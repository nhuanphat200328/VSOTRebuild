# LEGACY_CONFERENCE_INVENTORY.md

- Ngày kiểm kê: 2026-11-20
- Nguồn: `PrototypeClone/public_html` (READ-ONLY)
- Không chỉnh sửa bản gốc.

## Tổng quan

| Năm | Thư mục | Entry | Files | Dung lượng | Công nghệ | Trạng thái migrate |
|---:|---|---|---:|---:|---|---|
| 2026 | `hoinghi2026` | `index.html` | 577 | 206,3 MB | Static HTML + PHP admin + JSON | **Migrated** (public-only) |
| 2025 | `hoinghi2025` | `index.html` | 321 | 192,0 MB | Static HTML + ảnh + PDF/video | **Migrated visual** |
| 2023 | `hoinghi2023` | PDF | 1 | 0,6 MB | PDF | **Migrated** (document) |
| 2022 | `hoinghi2022` | `chuong-trinh-hoi-nghi-final.htm` | 20 | 14,9 MB | Word HTML + PDF/DOCX | **Content restored** |
| 2022 | `chuongtrinhhoinghi2022` | `index.php` | 1.203 | 26,1 MB | PHP/MySQL | **Backend pending** |
| 2021 | `chuongtrinhhoinghi2021` | `index.php` | 1.200 | 200,5 MB | PHP/MySQL | **Backend pending** |
| 2019 | `chuongtrinhhoinghi2019` | `index.php` | 1.176 | 12,2 MB | PHP/MySQL | **Backend pending** |
| 2018 | `chuongtrinhhoinghi2018` | `index.php` | 1.175 | 12,1 MB | PHP/MySQL | **Backend pending** |

Không có thư mục website riêng cho 2020 và 2024.

## Chi tiết

### 2026 — Migrated
- Bản public: `public/legacy/2026/`.
- Giữ 24 HTML, asset, CSS, JS, data, materials, abstracts.
- Loại trừ `.env.local`, `admin/`, `.vercel`, `backup`, `tools`, `File tham khao`.
- Root `/` redirect tới `/legacy/2026/index.html`.
- Chức năng public: trang chủ, chương trình, chuyên đề, tài liệu, đăng ký, liên hệ.
- Admin PHP không chạy trên Vercel; đây là công cụ nội bộ.

### 2025 — Migrated visual
- Bản public: `public/legacy/2025/` (index, 314 ảnh, poster, CTKH PDF rút gọn).
- Ảnh trang chương trình tự host.
- Các nút Google Drive vẫn là dịch vụ bên thứ ba (theo thiết kế gốc).
- Chưa copy video trailer 27,4 MB và 2 PDF CTKH 67 MB; cần bổ sung nếu muốn đầy đủ download.

### 2023 — Migrated document
- PDF: `public/archive/2023/chuong-trinh-vsot-2023.pdf`.
- Không có website HTML.

### 2022 — Content restored
- Bản gốc `hoinghi2022/chuong-trinh-hoi-nghi-final.htm`:
  - Word HTML, meta `charset=windows-1252`.
  - Nhiều ký tự đã thành `?` (mất dữ liệu), không thể sửa chỉ bằng đổi charset.
- Nguồn phục hồi: file DOCX gốc `CHƯƠNG TRÌNH TÓM TẮT ... LẦN VII.docx` (Unicode đúng).
- Đã tạo trang mới `public/legacy/2022/index.html` từ bảng/biểu mẫu DOCX:
  - UTF-8, font hệ thống hỗ trợ tiếng Việt.
  - Responsive, bảng cuộn ngang.
  - Giữ 3 bảng chương trình, 17 hàng.
  - PDF kèm theo: `files/chuong-trinh-final.pdf`, `files/chuong-trinh-tom-tat.pdf`, `files/abstract-2022.pdf`.
- Nội dung ngày 09–10/12/2022 lấy từ DOCX; không tự đoán chỗ thiếu.
- Giao diện mới, không giữ layout Word gốc (được phép theo yêu cầu).

### 2018 / 2019 / 2021 / 2022 PHP — Backend pending
- Đây là ứng dụng PHP đọc MySQL, có `index.php`, `admin/`, `config.php`, tìm kiếm/phân trang.
- Không thể chạy PHP/MySQL trực tiếp trên Vercel/Next.
- Chưa migrate nếu không có:
  - DB dump.
  - PHP hosting.
  - Hoặc snapshot HTML đầy đủ.
- Không đưa link archive tới domain cũ cho các năm này.
- Phương án đề xuất: PHP hosting riêng (Apache/PHP 7/8 + MySQL) hoặc rewrite sang Next/Supabase sau khi có DB.

## Dependency / rủi ro
- Không dùng đường dẫn ổ D trong Production.
- 2018–2022 PHP phụ thuộc DB; nếu chỉ copy source sẽ không hiển thị.
- 2025 còn phụ thuộc Google Drive cho một số tài liệu (bên thứ ba).
- 2026 admin PHP không chạy trên Vercel; public site thì đầy đủ.
- Trang 2022 gốc có mất dữ liệu `?`; bản phục hồi dùng DOCX, không sửa bản gốc.
