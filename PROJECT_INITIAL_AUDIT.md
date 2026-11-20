# PROJECT_INITIAL_AUDIT.md — VSOT Website Rebuild

- Ngày audit: 2026-11-20 (Asia/Ho_Chi_Minh)
- Phạm vi: PHASE 0 — Environment Audit
- Trạng thái: Hoàn tất audit sơ bộ. **Cập nhật:** Phase 1 cleanup đã thực hiện ngày\n  2026-11-20 (xóa 28 file cache); xem `PROTOTYPE_CLEANUP_REPORT.md`.
- Người thực hiện: AI Coding Agent

> Tài liệu này chỉ ghi nhận thông tin kiểm tra được. Không chứa mật khẩu, API key,
> token hay nội dung file cấu hình nhạy cảm.

---

## 1. KẾT LUẬN NHANH

| Hạng mục | Trạng thái |
|---|---|
| Workspace `2027 demo` | Tồn tại, **trống hoàn toàn**, ghi được |
| Node.js / npm | Sẵn sàng (Node v24.17.0, npm 11.13.0) |
| Git local | Chưa khởi tạo repository |
| GitHub remote | Repository tồn tại nhưng **chưa có refs** (trống) |
| GitHub CLI (`gh`) | Chưa cài |
| Vercel CLI | Chưa cài |
| Supabase CLI | Chưa cài |
| Supabase project / credentials | **Chưa có cấu hình mới**, chưa xác minh |
| PrototypeClone | 9.332 file, ~1,47 GB; có nhiều site hội nghị cũ + dữ liệu 2026 |
| Dữ liệu chương trình thật | Có: `programme.json`, `abstracts.json`, 7 file Excel CTKH 2026 |
| Rủi ro bảo mật | `.env.local`, `config.php`, `error_log` 70 MB, file lạ `zinzzloD` 482 MB |

**Kết luận:** Môi trường local đủ để bắt đầu Phase 4 (foundation), nhưng **bị chặn**
ở các điểm cần người dùng cung cấp/phê duyệt:

1. Supabase project mới + secrets mới (các secret cũ coi như đã lộ).
2. Quyền push GitHub (PAT/SSH hoặc cài `gh`) — repo hiện trống.
3. Quyền truy cập Vercel (token hoặc thao tác qua dashboard).
4. Xác nhận phạm vi dữ liệu: website mới dùng dữ liệu hội nghị **2026** hay **2027**.
5. Phê duyệt trước khi thực hiện xóa/dọn bất kỳ file nào trong `PrototypeClone`
   (Phase 1 cleanup).

---

## 2. MÔI TRƯỜNG HỆ THỐNG

| Thành phần | Giá trị |
|---|---|
| OS | Windows NT 10.0.26300.0 |
| Shell | Windows PowerShell 5.1.26100.9818 |
| CPU logical | 12 |
| RAM | 31,6 GB |
| Ổ D: còn trống | ~65,4 GB (70.244.524.032 bytes) |
| Node.js | v24.17.0 |
| npm | 11.13.0 |
| npx | 11.13.0 |
| Git | 2.55.0.windows.5 |
| VS Code CLI | 1.142.0 |
| pnpm | Không có |
| yarn | Không có |
| GitHub CLI (`gh`) | Không có |
| Vercel CLI | Không có |
| Supabase CLI | Không có |
| npm registry | Kết nối được (`npm ping` → PONG ~1,3 s) |

**Đề xuất:** dùng **npm** (không cài thêm package manager). Có thể dùng `npx vercel`
và `npx supabase` khi cần, tránh cài global không kiểm soát.

---

## 3. WORKSPACE `2027 demo`

- Đường dẫn: `D:\Philao\code project\VSOT\2027 demo`
- Nội dung hiện tại: **rỗng** (không có file/thư mục, kể cả file ẩn)
- Quyền ghi: **có** (đã test tạo/xóa file tạm thành công)
- Git: **không phải repository**, không có `.git`
- Chưa có `package.json`, `next.config`, `.env`, `.gitignore`, source code

**Kết luận:** có thể khởi tạo dự án mới tại đây mà không có nguy cơ ghi đè.

---

## 4. GIT & GITHUB

