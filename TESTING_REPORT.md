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
| `/` | 307 → `/legacy/2026/index.html` |
| `/legacy/2026/index.html` | 200 |
| `/legacy/2026/chuong-trinh.html`, CSS/JS/PDF | 200 |
| `/vi/hoi-nghi/cac-nam-truoc` | 200 |
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
- People admin, settings UI.
- Tự host 2018–2025 (hiện dùng hosting gốc; 2023 PDF local).
- Media upload/user create chưa test submit (chỉ test render).
- Legacy archive.
- Visual regression, Lighthouse, accessibility audit, mobile browser thật.
- Vercel Preview public do đang bật SSO Protection.

## 6. Rủi ro

- Credential từng chia sẻ công khai: phải rotate trước Production.
- `auth.disable_signup` trên Dashboard vẫn `false`; trigger DB đang chặn.
- Repo public; lịch sử commit đầu có manifest legacy. Nên private hoặc rewrite history.
- `service_role` chỉ dùng server-side; không đưa vào `NEXT_PUBLIC_*`.
- Mutation CMS dùng `service_role` nên RLS/trigger không áp dụng cho thao tác admin; quyền chỉ kiểm ở app (SEC-01).

## 7. Đối chiếu với mã nguồn (review tĩnh 2026-11-20)

> Review đọc mã, **chưa chạy lại** test (môi trường review không có `node_modules`/Supabase).
> Các dòng dưới đây cho biết kết quả ở §2 **không còn đúng** với mã hiện tại; cần chạy lại bằng `scripts/smoke.mjs` (FIX-00).

| Route trong §2 | Kết quả cũ | Theo mã hiện tại | Lý do / việc sửa |
|---|---:|---|---|
| `/vi`, `/en` | 200 | **404** | Không có `app/[locale]/page.tsx` (đã xóa có chủ đích, `GLOBAL_DESIGN_AUDIT.md` §5). FIX-01 |
| `/vi/hoi-nghi/cac-nam-truoc` | 200 | **404** | Archive đã chuyển sang `/hoi-nghi/cac-nam-truoc`; `/vi/...` rơi vào route `[year]`. FIX-02 |
| `/hoi-nghi/cac-nam-truoc` (menu desktop) | — | Nhiều link **404** | `public/legacy/shared/header.html` dùng link tương đối. FIX-03 |
| Đăng xuất | — | Redirect sai | 307 + fallback `localhost` + đích `/vi` 404. FIX-04 |
| Upload media | chưa test submit | Lỗi với file > 1 MB | Giới hạn body Server Action 1 MB. FIX-05 |
| `/hoi-nghi/cac-nam-truoc` trên Vercel | chưa kiểm | Rủi ro 500 | Đọc file `public/` bằng `fs` lúc runtime. FIX-07 |

Bổ sung vào mục “Chưa kiểm thử” (§5):
- Đăng xuất qua trình duyệt; thông báo lỗi phân quyền với tài khoản editor/viewer.
- Kiểm quyền publish với tài khoản editor (SEC-02).
- Hiển thị ngày giờ trên Vercel (múi giờ UTC) cho tin tức và liên hệ (DATA-02, DATA-08).
- Link nội bộ toàn site (chưa có link checker trước FIX-00).
