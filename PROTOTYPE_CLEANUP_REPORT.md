# PROTOTYPE_CLEANUP_REPORT.md — VSOT Legacy Cleanup (Phase 1)

- Ngày thực hiện: 2026-11-20
- Phạm vi: `D:\Philao\code project\VSOT\PrototypeClone`
- Phương án backup: **không tạo backup** (theo xác nhận của người dùng)
- Tiêu chí: bảo toàn **VISUAL** — giữ mọi tài nguyên cần để tái hiện website cũ
- Trạng thái sau báo cáo: **PrototypeClone chuyển sang READ-ONLY vĩnh viễn**

---

## 1. TỔNG SỐ FILE

| Thời điểm | Files | Bytes | Ghi chú |
|---|---:|---:|---|
| Trước cleanup | **9.332** | **1.537.437.357** | ~1,47 GB |
| Sau cleanup | **9.304** | **1.535.280.005** | ~1,46 GB |
| Đã xóa | **28** | **2.157.352** | chỉ cache hệ điều hành / bytecode |

Kiểm tra lại sau xóa:
- `Thumbs.db` còn lại: **0**
- `.pyc` còn lại: **0**

Manifest đầy đủ: `PROTOTYPE_ASSET_MANIFEST.csv` (9.304 dòng, gồm path, size, ngày sửa, SHA-256).

---

## 2. DANH SÁCH FILE ĐÃ XÓA (28)

### 2.1. Windows thumbnail cache — 26 file `Thumbs.db`
```
public_html/admin/editor/dialog/common/images/Thumbs.db
public_html/admin/editor/images/Thumbs.db
public_html/admin/images/Thumbs.db
public_html/book2019/admin/editor/dialog/common/images/Thumbs.db
public_html/book2019/admin/editor/images/Thumbs.db
public_html/book2019/admin/images/Thumbs.db
public_html/chuongtrinhhoinghi2018/admin/editor/dialog/common/images/Thumbs.db
public_html/chuongtrinhhoinghi2018/admin/editor/images/Thumbs.db
public_html/chuongtrinhhoinghi2018/admin/images/Thumbs.db
public_html/chuongtrinhhoinghi2018/pictures/products/Thumbs.db
public_html/chuongtrinhhoinghi2018/pictures/products/zoom/Thumbs.db
public_html/chuongtrinhhoinghi2019/admin/editor/dialog/common/images/Thumbs.db
public_html/chuongtrinhhoinghi2019/admin/editor/images/Thumbs.db
public_html/chuongtrinhhoinghi2019/admin/images/Thumbs.db
public_html/chuongtrinhhoinghi2019/pictures/products/Thumbs.db
public_html/chuongtrinhhoinghi2019/pictures/products/zoom/Thumbs.db
public_html/chuongtrinhhoinghi2021/admin/editor/dialog/common/images/Thumbs.db
public_html/chuongtrinhhoinghi2021/admin/editor/images/Thumbs.db
public_html/chuongtrinhhoinghi2021/admin/images/Thumbs.db
public_html/chuongtrinhhoinghi2021/pictures/products/Thumbs.db
public_html/chuongtrinhhoinghi2021/pictures/products/zoom/Thumbs.db
public_html/chuongtrinhhoinghi2022/admin/editor/dialog/common/images/Thumbs.db
public_html/chuongtrinhhoinghi2022/admin/editor/images/Thumbs.db
public_html/chuongtrinhhoinghi2022/admin/images/Thumbs.db
public_html/chuongtrinhhoinghi2022/pictures/products/Thumbs.db
public_html/chuongtrinhhoinghi2022/pictures/products/zoom/Thumbs.db
```

### 2.2. Python bytecode cache — 2 file `.pyc`
```
public_html/hoinghi2026/tools/__pycache__/build_abstracts.cpython-312.pyc
public_html/hoinghi2026/tools/__pycache__/build_programme.cpython-312.pyc
```

### 2.3. Lý do xóa
- `Thumbs.db`: cache thumbnail của Windows, **không** được HTML/CSS/JS tham chiếu.
  Đã quét toàn bộ file text (php/html/css/js/json/xml/txt/htaccess/asp/cfm/pl/py)
  và không tìm thấy tham chiếu nào. Không ảnh hưởng hiển thị.
- `.pyc`: bytecode tái tạo được từ `.py`; không phục vụ hiển thị website.
- Không xóa bất kỳ file PHP, HTML, CSS, JS, ảnh, font, PDF, DOCX, XLSX, ZIP, DB
  hay thư mục nào.

### 2.4. Ứng viên đã cân nhắc nhưng GIỮ LẠI
| File/nhóm | Lý do giữ |
|---|---|
| `public_html/error_log` (70,6 MB) | Log server; không phục vụ visual nhưng có thể chứa thông tin cần điều tra. Không chắc → giữ. |
| `public_html/zinzzloD` (481,8 MB, không extension) | Không rõ nguồn gốc; không mở/chạy. Không chắc → giữ, đề xuất quarantine/scan riêng. |
| `.env.local`, `config.php` các site | Có thể chứa cấu hình/dữ liệu; không xóa. Cần xử lý riêng ngoài archive public. |
| 10 file `.zip` backup (editor, fckeditor, `chuongtrinhhoinghi2019.zip`) | Có thể chứa phiên bản file không còn trong cây hiện tại. Không chắc → giữ. |
| `.ftpquota`, `.lastlogin`, `.spamassassin*`, `.myimunify_id`, `.wp-toolkit-identifier`, `.bash*`, `.contactemail` | Metadata server, không phục vụ visual nhưng dung lượng nhỏ và có thể hữu ích khi điều tra hosting. Không chắc → giữ. |
| Toàn bộ `admin/`, `book2019/`, `chuongtrinhhoinghi20xx/` | Là một phần website cũ/PHP app; có thể cần để tái hiện hoặc tham chiếu. Giữ. |

