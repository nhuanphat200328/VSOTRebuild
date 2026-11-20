# GLOBAL_DESIGN_AUDIT.md

- Ngày: 2026-11-20
- Chuẩn tham chiếu: hội nghị 2026 (`/legacy/2026/index.html`)
- `index2.html` không tồn tại trong kho nguồn; dùng `index.html` làm chuẩn thực tế.

## 1. Tài nguyên đã kiểm tra

- `style/style.css` của 2026 (header, footer, responsive, font).
- HTML 2026 (23 trang public).
- Logo `/legacy/2026/asset/logo1507104171.gif`.
- Cờ English `/legacy/2026/asset/lacoen.gif`.
- Font Awesome 6.5.2 CDN.
- CSS/JS shell dùng chung:
  - `public/legacy/shared/legacy-shell.css`
  - `public/legacy/shared/legacy-shell.js`
- CSS riêng của 2018/2019/2021/2022/2025.

## 2. Thông số Header chuẩn

- Chiều cao: 74px desktop, 64px mobile.
- Container: max-width 1200px, padding 16px.
- Logo: cao 44px desktop, 38px mobile; trái; link `/legacy/2026/index.html`.
- Font: system-ui/Segoe UI/Roboto/Arial.
- Menu: 15px, weight 600; màu `#172536`; hover `#0d81cd`.
- Background: trắng, border-bottom `#dbe5ee`, shadow nhẹ.
- Sticky top, z-index 1000.
- Dropdown: trắng, radius 10px, shadow, hover/click.
- Breakpoint: 1104px; mobile dùng nút ☰.
- Menu order: Hội Ghép tạng VN, Hội nghị 2026, Chuyên đề, Tài liệu, Tin tức, Hội viên, Hội nghị các năm trước, Liên hệ, English.

## 3. Thông số Footer chuẩn

- Nền `#10283d`, chữ `#dbe7f0`, tiêu đề `#e9ac37`.
- 4 cột desktop; 1 cột mobile.
- Cột: Về VSOT, Dịch vụ, Truyền thông, Liên hệ.
- Thông tin liên hệ: 201B Nguyễn Chí Thanh, Q.5, TP.HCM; (+84) 8 38 554 138; +84 983 723 493; vsot@outlook.com.vn.
- Không có Chính sách bảo mật / Miễn trừ trách nhiệm.

## 4. Component dùng chung

- `public/legacy/shared/legacy-shell.css`
- `public/legacy/shared/legacy-shell.js`
- Header/footer 2026 gốc được nhúng vào:
  - 2026: 23 HTML
  - 2018: 27 HTML
  - 2019: 27 HTML
  - 2021: 1 HTML
  - 2022: index + full pages
  - 2023: index
  - 2025: index
- Next site dùng `SiteHeader`/`SiteFooter` cho archive/news/contact.

## 5. Đã xử lý

- Logo 2026: bỏ toàn bộ `index2.html`; trỏ `/legacy/2026/index.html`.
- Xóa legal links khỏi footer 2026.
- Xóa CTA archive cuối trang chủ 2026.
- Xóa `/vi` page; `/vi` trả 404.
- Archive chuyển sang `/hoi-nghi/cac-nam-truoc` (không phụ thuộc `/vi`).
- Archive dropdown: 2025, 2023, 2022, 2021, 2019, 2018.
- 2018/2019/2021 snapshot + 26 trang con (2018/2019).
- 2023 wrapper có header/footer.

## 6. Kiểm thử

- 2026 index/subpages: 200.
- 2018/2019/2021/2022/2023/2025: 200.
- `/hoi-nghi/cac-nam-truoc`: 200.
- `/vi`: 404.
- Logo `index2`: 0 occurrence; privacy/terms: 0 occurrence in 2026.
- Header/footer shell hiện diện trên mọi trang legacy.
- `typecheck`, `lint`, `build`: pass.

## 7. Khác biệt còn tồn tại

- 2026 và các năm cũ dùng cùng markup Header/Footer 2026 + `header-footer-2026.css`.
- Next pages (`/hoi-nghi/cac-nam-truoc`, `/tin-tuc`, `/lien-he`) dùng React `SiteHeader/SiteFooter`, không phải shell HTML; thiết kế tương đồng nhưng không pixel-identical.
- 2018/2019/2021 nội dung snapshot có thể còn `?` do encoding database cũ.
- 2022 bản full gốc còn `?`; bản phục hồi là tóm tắt.
- Chưa kiểm tra trình duyệt thật/desktop-tablet-mobile bằng screenshot; mới kiểm tra HTTP/HTML.


## 8. Cập nhật lần cuối

- Footer: thêm rule trắng + typography dùng chung trong `header-footer-2026.css`.
- Footer 2018: nguyên nhân lệch cỡ chữ do CSS cũ `#main/footer` kế thừa; đã ép font-size `.95rem`, h5 `.9375rem`, font Roboto bằng `!important`.
- Footer links: bỏ gạch chân mặc định, chỉ hover/focus mới gạch chân; mục liên hệ dạng text không bị gạch chân.
- Header: đổi nhãn “Hội nghị các năm trước” → “Hội nghị các năm”; giữ dropdown.
- Header: đã xóa toàn bộ English/lacoen khỏi HTML legacy và React Header.
- Trang `/hoi-nghi/cac-nam-truoc` dùng shared header/footer HTML 2026 qua `public/legacy/shared/header.html` + `footer.html`, không dùng React SiteHeader/SiteFooter.
- Google Maps: chỉ có 1 iframe tại `/legacy/2026/lien-he.html`; đổi sang query địa chỉ `201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh, Việt Nam`.
- Đã kiểm tra HTTP: 2018/2019/2021/2026, archive, liên hệ: 200.
- Chưa kiểm tra trực quan hover/screenshot trên trình duyệt; chưa xác minh marker Google Maps bằng mắt.


