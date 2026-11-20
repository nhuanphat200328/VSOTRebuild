# PLAN_02_ROADMAP.md — Lộ trình phát triển tiếp theo (làm tuần tự)

- Tạo: 2026-11-20 · Đọc `AGENTS.md` trước.
- **Điều kiện bắt đầu:** `PLAN_01_FIX_BACKLOG.md` đã xong Giai đoạn A, B, C (FIX-00 → FIX-15).
- Mỗi giai đoạn R1…R7 làm theo thứ tự. Trong một giai đoạn, làm theo thứ tự đánh số trừ khi ghi “song song được”.
- Mỗi mục có: **Bước** · **Xong khi** (tiêu chí nghiệm thu) · **Lưu ý** (lỗi dễ mắc).
- Mục cần chủ dự án quyết định được đánh dấu `(cần duyệt)`; chưa có trả lời thì bỏ qua và ghi lại.

---

## R1 — KIỂM THỬ TỰ ĐỘNG NỀN

### [ ] R1.1 Unit test (Vitest)
- Bước: `npm i -D vitest`; thêm script `"test": "vitest run"`; test cho `lib/utils/search.ts`, `lib/utils/dates.ts`
  (đặc biệt `toVNDateTimeLocal`/`fromVNDateTimeLocal`), `lib/auth/next-path.ts`, `sniffMime`, `RESERVED_PAGE_SLUGS`.
- Xong khi: `npm test` pass; các ca đã ghi trong `TESTING_REPORT.md` §4 (search không dấu) thành test.
- Lưu ý: test không gọi Supabase thật; tách hàm thuần ra khỏi file `"use server"` để test được.

### [ ] R1.2 E2E (Playwright)
- Bước: `npm i -D @playwright/test`; kịch bản: trang public chính, đổi view chương trình, tìm kiếm, đăng nhập → dashboard → đăng xuất.
- Tài khoản test đọc từ biến môi trường `E2E_EMAIL`/`E2E_PASSWORD` (không commit). Chỉ chạy mutation trên DB test.
- Xong khi: `npx playwright test` pass ở local; ảnh chụp lưu ở `playwright-report/` (đã có trong `.gitignore`).

### [ ] R1.3 CI GitHub Actions
- Bước: workflow cho push lên `ai-rebuild`: `npm ci` → `typecheck` → `lint` → `test` → `build` (env giả cho `NEXT_PUBLIC_*`).
- Xong khi: badge xanh; không có secret thật trong workflow.
- Lưu ý: repo đang public (SEC-10) — không in env trong log.

---

## R2 — CHẤT LƯỢNG MÃ & NEXT 16

### [ ] R2.1 Generate types Supabase
- Bước: `npx supabase gen types typescript --project-id nkxlapocuspqwcavymqz > supabase/types/database.types.ts`;
  truyền generic `Database` cho cả 4 client (`admin`, `server`, `client`, `public`); xóa dần `as unknown as`.
- Xong khi: `typecheck` pass, số lượng `as unknown as` giảm rõ rệt (ghi số trước/sau vào change log).
- Lưu ý: chạy lại lệnh mỗi khi thêm migration; quan hệ lồng (nested select) trả object hoặc mảng tùy FK — kiểm kỹ.

### [ ] R2.2 Cache trang public
- Bước: sau FIX-16, dùng `revalidate`/`unstable_cache` (hoặc `"use cache"` nếu bật Cache Components) cho dữ liệu chương trình,
  tin tức, trang CMS; trong admin action dùng `revalidateTag` theo hội nghị/slug thay cho `revalidatePath("/", "layout")`.
- Xong khi: trang chương trình không truy vấn DB ở mỗi request; sửa phiên trong CMS → public cập nhật ngay.
- Lưu ý: root layout đang gọi `headers()` (HYG-06) khiến mọi trang dynamic — phải xử lý R2.3 trước hoặc cùng lúc.

### [ ] R2.3 Bỏ `headers()` khỏi root layout (cần duyệt — đổi cấu trúc thư mục)
- Bước: dùng route group với nhiều root layout: `app/(site)/[locale]/layout.tsx` (`<html lang={locale}>`),
  `app/(admin)/admin/layout.tsx`, `app/(archive)/hoi-nghi/cac-nam-truoc/...`. Bỏ header `x-vsot-locale` trong middleware/proxy.
- Xong khi: build hiển thị các trang tĩnh/ISR được (ký hiệu ○ hoặc ● thay vì ƒ trong output `next build`); smoke pass.
- Lưu ý: điều hướng giữa 2 root layout khác nhau là full reload — chấp nhận được (admin ↔ site).

### [ ] R2.4 Component UI dùng chung + chuỗi song ngữ
- Bước: `components/ui/` thêm `Button`, `Input`, `Select`, `Alert`, `EmptyState`, `FormError`; gom chuỗi VI/EN lặp lại
  (`locale === "en" ? ... : ...`) vào `lib/i18n/dictionary.ts`.