### 4.1. Local
- `git -C "2027 demo" rev-parse --is-inside-work-tree` → **not a git repository**
- Không có repo ở thư mục cha (`VSOT`, `code project`)
- `user.name` đã cấu hình; `user.email` đã cấu hình (không ghi giá trị vào tài liệu)

### 4.2. Remote
- URL yêu cầu: `https://github.com/nhuanphat200328/VSOTRebuild`
- `git ls-remote` → exit code 0, **không trả về ref nào**
- Diễn giải: repository tồn tại nhưng **trống** (chưa có commit/branch), hoặc
  không có quyền đọc ref. Cần xác nhận trên GitHub.
- Chưa có remote local vì chưa có repo local.

### 4.3. Công cụ
- `gh` chưa cài → không thể tạo PR/kiểm tra Actions qua CLI.
- Có thể push bằng HTTPS + PAT hoặc SSH nếu người dùng cấu hình.

### 4.4. Đề xuất quy trình
1. Khởi tạo repo local tại `2027 demo` (Phase 4, sau khi có scaffold).
2. Thêm remote `origin` đúng URL, không tạo remote trùng.
3. Tạo branch phát triển `ai-rebuild`; giữ `main` trống/ổn định.
4. Không push `main` cho đến khi có phê duyệt Production.
5. Kiểm tra `.gitignore` trước mọi commit.

---

## 5. SUPABASE

### 5.1. Hiện trạng
- Không có biến môi trường `SUPABASE_*`, `DATABASE_*`, `SUPER_ADMIN_*` trong shell.
- Không có `supabase/config.toml` trong `2027 demo`.
- Không có Supabase CLI.
- Chưa có thông tin project ref/schema/RLS/Auth/Storage của một project mới.

### 5.2. Phát hiện trong PrototypeClone
- `PrototypeClone\public_html\hoinghi2026\.env.local` **tồn tại** (1.231 bytes).
  **Không đọc, không trích xuất giá trị.**
- `hoinghi2026\.vercel\project.json` tồn tại (liên kết deployment cũ).
- `hoinghi2026\admin\config.php` và các `config.php` khác tồn tại; có khả năng
  chứa thông tin kết nối cũ.

### 5.3. Kết luận & yêu cầu
- Theo Master Prompt, mọi credential từng chia sẻ được coi là **đã lộ**.
- **Không** tái sử dụng `.env.local`, `config.php` cũ, hoặc bất kỳ key nào trong
  PrototypeClone.
- Cần người dùng:
  1. Tạo project Supabase mới (hoặc xác nhận project được dùng).
  2. Cung cấp `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` và
     `SUPABASE_SERVICE_ROLE_KEY` qua `.env.local`/Vercel — **không gửi qua chat**.
  3. Xác nhận database trống hay đã có schema trước khi tạo migration.
  4. Cấp `SUPER_ADMIN_BOOTSTRAP_SECRET` riêng, đủ mạnh.

**Chưa thể thực hiện:** kiểm tra schema, bảng, RLS, Auth, Storage, dữ liệu hiện có
cho đến khi có project/credential hợp lệ.

---

## 6. VERCEL

- Không có Vercel CLI toàn cục.
- `2027 demo` không có `.vercel`, không có cấu hình project.
- `.vercel` chỉ tồn tại trong `PrototypeClone\public_html\hoinghi2026` (site cũ).
- Chưa xác minh được project, Production branch, Environment Variables, domain.

**Đề xuất:** dùng `npx vercel` sau khi có scaffold; chỉ tạo **Preview Deployment**.
Không thay đổi domain/Production khi chưa được phê duyệt.

---

## 7. PROTOTYPECLONE — KIỂM KÊ SƠ BỘ (READ-ONLY)

### 7.1. Tổng quan
| Chỉ số | Giá trị |
|---|---|
| Tổng file | 9.332 |
| Tổng dung lượng | 1.537.437.357 bytes (~1,47 GB) |
| `docs` | 1 file — `TTS2026_PROGRAMME_REFERENCE.txt` (87.760 bytes) |
| `public_html` | 9.331 file — ~1.466 MB |

