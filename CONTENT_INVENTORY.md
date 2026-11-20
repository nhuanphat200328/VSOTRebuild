# CONTENT_INVENTORY.md — VSOT Content Audit (Phase 2)

- Ngày: 2026-11-20
- Nguồn: `PrototypeClone` (read-only) + dữ liệu JSON/HTML của hội nghị 2026
- Mục tiêu: xác định nội dung thật, nguồn, ngôn ngữ, mức đầy đủ trước khi thiết kế CMS

> Không có nội dung nào trong tài liệu này được tạo mới. Các chỗ thiếu ghi rõ
> `Nội dung đang được cập nhật`.

---

## 1. TỔNG QUAN NGUỒN

| Nhóm | Nguồn | Trạng thái |
|---|---|---|
| Website VSOT hiện tại | `public_html/index.php`, `home.php`, `trangchu.php`, `admin/` | **Động (PHP/MySQL)** — nội dung thật nằm trong DB, chưa có dump |
| Hội nghị 2018 | `chuongtrinhhoinghi2018/` | PHP app + asset |
| Hội nghị 2019 | `chuongtrinhhoinghi2019/` | PHP app + asset |
| Hội nghị 2021 | `chuongtrinhhoinghi2021/` | PHP app + nhiều PPT/PDF |
| Hội nghị 2022 | `chuongtrinhhoinghi2022/` + `hoinghi2022/` | PHP app + PDF/DOCX/HTM |
| Hội nghị 2023 | `hoinghi2023/` | Chỉ PDF chương trình |
| Hội nghị 2025 | `hoinghi2025/` | Static HTML + PDF + MP4 |
| Hội nghị 2026 | `hoinghi2026/` | Static HTML + PHP admin + JSON + DOCX/PDF/XLSX |
| TTS 2026 reference | `docs/TTS2026_PROGRAMME_REFERENCE.txt` | Tài liệu tham chiếu UI/UX |

**Giới hạn:** chưa có database dump của website VSOT hiện tại. Không thể trích xuất
giới thiệu Hội, ban chấp hành, tin tức, thành viên từ DB. Cần người dùng cung cấp
dump hoặc API/nguồn nội dung.

---

## 2. WEBSITE VSOT HIỆN TẠI (ROOT LEGACY)

### 2.1. Nhận diện
- Entry: `index.php` (6.905 bytes), `home.php` (12.478 bytes), `trangchu.php`.
- `config.php` (175 bytes) — cấu hình DB; **không đọc/không công bố**.
- `admin/` (1.042 file): CMS PHP cũ + CKEditor/FCKeditor.
- Thư viện dùng chung: `images/`, `js/`, `fonts/`, `pictures/`, `Scripts/`.
- Nhiều module PHP: tin tức, sản phẩm, đăng ký, liên hệ, đăng nhập, giỏ hàng,
  thanh toán, quên mật khẩu, tìm kiếm, RSS, sitemap.

### 2.2. Chuyên mục có dấu vết trong code
- Trang chủ, giới thiệu, tin tức, hoạt động, hội nghị, thư viện ảnh, liên hệ,
  đăng ký, tìm kiếm.
- Menu/column động lấy từ DB (`column_left.php`, `column_right.php`, `menudd.php`).
- **Không thể** xác nhận đầy đủ tên chuyên mục/nội dung nếu không có DB.

### 2.3. Kết luận
- Nội dung website hiện tại: **UNKNOWN / cần DB dump**.
- Tài nguyên hình ảnh/logo/banner có sẵn trong `public_html/images`,
  `public_html/pictures`, `public_html/banner3`.
- Không dùng nội dung từ DB cũ làm nội dung giả; chỉ migrate khi có nguồn xác thực.

---

## 3. HỘI NGHỊ 2026 — NGUỒN CHÍNH THỨC

### 3.1. Quyết định nguồn
Người dùng xác nhận: **chương trình khoa học lấy trực tiếp từ**
`PrototypeClone\public_html\hoinghi2026\chuong-trinh.html`
và các file có thể chưa cập nhật kịp.

Thực tế kỹ thuật:
- `chuong-trinh.html` chỉ là shell; dữ liệu được nạp bởi
  `data/programme.js` (99.653 ký tự) qua `window.VSOT_PROGRAMME`.
- `data/programme.json` (145.189 bytes) là bản JSON tương tự nhưng **thiếu tên phòng**
  (rooms chỉ có id). **`programme.js` là nguồn đầy đủ hơn**.
- Vì vậy: import từ `programme.js`, đối chiếu `chuong-trinh.html` để xác nhận
  trang đang dùng đúng file dữ liệu này.

