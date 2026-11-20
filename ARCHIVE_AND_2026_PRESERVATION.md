# ARCHIVE_AND_2026_PRESERVATION.md

- Ngày: 2026-11-20
- Mục tiêu: bảo toàn website VSOT 2026 và xây mục Hội nghị các năm trước.

## 1. Website VSOT 2026

### 1.1. Bản gốc
- Nguồn: `PrototypeClone/public_html/hoinghi2026`
- Không chỉnh sửa PrototypeClone sau cleanup.
- Website gốc gồm HTML tĩnh + PHP admin + JSON data + materials.

### 1.2. Bản phục vụ trên hệ thống mới
- Vị trí: `public/legacy/2026/`
- Đã sao chép **chỉ tài nguyên public**:
  - 24 trang HTML
  - `asset/`, `style/`, `js/`, `data/`
  - `materials/` (PDF, template, sơ đồ)
  - `abstracts/`
- Tổng: 218 file, ~145,9 MB.
- **Không sao chép**:
  - `.env.local`
  - `.vercel/`
  - `admin/` (PHP admin + config)
  - `backup/`, `tools/`, `reports/`
  - `File tham khao/` (DOCX nội bộ/PII)
- Đã sửa 3 đường dẫn tuyệt đối trong bản copy:
  `/asset/...`, `/materials/...`, `/favicon.ico` → prefix `/legacy/2026/...`.
  Bản gốc không bị sửa.

### 1.3. URL
- Root website mới `/` → **307** → `/legacy/2026/index.html`.
- Có thể override bằng `VSOT_LEGACY_2026_URL`.
- Truy cập trực tiếp: `/legacy/2026/index.html`.
- Đã kiểm tra 200:
  - `index.html`, `chuong-trinh.html`
  - `style/style.css`, `data/programme.js`, `asset/kv-vsot-2026.png`
  - `materials/abs-tong-hop.pdf`

### 1.4. Giới hạn
- `admin/` PHP không chạy trên Next/Vercel; đây là công cụ nội bộ, không phải giao diện public.
- Các form public của 2026 là liên kết tĩnh/Google Form, không có POST PHP trong HTML.
- Bản gốc vẫn đầy đủ trong PrototypeClone và Vercel legacy project `vsot-website`.

## 2. Nút truy cập trên website 2026

- Đã thêm dropdown top-level “Hội nghị các năm trước” trong header 2026 (desktop + mobile details).
- Dropdown chỉ gồm năm đã migrate: 2025, 2023 (PDF), 2022.
- Logo VSOT trên site mới trỏ `/legacy/2026/index.html`.
- CTA card và link archive vẫn giữ.
- Bản gốc PrototypeClone không thay đổi.

## 3. Hội nghị các năm trước

URL: `/[locale]/hoi-nghi/cac-nam-truoc`

Mapping đã xác minh:

| Năm | Nguồn / URL | Loại | Ghi chú |
|---:|---|---|---|
| 2025 | `https://vsot.com.vn/hoinghi2025/` | live site | 200 |
| 2023 | `/archive/2023/chuong-trinh-vsot-2023.pdf` | PDF local | Không có website HTML |
| 2022 | `https://vsot.com.vn/hoinghi2022/chuong-trinh-hoi-nghi-final.htm` | static page | 200 |
| 2021 | `https://vsot.com.vn/chuongtrinhhoinghi2021/` | PHP site | 200 |
| 2019 | `https://vsot.com.vn/chuongtrinhhoinghi2019/` | PHP site | 200 |
| 2018 | `https://vsot.com.vn/chuongtrinhhoinghi2018/` | PHP site | 200 |

Không có website riêng cho 2020 và 2024 trong kho nguồn.
Không đưa 2026 vào danh sách vì 2026 là website hiện tại.

### 3.1. Nguyên tắc
- Không đổi giao diện website cũ.
- Không ép template mới.
- 2018–2022 dùng hosting cũ vì phụ thuộc PHP/MySQL.
- 2025 dùng hosting cũ (static).
- 2026 tự host trong Next để không phụ thuộc project Vercel legacy.
- Link archive không trỏ đường dẫn ổ D.

## 4. Kiểm thử

- Root 307 → `/legacy/2026/index.html`.
- Legacy 2026: HTML/CSS/JS/data/PDF trả 200.
- Archive page VI/EN: 200.
- 2026/2025/2022/2021/2019/2018 URLs: 200 (kiểm tra 2026-11-20).
- 2023 PDF local: 200.
- 2020/2024 không có website.

## 5. Việc còn lại

- Nếu muốn tự host 2018–2022: cần môi trường PHP/MySQL hoặc snapshot HTML tĩnh.
- Nếu muốn tự host 2025: cần copy ~192 MB asset/PDF/video.
- Không đưa `admin/` hoặc `.env.local` lên public.