### 7.2. Phân bố theo phần mở rộng (top)
| Ext | Số file |
|---|---|
| .js | 2.754 |
| .gif | 1.722 |
| .php | 1.192 |
| .html | 674 |
| .png | 641 |
| .jpg | 415 |
| .docx | 318 |
| .xml | 261 |
| .pdf | 253 |
| .css | 250 |
| .asp / .cfm / .pl / .py / .lasso / .aspx | 102 / 82 / 60 / 44 / 36 / 20 |
| .xlsx | 7 |
| .zip | 10 |
| .mp4 | 1 |
| .db | 26 (toàn bộ là `Thumbs.db`) |

### 7.3. Thư mục cấp 1 trong `public_html`
| Thư mục | Files | Dung lượng |
|---|---:|---:|
| admin | 1.042 | 6,5 MB |
| banner3 | 6 | 0,1 MB |
| book2019 | 2.001 | 58,0 MB |
| cgi-bin | 0 | 0 MB |
| chuongtrinhhoinghi2018 | 1.180 | 12,6 MB |
| chuongtrinhhoinghi2019 | 1.181 | 12,6 MB |
| chuongtrinhhoinghi2021 | 1.205 | 200,9 MB |
| chuongtrinhhoinghi2022 | 1.208 | 26,5 MB |
| fonts | 15 | 0,6 MB |
| hoinghi2022 | 20 | 14,9 MB |
| hoinghi2023 | 1 | 0,6 MB |
| hoinghi2025 | 321 | 192,0 MB |
| hoinghi2026 | 579 | 206,3 MB |
| images | 158 | 9,4 MB |
| js | 55 | 2,3 MB |
| pictures | 186 | 146,1 MB |
| Scripts | 2 | ~0 MB |
| vsot.com.vn | 1 | ~0 MB |

### 7.4. File gốc cấp public_html
- `index.php` (6.905 bytes), `home.php` (12.478 bytes), `trangchu.php` (2.743 bytes)
- `config.php` (175 bytes) — **không đọc nội dung**
- `.htaccess`, `robots.txt`, `sitemap.xml`, `favicon.ico`
- 70+ file PHP chức năng cũ (đăng nhập, đăng ký, liên hệ, sản phẩm, tin tức…)
- `error_log` **70,6 MB**, modified 12/12/2023

### 7.5. Các “website hội nghị” nhận diện được
| Thư mục | Loại | Ghi chú |
|---|---|---|
| `chuongtrinhhoinghi2018` | PHP app + asset | Bản sao cấu trúc CMS/editor |
| `chuongtrinhhoinghi2019` | PHP app + asset | Tương tự 2018; có file zip backup |
| `chuongtrinhhoinghi2021` | PHP app + nhiều PPT/PDF | 200,9 MB, nhiều slide báo cáo |
| `chuongtrinhhoinghi2022` | PHP app + asset | 26,5 MB |
| `hoinghi2022` | Tài liệu tĩnh | PDF/DOCX/HTM chương trình |
| `hoinghi2023` | PDF | 1 file chương trình |
| `hoinghi2025` | Static HTML + PDF/MP4 | `index.html`, trailer, CTKH |
| `hoinghi2026` | Static HTML + PHP admin + JSON data | Có `.env.local`, `.vercel`, dữ liệu chương trình |

### 7.6. Chi tiết `hoinghi2026`
- 24 trang HTML công khai: `index.html`, `gioi-thieu.html`, `chuong-trinh.html`,
  `chuong-trinh-dao-tao.html`, `chuyen-de.html`, `hoi-vien.html`, `tin-tuc.html`,
  `tai-lieu.html`, `tai-lieu-tham-khao.html`, `tom-tat-bao-cao.html`,
  `dang-ky-tham-du.html`, `lien-he.html`, các trang chuyên đề ghép tạng, thông báo.
- `admin/`: PHP admin nhỏ (auth/config/editor/lib/login/delete), dùng JSON làm kho dữ liệu.
- `data/`:
  - `programme.json` (145.189 bytes)
  - `abstracts.json` (36.090 bytes)
  - `programme.js` (111.029 bytes)
