# SITEMAP.md — VSOT Website (Public + CMS)

- Ngày: 2026-11-20
- Locale: `vi` (mặc định), `en`
- URL pattern: `/{locale}/...`; root `/` redirect theo cookie `vsot_locale` (fallback `vi`).
  **Thực tế (2026-11-20):** `/` → `/legacy/2026/index.html`; không có cookie `vsot_locale`.

---

## 0. TRẠNG THÁI ROUTE THỰC TẾ (review 2026-11-20)

Sitemap bên dưới là thiết kế mục tiêu. Bảng này cho biết route nào **đã có** trong mã.

| Route thiết kế | Trạng thái | Ghi chú |
|---|---|---|
| `/` | Có (khác thiết kế) | Redirect tới website 2026 bảo toàn |
| `/[locale]` (trang chủ) | **Không có → 404** | Đã xóa có chủ đích; FIX-01 chuyển thành redirect |
| `/[locale]/gioi-thieu/*`, `/hoi-vien`, `/hoat-dong/*`, `/tai-lieu`, `/thu-vien-hinh-anh` | Chưa có | Dùng trang legacy 2026 tương ứng (`/legacy/2026/gioi-thieu.html`, `hoi-vien.html`, `tai-lieu.html`…) |
| `/[locale]/tin-tuc`, `/tin-tuc/[slug]` | Có | `/tin-tuc/[category]` chưa có |
| `/[locale]/hoi-nghi`, `/hoi-nghi/[year]` | Có | |
| `/[locale]/hoi-nghi/[year]/chuong-trinh` (+ `tong-quan`) | Có | `?date=&view=&q=&room=&type=`; đổi view làm mất bộ lọc (DATA-09) |
| `/[locale]/hoi-nghi/[year]/phien/[id]` | Có | Chưa kiểm phiên thuộc đúng năm (BUG-06) |
| `/[locale]/hoi-nghi/[year]/bao-cao/[id]`, `/tai-lieu`, `/archive`, `/chuong-trinh/tim-kiem` | Chưa có | |
| `/[locale]/hoi-nghi/[year]/dien-gia` (+ `[slug]`) | Có | Lọc role: chair/discussant/presenter |
| `/archive`, `/archive/[slug]` | Không dùng | Thay bằng **`/hoi-nghi/cac-nam-truoc`** (ngoài locale) + `/legacy/[year]/...` |
| `/[locale]/lien-he` | Có | Song song với `/legacy/2026/lien-he.html` (D2) |
| `/[locale]/tim-kiem`, `/chinh-sach-bao-mat`, `/mien-tru-trach-nhiem` | Chưa có | Footer 2026 đã bỏ link legal (GLOBAL_DESIGN_AUDIT §5) |
| `/[locale]/[slug]` (trang CMS) | Có | Không đặt slug trùng route tĩnh (FIX-08) |
| `/[locale]/dang-nhap` | Có | `/dang-xuat`, `/quen-mat-khau`, `/dat-mat-khau` chưa có (đăng xuất = `POST /api/auth/signout`) |
| `/admin/dashboard`, `/pages*`, `/news*`, `/media`, `/contacts`, `/users` | Có | `/contacts/[id]`, `/users/invite`, `/users/[id]` chưa có |
| `/admin/conferences`, `/conferences/[id]/programme` (+ `new`, `[sessionId]`) | Có | `/conferences/new`, `/[id]`, `/settings`, `/dates`, `/rooms`, `/import`, `/faculty`, `/documents`, `/sponsors`, `/legacy` chưa có |
| `/admin/people*`, `/roles`, `/audit`, `/settings`, `/profile` | Chưa có | ROADMAP R4 |

---

## 1. PUBLIC SITE

```
/                                   → redirect /vi
/[locale]
  /                                 Trang chủ
  /gioi-thieu                       Giới thiệu Hội
    /lich-su-hinh-thanh             Lịch sử hình thành
    /ban-chap-hanh                  Ban chấp hành
    /hoi-dong-khoa-hoc              (nếu có dữ liệu)
  /hoi-vien                         Thông tin hội viên
  /tin-tuc                          Danh sách tin
    /[category]                     Tin theo chuyên mục
    /[slug]                         Chi tiết tin
  /hoat-dong                        Hoạt động Hội
    /chuyen-mon                     Hoạt động chuyên môn
    /[slug]
  /hoi-nghi                         Danh sách hội nghị theo năm
    /[year]                         Conference landing page
      /chuong-trinh                 Programme (List/Grid/Table)
      /chuong-trinh/tong-quan       At a glance
      /chuong-trinh/tim-kiem        Search (nếu bật)
      /phien/[sessionId]            Chi tiết phiên
      /bao-cao/[presentationId]     Chi tiết báo cáo
      /dien-gia                     Faculty directory
      /dien-gia/[personSlug]        Hồ sơ diễn giả
      /tai-lieu                     Tài liệu hội nghị
      /archive                      Mở website gốc (legacy)
  /tai-lieu                         Tài liệu khoa học (toàn Hội)
  /thu-vien-hinh-anh                Thư viện ảnh
  /lien-he                          Liên hệ (form)
  /tim-kiem                         Tìm kiếm toàn site
  /chinh-sach-bao-mat
  /mien-tru-trach-nhiem
  /404
```

