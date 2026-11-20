# TESTING_REPORT.md — VSOT Rebuild

- Ngày: 2026-11-20
- Phạm vi: foundation, public programme/faculty, CMS Pages, Programme Builder
- Môi trường: local `next start` port 3100; Supabase project thật

## 1. Static checks

| Check | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS (Next.js 16.4.6) |

## 2. Route smoke test

| Route | HTTP |
|---|---:|
| `/vi`, `/en` | 200 |
| `/vi/hoi-nghi`, `/vi/hoi-nghi/2026` | 200 |
| `/chuong-trinh`, `?view=grid`, `?view=table` | 200 |
| `/chuong-trinh/tong-quan` | 200 |
| `/phien/{uuid}`, `/dien-gia`, `/dien-gia/{slug}` | 200 |
| `/vi/lien-he` | 200 |
| `/vi/dang-nhap` | 200 |
| `/admin` (chưa đăng nhập) | 307 → login |
| `/admin/dashboard` (có session) | 200 |
| `/admin/conferences` (có session) | 200 |
| `/admin/conferences/{id}/programme` | 200 |
| `/admin/conferences/{id}/programme/new` | 200 |
| `/admin/pages`, `/admin/pages/new` | 200 |
| `/admin/news`, `/admin/news/new`, `/admin/news/categories` | 200 |
| `/admin/media`, `/admin/users` | 200 |
| `/vi/tin-tuc` | 200 |
| `/vi/{slug}` (test page) | 200; test row đã xóa |
| `/api/health` | 200 |
| `/api/bootstrap-super-admin` sai secret | 401 |

## 3. Database

| Hạng mục | Giá trị |
|---|---:|
| Public tables | 35 |
| RLS policies | 94 |
| Storage buckets | 3 |
| Roles | 4 |
| Permissions | 31 |
| Migrations | 16 |
| Auth users | 1 (Super Admin) |
| Conference 2026 | 1 |
| Dates / rooms | 5 / 6 |
| Sessions / presentations | 65 / 255 |
| People | 245 |
| Session / presentation assignments | 127 / 221 |

## 4. Search

Đã kiểm tra `lib/utils/search.ts`:

- `Hội nghị khoa học` khớp `hoi nghi`.
- `Ghép thận` khớp `ghep than`.
- `Nguyễn Văn A` khớp `nguyen van`.
- `Điều phối hiến tạng` chuẩn hoá thành `dieu phoi hien tang`.

Search chạy client-side, không cần Enter, áp dụng cho Programme và Faculty.
Room/type/role filter cũng cập nhật ngay.

## 5. Chưa kiểm thử

- Submit form qua trình duyệt thật (CMS Pages, Programme Builder, contact).
- Legacy archive, people admin, settings UI.
- Media upload/user create chưa test submit (chỉ test render).
- Legacy archive.
- Visual regression, Lighthouse, accessibility audit, mobile browser thật.
- Vercel Preview public do đang bật SSO Protection.

## 6. Rủi ro

- Credential từng chia sẻ công khai: phải rotate trước Production.
- `auth.disable_signup` trên Dashboard vẫn `false`; trigger DB đang chặn.
- Repo public; lịch sử commit đầu có manifest legacy. Nên private hoặc rewrite history.
- `service_role` chỉ dùng server-side; không đưa vào `NEXT_PUBLIC_*`.