- `asset/`: logo, banner KV 2026, QR, icon cũ.
- `style/`, `js/`: CSS/JS của site.
- `materials/`: PDF chương trình, thư mời, template PPTX, sơ đồ hội trường.
- `File tham khao/`: **318 DOCX** abstract/báo cáo, 7 file Excel CTKH, PDF.
- `abstracts/`: 132 file (abstract liên quan).
- `reports/`: CSV audit abstract.
- `tools/`: Python build script `build_programme.py`, `build_abstracts.py`.
- `.env.local`: tồn tại — **không đọc**.
- `.vercel/project.json`: liên kết project cũ — **không tái sử dụng khi chưa xác minh**.
- `.git`: không có.

### 7.7. Dữ liệu chương trình thật (đọc cấu trúc, không in nội dung cá nhân)
`programme.json`:
- `meta.event`: VSOT 2026
- `meta.title`: Hội nghị khoa học thường niên Hội ghép tạng Việt Nam lần XI
- `meta.location`: TP. Đà Nẵng
- `meta.week`: 13/10 – 17/10/2026
- `meta.sourceSheet`: `CTKH VSOT 2026`
- `meta.generatedAt`: 2026-10-14T13:02:11
- `rooms`: 6 (id: danang, hoian, sontra, mykhe, songhan, bana — **tên hiển thị đang trống**)
- `days`: 5 (13–17/10/2026)
- `sessions`: 65
- `presentations`: 255
- `chairs` assignments: 120
- `discussants` assignments: 7
- `posters`: 2
- Session có các trường: `roomId, title, titleVi, titleEn, titleViShort, titleEnShort,
  type, category, start, end, chairs, discussants, presentations, sid`

`abstracts.json`:
- `byPresentation`: 124 entry
- `review`: 3
- `unmatched`: 0
- `generatedAt`, `source`

**Nhận xét:** đây là dữ liệu thật, có song ngữ Việt–Anh ở cấp tiêu đề, nhưng
**chưa đầy đủ**: tên phòng trống, id ngày trống, phân bố presentation lệch
(57 bài ngày 16/10, 198 bài ngày 17/10). Cần đối chiếu với Excel nguồn.

### 7.8. Nguồn Excel CTKH 2026 (7 phiên bản)
- `VSOT2026_CTKH_04Oct2026_ver1.xlsx`
- `VSOT2026_CTKH_05Oct2026.xlsx`
- `VSOT2026_CTKH_05Oct2026_ver3.xlsx`
- `VSOT2026_CTKH_08Oct2026_ver1.xlsx`
- `VSOT2026_CTKH_09Oct2026_ver1.xlsx`
- `VSOT2026_CTKH_11Oct2026_verCheck.xlsx`
- `VSOT2026_CTKH_11Oct2026_verHighlight.xlsx`

**Chưa đọc sheet.** Phase 2 sẽ kiểm tra tên sheet, số dòng, và xác nhận phiên bản
nguồn chính thức. Không tự lấy dữ liệu từ sheet chưa được xác nhận.

---

## 8. RỦI RO PHÁT HIỆN

### 8.1. Bảo mật
| Rủi ro | Chi tiết | Đề xuất |
|---|---|---|
| Credential cũ | `hoinghi2026\.env.local`, nhiều `config.php` | Coi như đã lộ; không dùng lại; rotate toàn bộ |
| Log lớn | `public_html\error_log` 70,6 MB từ 2023 | Không publish; có thể chứa PII/path/secret; xử lý riêng ở Phase 1 |
| File lạ | `public_html\zinzzloD` — **481,8 MB**, không phần mở rộng, nằm ngoài cấu trúc site | Không mở/chạy; kiểm tra checksum/malware; giữ lại cho đến khi xác minh |
| Admin PHP cũ | `admin/`, `book2019/admin`, các `admin/` trong site năm | Không đưa lên public host mới; chỉ lưu archive |
| Form/DB cũ | `config.php`, `.db`, `.zip` backup | Không commit; không public |
| PII | 318 DOCX abstract + PDF có tên bác sĩ, bệnh án/báo cáo | Cần chính sách công bố; không đưa toàn bộ lên web mặc định |

