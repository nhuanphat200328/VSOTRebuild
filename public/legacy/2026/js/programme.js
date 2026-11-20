/*
 * VSOT 2026 scientific programme — timeline renderer.
 * Data source: data/programme.js (window.VSOT_PROGRAMME) generated from the
 * 'CTKH VSOT 2026' sheet by tools/build_programme.py.
 *
 * Positions/heights are always computed from each session's start/end time,
 * never hard-coded, so the timeline follows the data if times change.
 */
(function () {
    'use strict';

    // Vertical time scale — global, single source of truth for the whole
    // timeline (every session, every axis tick). 168px per hour = the original
    // 108px + 40px + 10px + 10px, as requested; minutes scale proportionally.
    var PX_PER_MIN = 168 / 60;      // vertical scale: 60 min => 168px
    var MIN_BLOCK = 20;             // minimum session block height (px)

    var TYPE_LABEL = {
        welcome: 'Đón đại biểu',
        opening: 'Khai mạc',
        cme: 'CME / Đào tạo',
        session: 'Phiên khoa học',
        debate: 'Thảo luận ca lâm sàng',
        live_surgery: 'Phẫu thuật thị phạm',
        plenary: 'Phiên toàn thể',
        symposium: 'Symposium',
        tea_break: 'Giải lao',
        meeting: 'Họp Ban chấp hành',
        gala: 'Tiệc / Gala',
        closing: 'Bế mạc'
    };
    var TYPE_ORDER = ['welcome', 'opening', 'cme', 'session', 'debate', 'live_surgery',
        'plenary', 'symposium', 'tea_break', 'meeting', 'gala', 'closing'];

    // Conference-wide items shown in EVERY hall column on the timeline
    // (e.g. "Tiếp đón đại biểu / Welcome Delegates" happens in all halls).
    var SPAN_ALL_TYPES = { welcome: true };

    var TALK_LABEL = {
        talk: 'Báo cáo', discussion: 'Thảo luận', case: 'Ca lâm sàng',
        video: 'Video', info: 'Thông tin'
    };

    // Item types that are NOT counted as a report/presentation.
    var NON_REPORT_TYPES = { discussion: true, info: true };
    var DISCUSSION_RE = /(thảo\s*luận|tranh\s*luận|discussion|q\s*&\s*a|panel|trao\s*đổi|ý\s*kiến)/i;

    function isReportItem(p) {
        if (!p) return false;
        if (NON_REPORT_TYPES[p.type]) return false;
        if (p.type === 'talk' && DISCUSSION_RE.test(p.title || '')) return false;
        return true;
    }

    function reportCount(s) {
        // memoized per session (data is immutable at runtime)
        if (s._reports == null) {
            s._reports = (s.presentations || []).filter(isReportItem).length;
        }
        return s._reports;
    }

    function rangeText(a, b) {
        if (a && b) return a + ' - ' + b;
        return a || b || '';
    }

    var state = { data: null, day: null, rooms: [], types: [], q: '', qn: '', view: 'timeline', posterId: null, abstracts: null, abstractsLoading: null };
    var ROOM_BY_ID = {};
    var ROOM_ORDER = [];

    /* ---------------- DOM helpers ---------------- */
    function $(id) { return document.getElementById(id); }

    function el(tag, props, children) {
        var node = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach(function (k) {
                var v = props[k];
                if (v == null) return;
                if (k === 'class') node.className = v;
                else if (k === 'text') node.textContent = v;
                else if (k === 'html') node.innerHTML = v;
                else if (k === 'style') node.setAttribute('style', v);
                else if (k.indexOf('on') === 0 && typeof v === 'function') {
                    node.addEventListener(k.slice(2).toLowerCase(), v);
                } else {
                    node.setAttribute(k, v);
                }
            });
        }
        (children || []).forEach(function (c) {
            if (c == null) return;
            node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return node;
    }

    function icon(cls) {
        return el('i', { class: cls, 'aria-hidden': 'true' });
    }

    // Shared search normaliser: lowercase, strip Vietnamese diacritics (incl.
    // đ/Đ), collapse whitespace. Used for BOTH the query and the data so search
    // works with or without accents. Displayed data is never modified.
    function normalizeSearchText(value) {
        return String(value == null ? '' : value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Render a multi-line "info" block (e.g. the live-surgery personnel/kíp mổ
    // list) as real lines, bolding the "Label:" job headings. Single-line titles
    // keep their existing inline rendering.
    function titleContent(title) {
        var t = String(title == null ? '' : title);
        if (t.indexOf('\n') < 0) {
            return el('span', { class: 't-talk-title', text: t });
        }
        var wrap = el('div', { class: 't-talk-lines' });
        t.split('\n').forEach(function (raw) {
            var line = raw.trim();
            if (!line) return;
            var m = line.match(/^([^:]{1,60}):\s*(.*)$/);
            if (m) {
                wrap.appendChild(el('div', { class: 't-talk-line is-head' }, [
                    el('strong', { text: m[1] + ':' }),
                    (m[2] ? document.createTextNode(' ' + m[2]) : null)
                ]));
            } else {
                wrap.appendChild(el('div', { class: 't-talk-line', text: line }));
            }
        });
        return wrap;
    }

    // Abstract button — opens the full-screen reader for the linked document.
    function abstractButton(pid, info) {
        var b = el('button', {
            type: 'button',
            class: 'prog-abstract',
            'data-abstract': pid || ''
        }, ['Abstract']);
        b.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openAbstract(pid, info || {});
        });
        return b;
    }

    /* ---------------- abstract reader ---------------- */
    function loadAbstractManifest() {
        if (state.abstracts) return Promise.resolve(state.abstracts);
        if (state.abstractsLoading) return state.abstractsLoading;
        if (typeof fetch !== 'function') {
            state.abstracts = { byPresentation: {} };
            return Promise.resolve(state.abstracts);
        }
        state.abstractsLoading = fetch('data/abstracts.json')
            .then(function (r) { return r.ok ? r.json() : { byPresentation: {} }; })
            .then(function (m) { state.abstracts = m || { byPresentation: {} }; return state.abstracts; })
            .catch(function () { return { byPresentation: {}, error: true }; });
        return state.abstractsLoading;
    }

    function ensureAbstractReader() {
        var reader = $('prog-abstract-reader');
        if (reader) return reader;
        reader = el('div', { class: 'prog-abstract-reader', id: 'prog-abstract-reader', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Đọc Abstract' });
        var bar = el('header', { class: 'prog-abstract-reader__bar' });
        var back = el('button', { type: 'button', class: 'prog-abstract-reader__back' }, [
            icon('fa-solid fa-arrow-left'), document.createTextNode(' Quay lại')
        ]);
        back.addEventListener('click', closeAbstract);
        var meta = el('div', { class: 'prog-abstract-reader__meta' }, [
            el('div', { class: 'prog-abstract-reader__title' }),
            el('div', { class: 'prog-abstract-reader__sub' })
        ]);
        var tabs = el('div', { class: 'prog-abstract-reader__tabs' });
        bar.appendChild(back); bar.appendChild(meta); bar.appendChild(tabs);
        var stage = el('div', { class: 'prog-abstract-reader__stage' });
        var status = el('div', { class: 'prog-abstract-reader__status' });
        var frame = el('iframe', { class: 'prog-abstract-reader__frame', 'title': 'Abstract' });
        frame.addEventListener('load', function () {
            status.classList.remove('is-on');
            frame.classList.add('is-on');
        });
        stage.appendChild(status); stage.appendChild(frame);
        reader.appendChild(bar); reader.appendChild(stage);
        reader.addEventListener('click', function (e) { if (e.target === reader) closeAbstract(); });
        document.body.appendChild(reader);
        return reader;
    }

    function openAbstract(pid, info) {
        var reader = ensureAbstractReader();
        reader.querySelector('.prog-abstract-reader__title').textContent = info.title || '';
        var parts = [];
        if (info.speaker) parts.push('Báo cáo viên: ' + info.speaker);
        if (info.session) parts.push(info.session);
        reader.querySelector('.prog-abstract-reader__sub').textContent = parts.join('  ·  ');
        var tabs = reader.querySelector('.prog-abstract-reader__tabs');
        tabs.textContent = '';
        setReaderStatus('Đang tải tài liệu…', true);
        reader.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (reader._lastFocus == null) reader._lastFocus = document.activeElement;
        reader.querySelector('.prog-abstract-reader__back').focus();

        loadAbstractManifest().then(function (m) {
            var entry = (m.byPresentation || {})[pid];
            var frame = reader.querySelector('.prog-abstract-reader__frame');
            if (m.error) { showReaderMessage('Không tải được danh mục Abstract.'); return; }
            if (!entry || !entry.files || !entry.files.length) {
                showReaderMessage('Chưa có Abstract cho bài báo cáo này.');
                return;
            }
            function showFile(i) {
                var f = entry.files[i];
                Array.prototype.forEach.call(tabs.children, function (b, k) {
                    b.classList.toggle('is-active', k === i);
                });
                loadReaderFile(f);
            }
            if (entry.files.length > 1) {
                entry.files.forEach(function (f, i) {
                    var label = entry.files.length > 1 ? ('Bản ' + (i + 1)) : 'Tài liệu';
                    var tb = el('button', { type: 'button', class: 'prog-abstract-reader__tab', text: label, title: f.source || '' });
                    tb.addEventListener('click', function () { showFile(i); });
                    tabs.appendChild(tb);
                });
            }
            showFile(0);
        });
    }

    function loadReaderFile(f) {
        var reader = ensureAbstractReader();
        var frame = reader.querySelector('.prog-abstract-reader__frame');
        frame.classList.remove('is-on');
        setReaderStatus('Đang tải tài liệu…', true);
        clearTimeout(frame._errTimer);
        frame.onload = function () {
            frame.classList.add('is-on');
            setReaderStatus('', false);
        };
        frame._errTimer = setTimeout(function () {
            if (!frame.classList.contains('is-on')) showReaderMessage('Không hiển thị được tài liệu. ');
        }, 12000);
        frame.setAttribute('src', f.path);
    }

    function setReaderStatus(text, on) {
        var reader = ensureAbstractReader();
        var s = reader.querySelector('.prog-abstract-reader__status');
        s.textContent = text || '';
        s.classList.toggle('is-on', !!on);
    }

    function showReaderMessage(text) {
        var reader = ensureAbstractReader();
        var frame = reader.querySelector('.prog-abstract-reader__frame');
        frame.classList.remove('is-on');
        frame.removeAttribute('src');
        var s = reader.querySelector('.prog-abstract-reader__status');
        s.textContent = '';
        s.classList.add('is-on');
        while (s.firstChild) s.removeChild(s.firstChild);
        s.appendChild(el('span', { class: 'prog-abstract-reader__msg', text: text }));
    }

    function closeAbstract() {
        var reader = $('prog-abstract-reader');
        if (!reader || !reader.classList.contains('open')) return;
        reader.classList.remove('open');
        document.body.style.overflow = '';
        var frame = reader.querySelector('.prog-abstract-reader__frame');
        frame.removeAttribute('src');
        frame.classList.remove('is-on');
    }

    /* ---------------- time helpers ---------------- */
    function toMin(t) {
        if (!t || typeof t !== 'string') return null;
        var p = t.split(':');
        if (p.length < 2) return null;
        var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
        if (isNaN(h) || isNaN(m)) return null;
        return h * 60 + m;
    }

    function hhmm(min) {
        var h = Math.floor(min / 60), m = min % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }

    /*
     * Normalise displayed session times per room.
     *
     * Source data is never modified: each session keeps its declared start/end.
     * We derive `_startMin`/`_endMin` (used only for layout/display) because a
     * few session headers in the Excel span further than their own content.
     *   effectiveEnd = max( contentEnd , min(declaredEnd, nextEventStart) )
     * where nextEventStart is the next session OR break in the same room.
     * - If a session's talks run through a mid-session break, contentEnd keeps
     *   the block full length (e.g. Hội An CME 08:00–12:00).
     * - If the declared end overlaps a later, separate session, the block is
     *   clamped to the next event (e.g. Sông Hàn CME 08:00–09:45), so blocks in
     *   a room stay sequential and never overlap when the agenda does not.
     */
    function normalizeDay(day) {
        var byRoom = {};
        day.sessions.forEach(function (s) {
            (byRoom[s.roomId] = byRoom[s.roomId] || []).push(s);
        });
        Object.keys(byRoom).forEach(function (rid) {
            var list = byRoom[rid].filter(function (s) { return toMin(s.start) != null; })
                .sort(function (a, b) { return toMin(a.start) - toMin(b.start); });
            list.forEach(function (s, i) {
                var ds = toMin(s.start);
                var de = toMin(s.end);
                if (de == null) de = ds;
                var ends = (s.presentations || []).map(function (p) { return toMin(p.end); })
                    .filter(function (n) { return n != null; });
                var contentEnd = ends.length ? Math.max.apply(null, ends) : de;
                var nextStart = null;
                for (var j = i + 1; j < list.length; j++) {
                    var ns = toMin(list[j].start);
                    if (ns > ds) { nextStart = ns; break; }
                }
                var end = de;
                if (nextStart != null) end = Math.min(de, nextStart);
                if (contentEnd != null) end = Math.max(end, contentEnd);
                if (end < ds) end = ds;
                s._startMin = ds;
                s._endMin = end;
                s.effStart = hhmm(ds);
                s.effEnd = hhmm(end);
            });
        });
        day.sessions.forEach(function (s) {
            if (s._startMin == null) {
                s.effStart = s.start;
                s.effEnd = s.end;
            }
        });
    }

    /* ---------------- boot ---------------- */
    function boot(data) {
        state.data = data;
        ROOM_ORDER = data.rooms.map(function (r) { return r.id; });
        data.rooms.forEach(function (r) { ROOM_BY_ID[r.id] = r; });

        data.days.forEach(function (d) {
            d.sessions.forEach(function (s, i) {
                s.id = d.date + '-' + i;
                s.date = d.date;
                s.spanAllRooms = !!SPAN_ALL_TYPES[s.type];
            });
            normalizeDay(d);
        });

        readUrl();
        if (!state.day) state.day = defaultDay();

        bindControls();
        renderAll();
    }

    function defaultDay() {
        var today = new Date();
        var iso = today.getFullYear() + '-' +
            ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
            ('0' + today.getDate()).slice(-2);
        var match = state.data.days.filter(function (d) { return d.date === iso; })[0];
        if (match) return match;
        var sci = state.data.days.filter(function (d) { return d.kind === 'scientific'; })[0];
        return sci || state.data.days[0];
    }

    function readUrl() {
        var p = new URLSearchParams(window.location.search);
        var d = p.get('d');
        if (d) {
            var found = state.data.days.filter(function (x) { return x.date === d; })[0];
            if (found) state.day = found;
        }
        var poster = p.get('poster');
        if (poster && (state.data.posters || []).some(function (x) { return x.id === poster; })) {
            state.posterId = poster;
        }
        if (p.get('rooms')) state.rooms = p.get('rooms').split(',').filter(Boolean);
        if (p.get('types')) state.types = p.get('types').split(',').filter(Boolean);
        if (p.get('q')) { state.q = p.get('q'); state.qn = normalizeSearchText(state.q); }
        if (p.get('view') === 'list') state.view = 'list';
    }

    function syncUrl() {
        var p = new URLSearchParams();
        if (state.posterId) {
            p.set('poster', state.posterId);
        } else if (state.day) {
            p.set('d', state.day.date);
            if (state.rooms.length) p.set('rooms', state.rooms.join(','));
            if (state.types.length) p.set('types', state.types.join(','));
            if (state.view !== 'timeline') p.set('view', state.view);
        }
        if (state.q) p.set('q', state.q);
        var qs = p.toString();
        history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
    }

    function bindControls() {
        $('prog-days').addEventListener('click', function (e) {
            var day = e.target.closest('[data-date]');
            if (day) { setDay(day.getAttribute('data-date')); return; }
            var poster = e.target.closest('[data-poster]');
            if (poster) setPoster(poster.getAttribute('data-poster'));
        });
        $('prog-rooms').addEventListener('click', function (e) {
            var b = e.target.closest('[data-room]');
            if (b) { toggle(state.rooms, b.getAttribute('data-room')); renderChipsAndResults(); }
        });
        $('prog-types').addEventListener('click', function (e) {
            var b = e.target.closest('[data-type]');
            if (b) { toggle(state.types, b.getAttribute('data-type')); renderChipsAndResults(); }
        });
        $('prog-view').addEventListener('click', function (e) {
            var b = e.target.closest('[data-view]');
            if (!b) return;
            state.view = b.getAttribute('data-view');
            renderViewOnly();
        });
        $('prog-clear').addEventListener('click', function () {
            state.rooms = []; state.types = []; state.q = ''; state.qn = '';
            $('prog-search').value = '';
            renderChipsAndResults();
        });
        var timer = null;
        $('prog-search').addEventListener('input', function (e) {
            var v = e.target.value;
            clearTimeout(timer);
            timer = setTimeout(function () {
                state.q = v.trim();
                state.qn = normalizeSearchText(state.q);
                renderResultsOnly();
            }, 180);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var r = $('prog-abstract-reader');
                if (r && r.classList.contains('open')) closeAbstract();
                else closeModal();
            }
        });
        $('prog-modal').addEventListener('click', function (e) {
            if (e.target === $('prog-modal')) closeModal();
        });
        window.addEventListener('resize', function () { syncStickyOffsets(); });
    }

    function toggle(arr, v) {
        var i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
    }

    function setDay(date) {
        state.posterId = null;
        state.day = state.data.days.filter(function (d) { return d.date === date; })[0];
        state.rooms = [];
        state.types = [];
        renderAll();
        scrollToStage();
    }

    function setPoster(id) {
        // Poster is a dataset independent of the day timeline.
        state.posterId = id;
        renderAll();
        scrollToStage();
    }

    function scrollToStage() {
        var stage = $('prog-stage');
        if (stage && stage.scrollIntoView) stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* ---------------- filtering ---------------- */
    function inRooms(s) {
        if (s.spanAllRooms) return true;
        return state.rooms.length === 0 || state.rooms.indexOf(s.roomId) >= 0;
    }
    function inTypes(s) { return state.types.length === 0 || state.types.indexOf(s.type) >= 0; }

    // precompute normalised (accent-stripped) search text once per session /
    // presentation; uncached lazily on first search.
    function sessionHaystack(s) {
        if (s._hay == null) {
            s._hay = normalizeSearchText(
                s.title + ' ' + (s.titleEn || '') + ' ' + (s.chairs || []).join(' ')
                + ' ' + (s.discussants || []).join(' '));
        }
        return s._hay;
    }

    function matchesQuery(s) {
        if (!state.q) return true;
        if (state.qn == null) state.qn = normalizeSearchText(state.q);
        var q = state.qn;
        if (!q) return true;
        if (sessionHaystack(s).indexOf(q) >= 0) return true;
        return (s.presentations || []).some(function (p) {
            if (p._hay == null) {
                p._hay = normalizeSearchText(
                    (p.title || '') + ' ' + (p.speaker || '') + ' ' + (p.affiliation || ''));
            }
            return p._hay.indexOf(q) >= 0;
        });
    }

    function visibleSessions() {
        return state.day.sessions.filter(function (s) {
            return inRooms(s) && inTypes(s) && matchesQuery(s);
        });
    }

    function roomsWithSessions() {
        // cached per day (depends only on state.day)
        if (state._roomsFor !== state.day) {
            var seen = {};
            state.day.sessions.forEach(function (s) { seen[s.roomId] = true; });
            state._rooms = ROOM_ORDER.filter(function (id) { return seen[id]; });
            state._roomsFor = state.day;
        }
        return state._rooms;
    }

    function typesInDay() {
        // Breaks are not shown on the timeline, so they are not offered as a
        // timeline filter. They remain available in the detailed (list) view.
        if (state._typesFor !== state.day) {
            var seen = {};
            state.day.sessions.forEach(function (s) {
                if (s.category !== 'break') seen[s.type] = true;
            });
            state._types = TYPE_ORDER.filter(function (t) { return seen[t]; });
            state._typesFor = state.day;
        }
        return state._types;
    }

    /* ---------------- rendering ----------------
       Split into small pieces so a change only rebuilds what it affects:
       - day/poster change  -> renderAll()
       - room/type filter    -> renderChipsAndResults()
       - view toggle         -> renderViewOnly()
       - search              -> renderResultsOnly()                             */
    function updateFiltersVisibility() {
        var isPoster = !!state.posterId;
        var filters = document.querySelector('.prog-filters');
        if (filters) filters.classList.toggle('is-poster', isPoster);
        $('prog-view').style.display = isPoster ? 'none' : '';
    }

    function renderAll() {
        renderTabs();
        updateFiltersVisibility();
        renderChips();
        renderViewToggle();
        renderStage();
        syncStickyOffsets();
        syncUrl();
    }

    function renderChipsAndResults() {
        renderChips();
        renderStage();
        syncStickyOffsets();
        syncUrl();
    }

    function renderViewOnly() {
        renderViewToggle();
        renderStage();
        syncStickyOffsets();
        syncUrl();
    }

    function renderResultsOnly() {
        renderStage();
        syncStickyOffsets();
        syncUrl();
        scrollToFirstResult();
    }

    // Publish the real height of the sticky filters so the timeline header can
    // pin right below it (CSS var consumed by .tl-sticky-head, top: calc(...)).
    // On mobile the filters are NOT sticky (see the 640px media query), so the
    // offset is 0 and the timeline header pins directly under the site header.
    function syncStickyOffsets() {
        var f = document.querySelector('.prog-filters');
        var mobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        var h = (!mobile && f) ? (f.offsetHeight || 0) : 0;
        document.documentElement.style.setProperty('--prog-filters-h', '0px');
    }

    // When a search yields results, bring the first matching block near the top
    // of the timeline so it is immediately actionable — while keeping the sticky
    // search bar / filters visible. Vertical scroll is on the page; horizontal
    // scroll uses the existing timeline scroll container. Times are never changed.
    function scrollToFirstResult() {
        if (!state.q || state.posterId || state.view !== 'timeline') return;
        var stage = $('prog-stage');
        var scroll = stage && stage.querySelector('.prog-timeline-scroll');
        if (!scroll) return;                       // empty state or poster view
        var blocks = stage.querySelectorAll('.tl-event[data-id]');
        var target = null;
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].classList.contains('t-tea_break')) continue;
            target = blocks[i];
            break;
        }
        if (!target) return;                       // no result -> do not scroll

        // horizontal: bring the target's room column into view (right of axis)
        var room = target.closest('.tl-room');
        var axis = stage.querySelector('.tl-axis');
        if (room) {
            var axisW = axis ? axis.offsetWidth : 0;
            var maxL = scroll.scrollWidth - scroll.clientWidth;
            var desiredL = Math.max(0, Math.min(maxL, room.offsetLeft - axisW));
            scroll.scrollLeft = desiredL;
        }

        // vertical: align the block just below the live bottom of the sticky
        // header (which itself sits below the sticky filters). Iterate + correct
        // on the next frame so wrapping/sticky heights settle.
        var head = stage.querySelector('.tl-sticky-head');
        var rect = target.getBoundingClientRect();
        var base = (head ? head.getBoundingClientRect().bottom : 92) + 12;
        scrollInstant((window.pageYOffset || document.documentElement.scrollTop) + rect.top - base);
        alignBelowHeader(target, head);
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(function () { alignBelowHeader(target, head); });
        }
    }

    function alignBelowHeader(target, head) {
        for (var k = 0; k < 4; k++) {
            var want = (head ? head.getBoundingClientRect().bottom : 80) + 12;
            var delta = target.getBoundingClientRect().top - want;
            if (Math.abs(delta) <= 2) break;
            scrollInstant((window.pageYOffset || document.documentElement.scrollTop) + delta);
        }
    }

    function scrollInstant(y) {
        y = Math.max(0, y);
        try {
            window.scrollTo({ top: y, left: window.pageXOffset || 0, behavior: 'instant' });
        } catch (e) {
            window.scrollTo(0, y);
        }
    }

    function renderTabs() {
        var wrap = $('prog-days');
        wrap.textContent = '';
        state.data.days.forEach(function (d) {
            var active = !state.posterId && state.day && d.date === state.day.date;
            wrap.appendChild(el('button', {
                type: 'button',
                class: 'prog-day' + (active ? ' is-active' : ''),
                'data-date': d.date
            }, [
                el('span', { text: d.labelShort }),
                el('small', { text: d.kind === 'precongress' ? 'Tiền hội nghị' : 'Chương trình khoa học' })
            ]));
        });
        // Poster tabs — same level as day tabs, but a separate dataset (no date)
        (state.data.posters || []).forEach(function (p) {
            var active = state.posterId === p.id;
            wrap.appendChild(el('button', {
                type: 'button',
                class: 'prog-day prog-poster' + (active ? ' is-active' : ''),
                'data-poster': p.id,
                title: p.label
            }, [
                el('span', { text: p.label }),
                el('small', { text: 'Poster' })
            ]));
        });
    }

    function renderChips() {
        var rooms = $('prog-rooms');
        rooms.textContent = '';
        roomsWithSessions().forEach(function (id) {
            var r = ROOM_BY_ID[id];
            rooms.appendChild(el('button', {
                type: 'button',
                class: 'prog-chip' + (state.rooms.indexOf(id) >= 0 ? ' is-active' : ''),
                'data-room': id,
                text: r.short
            }));
        });

        var types = $('prog-types');
        types.textContent = '';
        typesInDay().forEach(function (t) {
            types.appendChild(el('button', {
                type: 'button',
                class: 'prog-chip' + (state.types.indexOf(t) >= 0 ? ' is-active' : ''),
                'data-type': t,
                text: TYPE_LABEL[t] || t
            }));
        });
    }

    function renderViewToggle() {
        Array.prototype.forEach.call($('prog-view').children, function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-view') === state.view);
        });
    }

    function renderStage() {
        var stage = $('prog-stage');
        if (state.posterId) {
            stage.textContent = '';
            stage.appendChild(renderPoster(state.posterId));
            return;
        }
        var prevScroll = stage.querySelector('.prog-timeline-scroll');
        var keepLeft = prevScroll ? prevScroll.scrollLeft : 0;
        stage.textContent = '';
        var sessions = visibleSessions();
        if (!sessions.length) {
            stage.appendChild(el('div', { class: 'prog-empty', text: 'Không có phiên nào phù hợp với lựa chọn hiện tại.' }));
            return;
        }
        var node = state.view === 'list' ? renderList(sessions) : renderTimeline(sessions);
        stage.appendChild(node);
        if (keepLeft) {
            var next = stage.querySelector('.prog-timeline-scroll');
            if (next) next.scrollLeft = keepLeft;
        }
    }

    /* ---------------- poster datasets (no timeline) ---------------- */
    function matchesPosterQuery(it) {
        if (!state.q) return true;
        if (state.qn == null) state.qn = normalizeSearchText(state.q);
        var q = state.qn;
        if (!q) return true;
        if (it._hay == null) {
            it._hay = normalizeSearchText(
                (it.title || '') + ' ' + (it.author || '') + ' ' + (it.affiliation || ''));
        }
        return it._hay.indexOf(q) >= 0;
    }

    function renderPoster(id) {
        var poster = (state.data.posters || []).filter(function (p) { return p.id === id; })[0];
        if (!poster) {
            return el('div', { class: 'prog-empty', text: 'Không có dữ liệu poster.' });
        }
        var items = poster.items.filter(matchesPosterQuery);
        var wrap = el('div', { class: 'prog-poster-view' });
        wrap.appendChild(el('div', { class: 'prog-poster-head' }, [
            el('h3', { text: poster.title || poster.label }),
            el('span', { class: 'prog-poster-count', text: items.length + ' poster' })
        ]));
        if (!items.length) {
            wrap.appendChild(el('div', { class: 'prog-empty', text: 'Không có poster phù hợp.' }));
            return wrap;
        }
        var list = el('div', { class: 'prog-poster-list' });
        items.forEach(function (it) {
            list.appendChild(el('article', { class: 'prog-poster-item' }, [
                el('div', { class: 'prog-poster-index' }, [
                    el('span', { class: 'prog-poster-no', text: String(it.no) }),
                    abstractButton(it.pid || '',
                        { title: it.title, speaker: it.author, session: poster.title || poster.label })
                ]),
                el('div', { class: 'prog-poster-body' }, [
                    el('h4', { class: 'prog-poster-title', text: it.title }),
                    (it.author ? el('div', { class: 'prog-poster-author', text: 'Báo cáo viên: ' + it.author }) : null),
                    (it.affiliation ? el('div', { class: 'prog-poster-aff', text: it.affiliation }) : null)
                ])
            ]));
        });
        wrap.appendChild(list);
        return wrap;
    }

    /* ---------------- timeline ---------------- */
    function assignLanes(list) {
        // breaks are drawn full-width on top, so they don't take a lane
        var evs = list.filter(function (s) { return s.category !== 'break'; })
            .sort(function (a, b) { return a._startMin - b._startMin; });
        var laneEnd = [];
        evs.forEach(function (ev) {
            var st = ev._startMin;
            var lane = -1;
            for (var i = 0; i < laneEnd.length; i++) {
                if (st >= laneEnd[i]) { lane = i; break; }
            }
            if (lane < 0) { lane = laneEnd.length; laneEnd.push(0); }
            laneEnd[lane] = ev._endMin;
            ev._lane = lane;
        });
        var n = laneEnd.length || 1;
        evs.forEach(function (ev) { ev._lanes = n; });
    }

    function renderTimeline(sessions) {
        // Breaks / tea breaks are rendered too (as their own type/colour). They
        // are excluded from lane packing so they overlay their room instead of
        // shrinking the surrounding scientific sessions.
        var blocks = sessions;

        var dayStart = Math.floor(toMin(state.day.start) / 60) * 60;
        var dayEnd = Math.ceil(toMin(state.day.end) / 60) * 60;
        var H = (dayEnd - dayStart) * PX_PER_MIN;

        var roomIds = state.rooms.length ? state.rooms.slice() : roomsWithSessions();
        roomIds.sort(function (a, b) { return ROOM_ORDER.indexOf(a) - ROOM_ORDER.indexOf(b); });

        var inner = el('div', { class: 'tl-inner' });

        /* time axis — body only; the "Giờ" head lives in the sticky header */
        var axisBody = el('div', { class: 'tl-axis-body', style: 'height:' + H + 'px' });
        for (var t = dayStart; t <= dayEnd; t += 60) {
            axisBody.appendChild(el('span', {
                class: 'tl-axis-label',
                style: 'top:' + ((t - dayStart) * PX_PER_MIN) + 'px',
                text: hhmm(t)
            }));
        }
        inner.appendChild(el('div', { class: 'tl-axis' }, [axisBody]));

        /* room columns — bodies only */
        roomIds.forEach(function (rid) {
            var body = el('div', { class: 'tl-room-body', style: 'height:' + H + 'px' });

            for (var g = dayStart; g <= dayEnd; g += 30) {
                body.appendChild(el('div', {
                    class: 'tl-slot-line' + (g % 60 === 0 ? ' is-hour' : ''),
                    style: 'top:' + ((g - dayStart) * PX_PER_MIN) + 'px'
                }));
            }

            var list = blocks.filter(function (s) { return s.roomId === rid || s.spanAllRooms; });
            var roomBreaks = list.filter(function (s) {
                return s.category === 'break' && s._startMin != null && s._endMin != null;
            }).map(function (s) {
                return { s: s, start: s._startMin, end: s._endMin };
            }).sort(function (a, b) { return a.start - b.start; });

            assignLanes(list);
            // non-break sessions: split into visual segments around inner breaks
            list.forEach(function (s) {
                if (s.category === 'break') return;
                var segs = subtractBreaks(s._startMin, s._endMin, roomBreaks);
                segs.forEach(function (seg, i) {
                    var b = eventBlock(s, dayStart, rid, seg[0], seg[1], i === 0);
                    if (b) body.appendChild(b);
                });
            });
            // breaks: their own time band (no overlap with sessions)
            roomBreaks.forEach(function (br) {
                var inside = list.some(function (s) {
                    return s.category !== 'break' && s._startMin != null && s._endMin != null &&
                        s._startMin < br.start && s._endMin > br.end;
                });
                var b = breakBlock(br.s, dayStart, rid, inside);
                if (b) body.appendChild(b);
            });

            inner.appendChild(el('div', { class: 'tl-room' }, [body]));
        });

        /* sticky header: "Giờ" + room names. It sits in normal flow at the top
           of the timeline, then pins (position: sticky) while the page scrolls,
           and scrolls horizontally in sync with the body via transform. */
        var headRooms = el('div', { class: 'tl-head-rooms-inner' });
        roomIds.forEach(function (rid) {
            var r = ROOM_BY_ID[rid];
            headRooms.appendChild(el('div', { class: 'tl-room-head' }, [
                el('div', {}, [
                    el('span', { text: r.vi }),
                    el('span', { class: 'tl-room-en', text: r.en })
                ])
            ]));
        });
        var headRow = el('div', { class: 'tl-head-row' }, [
            el('div', { class: 'tl-axis-head', text: 'Giờ' }),
            el('div', { class: 'tl-head-rooms' }, [headRooms])
        ]);
        // nav + header row live in the same sticky block, so the hint and the
        // arrow buttons stay visible while the timeline is on screen.
        var nav = buildScrollNav();
        var head = el('div', { class: 'tl-sticky-head' }, [nav, headRow]);

        var scroll = el('div', { class: 'prog-timeline-scroll' }, [inner]);
        wireScrollNav(nav, scroll, headRooms);
        return el('div', { class: 'tl-wrap' }, [head, scroll]);
    }

    /* -------- horizontal scroll navigation -------- */
    function buildScrollNav() {
        var left = el('button', {
            type: 'button', class: 'tl-nav-btn', 'data-dir': 'left',
            'aria-label': 'Cuộn sang trái', html: '&larr;'
        });
        var right = el('button', {
            type: 'button', class: 'tl-nav-btn', 'data-dir': 'right',
            'aria-label': 'Cuộn sang phải', html: '&rarr;'
        });
        return el('div', { class: 'tl-nav' }, [
            el('span', { class: 'tl-nav-hint', text: 'Kéo ngang hoặc dùng mũi tên để xem các hội trường khác' }),
            el('div', { class: 'tl-nav-btns' }, [left, right])
        ]);
    }

    function wireScrollNav(nav, scroll, headRooms) {
        var left = nav.querySelector('[data-dir="left"]');
        var right = nav.querySelector('[data-dir="right"]');

        function maxScroll() { return scroll.scrollWidth - scroll.clientWidth; }
        function update() {
            var max = maxScroll();
            var hasOverflow = max > 2;
            // always visible (the hint + arrows help discover horizontal
            // scroll); disabled when there is nothing to scroll to.
            left.disabled = !hasOverflow || scroll.scrollLeft <= 1;
            right.disabled = !hasOverflow || scroll.scrollLeft >= max - 1;
            // keep the sticky header columns aligned with the body
            if (headRooms) headRooms.style.transform = 'translateX(' + (-scroll.scrollLeft) + 'px)';
        }
        function scrollByDir(dir) {
            var amount = Math.max(scroll.clientWidth * 0.8, 240);
            var target = Math.max(0, Math.min(maxScroll(), scroll.scrollLeft + dir * amount));
            if (typeof scroll.scrollTo === 'function') {
                try { scroll.scrollTo({ left: target, behavior: 'smooth' }); return; } catch (e) {}
            }
            scroll.scrollLeft = target;
        }
        left.addEventListener('click', function () { scrollByDir(-1); });
        right.addEventListener('click', function () { scrollByDir(1); });
        scroll.addEventListener('scroll', update, { passive: true });

        // keep a single resize listener across re-renders
        if (state._resizeHandler) window.removeEventListener('resize', state._resizeHandler);
        state._resizeHandler = update;
        window.addEventListener('resize', update);

        update();
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(update);
    }

    // A session may be visually split into segments so an inner break can occupy
    // its own time band (no overlap, no z-index tricks). Data is never split.
    function subtractBreaks(start, end, breaks) {
        if (start == null || end == null) return [];
        var segs = [], cursor = start;
        breaks.forEach(function (b) {
            var bs = Math.max(b.start, start), be = Math.min(b.end, end);
            if (be <= bs) return;
            if (bs > cursor) segs.push([cursor, bs]);
            if (be > cursor) cursor = be;
        });
        if (cursor < end) segs.push([cursor, end]);
        return segs.length ? segs : [[start, end]];
    }

    function eventBlock(s, dayStart, roomId, segStart, segEnd, isFirst) {
        var rid = roomId || s.roomId;
        var st = (segStart != null) ? segStart : s._startMin;
        var en = (segEnd != null) ? segEnd : s._endMin;
        if (st == null || en == null) return null;
        var first = (isFirst !== false);
        var top = (st - dayStart) * PX_PER_MIN;
        var h = Math.max((en - st) * PX_PER_MIN, MIN_BLOCK);
        var lane = s._lane || 0, lanes = s._lanes || 1;
        var left = (lane / lanes) * 100;
        var width = (1 / lanes) * 100;

        var style = 'top:' + top + 'px;min-height:' + h + 'px;' +
            'left:calc(' + left + '% + 2px);width:calc(' + width + '% - 4px);';

        var reports = reportCount(s);
        var tip = s.title + '\n' + rangeText(s.effStart, s.effEnd) +
            ' · ' + ROOM_BY_ID[rid].vi;
        if (reports) tip += '\n' + reports + ' bài báo cáo';

        // count badge + session time only on the first visual segment
        var countBadge = (first && reports) ? el('span', {
            class: 'tl-count',
            title: reports + ' bài báo cáo',
            'aria-label': reports + ' bài báo cáo',
            text: reports + ' bài báo cáo'
        }) : null;

        var children = [el('span', { class: 'tl-type', text: TYPE_LABEL[s.type] || s.type })];
        if (countBadge) children.push(countBadge);
        if (first) children.push(el('span', { class: 'tl-time', text: rangeText(s.effStart, s.effEnd) }));
        children.push(el('span', { class: 'tl-title' }, [
            el('span', { class: 'session-title-vi', text: s.titleViShort || s.titleVi || s.title }),
            ((s.titleEnShort || s.titleEn) ? el('span', {
                class: 'session-title-en', text: s.titleEnShort || s.titleEn
            }) : null)
        ]));

        return el('button', {
            type: 'button',
            class: 'tl-event t-' + s.type + (lanes > 1 ? ' has-overlap' : '') + (first ? '' : ' is-cont'),
            style: style,
            title: tip,
            'data-id': s.id,
            'aria-label': s.title + ' ' + rangeText(s.effStart, s.effEnd) + ' ' + ROOM_BY_ID[rid].vi,
            onclick: function () { openModal(s); }
        }, children);
    }

    function breakBlock(s, dayStart, roomId, inside) {
        var rid = roomId || s.roomId;
        var st = s._startMin, en = s._endMin;
        if (st == null || en == null) return null;
        var bandH = (en - st) * PX_PER_MIN;
        var MIN_VIS = 30;   // keep the badge + name readable
        var h;
        if (inside) {
            // Break inside a session: symmetric inset ~10px each side (as before)
            var inset = Math.min(10, Math.max(0, (bandH - 40) / 2));
            h = bandH - 2 * inset;
        } else {
            // Break between two sessions: 10px shorter overall (5px top+bottom),
            // but never below the readable minimum for very short breaks
            h = bandH - 10;
            if (h < MIN_VIS) h = Math.min(bandH, MIN_VIS);
        }
        if (h < MIN_BLOCK) h = MIN_BLOCK;
        var top = (st - dayStart) * PX_PER_MIN + (bandH - h) / 2;
        return el('button', {
            type: 'button',
            class: 'tl-event t-' + s.type,
            style: 'top:' + top + 'px;height:' + h + 'px;' +
                'left:calc(0% + 2px);width:calc(100% - 4px);',
            title: s.title + '\n' + rangeText(s.effStart, s.effEnd) + ' · ' + ROOM_BY_ID[rid].vi,
            'data-id': s.id,
            'aria-label': (TYPE_LABEL[s.type] || 'Giải lao') + ' ' + (s.titleViShort || s.title),
            onclick: function () { openModal(s); }
        }, [
            el('span', { class: 'tl-type', text: TYPE_LABEL[s.type] || 'Giải lao' }),
            el('span', { class: 'tl-title' }, [
                el('span', { class: 'session-title-vi', text: s.titleViShort || s.title })
            ])
        ]);
    }

    /* ---------------- list ---------------- */
    function renderList(sessions) {
        var wrap = el('div', { class: 'prog-list' });
        var roomIds = state.rooms.length ? state.rooms.slice() : roomsWithSessions();
        roomIds.sort(function (a, b) { return ROOM_ORDER.indexOf(a) - ROOM_ORDER.indexOf(b); });

        roomIds.forEach(function (rid) {
            var list = sessions.filter(function (s) { return s.roomId === rid; })
                .sort(function (a, b) { return toMin(a.start) - toMin(b.start); });
            if (!list.length) return;
            var r = ROOM_BY_ID[rid];
            var group = el('div', { class: 'prog-list-room' }, [
                el('h3', { text: r.vi }),
                el('div', { class: 'prog-list-room-en', text: r.en })
            ]);
            list.forEach(function (s) { group.appendChild(listCard(s)); });
            wrap.appendChild(group);
        });
        return wrap;
    }

    function listCard(s) {
        var meta = [];
        var reports = reportCount(s);
        if (reports) meta.push(reports + ' bài báo cáo');
        if (s.chairs && s.chairs.length) meta.push('Chủ tọa: ' + s.chairs.join(', '));
        if (s.discussants && s.discussants.length) meta.push('Tham luận viên: ' + s.discussants.join(', '));
        return el('button', {
            type: 'button',
            class: 'prog-card t-' + s.type,
            onclick: function () { openModal(s); }
        }, [
            el('div', { class: 'prog-card__time', text: rangeText(s.effStart, s.effEnd) }),
            el('div', { class: 'prog-card__body' }, [
                el('h4', {}, [
                    el('span', { class: 'prog-badge t-' + s.type, text: TYPE_LABEL[s.type] || s.type }),
                    el('span', { class: 'session-title-vi', text: s.titleViShort || s.titleVi || s.title }),
                    ((s.titleEnShort || s.titleEn) ? el('span', {
                        class: 'session-title-en', text: s.titleEnShort || s.titleEn
                    }) : null)
                ]),
                (meta.length ? el('div', { class: 'prog-card__meta', text: meta.join(' · ') }) : null)
            ])
        ]);
    }

    /* ---------------- detail modal ---------------- */
    function openModal(s) {
        var r = ROOM_BY_ID[s.roomId];
        var dialog = $('prog-modal-dialog');
        dialog.textContent = '';

        dialog.appendChild(el('div', { class: 'prog-modal__head' }, [
            el('button', {
                type: 'button', class: 'prog-modal__close', text: '×',
                'aria-label': 'Đóng', onclick: closeModal
            }),
            el('span', { class: 'prog-badge t-' + s.type, text: TYPE_LABEL[s.type] || s.type }),
            el('h3', { class: 'prog-modal__title session-title-vi', text: s.titleVi || s.title }),
            (s.titleEn ? el('div', { class: 'prog-modal__title-en session-title-en', text: s.titleEn }) : null),
            el('div', { class: 'prog-modal__facts' }, [
                el('span', {}, [icon('fa-solid fa-clock'), document.createTextNode(' ' + rangeText(s.effStart, s.effEnd))]),
                el('span', {}, [icon('fa-solid fa-location-dot'), document.createTextNode(' ' + r.vi + ' / ' + r.en)])
            ])
        ]));

        var body = el('div', { class: 'prog-modal__body' });

        if (s.chairs && s.chairs.length) {
            body.appendChild(el('div', { class: 'prog-modal__section' }, [
                el('h5', { text: 'Chủ tọa' }),
                el('div', { class: 'prog-chairs' }, s.chairs.map(function (c) {
                    return el('span', { class: 'prog-chair', text: c });
                }))
            ]));
        }

        if (s.discussants && s.discussants.length) {
            body.appendChild(el('div', { class: 'prog-modal__section' }, [
                el('h5', { text: 'Tham luận viên' }),
                el('div', { class: 'prog-chairs' }, s.discussants.map(function (c) {
                    return el('span', { class: 'prog-chair', text: c });
                }))
            ]));
        }

        // Breaks that fall inside this session's time span (same room) are merged
        // into the detail list in chronological order — the session stays ONE
        // session (its start/end/title are never split).
        var sessionBreaks = (state.day.sessions || []).filter(function (b) {
            return b.category === 'break' && b !== s && b.roomId === s.roomId &&
                toMin(b.effStart) != null && toMin(b.effEnd) != null &&
                toMin(b.effStart) >= toMin(s.effStart) && toMin(b.effEnd) <= toMin(s.effEnd);
        });

        function presRow(p) {
                var qn = state.qn != null ? state.qn : normalizeSearchText(state.q);
                var isMatch = qn && normalizeSearchText(p.title + ' ' + (p.speaker || ''))
                    .indexOf(qn) >= 0;
                var presenter = p.speaker || '';
                var aff = p.affiliation || '';
                var isReport = isReportItem(p);
                // report items are labelled "Báo cáo"; discussion/info keep their own label
                var label = isReport ? 'Báo cáo' : (TALK_LABEL[p.type] || p.type);
                var cls = [];
                if (isMatch) cls.push('is-match');
                if (!isReport) cls.push('is-discussion');

                var cell;
                var timeCell = [el('span', { class: 't-time-val', text: rangeText(p.start, p.end) })];
                if (label === 'Báo cáo') {
                    // line 1 (flex row): [type pill] | "Báo cáo viên: <b>Name</b>"
                    // line 2: organization (inside speaker-info, aligned under the label)
                    // line 3: <b>title</b> as a sibling AFTER the meta row, so it
                    //         aligns to the LEFT EDGE OF THE PILL (td content left).
                    var info = el('div', { class: 'prog-speaker-info' });
                    if (presenter) {
                        info.appendChild(el('div', { class: 'prog-speaker-line' }, [
                            el('span', { class: 'prog-speaker-label', text: 'Báo cáo viên: ' }),
                            el('strong', { class: 'prog-speaker-name', text: presenter })
                        ]));
                    }
                    if (aff) info.appendChild(el('div', { class: 'prog-speaker-org', text: aff }));
                    var meta = el('div', { class: 'prog-talk-meta' }, [
                        el('span', { class: 'prog-talk-type', text: label }),
                        info
                    ]);
                    cell = [meta, el('div', { class: 'prog-talk-title', text: p.title })];
                    // the Abstract button lives in the time column, right under the time.
                    // An optional report number (p.no, e.g. moved posters) sits to its left.
                    var actions = el('div', { class: 't-time-actions' }, [
                        (p.no != null ? el('span', { class: 't-report-no', text: String(p.no) }) : null),
                        abstractButton(p.pid || '',
                            { title: p.title, speaker: presenter, session: s.titleVi || s.title })
                    ]);
                    timeCell.push(actions);
                } else {
                    // other item types keep their own layout (no "Báo cáo viên")
                    cell = [el('span', { class: 'prog-talk-type', text: label })];
                    cell.push(titleContent(p.title));
                    if (presenter) {
                        cell.push(el('div', { class: 't-talk-speaker' }, [
                            el('span', { class: 't-speaker-label', text: 'Người báo cáo: ' }),
                            document.createTextNode(presenter + (aff ? ' — ' + aff : ''))
                        ]));
                    } else if (aff) {
                        cell.push(el('div', { class: 't-talk-speaker', text: aff }));
                    }
                }
                return el('tr', { class: cls.join(' ') }, [
                    el('td', { class: 't-time' }, timeCell),
                    el('td', {}, cell)
                ]);
        }

        function breakRow(b) {
            return el('tr', { class: 'is-break' }, [
                el('td', { class: 't-time', text: rangeText(b.effStart, b.effEnd) }),
                el('td', {}, [
                    el('span', { class: 'prog-talk-type', text: TYPE_LABEL[b.type] || 'Giải lao' }),
                    el('span', { class: 't-talk-title', text: b.titleViShort || b.title })
                ])
            ]);
        }

        var items = [];
        (s.presentations || []).forEach(function (p) { items.push({ start: p.start, row: presRow(p) }); });
        sessionBreaks.forEach(function (b) { items.push({ start: b.effStart, row: breakRow(b) }); });
        items.sort(function (a, b) { return (toMin(a.start) || 9999) - (toMin(b.start) || 9999); });

        if (items.length) {
            var reports = reportCount(s);
            body.appendChild(el('div', { class: 'prog-modal__section' }, [
                el('h5', { text: reports ? 'Chương trình · ' + reports + ' bài báo cáo' : 'Chương trình' }),
                el('table', { class: 'prog-talks' }, [
                    el('thead', {}, [el('tr', {}, [
                        el('th', { text: 'Giờ' }), el('th', { text: 'Nội dung' })
                    ])]),
                    el('tbody', {}, items.map(function (it) { return it.row; }))
                ])
            ]));
        } else {
            body.appendChild(el('p', { class: 'prog-note', text: emptyNote(s.type) }));
        }

        dialog.appendChild(body);
        $('prog-modal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function emptyNote(type) {
        if (type === 'tea_break') return 'Thời gian giải lao.';
        if (type === 'symposium') return 'Symposium do nhà tài trợ tổ chức — chương trình chi tiết chưa có trong tài liệu.';
        if (type === 'opening' || type === 'closing' || type === 'welcome' || type === 'gala' || type === 'meeting')
            return 'Sự kiện nghi lễ / tổ chức — không có danh sách báo cáo.';
        return 'Chưa có danh sách báo cáo chi tiết trong tài liệu.';
    }

    function closeModal() {
        $('prog-modal').classList.remove('open');
        document.body.style.overflow = '';
    }

    /* ---------------- start ---------------- */
    // The data script (data/programme.js) runs before this file, at the end of
    // <body>, so the DOM skeleton already exists — boot immediately.
    if (window.VSOT_PROGRAMME) {
        boot(window.VSOT_PROGRAMME);
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadJson);
    } else {
        loadJson();
    }

    function loadJson() {
        fetch('data/programme.json')
            .then(function (r) { return r.json(); })
            .then(boot)
            .catch(function () {
                $('prog-stage').innerHTML =
                    '<div class="prog-empty">Không tải được dữ liệu chương trình.</div>';
            });
    }
})();
