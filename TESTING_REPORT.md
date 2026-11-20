# TESTING_REPORT.md — VSOT Rebuild (snapshot)

- Ngày: 2026-11-20
- Phạm vi: Phase 4 foundation + public programme views
- Môi trường: local `next start` port 3100; Supabase project thật.

## 1. Static checks

| Check | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 warning, 0 error) |
| `npm run build` | PASS (Next.js 16.4.6) |

## 2. Route smoke test

| Route | HTTP |
|---|---:|
| `/vi` | 200 |
| `/en` | 200 |
| `/vi/hoi-nghi` | 200 |
| `/vi/hoi-nghi/2026` | 200 |
| `/vi/hoi-nghi/2026/chuong-trinh` | 200 |
| `?view=grid` | 200 |
| `?view=table` | 200 |
| `/chuong-trinh/tong-quan` | 200 |
| `/phien/{uuid}` | 200 |
| `/dien-gia` | 200 |
| `/dien-gia?role=chair` | 200 |
| `/dien-gia/{slug}` | 200 |
| `/en/dien-gia/{slug}` | 200 |
| `/vi/dang-nhap` | 200 |
| `/admin` (chưa đăng nhập) | 307 → login |
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
| Migrations | 15 |
| Conference 2026 | 1 |
| Dates | 5 |
| Rooms | 6 |
| Sessions | 65 |
| Presentations | 255 |
| People | 245 |
| Session assignments | 127 |
| Presentation assignments | 221 |

## 4. Chưa kiểm thử

- Đăng nhập thật / tạo Super Admin (chưa có email/password).
- CMS CRUD (chưa triển khai).
- Programme Builder UI (chưa triển khai).
- Contact form: đã có UI + server action + insert RLS; chưa test qua trình duyệt, chưa có admin inbox/email.
- Upload media (chưa triển khai).
- Legacy archive mount (chưa triển khai).
- Visual regression / Lighthouse / accessibility audit.
- Mobile browser thật.
- Vercel Preview / Production.

## 5. Rủi ro

- Credential đã chia sẻ công khai → rotate trước Production.
- `auth.disable_signup` trên Dashboard vẫn `false`; trigger DB đang chặn,
  nhưng nên tắt ở cấu hình Auth.
- Chưa có E2E auth; middleware/admin guard mới test ở mức redirect.