Ghi chú:
- Không tạo route rỗng. Route nào chưa có dữ liệu hiển thị
  `Nội dung đang được cập nhật`.
- `[year]` lấy từ conference slug (ví dụ `2026`, `2027`); không hardcode.
- Archive legacy có thể dùng route ngoài locale: `/archive/[slug]` để giữ URL gốc.

### 1.1. Programme routes (chi tiết)
```
/[locale]/hoi-nghi/[year]/chuong-trinh?date=YYYY-MM-DD&view=list|grid|table
/[locale]/hoi-nghi/[year]/chuong-trinh?q=...&room=...&type=...&track=...
/[locale]/hoi-nghi/[year]/phien/[sessionId]
/[locale]/hoi-nghi/[year]/bao-cao/[presentationId]
/[locale]/hoi-nghi/[year]/dien-gia?q=...&role=chair|discussant|presenter|invited
/[locale]/hoi-nghi/[year]/dien-gia/[personSlug]
```
- `date` dùng ISO `YYYY-MM-DD` (không dùng id số như TTS).
- `view` giữ nguyên khi đổi ngày; filter giữ nguyên khi đổi view (cải thiện so với TTS).
- Canonical session: `/[locale]/hoi-nghi/[year]/phien/[sessionId]`.

### 1.2. Legacy archive routes
```
/archive                                 Danh sách website hội nghị cũ
/archive/[slug]                          Trang giới thiệu + nút mở bản gốc
/legacy/[year]/...                       Static mount của site gốc (rewrite)
```
- Site gốc giữ nguyên HTML/CSS/JS/asset, mount dưới `/legacy/[year]/`.
- Không rewrite nội dung; chỉ rewrite path và chặn PHP execution.
- Với site PHP động (2018–2022, root), chỉ archive được phần HTML/asset tĩnh;
  nội dung động cần DB dump hoặc snapshot HTML.

---

## 2. AUTH

```
/[locale]/dang-nhap                  Đăng nhập (admin/editor)
/[locale]/dang-xuat
/[locale]/quen-mat-khau              (tùy chọn; ưu tiên magic link/invite)
/[locale]/dat-mat-khau               Set password sau invite
```
Không có đăng ký công khai.

---

## 3. ADMIN CMS

```
/admin                               → /admin/dashboard
/admin/dashboard                     Tổng quan (số liệu thật)
/admin/pages                         Trang nội dung
/admin/pages/new
/admin/pages/[id]
/admin/news                          Tin tức
/admin/news/categories
/admin/news/new
/admin/news/[id]
/admin/conferences                   Hội nghị
/admin/conferences/new
/admin/conferences/[id]              Tổng quan hội nghị
/admin/conferences/[id]/settings
/admin/conferences/[id]/dates
/admin/conferences/[id]/rooms
/admin/conferences/[id]/programme    Programme Builder
/admin/conferences/[id]/programme/import
/admin/conferences/[id]/faculty
/admin/conferences/[id]/documents
/admin/conferences/[id]/sponsors
/admin/conferences/[id]/legacy
/admin/people                        Diễn giả / nhân sự
/admin/people/new
/admin/people/[id]
/admin/media                         Thư viện media
/admin/contacts                      Yêu cầu liên hệ
/admin/contacts/[id]
/admin/users                         Người dùng
/admin/users/invite
/admin/users/[id]
/admin/roles                         Vai trò & quyền
/admin/audit                         Audit log
/admin/settings                      Cấu hình site
/admin/profile                       Hồ sơ cá nhân
```

---

## 4. NAVIGATION ĐỀ XUẤT

### 4.1. Public header
- Trang chủ
- Giới thiệu (dropdown: Lịch sử, Ban chấp hành)
- Tin tức
- Hoạt động
- Hội nghị (dropdown theo năm, mới nhất trước)
- Tài liệu
- Liên hệ
- Language switcher `VI | EN`
- Nút tìm kiếm

### 4.2. Conference sub-nav
- Tổng quan
- Chương trình
- At a glance
- Diễn giả
- Tài liệu
- Đăng ký (nếu có dữ liệu)
- Archive (nếu có)

### 4.3. Footer
- Về VSOT: Giới thiệu, Ban chấp hành, Hội viên
- Hội nghị: năm gần nhất, danh sách hội nghị
- Tài nguyên: Tài liệu, Thư viện ảnh, Archive
- Liên hệ: địa chỉ/email/điện thoại thật
- Chính sách bảo mật, Miễn trừ trách nhiệm
- Copyright

---

## 5. QUY TẮC URL

- Slug tiếng Việt không dấu, lowercase, hyphen.
- Không đổi slug đã publish nếu chưa có redirect 301.
- `conference.slug`: `2026`, `2027`, ...
- `person.slug`: `ho-ten` + hậu tố `-2` nếu trùng.
- `sessionId`/`presentationId`: UUID (không lộ tuần tự).
- Giữ `legacy_sid`/`legacy_pid` để map ngược.
- Canonical + hreflang cho `vi`/`en`.
