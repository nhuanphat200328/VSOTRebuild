# AUDIT_REMEDIATION_PLAN.md

- Ngày: 2026-11-20
- Nguồn: 11 tài liệu audit + REVIEW_2026-11-20 + PLAN_01_FIX_BACKLOG
- Trạng thái: đang triển khai remediation

## Critical / Production blockers

| ID | Phát hiện | Trạng thái | Ghi chú |
|---|---|---|---|
| CRED-1 | Toàn bộ credential Supabase từng lộ qua chat | **Blocked** | Cần rotate trên Supabase Dashboard; không thể tự đổi key/DB password từ code |
| CRED-2 | Repo public chứa manifest legacy trong history | **Blocked** | Cần chuyển repo private hoặc rewrite history; không force push khi chưa duyệt |
| SEC-01 | Admin mutation dùng service_role; RLS/trigger không bảo vệ publish | **Fixed một phần** | Thêm `0017_publish_guard.sql` chặn editor publish qua REST; service_role vẫn dùng server-side có kiểm tra quyền |
| SEC-10 | `auth.disable_signup` Dashboard = false | **Blocked** | Cần tắt trên Supabase Dashboard; trigger 0013 đang chặn |

## High

| ID | Phát hiện | Trạng thái | Thay đổi |
|---|---|---|---|
| BUG-01 | Link `/vi` chết | **Fixed** | Footer/about/home trỏ 2026/archive; `/vi` vẫn 404 theo yêu cầu |
| BUG-02 | Link `/vi/hoi-nghi/cac-nam-truoc` chết | **Fixed** | Footer trỏ `/hoi-nghi/cac-nam-truoc` |
| BUG-03 | Shared Header archive dùng link tương đối | **Fixed** | Toàn bộ `href/src` trong `shared/header.html` chuyển absolute |
| BUG-04 | Signout 307 + fallback localhost | **Fixed** | `303` + `request.url`, về `/vi/dang-nhap` |
| BUG-05 | Media >1MB lỗi Server Action | **Fixed** | `bodySizeLimit: 4mb`, giới hạn 3.5MB |
| BUG-06 | Link programme hardcode 2026; session không kiểm tra năm | **Fixed** | `year` prop cho List/Grid/Table/Results; session so `conference_id` |
| BUG-07 | Archive đọc public bằng fs có thể ENOENT | **Fixed** | `outputFileTracingIncludes` cho 2 file shell |
| SEC-02 | Thiếu publish check news EN/presentation/category | **Fixed** | Check `en_status`, presentation `programme.publish`, category draft nếu thiếu quyền |
| SEC-05 | SVG upload, thiếu uploaded_by | **Fixed một phần** | Bỏ SVG, ghi `uploaded_by`; chưa magic-byte sniff |
| HF-1 | Footer social `href=""` | **Fixed** | Đổi thành `<span>` |

## Medium / Low đã sửa

- SEC-03: `safeNextPath()` chặn `//`, `\`, fallback `/admin`.
- SEC-04: sanitize query contact admin (bỏ ký tự PostgREST).
- SEC-06: rate limit contact 5/IP/10 phút; validate IP bằng `node:net`.
- SEC-08: security headers cơ bản (nosniff, frame, referrer, permissions, HSTS).
- DB-3: migration `0017` publish guard đã áp dụng.
- DATA-01: giữ `published_at` khi sửa page đã publish.
- DATA-03: chặn reserved slug; đổi slug khi soft-delete.
- DATA-10: bỏ số migration/CMS hardcode khỏi dashboard.
- DATA-16/HF: social footer không còn link rỗng.

## Còn tồn đọng / chưa làm

- Rotation credential, tắt signup Dashboard, repo private/rewrite history.
- Chuyển toàn bộ admin mutation sang session client (SEC-01 Phase B).
- Audit log cho toàn bộ CMS mutation.
- Magic-byte MIME sniff, signed upload URL.
- People admin, conference CRUD đầy đủ, media alt edit, RBAC conference scope.
- `middleware.ts` → `proxy.ts` (Next 16 deprecation).
- Generated `database.types.ts`.
- Automated smoke/link/E2E tests.
- Preview Vercel SSO chưa bypass; chưa test thiết bị thật.
- 2018/2019/2021 PHP backend vẫn content snapshot.
