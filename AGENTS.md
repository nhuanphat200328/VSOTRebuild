# AGENTS.md — Hướng dẫn bắt buộc cho AI agent làm việc trên VSOT Rebuild

> Đọc hết file này **trước khi sửa bất kỳ dòng nào**. File này tổng hợp các lỗi đã từng xảy ra
> trong dự án để agent sau không lặp lại. Cập nhật lần cuối: 2026-11-20.

---

## 0. THỨ TỰ ĐỌC

1. `AGENTS.md` (file này) — quy tắc, lỗi vặt, checklist.
2. `REVIEW_2026-11-20.md` — danh sách lỗi hiện có (ID `BUG-*`, `SEC-*`, `DATA-*`, `HYG-*`).
3. `PLAN_01_FIX_BACKLOG.md` — việc sửa lỗi, làm **tuần tự từ trên xuống**.
4. `PLAN_02_ROADMAP.md` — việc tương lai, chỉ bắt đầu khi PLAN_01 xong phần P0/P1.
5. Tham chiếu khi cần: `README.md`, `PROJECT_TECHNICAL_REFERENCE.txt`, `SYSTEM_ARCHITECTURE.md`,
   `DATABASE_DESIGN.md`, `CMS_MODULES.md`, `SITEMAP.md`, `GLOBAL_DESIGN_AUDIT.md`.

Tài liệu **lịch sử** (chỉ đọc để hiểu bối cảnh, số liệu trong đó có thể đã cũ):
`PROJECT_INITIAL_AUDIT.md`, `PROTOTYPE_CLEANUP_REPORT.md`, `CONTENT_INVENTORY.md`,
`LEGACY_CONFERENCE_INVENTORY.md`, `LEGACY_FILE_REUSE_REPORT.md`, `LEGACY_MIGRATION_REPORT.md`.

**Mã nguồn là sự thật cuối cùng.** Khi tài liệu mâu thuẫn với code, tin code, rồi sửa tài liệu.

---

## 1. SNAPSHOT DỰ ÁN

| Mục | Giá trị |
|---|---|
| Thư mục làm việc | `D:\VSOT REBUILD` (Windows, PowerShell 5.1) |
| Stack | Next.js 16.4.6 (App Router) · React 19.3.1 · TypeScript 5.9 strict · Tailwind 4 · Supabase (Postgres 17, Auth, Storage) |
| Git | remote `nhuanphat200328/VSOTRebuild`, branch làm việc **`ai-rebuild`** |
| Hosting | Vercel (Preview đang bật SSO Protection) |
| Supabase project ref | `nkxlapocuspqwcavymqz` (không ghi key ở bất kỳ đâu) |
| Migrations | `supabase/migrations/0001..0016` — đã áp dụng |
| Dữ liệu | Hội nghị 2026: 5 ngày, 6 phòng, 65 phiên, 255 báo cáo, 245 người |
| Website 2026 | Bản tĩnh bảo toàn ở `public/legacy/2026/` — `/` redirect tới đây |

---

## 2. BẢN ĐỒ ROUTE THỰC TẾ (đừng đoán — dễ sai nhất)

| URL | Nguồn | Ghi chú |
|---|---|---|
| `/` | `middleware.ts` + `app/page.tsx` | 307 → `VSOT_LEGACY_2026_URL` (mặc định `/legacy/2026/index.html`) |
| `/vi`, `/en` | **không có page** | Đang 404 (BUG-01). Sau FIX-01 sẽ redirect như `/` |
| `/legacy/<năm>/...` | `public/legacy/` (file tĩnh) | Không qua middleware (path có dấu chấm) |
| `/hoi-nghi/cac-nam-truoc` | `app/hoi-nghi/cac-nam-truoc/page.tsx` | **Ngoài** `[locale]`. KHÔNG phải `/vi/hoi-nghi/cac-nam-truoc` |
| `/archive/2023/*.pdf` | `public/archive/` | |
| `/{vi,en}/hoi-nghi` | `app/[locale]/hoi-nghi/page.tsx` | Danh sách hội nghị (DB) |
| `/{vi,en}/hoi-nghi/[year]/...` | `app/[locale]/hoi-nghi/[year]/` | `year` = `conferences.slug`. Mọi chuỗi lạ cũng rơi vào đây → 404 |
| `/{vi,en}/tin-tuc`, `/lien-he`, `/dang-nhap` | `app/[locale]/...` | |
| `/{vi,en}/[slug]` | `app/[locale]/[slug]/page.tsx` | Trang CMS. Route tĩnh cùng cấp **luôn thắng** `[slug]` |
| `/admin/**` | `app/admin/` | Middleware chặn khi chưa đăng nhập → `/vi/dang-nhap?next=...` |
| `/api/health`, `/api/auth/signout`, `/api/bootstrap-super-admin` | `app/api/` | Middleware **không** chạy cho `/api` |

