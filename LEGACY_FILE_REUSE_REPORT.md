# LEGACY_FILE_REUSE_REPORT.md

- Ngày: 2026-11-20
- Nguồn: `PrototypeClone/public_html` (READ-ONLY)
- Nguyên tắc: file không chắc chắn → giữ nguyên, không xóa.

## 1. Dùng trực tiếp

| Nhóm | Nguồn | Đích | Ghi chú |
|---|---|---|---|
| 2026 HTML | `hoinghi2026/*.html` | `public/legacy/2026/` | 24 trang public |
| 2026 asset | `asset/`, `style/`, `js/`, `data/`, `materials/`, `abstracts/` | `public/legacy/2026/` | Đã sửa 3 absolute path |
| 2025 trang | `hoinghi2025/index.html` | `public/legacy/2025/` | Giữ nguyên |
| 2025 ảnh | `hoinghi2025/pictures/` | `public/legacy/2025/pictures/` | 314 ảnh |
| 2025 poster/CTKH | `hoinghi-2025.jpg`, `CTKH.pdf` | `public/legacy/2025/` | Dùng trực tiếp |
| 2023 PDF | `hoinghi2023/*.pdf` | `public/archive/2023/` | Đổi tên an toàn |
| 2022 PDF | `hoinghi2022/*.pdf` | `public/legacy/2022/files/` | 3 PDF |
| 2022 full HTML | `chuong-trinh-hoi-nghi-final.htm`, `chuong-trinh-tom-tat-2022 tp HCM.htm` | `public/legacy/2022/` | Giữ bản gốc + `_files` |

## 2. Cần chỉnh sửa trên bản sao

| File/nhóm | Vấn đề | Xử lý |
|---|---|---|
| 2026 HTML | 3 link tuyệt đối `/asset`, `/materials`, `/favicon` | Đổi sang `/legacy/2026/...` trên bản copy |
| 2026 index | Thêm dropdown/CTA archive | Chỉ sửa bản deploy, không sửa gốc |
| 2022 full HTML | Meta `windows-1252`, ký tự `?` | Giữ bản gốc; tạo trang phục hồi riêng |
| 2025 index | Link Google Drive | Giữ (dịch vụ bên thứ ba), ghi nhận |
| Archive cards | URL cũ | Đổi sang `/legacy/...` nội bộ |

## 3. Cần phục hồi

| Nguồn | Vấn đề | Nguồn đối chiếu | Kết quả |
|---|---|---|---|
| `hoinghi2022/chuong-trinh-hoi-nghi-final.htm` | Word HTML, mất ký tự `?` | `CHƯƠNG TRÌNH TÓM TẮT ... LẦN VII.docx` | `public/legacy/2022/index.html` UTF-8 |
| `hoinghi2022/chuong-trinh-tom-tat-2022 tp HCM.htm` | Cùng lỗi encoding | DOCX/PDF | Giữ bản gốc, link riêng |
| 2022 full programme | Không thể khôi phục toàn bộ do byte mất | DOCX summary + PDF | Bản tóm tắt phục hồi; full giữ gốc |

## 4. Cần chuyển đổi (backend)

| Website | Công nghệ | Phụ thuộc | Đề xuất |
|---|---|---|---|
| `chuongtrinhhoinghi2018` | PHP/MySQL | DB, session, admin | PHP hosting riêng hoặc rewrite Next/Supabase |
| `chuongtrinhhoinghi2019` | PHP/MySQL | DB, session, admin | Như trên |
| `chuongtrinhhoinghi2021` | PHP/MySQL + slide | DB, file PPT/PDF | Như trên; giữ slide |
| `chuongtrinhhoinghi2022` | PHP/MySQL | DB, admin | Như trên |
| 2026 admin | PHP | config, JSON | Không public; giữ bản gốc |

Không thể chạy PHP/MySQL trực tiếp trên Vercel. Không có DB dump trong PrototypeClone.

## 5. Chưa xác định / giữ nguyên

| File/thư mục | Kích thước | Ghi chú |
|---|---:|---|
| `public_html/zinzzloD` | 481,8 MB | Không rõ, không mở/chạy, giữ |
| `public_html/error_log` | 70,6 MB | Log server, giữ |
| `public_html/book2019/` | 58 MB | CMS/sách 2019, không phải hội nghị |
| `hoinghi2026/backup/` | — | Thiết kế cũ, giữ |
| `hoinghi2026/File tham khao/` | — | DOCX/PII, không copy public |
| `hoinghi2026/admin/` | — | PHP admin, không copy public |
| `.env.local` 2026 | — | Secret, không đọc/copy |
| 10 file `.zip` backup | — | Có thể chứa bản cũ, giữ |

## 6. Không tái sử dụng (đề xuất, không xóa)

- `error_log`, `.ftpquota`, `.lastlogin`, `.spamassassin*`, `.bash*`: metadata server.
- `Thumbs.db`, `__pycache__`: đã xóa trong cleanup ban đầu (cache).
- Không có đề xuất xóa thêm file hội nghị nào.

## 7. Kết luận

- Đã tái sử dụng trực tiếp: 2026 public, 2025 visual, 2023 PDF, 2022 PDF/full HTML.
- Đã phục hồi nội dung 2022 từ DOCX Unicode.
- Chưa chuyển đổi: 2018/2019/2021/2022 PHP do thiếu DB/hosting.
- Mọi dữ liệu còn lại được giữ nguyên trong PrototypeClone.