## 9. Fix logo và menu archive

- Nguyên nhân logo không hiển thị trên `/hoi-nghi/cac-nam-truoc`: Shared Header dùng `src="./asset/logo1507104171.gif"`, resolve thành `/hoi-nghi/cac-nam-truoc/asset/...` → 404.
- Đã đổi tất cả logo header sang `/legacy/2026/asset/logo1507104171.gif`.
- File logo: `public/legacy/2026/asset/logo1507104171.gif` (7.995 bytes), sao chép từ `hoinghi2026/asset`.
- Link logo: `/legacy/2026/index.html`.
- Nguyên nhân chữ “Hội nghị các năm” nhỏ: rule `.nav-item--archive .nav-link { font-size: .82rem; }` trong shared CSS và `2026/style/style.css`.
- Đã bỏ rule nhỏ; dùng `font-size: inherit`, `white-space: nowrap`, `flex: 0 0 auto`.
- Đã giảm nav gap từ 1.75rem xuống 1.3rem để đủ chỗ, không tăng chiều cao Header.
- Kiểm tra HTTP: archive 200, logo 200, header shared 200.
- Chưa kiểm tra Network/Console và hover trực quan bằng trình duyệt; mới xác minh HTTP.


## 10. Sticky trang chương trình 2026

- Nguyên nhân: `.prog-filters` có `position: sticky; top: 5rem; z-index: 40` trên desktop.
- Đã đổi `.prog-filters` sang `position: static; top: auto; z-index: auto`.
- `.tl-sticky-head` đổi `top: calc(5rem + var(--prog-filters-h, 0px))` → `top: 5rem`.
- `programme.js` set `--prog-filters-h` = `0px`.
- Sticky bắt đầu từ timeline header (chứa dòng “Kéo ngang hoặc dùng mũi tên…”), không còn giữ bộ lọc.
- Không đổi bố cục, chiều cao bảng, filter, nút mũi tên hay kéo ngang.
- Chưa kiểm tra cuộn thực tế bằng trình duyệt; đã kiểm tra CSS/JS.


## 11. Header mobile và tiêu đề

- Thêm CSS `@media (max-width:1104px) .inner-header .hamburger-menu { margin-left:auto; display:flex; align-items:center; justify-content:flex-end; }`.
- Logo giữ trái; hamburger sát phải; không dùng position:absolute.
- Áp dụng trong `shared/header-footer-2026.css` và `2026/style/style.css`.
- Logo link thêm `aria-label`/`title` “Hội Ghép tạng Việt Nam”; logo vẫn trỏ `/legacy/2026/index.html`.
- Header 2026 không có tiêu đề chữ riêng; tiêu đề nhận diện là logo + alt/title.
- Chưa kiểm tra mobile bằng trình duyệt thật.


## 12. Mobile header – nguyên nhân và sửa lần cuối

- Header render thực tế: markup tĩnh trong từng file legacy + `public/legacy/shared/header.html` cho archive. Không phải React SiteHeader cho các trang legacy.
- Lần trước chỉ thêm `margin-left:auto` cho hamburger, nhưng `.header-menu`/`.header-button` vẫn chiếm flex item và chưa có `justify-content:space-between`; đồng thời rule nằm sau nhiều CSS cũ nên dễ bị ghi đè.
- Mobile nav là `.mobile-nav` riêng, không render `.nav-item--archive`; vì vậy “Hội nghị các năm” không xuất hiện.
- Đã sửa:
  - `@media(max-width:1104px)`: `.inner-header { justify-content:space-between }`.
  - Ẩn `.header-menu`, `.header-button`, `.select-language` trên mobile.
  - `.hamburger-menu { margin-left:auto; display:flex; align-items:center }`.
  - Thêm `<details class="mobile-nav-archive">` vào `.mobile-nav` tất cả trang legacy, gồm 2025/2023/2022/2021/2019/2018.
  - CSS details: summary giống link, tap mở/đóng, không phụ thuộc hover.
- Không thay đổi CSS desktop (media query chỉ max 1104px).
- Đã kiểm tra HTTP 2026/2018/2019/2021/archive: 200; mobile archive details có trong HTML.
- Chưa kiểm tra viewport 375/390/430 bằng trình duyệt thật; chưa xác minh hover/tap thực tế.


## 13. Mobile header – sửa theo screenshot (không đọc được ảnh)

- Xác định DOM: Header tĩnh `.full-header > .inner-header`; mobile menu riêng `.mobile-nav`.
- Nguyên nhân hamburger giữa: mobile vẫn để `.inner-header` flex với các item ẩn/không ẩn triệt để; đã chuyển mobile sang CSS Grid `1fr auto`, ẩn `.header-menu`, `.header-button`, `.select-language`.
- Hamburger `justify-self:end`, không dùng absolute/translate.
- Mobile menu cũ hardcode “Trang chủ/Giới thiệu VSOT…” đã thay bằng đúng 8 mục PC:
  Hội ghép tạng VN, Hội nghị 2026, Chuyên đề, Tài liệu, Tin tức, Hội viên, Hội nghị các năm (details), Liên hệ.
- `.mobile-nav-archive` dùng `<details>` + summary, tap mở/đóng, danh sách 2025/2023/2022/2021/2019/2018.
- Desktop gap trả về `1.75rem` như gốc.
- Không có tiêu đề chữ riêng trong Header 2026; nhận diện là logo + title/alt.
- Đã kiểm tra HTTP 2026/2018/2019/2021/archive: 200; mobile menu HTML đúng.
- Chưa kiểm tra 375/390/430 bằng trình duyệt/screenshot; model không đọc được ảnh đính kèm.