Header/Footer:
- Trang legacy và trang archive dùng **markup HTML 2026** (`public/legacy/shared/header.html`, `footer.html`,
  `header-footer-2026.css`), không dùng React.
- Trang Next trong `[locale]` dùng `components/layout/site-header.tsx` / `site-footer.tsx`.
- Sửa menu ⇒ phải sửa **cả hai** nơi + các file HTML legacy có header nhúng sẵn (xem `GLOBAL_DESIGN_AUDIT.md`).

---

## 3. QUY TẮC CỨNG — KHÔNG ĐƯỢC LÀM

1. **Không đụng `D:\Philao\code project\VSOT\PrototypeClone`** (read-only vĩnh viễn).
2. **Không đọc, in, commit secret**: `.env.local`, `config.php`, key Supabase, mật khẩu DB. Không dán secret vào tài liệu/chat/log.
3. Không commit `PROTOTYPE_ASSET_MANIFEST.csv`, `PROTOTYPE_BROKEN_LINKS.csv` (chứa tên cá nhân).
4. Không push `main`, không `git push --force`, không rewrite history khi chưa được phê duyệt.
5. Không tạo nội dung giả (tên, số điện thoại, link mạng xã hội, tin tức, số liệu). Thiếu thì để
   “Nội dung đang được cập nhật” hoặc hỏi chủ dự án.
6. Không sửa file migration đã áp dụng (`0001..0016`). Thay đổi schema ⇒ tạo file mới `0017_...sql`.
7. Không chạy lại `scripts/import_2026.py` trên DB thật khi chưa được phê duyệt: nó **ghi đè** giờ/phòng/tiêu đề đã sửa qua CMS.
8. Không đổi domain, Production, biến môi trường Vercel khi chưa được phê duyệt.
9. Không dùng `SUPABASE_SERVICE_ROLE_KEY` trong client component hoặc biến `NEXT_PUBLIC_*`.
10. Không xóa file trong `public/legacy/**` trừ khi task yêu cầu rõ; đây là bản bảo toàn.

---

## 4. QUY ƯỚC CODE — PHẢI LÀM

### 4.1. Route & link
- Link nội bộ phải là **đường dẫn tuyệt đối** (`/legacy/2026/tin-tuc.html`, không `tin-tuc.html`) trong mọi HTML dùng chung.
- Không hardcode năm hội nghị (`2026`) trong component; nhận `year` qua props/params.
- Không link tới `/vi` hoặc `/${locale}` làm “trang chủ” — dùng hằng số trang chủ dùng chung
  (sau FIX-01: `lib/site.ts` → `HOME_URL`).
- Link tới file tĩnh `/legacy/*.html`, PDF, trang ngoài: dùng `<a>`, không dùng `next/link`.
- Thêm route mới cùng cấp `[locale]` ⇒ thêm slug đó vào danh sách slug cấm của CMS Pages (FIX-08).

### 4.2. Admin (server actions & pages)
- **Mỗi** page admin và **mỗi** server action phải gọi `requirePermission("<resource>.<action>")` của riêng nó
  (không dựa vào layout — layout và page render song song).
- Mọi trường trạng thái có thể thành `published` (status trang, `vi_status`, `en_status`, status báo cáo, danh mục…)
  đều phải kiểm quyền `*.publish`.
- Sau mutation: ghi `audit_logs` (actor, action, entity, entity_id, before/after khi có) và `revalidatePath`.
- `redirect()` ném exception đặc biệt — **không** đặt trong `try/catch` (hoặc rethrow nếu bắt).
- Không ghi đè `published_at` khi nội dung đã publish trước đó.
- Tạo nhiều bảng liên quan (row cha + translations) phải xử lý lỗi giữa chừng (RPC transaction hoặc dọn row cha).

### 4.3. Supabase
- Đọc public: client không cookie (sau FIX-16 `createSupabasePublicClient`) hoặc luôn lọc `status = 'published'`
  cả ở bảng lồng — đừng dựa hoàn toàn vào RLS vì admin đăng nhập sẽ thấy cả draft.
