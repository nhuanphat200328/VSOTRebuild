# LEGACY_CONFERENCE_INVENTORY.md

- Ngày kiểm kê: 2026-11-20
- Nguồn: `PrototypeClone/public_html` — **READ-ONLY**
- Tổng file trong PrototypeClone: **9.304** (không thay đổi sau cleanup).
- Không xóa bất kỳ thư mục hội nghị hoặc tài nguyên nào.

## 1. Tất cả thư mục hội nghị tìm thấy

| Thư mục | Năm | Entry | Files | Dung lượng | Loại |
|---|---:|---|---:|---:|---|
| `chuongtrinhhoinghi2018` | 2018 | `index.php` | 1.175 | 12,1 MB | PHP/MySQL |
| `chuongtrinhhoinghi2019` | 2019 | `index.php` | 1.176 | 12,2 MB | PHP/MySQL |
| `chuongtrinhhoinghi2021` | 2021 | `index.php` | 1.200 | 200,5 MB | PHP/MySQL + slide |
| `chuongtrinhhoinghi2022` | 2022 | `index.php` | 1.203 | 26,1 MB | PHP/MySQL (bản thứ 2 của 2022) |
| `hoinghi2022` | 2022 | không có index | 20 | 14,9 MB | Word HTML + PDF/DOCX (bản tài liệu) |
| `hoinghi2023` | 2023 | không có index | 1 | 0,6 MB | Chỉ PDF chương trình |
| `hoinghi2025` | 2025 | `index.html` | 321 | 192,0 MB | Static ảnh + PDF/video |
| `hoinghi2026` | 2026 | `index.html` | 577 | 206,3 MB | Static HTML + PHP admin + JSON |

Không có thư mục website riêng cho **2020** và **2024**.

## 2. Thống kê theo loại file

### 2018
- JS 421, GIF 263, PHP 163, PNG 90, HTML 82, CSS 33, ASP 20, CFM 18, PL 12, PY 10, MD 8, LASSO 7.
- Có `admin/` + CKEditor/FCKEditor; phụ thuộc MySQL.
- 4 file nhắc `vsot.com.vn`.

### 2019
- JS 421, GIF 263, PHP 164, PNG 90, HTML 82, CSS 33, ASP 20, CFM 18, PL 12, PY 10, MD 8.
- Cấu trúc gần giống 2018.
- 5 file nhắc `vsot.com.vn`.

### 2021
- JS 421, GIF 263, PHP 164, PNG 90, HTML 82, CSS 33, ASP 20, CFM 18, PL 12, PPTX 11, PY 10, PPT 8.
- 200,5 MB do nhiều slide/PDF báo cáo.
- 5 file nhắc `vsot.com.vn`.

### 2022 PHP
- JS 421, GIF 235, PHP 164, PNG 90, HTML 82, PDF 55, CSS 33, ASP 20, CFM 18, PL 12, PY 10, MD 8.
- 5 file nhắc `vsot.com.vn`.
- Là bản website PHP khác với thư mục tài liệu `hoinghi2022`.

### 2022 tài liệu (`hoinghi2022`)
- PDF 6, HTM 4, XML 4, DOCX 3, THMX 2, ZIP 1.
- `chuong-trinh-hoi-nghi-final.htm`: Word HTML, meta `windows-1252`, nhiều numeric entity; một số ký tự `?` do mất dữ liệu.
- `CHƯƠNG TRÌNH TÓM TẮT ... LẦN VII.docx`: nguồn Unicode dùng phục hồi.
- Có bản `chuong-trinh-hoi-nghi-final.htm`, `chuong-trinh-tom-tat-2022 tp HCM.htm`, PDF/DOCX.

### 2023
- Chỉ 1 PDF `CHUONG TRI`NH HN GHEP TANG 2023 cap nhat.pdf` (640 KB).
- Không có HTML/CSS/JS.

### 2025
- JPG 315, PDF 4, MP4 1, HTML 1.
- `index.html` chỉ gồm ảnh trang chương trình + link Google Drive.
- PDF lớn: 2 bản CTKH ~67 MB, CTKH 1 MB, thông báo bổ sung; trailer 27,4 MB.

### 2026
- DOCX 312, HTML 152, PDF 37, GIF 14, JS 10, PHP 9, XLSX 7, CSS 6, PPTX 6, JSON 5, PNG 4.
- Public HTML 24; còn lại là admin, backup, tài liệu nội bộ (`File tham khao`), abstract DOCX.
- 25 file nhắc `vsot.com.vn`.

## 3. Phiên bản trùng lặp / liên quan

| Nhóm | Phiên bản | Ghi chú |
|---|---|---|
| 2022 | `chuongtrinhhoinghi2022` (PHP/MySQL) | Website động, DB |
| 2022 | `hoinghi2022` (Word HTML/PDF/DOCX) | Tài liệu tĩnh, nguồn phục hồi |
| 2018/2019 | Cấu trúc PHP gần giống | Giữ riêng từng năm |
| 2021 | Nhiều slide/PDF trùng tên với `pictures/` | Giữ tất cả |
| 2025 | 2 PDF CTKH gần giống tên | Giữ cả hai |
| 2026 | `backup/vsot-eau-design-20260904` | Bản thiết kế cũ, giữ nguyên |

## 4. Tài nguyên ngoài thư mục năm

- `public_html/pictures/`: ảnh/slide dùng chung, có thể liên quan 2021/2022.
- `public_html/images/`, `banner3/`, `fonts/`, `js/`, `Scripts/`: tài nguyên dùng chung.
- `public_html/book2019/`: bản CMS/sách 2019, không phải website hội nghị; giữ nguyên.
- `public_html/zinzzloD`: file lạ 481,8 MB, không rõ công dụng; giữ nguyên, không mở/chạy.
- `.env.local` 2026: **không đọc/copy**.
- `File tham khao/` 2026: DOCX nội bộ/PII; không copy public.

## 5. Khả năng triển khai độc lập

| Năm | Trạng thái | Lý do |
|---|---|---|
| 2026 | Migrated | Static public, đã copy public-only |
| 2025 | Migrated with limitations | Ảnh local; chưa copy PDF lớn/video |
| 2023 | Migrated document | Chỉ PDF |
| 2022 | Content restored | DOCX Unicode + bản full gốc |
| 2018–2022 PHP | Backend pending | PHP/MySQL, chưa có DB dump |
| 2020/2024 | Không có dữ liệu | Không có thư mục |

## 6. Nguyên tắc bảo toàn

- Không xóa file/thư mục trong PrototypeClone.
- Mọi năm và mọi phiên bản đều được giữ.
- Không đánh dấu migrated nếu chưa kiểm tra đủ trang/tài nguyên/chức năng.
- File chưa xác định (`zinzzloD`, backup, `book2019`) giữ nguyên và ghi nhận.