### 3.2. Thống kê dữ liệu (đã parse)
| Chỉ số | Giá trị |
|---|---:|
| Ngày | 5 (13–17/10/2026) |
| Phòng | 6 |
| Phiên | 65 |
| Báo cáo | 255 |
| Lượt Chair | 120 |
| Lượt Discussant | 7 |
| Cá nhân unique (theo tên hiển thị) | 245 |
| Người có nhiều vai trò | 49 |
| Người tham gia nhiều phiên | 39 |
| Số phiên tối đa của 1 người | 4 |
| Báo cáo thiếu giờ | 1 |
| Báo cáo có affiliation | 192 |

Phân bố phiên:
- 13/10: 2 phiên (pre-congress)
- 14/10: 4 phiên (pre-congress)
- 15/10: 4 phiên (pre-congress)
- 16/10: 16 phiên (scientific)
- 17/10: 39 phiên (scientific)

Phòng (id / VI / EN / short):
| id | VI | EN |
|---|---|---|
| danang | Hội trường Đà Nẵng | Da Nang Hall |
| hoian | Hội trường Hội An | Hoi An Hall |
| sontra | Hội trường Sơn Trà | Son Tra Hall |
| mykhe | Hội trường Mỹ Khê | My Khe Hall |
| songhan | Hội trường Sông Hàn | Song Han Hall |
| bana | Hội trường Bà Nà | Ba Na Hall |

Loại phiên (type): `cme`, `scientific`, và các giá trị khác trong dữ liệu.
Category: `scientific`, `precongress`.

### 3.3. Cấu trúc bản ghi
Session:
```
roomId, title, titleVi, titleEn, titleViShort, titleEnShort,
type, category, start, end, chairs[], discussants[], presentations[], sid
```
Presentation:
```
start, end, title, speaker, affiliation, type, pid
```
Person (suy ra từ tên):
```
name (string), roles[] (C/D/P), session_ids[]
```
**Không có** person id ổn định trong dữ liệu nguồn; trùng tên là rủi ro cần xử lý
khi import (tạo `people` + `session_people`).

### 3.4. Vai trò thực tế trong dữ liệu 2026
| Tổ hợp | Số người |
|---|---:|
| P (Presenter) | 149 |
| C (Chair) | 45 |
| C+P | 44 |
| D+P | 3 |
| C+D | 2 |
| D (Discussant) | 2 |
| **Tổng** | **245** |

Ghi chú:
- Dữ liệu 2026 **không có** vai trò `Invited Speaker` (I). TTS có I, VSOT 2026 dùng
  C/D/P.
- Cần thiết kế role linh hoạt: `chair`, `discussant`, `presenter`, `invited_speaker`
  và có thể mở rộng.
- 49 người đa vai trò xác nhận: không được mô hình hoá 1 người = 1 vai trò.

### 3.5. Abstracts
- `data/abstracts.json`:
  - `byPresentation`: 124 entry
  - `review`: 3
  - `unmatched`: 0
  - `generatedAt`: 2026-10-14
- `abstracts/`: 132 file liên quan.
- `File tham khao/`: 318 DOCX abstract/báo cáo, 7 XLSX CTKH, PDF.
- Người dùng **cho phép sử dụng** các DOCX abstract.

### 3.6. Excel CTKH (7 phiên bản)
```
VSOT2026_CTKH_04Oct2026_ver1.xlsx
VSOT2026_CTKH_05Oct2026.xlsx
VSOT2026_CTKH_05Oct2026_ver3.xlsx
VSOT2026_CTKH_08Oct2026_ver1.xlsx
VSOT2026_CTKH_09Oct2026_ver1.xlsx
VSOT2026_CTKH_11Oct2026_verCheck.xlsx
VSOT2026_CTKH_11Oct2026_verHighlight.xlsx
```
- Chưa đọc sheet. Bản mới nhất theo tên: `11Oct2026_verHighlight`.
- Theo quyết định người dùng: **HTML/JS 2026 là nguồn chương trình chính**;
  Excel chỉ dùng đối chiếu, không tự động ghi đè.

### 3.7. Trang nội dung 2026 (24 HTML)
- Trang chủ, giới thiệu, chương trình khoa học, chương trình đào tạo, chuyên đề,
  hội viên, tin tức, tài liệu, tài liệu tham khảo, tóm tắt báo cáo, đăng ký tham dự,
  liên hệ.
- Chuyên đề: ghép thận/tụy, gan, tim, phổi, ruột, đa tạng.
- Thông báo: số 1, số 2, họp ban chấp hành; thư mời tài trợ.
- Ngôn ngữ: giao diện tiếng Việt; nút English hiện trỏ tới một PDF, **không phải**
  bản dịch toàn site.

### 3.8. Tài liệu/hình ảnh
- `materials/`: CTKH PDF, chương trình theo hội trường, sơ đồ, thư mời, template.
- `asset/`: logo VSOT cũ, KV 2026, QR abstract/đăng ký, favicon.
- `materials/KV.png` (1,58 MB) — banner chính.
- Video trailer 2025: `hoinghi2025/041125-TRAILER-VSOT-3n.mp4` (27,4 MB).

---

## 4. CÁC NĂM TRƯỚC

