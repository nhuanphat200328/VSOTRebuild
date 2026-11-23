# AUDIT_REMEDIATION_REPORT.md

- Ngày: 2026-11-20
- Phạm vi: remediation từ 11 tài liệu audit + REVIEW/PLAN
- Không sửa PrototypeClone.

## Tổng hợp

| Mức | Phát hiện chính | Đã sửa | Blocked/Pending |
|---|---:|---:|---:|
| Critical | 4 | 1 phần | 2 external, 1 dashboard |
| High | 9 | 8 | 1 phụ thuộc quyết định/thiết bị |
| Medium | 18 | 9 | phần còn lại |
| Low | 12 | 4 | phần còn lại |

## Đã sửa trong đợt này

- Link `/vi` chết trong Footer/breadcrumb; archive link chuyển `/hoi-nghi/cac-nam-truoc`.
- Shared archive Header link tương đối → absolute `/legacy/2026/...`.
- Signout trả 303, không fallback localhost.
- Media upload: giới hạn 3.5MB, server action body 4MB, bỏ SVG, lưu `uploaded_by`.
- Programme links dùng `year` động; session page kiểm tra đúng conference.
- Publish guard 0017 cho pages/news/sessions/presentations qua REST.
- News publish check cả EN; presentation publish check; category draft nếu không có quyền publish.
- Safe redirect login; sanitize contact search; rate limit contact; validate IP.
- Security headers cơ bản.
- Giữ `published_at`; reserved slug; slug khi delete.
- Bỏ hardcode dashboard.
- Footer social empty href → span.
- Cache-bust CSS legacy; no-store HTML legacy.
- Header mobile grid, menu mobile 8 mục, archive details.

## Test đã chạy

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Smoke local: `/` 307; `/vi` 404; `/vi/dang-nhap` 200; `/hoi-nghi/cac-nam-truoc` 200; `/legacy/2026/index.html` 200; `/legacy/2018/index.html` 200; `/api/health` 200.
- Migration 0017 applied.
- Chưa chạy E2E/RBAC thực tế, chưa test upload >1MB, chưa test direct REST publish với editor token.

## Blocked

- Rotate Supabase keys/JWT/DB password: cần Dashboard/Management access.
- Tắt public signup: cần Dashboard.
- Repo private/rewrite history: cần phê duyệt, không force push.
- Preview SSO: cần Protection Bypass/owner test.

## Chưa xử lý

Xem `AUDIT_REMEDIATION_PLAN.md` mục “Còn tồn đọng”.