---

## 3. CÁC WEBSITE ĐÃ KIỂM TRA

Kiểm tra tĩnh: tồn tại entry page, CSS/JS/ảnh cục bộ, link nội bộ tương đối.
Không chạy PHP/DB, không mở trình duyệt trong bước này.

| Site | HTML | CSS | Tham chiếu cục bộ | Ghi chú |
|---|---:|---:|---:|---|
| `public_html` (root legacy) | 684 | 250 | 10.654 | Nhiều file admin/editor sinh link động → false positive cao |
| `chuongtrinhhoinghi2018` | 83 | 33 | 1.488 | Có admin/editor; link động |
| `chuongtrinhhoinghi2019` | 83 | 33 | 1.488 | Tương tự 2018 |
| `chuongtrinhhoinghi2021` | 83 | 33 | 1.488 | Tương tự |
| `chuongtrinhhoinghi2022` | 83 | 33 | 1.488 | Tương tự |
| `hoinghi2022` | 4 | 0 | 18 | **0 missing** |
| `hoinghi2023` | 0 | 0 | 0 | Chỉ PDF chương trình |
| `hoinghi2025` | 1 | 0 | 272 | **0 missing** |
| `hoinghi2026` | 152 | 6 | 941 | 38 missing (xem mục 4) |
| `book2019` | 113 | 69 | 2.052 | Bản sao editor/CMS |

Chi tiết missing: `PROTOTYPE_BROKEN_LINKS.csv` (689 dòng, gồm false positive từ
JavaScript/editor).

---

## 4. LỖI/GAP PHÁT HIỆN Ở `hoinghi2026`

Các link nội bộ trỏ tới file **không tồn tại** (đã xác minh):

| Nhóm | File thiếu | Ảnh hưởng |
|---|---|---|
| Trang tài liệu chuyên đề | `ghep-da-tang-tai-lieu.html`, `ghep-gan-tai-lieu.html`, `ghep-phoi-tai-lieu.html`, `ghep-ruot-tai-lieu.html`, `ghep-than-tuy-tai-lieu.html`, `ghep-tuy-tai-lieu.html`, `ghep-tim-tai-lieu.html` | Link "Tài liệu" trong các trang chuyên đề bị 404 |
| Trang phụ | `index2.html` | Link trong `index.html` và bản backup |
| Biểu mẫu | `asset/Mau-Dang-Ky-Hoi-Vien-VSOT.docx` | Nút tải mẫu đăng ký hội viên hỏng |
| Font Awesome | `fonts/fontawesome-webfont.{eot,svg,ttf,woff}` (CSS trỏ `../fonts/`) | Icon FontAwesome cục bộ có thể không hiện; site còn dùng kit CDN |
| Ảnh trang trí | `style/images/pixel_br.gif` | Cosmetic |

Ngoài ra:
- `backup/vsot-eau-design-20260904/index.html` là bản backup thiết kế cũ, thiếu asset
  tương đối; **không phải** trang đang dùng.
- Một số href bắt đầu bằng `/materials/...` hoặc `/asset/...`; nếu deploy dưới
  subpath `/hoinghi2026/` sẽ sai. Cần mount đúng root hoặc rewrite khi archive.

---

## 5. KHẢ NĂNG TÁI HIỆN GIAO DIỆN

| Site | Kết luận |
|---|---|
| `hoinghi2025` | **Có** — 1 HTML + 272 tham chiếu cục bộ đều tồn tại |
| `hoinghi2022` | **Có** — 0 missing |
| `hoinghi2026` | **Có, trừ các gap ở mục 4** — trang chính, CSS, ảnh, PDF, chương trình JS đều còn |
| `hoinghi2023` | Chỉ PDF, không có website HTML |
| 2018/2019/2021/2022 PHP | **Một phần** — asset/HTML còn, nhưng cần PHP + DB để render động; chưa xác minh runtime |
| Root legacy + `book2019` | **Một phần** — phụ thuộc PHP/MySQL; nội dung thật nằm trong DB, không có trong file |

**Không thay đổi file nào ngoài 28 file cache đã liệt kê.**

---

## 6. ĐÓNG BĂNG PROTOTYPECLONE

Từ sau báo cáo này:

- **KHÔNG** sửa, đổi tên, di chuyển, xóa bất kỳ file/thư mục nào trong
  `D:\Philao\code project\VSOT\PrototypeClone`.
- Mọi thao tác đọc phải là read-only.
- Website mới chỉ được tham chiếu/copy tài nguyên sang `2027 demo` nếu được yêu cầu
  rõ ràng và có ghi nhận nguồn.
- Các credential trong PrototypeClone (`.env.local`, `config.php`) coi như đã lộ,
  không tái sử dụng.

---

## 7. VIỆC CẦN LÀM TIẾP (không thuộc cleanup)

1. Xác minh runtime các site PHP cũ (nếu muốn archive động) — cần PHP/MySQL.
2. Lấy DB dump của website VSOT cũ nếu muốn chuyển nội dung root site.
3. Quarantine/scan `zinzzloD` và `error_log` ngoài phạm vi archive public.
4. Kiểm tra `hoinghi2026` trên trình duyệt thật sau khi mount.
5. Phase 2: content inventory & mapping dữ liệu 2026/2027.
