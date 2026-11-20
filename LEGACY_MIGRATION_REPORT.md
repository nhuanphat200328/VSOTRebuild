# LEGACY_MIGRATION_REPORT.md

- Ngày: 2026-11-20
- Phạm vi: website hội nghị VSOT 2018–2026
- Nguồn: PrototypeClone (READ-ONLY)
- Nguyên tắc: không sửa bản gốc; không dùng domain cũ để hiển thị website đã migrate.

## 1. Trạng thái từng website

| Năm | Trạng thái | URL mới | Ghi chú |
|---:|---|---|---|
| 2026 | **Migrated** | `/legacy/2026/index.html` | Public-only, root redirect |
| 2025 | **Migrated with limitations** | `/legacy/2025/index.html` | Ảnh/JS tự host; PDF lớn/video chưa copy; một số link Google Drive |
| 2023 | **Migrated** | `/legacy/2023/index.html` | Wrapper header/footer + PDF |
| 2022 | **Content restored** | `/legacy/2022/index.html` | Bản phục hồi UTF-8 + bản gốc full |
| 2022 (PHP) | **Backend pending** | — | `chuongtrinhhoinghi2022` cần MySQL/PHP |
| 2021 | **Migrated with limitations** | `/legacy/2021/index.html` | Snapshot nội dung, PHP backend không chạy |
| 2019 | **Migrated with limitations** | `/legacy/2019/index.html` | Snapshot + 26 trang text |
| 2018 | **Migrated with limitations** | `/legacy/2018/index.html` | Snapshot + 26 trang text |
| 2020 | Không có dữ liệu | — | Không có thư mục website |
| 2024 | Không có dữ liệu | — | Không có thư mục website |

## 2. Tự host

### 2026
- 218 file, ~145,9 MB trong `public/legacy/2026`.
- HTML/CSS/JS/data/materials/abstracts.
- Không copy `.env.local`, `admin/`, `.vercel`, backup, tài liệu nội bộ.
- Root `/` 307 → `/legacy/2026/index.html`.
- Đã kiểm tra 200: trang chủ, chương trình, CSS, JS, ảnh, PDF.

### 2025
- `public/legacy/2025`: 317 file, ~29,4 MB.
- Tự host `index.html`, 314 ảnh, poster, CTKH rút gọn.
- Link Google Drive giữ nguyên (dịch vụ bên thứ ba, có chủ đích).
- Chưa copy: trailer 27,4 MB, 2 PDF CTKH 67 MB. Cần bổ sung nếu muốn đầy đủ download.

### 2023
- PDF 640 KB tại `public/archive/2023/`.
- Không có website HTML.

### 2018 / 2019 / 2021
- Snapshot HTML công khai + CSS + toàn bộ text1..text26 (2018/2019).
- Trang con dùng shell header/footer chung.
- Không chạy PHP/MySQL; chức năng login/search/admin cũ không phục hồi.
- Nội dung có thể còn `?` do encoding database cũ.

### 2022 – phục hồi nội dung
- Bản gốc `chuong-trinh-hoi-nghi-final.htm`:
  - Word HTML, meta `windows-1252`.
  - Dùng numeric entity cho phần lớn tiếng Việt.
  - Một số ký tự đã thành `?` trong dữ liệu gốc (không phải lỗi font).
- Bản phục hồi `public/legacy/2022/index.html`:
  - Sinh từ DOCX Unicode `CHƯƠNG TRÌNH TÓM TẮT ... LẦN VII.docx`.
  - UTF-8, font hệ thống, responsive, bảng cuộn ngang.
  - 3 bảng, 17 hàng; ngày 09–10/12/2022.
  - Không tự đoán chỗ thiếu.
- Bản đầy đủ giữ nguyên:
  - `/legacy/2022/full-programme.htm`
  - `/legacy/2022/full-summary.htm`
- PDF: chương trình final, tóm tắt, abstract.
- Hạn chế: bản full gốc vẫn còn ký tự `?` do mất dữ liệu nguồn.

## 3. Header/footer dùng chung

- 2022, 2025, 2023 dùng `public/legacy/shared/legacy-shell.css` + `legacy-shell.js`.
- Logo → `/legacy/2026/index.html`.
- Menu/dropdown link nội bộ 2026/2025/2022/2023.
- Footer dùng thông tin liên hệ VSOT 2026.
- 2026 giữ header/footer gốc, chỉ thêm dropdown.

## 4. Database

- Không tạo database giả.
- 2026 dùng JSON/static; 2025/2023/2022 dùng tài nguyên tĩnh/PDF/DOCX.
- 2018/2019/2021/2022 PHP cần DB dump + PHP/MySQL; chưa có trong nguồn.
- Không phục hồi chức năng login/search/admin khi thiếu dữ liệu.

## 5. Không phụ thuộc domain cũ

- Archive không còn link tới `vsot.com.vn` cho 2022/2023/2025/2026.
- 2026 root dùng bản local.
- 2025 dùng ảnh local.
- 2022 dùng bản local.
- 2023 dùng PDF local.
- 2018/2019/2021 đã snapshot local, **không** chuyển sang domain cũ.
- Không có URL ổ D.

## 6. Kiểm thử

| Mục | Kết quả |
|---|---|
| `/` | 307 → `/legacy/2026/index.html` |
| `/legacy/2026/index.html` | 200 |
| `/legacy/2026/chuong-trinh.html` | 200 |
| `/legacy/2026/style/style.css` | 200 |
| `/legacy/2026/data/programme.js` | 200 |
| `/legacy/2026/materials/abs-tong-hop.pdf` | 200 |
| `/legacy/2025/index.html` | 200 |
| `/legacy/2025/pictures/01.jpg` | 200 |
| `/legacy/2022/index.html` | 200 |
| `/legacy/2022/files/chuong-trinh-final.pdf` | 200 |
| `/vi/hoi-nghi/cac-nam-truoc` | 200 tại thời điểm ghi — **nay 404**, trang đã chuyển sang `/hoi-nghi/cac-nam-truoc` (review 2026-11-20, FIX-02) |
| `typecheck`, `lint`, `build` | PASS |

## 7. Chưa hoàn thành / giới hạn

- **PHP backend 2018–2022**: snapshot nội dung đã có, nhưng login/search/admin cũ vẫn cần DB + PHP hosting nếu muốn phục hồi.
- **2025**: chưa copy PDF lớn/video; link Google Drive vẫn bên thứ ba.
- **2022**: bản full gốc còn `?` do mất byte; bản phục hồi từ DOCX là bản tóm tắt.
- Preview Vercel bật SSO Protection.
- Không tuyên bố tự host đầy đủ 2018–2022 khi chưa có backend.