- Không nối chuỗi người dùng nhập vào `.or()`, `.filter()` (PostgREST filter injection). Sanitize hoặc dùng `.ilike()` riêng.
- PostgREST trả tối đa 1000 dòng mặc định — truy vấn danh sách lớn phải phân trang hoặc lọc ở DB.
- Kiểu `time` trả về `HH:MM:SS`; `<input type="time">` gửi `HH:MM`. Luôn `.slice(0, 5)` khi hiển thị/so sánh.
- Bảng mới: `alter table ... enable row level security` + policy public/admin + restrictive delete policy, trong cùng migration.

### 4.4. Ngày giờ & ngôn ngữ
- Format ngày giờ luôn truyền `timeZone: "Asia/Ho_Chi_Minh"` (server Vercel chạy UTC).
  Ngày thuần (`date`) dùng helper `lib/utils/dates.ts` (đang dùng `timeZone: "UTC"` cho date-only — đúng).
- `datetime-local` không có múi giờ: chuyển đổi rõ ràng VN ↔ UTC (FIX-17).
- UI admin và nội dung mặc định tiếng Việt; EN fallback hiển thị banner “English translation is being updated.”

### 4.5. Next.js 16
- `params`, `searchParams`, `cookies()`, `headers()` đều là **Promise** — phải `await`.
- `cookies().set()` trong Server Component sẽ ném lỗi (đã có try/catch trong `lib/supabase/server.ts`, giữ nguyên).
- `middleware.ts` đã bị deprecate, tên mới là `proxy.ts` (HYG-01). Matcher hiện loại bỏ mọi path có dấu chấm và path bắt đầu bằng `api`, `archive`.
- Server Action nhận body tối đa 1 MB trừ khi cấu hình `experimental.serverActions.bodySizeLimit`; Vercel giới hạn 4,5 MB.
- `next lint` không còn; dùng `npm run lint` (= `eslint .`).

---

## 5. LỖI VẶT ĐÃ GẶP — TRIỆU CHỨNG → NGUYÊN NHÂN → CÁCH TRÁNH

| # | Triệu chứng | Nguyên nhân | Cách tránh |
|---|---|---|---|
| 1 | Logo/menu 404 trên `/hoi-nghi/cac-nam-truoc` | HTML dùng chung có link/ảnh **tương đối** | Mọi `href`/`src` trong `public/legacy/shared/*` phải bắt đầu bằng `/` |
| 2 | “Về trang chủ”, “Đăng xuất” ra 404 | Trang `/vi` đã bị xóa nhưng link còn | Dùng `HOME_URL`; chạy `scripts/smoke.mjs` |
| 3 | Báo cáo test ghi 200 nhưng thực tế 404 | Test chạy trước khi đổi route, tài liệu không cập nhật | Sau khi đổi route, chạy lại smoke + sửa `TESTING_REPORT.md` |
| 4 | CSS legacy sửa rồi mà điện thoại vẫn hiển thị cũ | Cache trình duyệt/bfcache | Tăng `?v=YYYYMMDD-N` trên mọi trang legacy (xem `GLOBAL_DESIGN_AUDIT.md` §14) |
| 5 | CSS legacy cũ (2018/2019/2021) đè style header | Specificity cao của `css.css` cũ | Thêm rule isolation trong `header-footer-2026.css`, không sửa `css.css` gốc |
| 6 | File TS/MD có ký tự lạ `﻿` đầu file, diff toàn file | PowerShell 5.1 ghi UTF-8 **có BOM** và CRLF | Xem §6 — ghi UTF-8 không BOM |
| 7 | Upload > 1 MB lỗi “Body exceeded 1mb limit” | Giới hạn Server Action | Cấu hình `bodySizeLimit`, giữ ≤ 4 MB trên Vercel |
| 8 | Trang chạy local được nhưng 500 trên Vercel (`ENOENT`) | `fs.readFileSync` file trong `public/` lúc runtime | `outputFileTracingIncludes` hoặc import nội dung lúc build |
| 9 | Đăng xuất chuyển về `localhost` | Fallback `http://localhost:3000` khi thiếu env | Tạo URL từ `request.url` |
| 10 | Admin thấy dữ liệu draft trên trang public | Client có cookie + RLS admin | Client public không cookie / lọc status |
| 11 | Ngày đăng tin lệch 7 giờ | Format/parse theo múi giờ server | `timeZone: "Asia/Ho_Chi_Minh"` |
| 12 | Trang CMS slug `lien-he` không bao giờ hiện | Route tĩnh thắng `[slug]` | Danh sách slug cấm |
| 13 | Migration mới chạy lỗi “already exists” | `apply_migrations.py` chạy lại toàn bộ file | Viết SQL idempotent; sửa script chỉ chạy version mới (FIX-19) |
| 14 | Tên file PDF có dấu tiếng Việt lúc 200 lúc 404 | NFC/NFD + khoảng trắng trong URL | File mới đặt tên không dấu, không khoảng trắng |
| 15 | Model không đọc được ảnh chụp màn hình người dùng gửi | Giới hạn môi trường | Mô tả DOM/CSS cụ thể, yêu cầu người dùng xác nhận trên thiết bị thật; ghi rõ “chưa kiểm bằng mắt” |

