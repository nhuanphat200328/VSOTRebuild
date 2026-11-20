# CMS_MODULES.md — VSOT Admin

- Ngày: 2026-11-20
- Nguyên tắc: module chỉ tồn tại khi có dữ liệu/nghiệp vụ thật; mọi số liệu dashboard
  lấy từ DB; mọi mutation kiểm tra quyền ở server + RLS.

---

## 0. TRẠNG THÁI TRIỂN KHAI (review 2026-11-20)

> Thực tế: mutation dùng service role nên chỉ kiểm quyền ở server action, **chưa** có lớp RLS cho thao tác CMS (SEC-01).

| Module | Trạng thái | Đã có | Còn thiếu / lỗi đã biết |
|---|---|---|---|
| 1. Dashboard | Một phần | Đếm hội nghị, phiên, diễn giả, tin, liên hệ mới | Khối “Trạng thái hệ thống” hardcode (DATA-10); chưa có chờ duyệt, bản dịch thiếu, audit, cảnh báo |
| 2. Pages | Phần lớn | CRUD song ngữ, SEO, xóa mềm, kiểm `page.publish` | Slug trùng route tĩnh (DATA-03); `published_at` bị ghi đè (DATA-01); chưa preview/draft token; chưa audit |
| 3. News | Phần lớn | CRUD song ngữ, danh mục (tạo), featured, ngày đăng | Không kiểm publish cho `en_status`, danh mục (SEC-02); múi giờ `published_at` (DATA-02); chưa sửa/xóa danh mục, cover, related |
| 4. Conferences | Chỉ đọc | Danh sách, link Programme Builder | Chưa tạo/sửa hội nghị, ngày, phòng, track, tài liệu, sponsor (ROADMAP R4.1) |
| 5. Programme Builder | Cơ bản | Lọc theo ngày, tạo/sửa phiên (chặn trùng phòng), tạo/sửa báo cáo | Không kiểm publish báo cáo (SEC-02); `sort` báo cáo (DATA-05); chưa kiểm khung giờ (DATA-06); chưa xóa, kéo-thả, phân công người, import UI, trang validate (ROADMAP R4.2–R4.3) |
| 6. People / Faculty | Chưa có (admin) | Public: danh sách + hồ sơ | ROADMAP R4.2 |
| 7. Media | Cơ bản | Upload ảnh/PDF, xóa có kiểm tham chiếu | File > 1 MB lỗi (BUG-05); cho SVG, MIME tin client (SEC-05); chưa sửa alt, chưa audit |
| 8. Users & Roles | Cơ bản | Tạo user (mật khẩu tạm), gán role global, khóa/mở | Chưa mời qua email, reset mật khẩu, role theo hội nghị, trang roles (ROADMAP R4.7) |
| 9. Bootstrap | Xong | Đã tạo Super Admin; endpoint trả 503 | Gỡ endpoint (ROADMAP R3.4) |
| 10. Contact | Cơ bản | Inbox lọc/tìm, đổi trạng thái, thêm ghi chú | Tìm kiếm chưa sanitize (SEC-04); chưa xem lịch sử ghi chú, export CSV; form chưa rate limit (SEC-06) |
| 11. Audit log | Một phần | Ghi ở users + bootstrap | Ghi cho mọi module (FIX-13); trang xem (ROADMAP R4.6) |
| 12. Settings | Chưa có | — | ROADMAP R4.6 |

---

## 1. DASHBOARD

Hiển thị (dữ liệu thật):
- Tổng bài viết (published/draft), trang, hội nghị, diễn giả.
- Người dùng theo role.
- Nội dung chờ duyệt (`pending_review`).
- Bản dịch thiếu (`translation_status = missing`).
- Contact mới (`status = new`).
- Audit log gần đây (10–20 dòng).
- Cảnh báo: hội nghị chưa publish, session thiếu phòng/giờ, trùng phòng.

Không hiển thị số liệu giả/cứng.

---

## 2. PAGES

- Danh sách: filter status/locale, search title/slug, sort.
- Editor: title, slug, body (rich text blocks), SEO, template.
- Bản dịch VI/EN độc lập; trạng thái từng locale.
- Actions: Save draft, Submit review, Publish, Unpublish, Archive, Delete.
- Delete: soft delete; chặn nếu là trang hệ thống (home, contact, privacy).
- Preview: render public với draft token (chỉ user có quyền).
- Permission: `page.read/write/publish/delete`.

---

## 3. NEWS

- Categories (VI/EN), slug, sort.
- News: title, excerpt, body, cover, author, category, publish date, featured.
- Related news (nhiều-nhiều).
- SEO fields.
- Workflow như Pages.
- Permission: `news.*`.

---

## 4. CONFERENCES

- Tạo conference: slug năm, tên VI/EN, theme, thời gian, địa điểm, màu, banner, logo.
- `landing_config`: bật/tắt section, thứ tự (JSON có schema).
- Sub-modules: dates, rooms, tracks, documents, sponsors, legacy link.
- Trạng thái: draft/published/archived.
- Không xoá conference đã published; chỉ archive.
- Permission: `conference.*`.

---

## 5. PROGRAMME BUILDER

