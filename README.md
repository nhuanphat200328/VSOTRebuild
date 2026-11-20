# VSOT Website Rebuild

Next.js 16 + TypeScript + Tailwind 4 + Supabase. Branch làm việc: `ai-rebuild`.

> **Agent / lập trình viên mới: đọc `AGENTS.md` trước.**
> Lỗi đang tồn tại: `REVIEW_2026-11-20.md` · Kế hoạch sửa: `PLAN_01_FIX_BACKLOG.md` · Lộ trình: `PLAN_02_ROADMAP.md`.

## Yêu cầu

- Node.js >= 20.9 (đang dùng 24.x)
- npm
- Python 3 + `psycopg[binary]` (chỉ cho script migration/import)
- Supabase project (đã cấu hình trong `.env.local`)

## Cài đặt

```bash
npm install
```

Tạo `.env.local` từ `.env.example`, điền:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (chỉ server)
- `NEXT_PUBLIC_SITE_URL` (URL gốc của môi trường; hiện route đăng xuất còn dùng — xem FIX-04)
- `VSOT_LEGACY_2026_URL` (tùy chọn, mặc định `/legacy/2026/index.html`)
- `DIRECT_URL` (chỉ cần cho migration/import)
- `SUPER_ADMIN_BOOTSTRAP_SECRET`, `SUPER_ADMIN_EMAIL`: **không cần nữa** — Super Admin đã được tạo; giữ trống.

Không commit `.env.local`. Không gửi giá trị secret qua chat/tài liệu.

## Chạy local

```bash
npm run dev
```

Mở http://localhost:3000 — tự chuyển về `/legacy/2026/index.html` (website hội nghị 2026 bảo toàn).

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run build
npm run start -- -p 3100
node scripts/smoke.mjs http://localhost:3100   # có sau FIX-00
```

## Database

- Migrations: `supabase/migrations/0001..0016` — **đã áp dụng** (16 bản ghi `supabase_migrations.schema_migrations`).
- Áp dụng: `python scripts/apply_migrations.py` (mặc định dry-run, rollback) · `--apply` để ghi.
  **Lưu ý:** script hiện chạy lại *toàn bộ* file mỗi lần (DATA-13, sửa ở FIX-19) — migration mới phải idempotent.
- Trạng thái: public schema 35 bảng, 94 policy RLS, 3 storage bucket, 4 role, 31 permission.
- Import dữ liệu 2026: `python scripts/import_2026.py` — idempotent nhưng **ghi đè** mọi chỉnh sửa đã làm qua CMS
  (giờ, phòng, tiêu đề). **Không chạy lại trên DB thật nếu chưa được phê duyệt.**
  Nguồn: `supabase/seed/2026/programme.json` (từ legacy `programme.js`).

## Super Admin

Đã tạo (2026-11-20) qua `POST /api/bootstrap-super-admin`; secret đã xóa khỏi môi trường.
Endpoint giờ trả 503 và sẽ được gỡ ở ROADMAP R3.4. Tài khoản mới: tạo tại `/admin/users`.

## Routes hiện có (theo mã 2026-11-20)

Public:
- `/` → 307 → `/legacy/2026/index.html`
- `/legacy/<năm>/...` — website hội nghị cũ bảo toàn (2018, 2019, 2021, 2022, 2023, 2025, 2026)
- `/hoi-nghi/cac-nam-truoc` — trang “Hội nghị các năm trước” (**ngoài** `/vi`)
- `/vi/hoi-nghi`, `/vi/hoi-nghi/2026`
- `/vi/hoi-nghi/2026/chuong-trinh` (`?view=list|grid|table&date=YYYY-MM-DD`)
- `/vi/hoi-nghi/2026/chuong-trinh/tong-quan`
- `/vi/hoi-nghi/2026/phien/[id]`
- `/vi/hoi-nghi/2026/dien-gia`, `/vi/hoi-nghi/2026/dien-gia/[slug]`
- `/vi/tin-tuc`, `/vi/tin-tuc/[slug]`
- `/vi/lien-he` (form liên hệ, lưu DB)
- `/vi/[slug]` (trang CMS đã publish)
- `/vi/dang-nhap`
- Mọi route trên có bản `/en/...` (fallback tiếng Việt kèm thông báo).
- **`/vi`, `/en` hiện trả 404** (trang chủ Next đã xóa có chủ đích) — FIX-01 sẽ chuyển thành redirect.

Admin:
- `/admin` → `/admin/dashboard`
- `/admin/conferences`, `/admin/conferences/[id]/programme` (+ `/new`, `/[sessionId]`) — Programme Builder
- `/admin/pages` (+ `/new`, `/[id]`) — trang CMS song ngữ
- `/admin/news` (+ `/new`, `/[id]`, `/categories`)
- `/admin/media`, `/admin/contacts`, `/admin/users`

API: `/api/health`, `/api/auth/signout` (POST), `/api/bootstrap-super-admin` (POST, đã vô hiệu).

## Trạng thái

Đã có: website 2026 bảo toàn + archive các năm; programme 2026 từ dữ liệu thật (List/Grid/Table/Tổng quan,
chi tiết phiên, diễn giả, tìm kiếm không dấu); CMS Pages, News (+ danh mục), Media (upload), Contacts inbox,
Users (tạo, gán role, khóa), Programme Builder cơ bản (sửa/tạo phiên, báo cáo, chặn trùng phòng);
RBAC + RLS; import dữ liệu 2026.

Chưa có: CRUD hội nghị/ngày/phòng, quản lý diễn giả & phân công, xóa phiên/báo cáo, settings, audit log viewer,
mời user qua email, trang tìm kiếm riêng, test tự động. Chi tiết: `CMS_MODULES.md` (bảng trạng thái), `PLAN_02_ROADMAP.md`.

Lỗi đã biết (link 404, upload > 1 MB, hardcode năm, phân quyền…): xem `REVIEW_2026-11-20.md`.

Không có nội dung giả. Phần thiếu hiển thị "Nội dung đang được cập nhật".