---

## 6. WINDOWS / POWERSHELL

```powershell
# Ghi file UTF-8 KHÔNG BOM (PowerShell 5.1):
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("D:\VSOT REBUILD\path\file.ts", $text, $utf8)

# KHÔNG dùng: Set-Content -Encoding UTF8 / Out-File -Encoding UTF8 (thêm BOM)

# Biến môi trường tạm cho 1 lệnh:
$env:PYTHONIOENCODING = "utf-8"; python scripts\import_2026.py

# Tìm chuỗi trong code (thay grep):
Get-ChildItem -Recurse -Include *.ts,*.tsx app,components,lib | Select-String -Pattern "hoi-nghi/2026"
git grep -n "hoi-nghi/2026"
```

- Đường dẫn có khoảng trắng (`D:\VSOT REBUILD`) ⇒ luôn đặt trong dấu nháy.
- Repo đang lưu CRLF; giữ nguyên kiểu dòng của file đang sửa, không convert hàng loạt (diff rác).

---

## 7. DATABASE & MIGRATION

- Mỗi thay đổi schema = 1 file mới `supabase/migrations/00NN_mo_ta.sql`, **idempotent**
  (`if not exists`, `drop policy if exists`, `create or replace`).
- Chạy dry-run trước: `python scripts/apply_migrations.py` (mặc định rollback). Chỉ `--apply` khi được phép.
- Sau khi đổi schema: cập nhật `DATABASE_DESIGN.md`, `PROJECT_TECHNICAL_REFERENCE.txt` (mục E), `README.md` (mục Database),
  và generate lại types (khi đã có, ROADMAP R2).
- RLS: thêm policy cho `anon`/`authenticated` rõ ràng; test bằng anon key: phải **không** thấy draft.
- Không dùng service role trong code mới cho mutation nội dung nếu không cần (xem SEC-01).

---

## 8. CHECKLIST TRƯỚC KHI COMMIT / BÁO “XONG”

```powershell
npm run typecheck
npm run lint
npm run build
npm run start -- -p 3100        # cửa sổ khác
node scripts/smoke.mjs http://localhost:3100   # sau khi FIX-00 tạo script
git grep -nE "SERVICE_ROLE_KEY=|eyJhbGci|sb_secret_" -- . ":!*.md"   # không được có kết quả
git status                       # không có .env*, manifest CSV
```

- [ ] Typecheck/lint/build pass.
- [ ] Smoke test pass (route + link nội bộ không 404).
- [ ] Đã kiểm quyền ở page **và** action; publish được kiểm.
- [ ] Không hardcode năm/locale/URL trang chủ.
- [ ] Đã cập nhật tài liệu theo §9.
- [ ] Ghi rõ phần **chưa kiểm** (trình duyệt thật, mobile, Preview) — không tuyên bố đã kiểm khi chưa.
- [ ] Commit message rõ ràng, branch `ai-rebuild`.

---

## 9. ĐỔI GÌ THÌ CẬP NHẬT TÀI LIỆU NÀO

| Thay đổi | Cập nhật |
|---|---|
| Route mới/xóa/đổi | `README.md` (Routes), `SITEMAP.md` (bảng trạng thái), `PROJECT_TECHNICAL_REFERENCE.txt` (L), danh sách route trong `scripts/smoke.mjs` |
| Schema/migration | `DATABASE_DESIGN.md`, `PROJECT_TECHNICAL_REFERENCE.txt` (E), `README.md` |
| Module CMS | `CMS_MODULES.md` (bảng trạng thái) |
| Header/footer/legacy | `GLOBAL_DESIGN_AUDIT.md` (thêm mục mới, ghi rõ đã/chưa kiểm trên thiết bị) |
| Bảo mật/credential | `SECURITY_ROTATION_CHECKLIST.md` |
| Kiểm thử | `TESTING_REPORT.md` (ghi ngày, môi trường, lệnh) |
| Hoàn thành task trong PLAN | Đánh `[x]` trong `PLAN_01_FIX_BACKLOG.md` / `PLAN_02_ROADMAP.md` + 1 dòng change log trong `PROJECT_TECHNICAL_REFERENCE.txt` (K) |