### 5.1. Màn hình
- Chọn conference + date.
- Cột/room hoặc timeline; danh sách session.
- Tạo nhanh session; inline edit.
- Panel chi tiết session: giờ, phòng, type, track, number, tiêu đề VI/EN,
  mô tả, chairs/discussants.
- Danh sách presentations: thêm/sửa/xoá, giờ, tiêu đề VI/EN, abstract, keywords,
  presenters/invited.
- Kéo-thả sort (trong session; giữa session nếu cho phép).
- Preview public (List/Grid/Table/At a glance).
- Validate + publish.

### 5.2. Validation
Chặn publish nếu:
- Session thiếu date/room/start/end; end <= start.
- Presentation ngoài khoảng session.
- Cùng phòng overlap thời gian (hiển thị cặp xung đột).
- Thiếu ít nhất 1 chair? **Không bắt buộc** — chỉ cảnh báo.
- Thiếu tiêu đề VI.
- Conference chưa có dates/rooms.

Không tự sửa dữ liệu. Chỉ báo.

### 5.3. Import
- Import từ JSON 2026 (`window.VSOT_PROGRAMME`).
- Preview mapping trước khi ghi.
- Idempotent theo `legacy_sid`/`legacy_pid`.
- Báo cáo: số tạo mới, cập nhật, bỏ qua, lỗi.
- Không tự tạo người trùng tên; tạo person mới + cảnh báo.
- Không lấy dữ liệu từ Excel nếu chưa xác nhận.

### 5.4. Publish
- Publish theo conference hoặc theo date.
- Cache invalidation.
- Audit log.
- Permission: `programme.read/write/publish`.

---

## 6. PEOPLE / FACULTY

- Danh sách: search, filter role (suy ra từ assignments), country, institution.
- Person: thông tin cá nhân, ảnh, bio VI/EN, social.
- Assignments: xem theo conference; thêm chair/discussant/presenter.
- Cảnh báo trùng tên/email; không auto-merge.
- Permission: `person.*`.

---

## 7. MEDIA

- Grid/list, filter bucket/type, search file name/alt.
- Upload: drag-drop, progress, size/mime limit.
- Metadata: alt VI/EN, caption, visibility.
- Usage check: đếm tham chiếu (page/news/person/conference/document).
- Delete: chặn nếu đang dùng; cho phép force delete chỉ super_admin + audit.
- Storage: `media-public`, `documents`, `legacy`.
- Permission: `media.read/upload/delete`.

---

## 8. USERS & ROLES

- Danh sách user, trạng thái, role, lần đăng nhập cuối.
- Invite qua Supabase Auth admin (email).
- Disable/enable.
- Gán role global hoặc theo conference.
- Không cho admin sửa super_admin.
- Không public signup.
- Permission: `user.*`.
- Bootstrap Super Admin: xem mục 9.

---

## 9. BOOTSTRAP SUPER ADMIN (Method B)

Endpoint server-only: `POST /api/bootstrap-super-admin`.

Điều kiện:
1. `SUPER_ADMIN_BOOTSTRAP_SECRET` khớp header/body (constant-time compare).
2. `select count(*) from user_roles join roles ... where role='super_admin'` = 0.
3. Chạy trong transaction + `pg_advisory_xact_lock` để tránh race.
4. Tạo/xác nhận auth user qua service role; gán role super_admin.
5. Ghi audit log (không ghi secret).
6. Sau khi thành công, endpoint trả 409 cho mọi lần gọi tiếp.
7. Hướng dẫn xoá secret khỏi env.

Không expose secret ra client; không log request body.

---

## 10. CONTACT

- Inbox: filter status/date, search.
- Detail: nội dung, thông tin người gửi, IP/UA (ẩn bớt), ghi chú nội bộ.
- Status: new → in_progress → resolved / spam.
- Không xoá vĩnh viễn trừ super_admin + audit.
- Export CSV (quyền `contact.read`).
- Permission: `contact.read/update`.

---

## 11. AUDIT LOG

- Ghi: login, logout, create/update/delete/publish, role change, settings,
  bootstrap, media delete, contact status.
- Trường: actor, action, entity, entity_id, before/after, ip, ua, time.
- Chỉ đọc; không UI sửa/xoá.
- Filter theo actor/action/entity/date.
- Permission: `audit.read`.

---

## 12. SETTINGS

- Site name, logo, favicon, contact info, social links, SEO default.
- Locale mặc định, bật/tắt EN.
- Maintenance mode.
- Permission: `settings.read/write`.

---

## 13. UX ADMIN

- Layout: sidebar + topbar; breadcrumbs; responsive.
- Data table: search, filter, sort, pagination server-side.
- Form: label rõ, lỗi cạnh field, autosave draft (tùy chọn).
- Xác nhận trước hành động phá huỷ; ghi rõ hậu quả.
- Empty states; loading skeletons; error boundaries.
- Không hiển thị nút nếu không có quyền, **và** vẫn chặn ở server.

---

## 14. THỨ TỰ TRIỂN KHAI

1. Auth + RBAC + bootstrap + audit.
2. Media.
3. Pages + News.
4. Conferences + rooms/dates.
5. People.
6. Programme Builder + import 2026.
7. Contact.
8. Users/Roles/Settings.
9. Legacy archive.