- Xong khi: các form admin dùng component chung; không đổi giao diện hiện tại (so ảnh trước/sau).

---

## R3 — BẢO MẬT TRƯỚC PRODUCTION

### [ ] R3.1 Credential & tài khoản (cần duyệt; chủ dự án thao tác trên Dashboard)
- Bước: làm hết `SECURITY_ROTATION_CHECKLIST.md` §1, §3: rotate JWT/anon/service/DB password; cập nhật `.env.local` + Vercel;
  tắt public signup (Auth > Providers > Email); chuyển repo private hoặc rewrite history (có phê duyệt).
- Xong khi: checklist §1, §3 đánh `[x]`; app chạy với key mới; key cũ bị vô hiệu.
- Lưu ý: rotate anon key làm client cũ lỗi đến khi deploy lại — làm trong khung giờ được báo trước.

### [ ] R3.2 Security headers
- Bước: `next.config.ts` → `headers()`: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`.
  CSP bật dạng `Content-Security-Policy-Report-Only` trước: cho phép `cdnjs.cloudflare.com` (Font Awesome),
  `fonts.googleapis.com`/`fonts.gstatic.com`, iframe `www.google.com` (Maps), ảnh từ Supabase Storage,
  script inline của trang legacy (`legacy-shell.js`, `onclick` trong header).
- Xong khi: không lỗi console trên trang legacy + Next; sau 1 tuần không có vi phạm thì chuyển CSP sang enforce.
- Lưu ý: header `onclick="..."` trong HTML legacy cần `'unsafe-inline'` hoặc chuyển sang file JS — đừng làm vỡ menu mobile.

### [ ] R3.3 SEC-01 giai đoạn B — mutation theo phiên đăng nhập (cần D5)
- Bước: chuyển từng module sang `createSupabaseServerClient()` (thứ tự: contacts → pages → news → programme → media metadata);
  giữ service role chỉ cho `auth.admin.*`, đếm rate-limit, audit insert.
  Sau mỗi module: test với 3 tài khoản admin/editor/viewer (đọc, sửa, publish, xóa).
- Xong khi: RLS + trigger `guard_publish` + `guard_user_roles` thực sự áp dụng cho thao tác CMS;
  `SYSTEM_ARCHITECTURE.md` §12 cập nhật lại.
- Lưu ý: `insert(...).select("id")` cần policy SELECT cho user — kiểm từng bảng; restrictive delete policy yêu cầu `*.delete`.

### [ ] R3.4 Gỡ endpoint bootstrap
- Bước: xóa `app/api/bootstrap-super-admin/` (đã bootstrap xong); giữ hàm SQL `bootstrap_super_admin` (chỉ service_role gọi được).
  Cập nhật `README.md`, `CMS_MODULES.md` §9.
- Xong khi: `POST /api/bootstrap-super-admin` → 404.

### [ ] R3.5 Phụ thuộc
- Bước: `npm audit`; ghi kết quả vào `SECURITY_ROTATION_CHECKLIST.md` §2; nâng cấp bản vá (patch/minor) có kiểm thử.

---

## R4 — HOÀN THIỆN CMS (theo thứ tự `CMS_MODULES.md` §14)

### [ ] R4.1 Hội nghị: tạo/sửa + ngày + phòng
- Bước: `/admin/conferences/new`, `/admin/conferences/[id]` (thông tin, translations VI/EN, status), `/dates`, `/rooms`.
  Quyền `conference.read/write/publish`; không xóa hội nghị đã publish (chỉ archive).
- Xong khi: tạo được hội nghị 2027 draft hoàn toàn qua CMS, không cần SQL.
- Lưu ý: `conferences.slug` = năm; thêm vào slug cấm? (không cần — nằm dưới `/hoi-nghi/[year]`).

### [ ] R4.2 Diễn giả (People) + phân công trong Programme Builder
- Bước: `/admin/people` (tìm không dấu, lọc), sửa hồ sơ, cảnh báo trùng tên (không auto-merge);
  trong trang sửa phiên: thêm/xóa chủ tọa, thảo luận; trong báo cáo: thêm báo cáo viên.
- Xong khi: thay đổi phân công hiển thị đúng ở trang phiên, danh sách diễn giả, hồ sơ.
- Lưu ý: `getAdminPeople()` hiện chỉ lấy `status = published` — admin cần thấy cả draft.

### [ ] R4.3 Programme Builder nâng cao
- Bước: xóa mềm phiên/báo cáo (`programme.delete`); sắp xếp kéo-thả báo cáo; trang “Kiểm tra trước khi publish”
  (trùng phòng, báo cáo ngoài khung giờ, thiếu tiêu đề VI, phiên thiếu phòng) — chỉ báo, không tự sửa; publish theo ngày.
- Xong khi: đáp ứng `CMS_MODULES.md` §5.2 – §5.4.

### [ ] R4.4 Media nâng cao
- Bước: upload file lớn bằng `createSignedUploadUrl` (trình duyệt đẩy thẳng lên Storage, server chỉ ghi metadata);
  bucket `documents` cho PDF; sửa alt/caption; kiểm “đang dùng” cả trong body trang/tin.
- Xong khi: upload PDF 40 MB thành công trên Vercel.

### [ ] R4.5 Liên hệ
- Bước: xem lịch sử ghi chú (`contact_notes`), xuất CSV (`contact.read`), thông báo email khi có liên hệ mới (cần duyệt dịch vụ gửi mail).

### [ ] R4.6 Cấu hình site & Audit log viewer
- Bước: `/admin/settings` (`site_settings`: tên, liên hệ, mạng xã hội — giải quyết D4), `/admin/audit` (lọc actor/action/entity/ngày, chỉ đọc).

### [ ] R4.7 Người dùng: mời qua email, đặt lại mật khẩu
- Bước: `auth.admin.inviteUserByEmail` thay cho mật khẩu tạm; trang `/[locale]/dat-mat-khau`; giữ chặn public signup
  (metadata `vsot_invite = "true"` bắt buộc — trigger 0013).
- Lưu ý: cấu hình SMTP trên Supabase trước (cần duyệt).

---

## R5 — NỘI DUNG & DỮ LIỆU

### [ ] R5.1 Đối chiếu dữ liệu 2026 (cần duyệt)
- Bước: xác nhận tên phòng, phiên bản Excel CTKH chính thức (`PROJECT_INITIAL_AUDIT.md` §7.8); mọi chỉnh sửa làm qua CMS
  (không chạy lại import).
### [ ] R5.2 Tóm tắt báo cáo (abstracts) (cần duyệt chính sách công bố)
- Bước: map `abstracts.json` (124 mục) vào báo cáo; chỉ công bố phần được phép (PII, bệnh án).
### [ ] R5.3 Legacy còn thiếu
- Bước: 2025 — PDF CTKH (~67 MB) + trailer (~27 MB) đưa lên Supabase Storage, không đưa vào git;
  2018–2022 PHP — quyết định giữ snapshot hay dựng backend riêng.
### [ ] R5.4 Faculty theo hội nghị ở tầng DB (DATA-17)
- Bước: truy vấn từ `session_people`/`presentation_people` lọc theo `conference_id` (view hoặc RPC) thay vì tải toàn bộ `people`.

---

## R6 — CHUẨN BỊ HỘI NGHỊ 2027

### [ ] R6.1 Gỡ phụ thuộc cứng vào 2026
- Bước: rà `git grep -n "2026"` trong `app/ components/ lib/ middleware|proxy`; chuyển nhãn “Hội nghị 2026”, `HOME_URL`,
  danh sách archive sang cấu hình (`site_settings` hoặc `lib/site.ts`).
- Xong khi: đổi hội nghị hiện hành chỉ cần sửa cấu hình + tạo conference trong CMS.
### [ ] R6.2 Website 2027 (cần duyệt)
- Bước: chọn phương án — landing Next dùng dữ liệu CMS (`/[locale]/hoi-nghi/2027`) hay site tĩnh như 2026;
  khi 2027 lên: thêm 2026 vào `lib/archive/conferences.ts`, header legacy dropdown, `shared/header.html`; đổi `HOME_URL`.
- Lưu ý: cập nhật cả header HTML của **mọi** trang legacy (2018–2026) — dùng script thay thế có kiểm tra, rồi bump `?v=`.
### [ ] R6.3 Tiếng Anh (D3)
- Bước: theo quyết định D3 — hoặc hoàn thiện bản dịch + hiện lại nút EN, hoặc redirect `/en/*` → `/vi/*`.

---

## R7 — TRIỂN KHAI & CHUYỂN PRODUCTION

### [ ] R7.1 Kiểm Preview (D6)
- Bước: smoke + e2e chạy với URL Preview (Protection Bypass header nếu được cấp); kiểm archive, upload, đăng xuất, liên hệ.
### [ ] R7.2 Chất lượng
- Bước: Lighthouse (mobile) ≥ 90 performance/accessibility cho trang chương trình; axe không lỗi nghiêm trọng;
  thử thật trên iOS Safari + Chrome Android (375/390/430 px) — ghi kết quả trung thực.
### [ ] R7.3 Cutover (cần duyệt)
- Bước: `pg_dump` sao lưu DB; env Production trên Vercel; kế hoạch domain + rollback; R3.1 đã xong; merge `ai-rebuild` → `main`
  chỉ khi được phê duyệt.
### [ ] R7.4 Sau khi chạy
- Bước: theo dõi Vercel/Supabase logs 1 tuần; xem `audit_logs`; ghi sự cố vào `TESTING_REPORT.md`.