### 8.2. Kỹ thuật
| Rủi ro | Chi tiết |
|---|---|
| Kích thước | 1,47 GB vượt giới hạn hợp lý của Git repo; **không commit PrototypeClone** |
| Trùng lặp | `book2019` chứa bản sao editor/CMS; 4 thư mục `chuongtrinhhoinghi20xx` giống nhau |
| Đường dẫn sâu | Nhiều đường dẫn > 200 ký tự, tên có dấu/khoảng trắng |
| Encoding | Tên file và nội dung có dấu tiếng Việt; cần UTF-8 xuyên suốt |
| Legacy runtime | PHP 5-era, FCKeditor/CKEditor cũ, thư viện .asp/.cfm/.pl không chạy trên Next.js |
| Dữ liệu thiếu | Room names trống, day id trống, abstracts chưa map đủ |
| Không có test | Không có test/CI trong PrototypeClone |

### 8.3. Phạm vi dữ liệu
- Master Prompt đặt tên workspace `2027 demo` nhưng dữ liệu thật hiện có là
  **VSOT 2026** (13–17/10/2026, Đà Nẵng).
- Cần xác nhận: website mới sẽ:
  (a) tái hiện/ nâng cấp dữ liệu 2026, hay
  (b) chuẩn bị cho hội nghị 2027 và chỉ dùng 2026 làm mẫu/archive.
- Không tự suy đoán.

---

## 9. NHỮNG GÌ CẦN NGƯỜI DÙNG CUNG CẤP / PHÊ DUYỆT

1. **Supabase**: project mới, URL, anon key, service role key; xác nhận DB trống;
   secret bootstrap Super Admin. Gửi qua `.env.local`/Vercel, không qua chat.
2. **GitHub**: xác nhận repo `VSOTRebuild` đang trống; cấp quyền push (PAT/SSH)
   hoặc cài `gh`; đồng ý branch phát triển `ai-rebuild`.
3. **Vercel**: cấp quyền tạo Preview (token hoặc thao tác dashboard); xác nhận
   không đụng domain/Production.
4. **Dữ liệu**: xác nhận năm hội nghị mục tiêu (2026 vs 2027); phiên bản Excel
   CTKH chính thức; có được phép dùng 318 abstract DOCX không.
5. **Cleanup Phase 1**: phê duyệt danh sách xóa cụ thể trước khi thực thi; đặc biệt
   `zinzzloD`, `error_log`, các bản zip/backup trùng lặp.
6. **Nội dung website**: logo VSOT chính thức, banner, nội dung giới thiệu, ban
   chấp hành, tin tức — hiện chưa xác minh được nguồn chính thức nào ngoài
   PrototypeClone.

---

## 10. ĐỀ XUẤT BƯỚC TIẾP THEO (PHASE 1)

1. Lập inventory chi tiết từng site hội nghị: entry page, CSS/JS/font/image được
   tham chiếu, dependency, asset thiếu.
2. Kiểm tra khả năng render tĩnh của từng site cũ (mở file HTML, kiểm tra đường
   dẫn tương đối) — không sửa file.
3. Đối chiếu 7 file Excel CTKH 2026: tên sheet, phiên bản, số dòng, cột.
4. Đề xuất danh sách xóa **chỉ khi chứng minh được không dùng**; giữ mặc định nếu
   không chắc.
5. Tạo `PROTOTYPE_CLEANUP_REPORT.md` + manifest tài nguyên.
6. Sau báo cáo, đóng băng PrototypeClone vĩnh viễn.

**Chưa thực hiện bất kỳ thao tác xóa/đổi tên/di chuyển nào.**

---

## 11. TUÂN THỦ PHẠM VI

- Không viết source code website mới.
- Không cài package.
- Không sửa `PrototypeClone`.
- Không đọc/ghi giá trị secret trong `.env.local` hoặc `config.php`.
- Không tạo nội dung giả.
- Chỉ tạo file audit này trong `2027 demo`.

---

## 12. LỆNH ĐÃ DÙNG (tóm tắt, không chứa secret)

```powershell
node --version
npm --version
git --version
git ls-remote https://github.com/nhuanphat200328/VSOTRebuild
Get-ChildItem -Recurse -File -Force   # kiểm kê PrototypeClone
# đọc cấu trúc JSON bằng ConvertFrom-Json (chỉ key/count, không in nội dung cá nhân)
```

Giới hạn:
- Chưa kiểm tra được Supabase/Vercel do thiếu credential/CLI.
- Chưa mở trình duyệt để xác minh render website cũ; mới kiểm tra tĩnh.
- Chưa đọc nội dung file Excel/DOCX/PDF.

