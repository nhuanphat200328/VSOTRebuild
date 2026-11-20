# SECURITY_ROTATION_CHECKLIST.md

- Ngày: 2026-11-20
- Lý do: credential đã được gửi qua chat/không còn được coi là bí mật.
- Không ghi giá trị secret trong file này.

## 1. Việc phải làm trước Production

- [ ] Rotate Supabase JWT secret.
- [ ] Rotate anon/publishable key (sau khi cập nhật client).
- [ ] Rotate service role / secret key.
- [ ] Đổi database password.
- [ ] Cập nhật `.env.local` và Environment Variables trên Vercel.
- [ ] Không dùng lại `.env.local` hoặc `config.php` từ PrototypeClone.
- [ ] Tắt public signup trong Supabase Dashboard (`Auth > Providers > Email`).
- [x] Xóa `SUPER_ADMIN_BOOTSTRAP_SECRET` khỏi môi trường sau khi tạo Super Admin.
- [x] Tạo Super Admin đầu tiên (email người dùng cấp).
- [ ] Kiểm tra `git grep` không có secret trước khi push.
- [ ] Kiểm tra Vercel build logs không chứa secret.

## 2. Kiểm tra định kỳ

- [ ] RLS bật trên toàn bộ bảng public.
- [ ] `service_role` chỉ dùng server-side.
- [ ] Không có `NEXT_PUBLIC_` chứa secret.
- [ ] Audit log không bị sửa/xóa bởi user thường.
- [ ] Rate limit contact form (chưa triển khai).
- [ ] Kiểm tra dependency (`npm audit`) trước release.

## 3. Repo public / legacy manifest

- [ ] Repo `VSOTRebuild` đang public và lịch sử commit 231af4e có chứa
  `PROTOTYPE_ASSET_MANIFEST.csv` (đường dẫn file legacy có thể chứa tên cá nhân).
  Ưu tiên: chuyển repo sang private, hoặc rewrite history có phê duyệt.
- [ ] Không commit lại manifest/broken-links.

## 4. Ghi chú

- Rotate JWT secret sẽ làm mọi token cũ mất hiệu lực.
- Rotate anon key sẽ làm client cũ lỗi cho đến khi deploy key mới.
- Không commit file chứa credential; `.gitignore` đã chặn `.env*`.


