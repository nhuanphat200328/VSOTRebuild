# VSOT Website Rebuild

Next.js + TypeScript + Tailwind + Supabase.

## Yêu cầu

- Node.js >= 20.9 (đang dùng 24.x)
- npm
- Supabase project (đã cấu hình trong `.env.local`)

## Cài đặt

```bash
npm install
```

Tạo `.env.local` từ `.env.example`, điền:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPER_ADMIN_BOOTSTRAP_SECRET`
- `SUPER_ADMIN_EMAIL` (tùy chọn)
- `DIRECT_URL` (chỉ cần cho migration/import)

Không commit `.env.local`.

## Chạy local

```bash
npm run dev
```

Mở http://localhost:3000 — tự chuyển về `/vi`.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run build
```

## Database

- Migrations: `supabase/migrations/0001..0013`.
- Áp dụng: `python scripts/apply_migrations.py --apply` (mặc định dry-run).
- Trạng thái hiện tại: đã áp dụng, public schema 35 bảng, RLS bật.
- Import dữ liệu 2026 (idempotent):

```bash
pip install "psycopg[binary]"
python scripts/import_2026.py
```

Nguồn: `supabase/seed/2026/programme.json` (từ legacy `programme.js`).

## Tạo Super Admin (một lần)

Gọi endpoint server với secret trong `.env.local`:

```bash
curl -X POST http://localhost:3000/api/bootstrap-super-admin \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: <SUPER_ADMIN_BOOTSTRAP_SECRET>" \
  -d '{"email":"<email>","password":"<mat-khau-manh>","full_name":"Super Admin"}'
```

Sau khi thành công:
1. Đăng nhập tại `/vi/dang-nhap`.
2. Xóa `SUPER_ADMIN_BOOTSTRAP_SECRET` khỏi môi trường.
3. Rotate lại toàn bộ credential từng chia sẻ công khai.

## Routes hiện có

- `/vi`, `/en`
- `/vi/hoi-nghi`
- `/vi/hoi-nghi/2026`
- `/vi/hoi-nghi/2026/chuong-trinh` (`?view=list|grid|table`)
- `/vi/hoi-nghi/2026/chuong-trinh/tong-quan`
- `/vi/hoi-nghi/2026/phien/[id]`
- `/vi/hoi-nghi/2026/dien-gia`, `/dien-gia/[slug]`
- `/vi/lien-he` (contact form)
- `/vi/dang-nhap`
- `/admin`, `/admin/dashboard`
- `/admin/conferences`, `/admin/conferences/[id]/programme` (Programme Builder)
- `/admin/pages` (CMS Pages, song ngữ)
- `/admin/news`, `/admin/news/categories` (News CMS)
- `/admin/media`, `/admin/users`
- `/vi/tin-tuc`, `/vi/tin-tuc/[slug]`
- `/vi/hoi-nghi/cac-nam-truoc` (archive)
- `/legacy/2026/index.html` (website hội nghị 2026 bảo toàn)
- `/` redirect tới website 2026
- `/api/health`, `/api/bootstrap-super-admin`

## Trạng thái

Đã có: public site nền tảng, programme 2026 từ dữ liệu thật, faculty, tìm kiếm/lọc
inline, admin login/dashboard, RBAC + RLS, import dữ liệu.

Chưa có: CMS CRUD đầy đủ, Programme Builder UI, contact form, legacy archive,
trang search riêng, upload media, quản lý người dùng.

Không có nội dung giả. Phần thiếu hiển thị "Nội dung đang được cập nhật".