### 4.1. 2018 / 2019 / 2021 / 2022 (PHP)
- Mỗi thư mục ~1.180–1.208 file, 12,6–200,9 MB.
- Cấu trúc giống nhau: `admin/`, `pictures/`, `config.php`, `css.css`, các
  `display*.php`, `detail*.php`, `search*.php`, `paging*.php`.
- Nội dung chương trình nằm trong DB MySQL (không có dump trong PrototypeClone).
- 2021 chứa nhiều PPT/PDF báo cáo (200,9 MB).
- **Dùng được cho archive visual; không migrate nội dung nếu không có DB.**

### 4.2. 2022 (tài liệu tĩnh)
- `hoinghi2022/` gồm:
  - `chuong-trinh-hoi-nghi-final.htm` + `_files.zip`
  - `chuong-trinh-tom-tat-2022 tp HCM.htm`
  - 5 PDF/DOCX chương trình (bản tiếng Việt/Anh)
  - `ABSTRACT-2022c.pdf` (8,96 MB)
- Có thể chuyển thành archive HTML/PDF.

### 4.3. 2023
- Chỉ 1 PDF: `CHUONG TRI`NH HN GHEP TANG 2023 cap nhat.pdf` (640 KB).
- Không có website HTML.

### 4.4. 2025
- `index.html` (39.888 bytes) + 320 file asset.
- PDF CTKH (2 bản ~67–70 MB), CTKH rút gọn (1,05 MB), thông báo bổ sung.
- Poster `hoinghi-2025.jpg`, trailer MP4 27,4 MB.
- Link nội bộ kiểm tra: **0 missing**.

---

## 5. TÀI NGUYÊN DÙNG CHUNG

| Nhóm | Vị trí | Ghi chú |
|---|---|---|
| Logo VSOT | `public_html/asset`/`images`, `hoinghi2026/asset/logo1507104171.gif` | Nhiều phiên bản cũ; cần chọn bản chính thức |
| Banner KV 2026 | `hoinghi2026/asset/kv-vsot-2026.png`, `materials/KV.png` | Có bản chất lượng cao |
| Font | `public_html/fonts/`, `hoinghi2026` dùng Google Fonts | Có font cục bộ cũ |
| Icon | FontAwesome CDN + asset GIF cũ | Không có bộ icon hiện đại |
| Hình ảnh hoạt động | `public_html/images/`, `pictures/` | Chưa phân loại/không có metadata |
| Video | trailer 2025 | 1 file MP4 |

---

## 6. NỘI DUNG CÒN THIẾU / CHƯA XÁC MINH

| Nội dung | Trạng thái |
|---|---|
| Giới thiệu Hội (bản dài) | Có thể có trong DB cũ; chưa trích xuất |
| Lịch sử hình thành | Chưa xác minh nguồn |
| Ban chấp hành | Chưa xác minh danh sách chính thức |
| Thành viên | Chưa có dữ liệu |
| Tin tức hiện tại | DB cũ; chưa có dump |
| Hoạt động chuyên môn | Phân tán trong tin tức/DB |
| Hội nghị 2027 | **Chưa có dữ liệu** — sẽ hiển thị "Nội dung đang được cập nhật" |
| Bản dịch tiếng Anh toàn site | Chưa có; chỉ có một số tiêu đề 2026 song ngữ |
| Ảnh đại diện diễn giả 2026 | Chưa thấy file ảnh gắn với person trong JSON |
| Email/điện thoại liên hệ chính thức | Footer 2026 có: 201B Nguyễn Chí Thanh, Q.5, TP.HCM; (+84) 8 38 554 138; +84 983 723 493; vsot@outlook.com.vn — cần xác nhận lại |

---

## 7. KẾ HOẠCH MIGRATE NỘI DUNG

1. **2026**: import `programme.js` vào schema mới; tạo person từ tên; gắn role
   C/D/P; lưu `legacy_sid`, `legacy_pid` để truy vết.
2. **2025 / 2022 / 2023**: tạo `legacy_sites` + archive tĩnh; metadata năm, tiêu đề,
   mô tả, ảnh đại diện; link sang bản HTML gốc.
3. **2018–2022 PHP**: archive tĩnh; nếu muốn dữ liệu chương trình, cần DB dump.
4. **Root site**: chờ DB dump; không bịa nội dung.
5. **2027**: tạo conference record với trạng thái `draft`, các trường chưa có để
   `Nội dung đang được cập nhật`.
6. **Song ngữ**: mọi entity nội dung có `vi`/`en` + `translation_status`.
   Thiếu EN → fallback VI + banner "English translation is being updated."

---

## 8. NGUYÊN TẮC

- Không tạo tên bác sĩ/chức danh/đơn vị/bài báo cáo.
- Không lấy dữ liệu từ sheet Excel chưa xác nhận.
- Không đăng toàn bộ 318 DOCX abstract lên public nếu chưa có chính sách.
- Mọi nội dung chưa có → `Nội dung đang được cập nhật`.
