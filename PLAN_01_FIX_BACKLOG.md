# PLAN_01_FIX_BACKLOG.md — Kế hoạch sửa lỗi tồn đọng (làm tuần tự)

- Tạo: 2026-11-20 · Nguồn: `REVIEW_2026-11-20.md`
- Đọc `AGENTS.md` trước. Làm **từ trên xuống**, mỗi task một commit riêng trên branch `ai-rebuild`.
- Xong task nào: đổi `[ ]` → `[x]`, ghi 1 dòng vào `PROJECT_TECHNICAL_REFERENCE.txt` mục K.
- Task bị chặn bởi quyết định (`D*`) thì bỏ qua, làm task kế tiếp, ghi lại lý do.

---

## QUYẾT ĐỊNH CẦN CHỦ DỰ ÁN (trả lời trước khi làm task liên quan)

| ID | Câu hỏi | Mặc định nếu chưa có trả lời | Ảnh hưởng |
|---|---|---|---|
| D1 | `/vi`, `/en` nên redirect về website 2026 (`/legacy/2026/index.html`) hay xây trang chủ Next mới? | Redirect (FIX-01) | FIX-01 |
| D2 | Trang “Liên hệ” chính là form Next `/vi/lien-he` (lưu DB, có inbox admin) hay trang tĩnh `/legacy/2026/lien-he.html` (bản đồ + thông tin)? | Giữ nguyên cả hai, không đổi link | FIX-23 |
| D3 | Giữ route tiếng Anh `/en/...` (ẩn khỏi menu) hay tắt hẳn (redirect `/en/*` → `/vi/*`)? | Giữ nguyên | ROADMAP R6 |
| D4 | URL thật của Facebook / YouTube / LinkedIn VSOT? | Không sửa (không tạo link giả) | FIX-03 bước 4 |
| D5 | Cho phép chuyển mutation CMS từ service-role sang client theo phiên đăng nhập (SEC-01 giai đoạn B)? Cần 3 tài khoản test admin/editor/viewer | Chưa làm, chỉ làm FIX-15 giai đoạn A | ROADMAP R3 |
| D6 | Cấp cách truy cập Vercel Preview (Protection Bypass token hoặc người dùng tự kiểm)? | Người dùng tự mở Preview và báo kết quả | FIX-07, FIX-25 |

---

## GIAI ĐOẠN A — CÔNG CỤ KIỂM TRA (làm đầu tiên)

### [ ] FIX-00 — Tạo `scripts/smoke.mjs` (route + link checker)
- Liên quan: HYG-05; dùng để xác minh mọi task sau.
- Tạo file `scripts/smoke.mjs` với nội dung:

```js
#!/usr/bin/env node
// Smoke test + kiểm tra link nội bộ. Dùng: node scripts/smoke.mjs [baseUrl]
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const origin = new URL(base).origin;

// [path, các status chấp nhận]. Cập nhật danh sách khi thêm/xóa route.
const routes = [
  ["/", [307, 308]],
  ["/vi", [307, 308]], // FAIL cho tới khi xong FIX-01
  ["/legacy/2026/index.html", [200]],
  ["/legacy/2026/chuong-trinh.html", [200]],
  ["/hoi-nghi/cac-nam-truoc", [200]],
  ["/vi/hoi-nghi/cac-nam-truoc", [307, 308]], // FAIL cho tới khi xong FIX-02
  ["/vi/hoi-nghi", [200]],
  ["/vi/hoi-nghi/2026", [200]],
  ["/vi/hoi-nghi/2026/chuong-trinh", [200]],
  ["/vi/hoi-nghi/2026/chuong-trinh?view=grid", [200]],
  ["/vi/hoi-nghi/2026/chuong-trinh?view=table", [200]],
  ["/vi/hoi-nghi/2026/chuong-trinh/tong-quan", [200]],
  ["/vi/hoi-nghi/2026/dien-gia", [200]],
  ["/vi/tin-tuc", [200]],
  ["/vi/lien-he", [200]],
  ["/vi/dang-nhap", [200]],
  ["/admin", [307, 308]],
  ["/api/health", [200]],
];

// Các trang sẽ được quét link nội bộ.
const crawl = [
  "/legacy/2026/index.html",
  "/legacy/2018/index.html",
  "/legacy/2025/index.html",
  "/hoi-nghi/cac-nam-truoc",
  "/vi/hoi-nghi",
  "/vi/hoi-nghi/2026",
  "/vi/hoi-nghi/2026/chuong-trinh",
  "/vi/tin-tuc",
  "/vi/lien-he",
  "/vi/dang-nhap",
];

let failed = 0;
const fetchOpts = (method, redirect) => ({ method, redirect, signal: AbortSignal.timeout(90_000) });

for (const [path, ok] of routes) {
  try {
    const res = await fetch(base + path, fetchOpts("GET", "manual"));
    const pass = ok.includes(res.status);
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"} ${res.status} ${path}${pass ? "" : `  (mong đợi ${ok.join("/")})`}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ERR ${path} ${error.message}`);
  }
}

const links = new Map(); // path -> trang chứa link
for (const page of crawl) {
  let html = "";
  try {
    html = await (await fetch(base + page, fetchOpts("GET", "follow"))).text();
  } catch (error) {
    failed++;
    console.log(`FAIL ERR crawl ${page} ${error.message}`);
    continue;
  }
  let emptyHref = 0;
  for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    const raw = match[1].replace(/&amp;/g, "&").trim();
    if (!raw) { emptyHref++; continue; }
    if (/^(mailto:|tel:|javascript:|data:|#)/i.test(raw)) continue;
    const url = new URL(raw, base + page);
    if (url.origin !== origin) continue;
    url.hash = "";
    const key = url.pathname + url.search;
    if (!links.has(key)) links.set(key, page);
  }
  if (emptyHref) console.log(`WARN ${emptyHref} href/src rỗng trên ${page}`);
}

for (const [path, from] of links) {
  try {
    let res = await fetch(base + path, fetchOpts("HEAD", "follow"));
    if (res.status === 405) res = await fetch(base + path, fetchOpts("GET", "follow"));
    if (res.status >= 400) {
      failed++;
      console.log(`FAIL ${res.status} ${path}  (link trên ${from})`);
    }
  } catch (error) {
    failed++;
    console.log(`FAIL ERR ${path}  (link trên ${from}) ${error.message}`);
  }
}

console.log(`\nĐã kiểm ${routes.length} route + ${links.size} link nội bộ. Lỗi: ${failed}`);
process.exit(failed ? 1 : 0);
```

- Thêm vào `package.json` → `scripts`: `"smoke": "node scripts/smoke.mjs"`.
- Chạy: `npm run build` → `npm run start -- -p 3100` → `npm run smoke -- http://localhost:3100`.
  Script quét vài trăm link (ảnh 2025, trang phiên, hồ sơ diễn giả) tuần tự — có thể mất vài phút; chạy với `next start`, không dùng `next dev` (compile chậm, dễ timeout).
- **Tiêu chí xong:** script chạy được; kết quả hiện tại được dán vào `TESTING_REPORT.md` (dự kiến FAIL ở `/vi`,
  `/vi/hoi-nghi/cac-nam-truoc` và các link tương đối của trang archive — đó là bằng chứng cho FIX-01..03).
- Không làm: không đưa URL Preview có token vào file commit.

---

## GIAI ĐOẠN B — P0: LỖI NGƯỜI DÙNG THẤY NGAY

### [ ] FIX-01 — Hằng số trang chủ + `/vi`, `/en` redirect (BUG-01) · cần D1
1. Tạo `lib/site.ts`:
   ```ts
   export const HOME_URL =
     process.env.NEXT_PUBLIC_HOME_URL ?? process.env.VSOT_LEGACY_2026_URL ?? "/legacy/2026/index.html";
   export const ARCHIVE_URL = "/hoi-nghi/cac-nam-truoc";
   export const LOGIN_URL = "/vi/dang-nhap";
   ```
   (`VSOT_LEGACY_2026_URL` không có prefix `NEXT_PUBLIC_` nên trong client component sẽ là `undefined` → dùng mặc định; ghi chú vào `.env.example`.)
2. Tạo `app/[locale]/page.tsx`:
   ```tsx
   import { notFound, redirect } from "next/navigation";
   import { isLocale } from "@/lib/i18n/config";
   import { HOME_URL } from "@/lib/site";

   export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
     const { locale } = await params;
     if (!isLocale(locale)) notFound();
     redirect(HOME_URL);
   }
   ```
3. `middleware.ts` và `app/page.tsx`: thay chuỗi mặc định bằng `HOME_URL`.
4. Thay link “trang chủ”:
   - `app/[locale]/dang-nhap/page.tsx:86` → `HOME_URL` (dùng `<a>`).
   - `app/admin/layout.tsx:30, :53` → `HOME_URL` (dùng `<a>`).
   - Breadcrumb `app/[locale]/hoi-nghi/[year]/page.tsx:46`, `.../chuong-trinh/page.tsx:75` → `HOME_URL` (`<a>`).
   - `components/layout/site-footer.tsx`: `/${locale}#gioi-thieu` → `/legacy/2026/gioi-thieu.html`;
     `/${locale}#hoi-nghi` → `/legacy/2026/index.html` (hoặc `/${locale}/hoi-nghi`).
- **Kiểm tra:** `git grep -nE 'href=\{`/\$\{locale\}`\}|"/vi"|#gioi-thieu|#hoi-nghi'` không còn kết quả; smoke `/vi` = 307.
- Không làm: không khôi phục lại trang chủ Next cũ khi chưa có D1 = “xây mới”.

### [ ] FIX-02 — Sửa link archive (BUG-02)
1. `components/layout/site-footer.tsx:54`, `app/[locale]/hoi-nghi/page.tsx:45` → `ARCHIVE_URL` (`<a>` hoặc `Link` đều được vì là route Next).
2. `next.config.ts` thêm redirect (chạy trước middleware và trước route `[year]`):
   ```ts
   async redirects() {
     return [
       { source: "/:locale(vi|en)/hoi-nghi/cac-nam-truoc", destination: "/hoi-nghi/cac-nam-truoc", permanent: true },
     ];
   },
   ```
- **Kiểm tra:** smoke `/vi/hoi-nghi/cac-nam-truoc` = 308; `git grep -n '/${locale}/hoi-nghi/cac-nam-truoc'` rỗng.

### [ ] FIX-03 — Link tuyệt đối trong header/footer HTML dùng chung (BUG-03)
1. `public/legacy/shared/header.html`: mọi `href="xxx.html"` tương đối → `href="/legacy/2026/xxx.html"`
   (danh sách: `index`, `thong-bao-1`, `thong-bao-2`, `thu-moi-tai-tro`, `chuong-trinh`, `chuong-trinh-dao-tao`,
   `dang-ky-tham-du`, `chuyen-de`, `ghep-than-tuy`, `ghep-gan`, `ghep-tim`, `ghep-phoi`, `ghep-ruot`, `ghep-da-tang`,
   `tai-lieu`, `tai-lieu-tham-khao`, `tom-tat-bao-cao`, `huong-dan-ghep-than`, `tin-tuc`, `hoi-vien`, `lien-he`).
2. Kiểm cả `shared/footer.html` theo cùng quy tắc.
3. Kiểm: `Select-String -Path "public\legacy\shared\*.html" -Pattern 'href="(?!/|https?:|mailto:|tel:|#)[^"]+"'` → không có kết quả
   (cho phép tạm `href=""` của social icon tới khi có D4).
4. (Cần D4) Social icon `href=""` trong `shared/footer.html` và footer các trang legacy: điền URL thật; nếu chủ dự án
   quyết định bỏ thì xóa thẻ `<a class="socials__social" ...>`. **Không** tự đặt URL.
- **Tiêu chí xong:** smoke không còn link 404 trên `/hoi-nghi/cac-nam-truoc`; ghi §16 `GLOBAL_DESIGN_AUDIT.md` là đã sửa.
- Không làm: không sửa các trang trong `public/legacy/2026/*.html` (link tương đối ở đó là đúng vì cùng thư mục).

### [ ] FIX-04 — Đăng xuất (BUG-04)
`app/api/auth/signout/route.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/vi/dang-nhap", request.url), 303);
}
```
- **Kiểm tra (trình duyệt):** đăng nhập → Đăng xuất → về trang đăng nhập, cookie `sb-*` bị xóa, `/admin` lại đòi đăng nhập.
- Bổ sung `NEXT_PUBLIC_SITE_URL` vào danh sách env trong `README.md` (nếu còn dùng ở nơi khác) — đã ghi trong lần review này.

### [ ] FIX-05 — Upload media: giới hạn dung lượng, bỏ SVG, kiểm magic bytes (BUG-05, SEC-05)
1. `next.config.ts`:
   ```ts
   experimental: { serverActions: { bodySizeLimit: "4mb" } },
   ```
2. `app/admin/media/actions.ts`:
   - `const MAX_BYTES = 3.5 * 1024 * 1024;` (chừa chỗ cho overhead multipart, dưới giới hạn 4,5 MB của Vercel).
   - Bỏ `image/svg+xml` khỏi `ALLOWED`.
   - Lấy `user` từ `requirePermission("media.upload", ...)`; ghi `uploaded_by: user.id`.
   - Kiểm magic bytes, dùng MIME phát hiện được làm `contentType`:
     ```ts
     function sniffMime(bytes: Uint8Array): string | null {
       const hex = (n: number) => Array.from(bytes.subarray(0, n), (b) => b.toString(16).padStart(2, "0")).join("");
       if (hex(3) === "ffd8ff") return "image/jpeg";
       if (hex(8) === "89504e470d0a1a0a") return "image/png";
       if (hex(4) === "47494638") return "image/gif";
       if (hex(4) === "52494646" && new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP") return "image/webp";
       if (hex(4) === "25504446") return "application/pdf";
       return null;
     }
     ```
     `const detected = sniffMime(bytes); if (!detected || !ALLOWED.has(detected)) redirect("/admin/media?error=type");`
3. `app/admin/media/page.tsx`: thông báo “File vượt quá 3,5 MB”; `accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"`.
- **Kiểm tra:** upload ảnh 0,5 MB, 2 MB, 3 MB → thành công; 5 MB → báo lỗi dung lượng (không phải lỗi 413 trắng);
  đổi đuôi `.txt` thành `.png` → báo lỗi định dạng. Ghi kết quả vào `TESTING_REPORT.md`.
- Ghi chú: file > 3,5 MB (PDF chương trình) → ROADMAP R4 (signed upload URL thẳng lên Storage).

### [ ] FIX-06 — Bỏ hardcode năm trong link chương trình (BUG-06)
1. Thêm prop `year: string` cho `ProgrammeList`, `ProgrammeGrid`, `ProgrammeTable`, `ProgrammeResults`; thay mọi
   `/hoi-nghi/2026/` bằng `/hoi-nghi/${year}/`.
2. Truyền `year` từ `chuong-trinh/page.tsx` và `chuong-trinh/tong-quan/page.tsx`.
3. `lib/programme/model.ts`: thêm `conference_id?: string` vào `ProgrammeSession`.
4. `app/[locale]/hoi-nghi/[year]/phien/[id]/page.tsx`:
   ```ts
   const conference = await getConferenceByYear(year);
   if (!conference) notFound();
   const session = await getSessionById(id);
   if (!session || session.conference_id !== conference.id) notFound();
   ```
- **Kiểm tra:** `git grep -n "hoi-nghi/2026" -- components app lib` → rỗng; `/vi/hoi-nghi/2025/phien/<id-2026>` → 404.

### [ ] FIX-07 — Đảm bảo trang archive đọc được header/footer trên Vercel (BUG-07) · cần D6 để xác minh
1. `next.config.ts` (top-level, Next 15+):
   ```ts
   outputFileTracingIncludes: {
     "/hoi-nghi/cac-nam-truoc": ["./public/legacy/shared/header.html", "./public/legacy/shared/footer.html"],
   },
   ```
2. Deploy Preview → mở `/hoi-nghi/cac-nam-truoc` → phải 200, có header/footer; xem Vercel Function Logs không có `ENOENT`.
3. Nếu vẫn lỗi: chuyển header/footer thành module `lib/legacy/shell.ts` (export chuỗi HTML) và cập nhật `GLOBAL_DESIGN_AUDIT.md`
   rằng nguồn chuẩn đã chuyển chỗ (tránh 2 nguồn lệch nhau).
- Không làm: không bỏ qua bước xác minh trên Preview rồi ghi “đã sửa”.

---

## GIAI ĐOẠN C — P1: BẢO MẬT / PHÂN QUYỀN

### [ ] FIX-08 — Slug cấm cho CMS Pages + giải phóng slug khi xóa (DATA-03)
1. Tạo `lib/pages/reserved.ts`:
   ```ts
   export const RESERVED_PAGE_SLUGS = new Set([
     "hoi-nghi", "tin-tuc", "lien-he", "dang-nhap", "dang-xuat", "quen-mat-khau", "dat-mat-khau",
     "tim-kiem", "admin", "api", "legacy", "archive",
   ]);
   ```
2. `createPageAction` / `updatePageAction`: `if (RESERVED_PAGE_SLUGS.has(slug)) redirect("...?error=reserved")`; thêm thông báo trong form.
3. `deletePageAction`: đổi slug khi xóa mềm: `slug: \`${slug}--deleted-${id.slice(0, 8)}\`` (đọc slug hiện tại trước).
4. SQL kiểm tra (chỉ đọc) trên DB thật: `select id, slug from pages where slug in ('hoi-nghi','tin-tuc','lien-he','dang-nhap');` → báo chủ dự án nếu có.
- Khi thêm route mới ở `app/[locale]/` ⇒ cập nhật danh sách này (đã ghi trong AGENTS.md).

### [ ] FIX-09 — Kiểm quyền publish đầy đủ (SEC-02)
1. Helper chung (ví dụ `lib/auth/publish.ts`): `wantsPublish(...statuses: (string | undefined)[]) => statuses.includes("published")`.
2. `app/admin/news/actions.ts` create/update: kiểm `status`, `vi_status`, **`en_status`**.
3. `app/admin/conferences/[id]/programme/actions.ts` `createPresentationAction` / `updatePresentationAction`:
   lấy `access` từ `requirePermission`; `status === "published"` mà thiếu `programme.publish` → `?error=publish`.
4. `createCategoryAction`: `status: access.permissions.has("news.publish") ? "published" : "draft"`.
- **Kiểm tra:** tài khoản editor (không có `*.publish`) thử publish news EN / báo cáo / danh mục → đều bị chặn.

### [ ] FIX-10 — Chặn open redirect `next` (SEC-03)
1. Tạo `lib/auth/next-path.ts`:
   ```ts
   export function safeNextPath(value: unknown, fallback = "/admin") {
     if (typeof value !== "string") return fallback;
     if (!value.startsWith("/admin")) return fallback;
     if (value.startsWith("//") || value.includes("\\")) return fallback;
     return value;
   }
   ```
2. Dùng trong `app/[locale]/dang-nhap/page.tsx` (thay dòng 20) và `actions.ts` (thay logic `next`).
- **Kiểm tra:** `/vi/dang-nhap?next=//example.com` khi đã đăng nhập → về `/admin`.

### [ ] FIX-11 — Sanitize tìm kiếm liên hệ (SEC-04)
`app/admin/contacts/page.tsx:46`:
```ts
const term = q.replace(/["\\]/g, "").slice(0, 100);
if (term) {
  query = query.or(["full_name", "email", "subject"].map((c) => `${c}.ilike."%${term}%"`).join(","));
}
```
(Giá trị đặt trong dấu `"` để PostgREST chấp nhận `,` `.` `(` `)`.) Thêm hiển thị lỗi `forbidden` trên trang.
- **Kiểm tra:** tìm `a,b`, `x)`, `test@example.com` → không lỗi 500, kết quả đúng.

### [ ] FIX-12 — Form liên hệ: IP hợp lệ + rate limit (SEC-06)
1. `app/[locale]/lien-he/actions.ts`: `import { isIP } from "node:net"`; `ip = candidate && isIP(candidate) ? candidate : null`.
2. Rate limit đơn giản trước khi insert (dùng service role chỉ để đếm):
   ```ts
   if (ip) {
     const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
     const { count } = await createSupabaseAdminClient()
       .from("contact_requests").select("id", { count: "exact", head: true })
       .eq("ip", ip).gte("created_at", since);
     if ((count ?? 0) >= 5) redirect(`/${locale}/lien-he?error=rate`);
   }
   ```
3. `app/[locale]/lien-he/page.tsx`: thông báo cho `error=rate` (VI/EN).
- Cập nhật `SECURITY_ROTATION_CHECKLIST.md` §2 “Rate limit contact form” → [x].

### [ ] FIX-13 — Audit log cho mọi mutation CMS (SEC-07)
1. Tạo `lib/audit.ts`:
   ```ts
   import "server-only";
   import { isIP } from "node:net";
   import { headers } from "next/headers";
   import { createSupabaseAdminClient } from "@/lib/supabase/admin";

   export async function writeAudit(entry: {
     actorId: string; actorEmail?: string | null; action: string; entity: string;
     entityId?: string | null; before?: unknown; after?: unknown;
   }) {
     const h = await headers();
     const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
     const { error } = await createSupabaseAdminClient().from("audit_logs").insert({
       actor_id: entry.actorId, actor_email: entry.actorEmail ?? null, action: entry.action,
       entity: entry.entity, entity_id: entry.entityId ?? null,
       before: entry.before ?? null, after: entry.after ?? null,
       ip: isIP(ip) ? ip : null, user_agent: (h.get("user-agent") ?? "").slice(0, 500),
     });
     if (error) console.error("audit_log_failed", entry.action, error.message); // không chặn thao tác chính
   }
   ```
2. Gọi `writeAudit` sau mỗi mutation thành công: `page.create|update|delete`, `news.create|update|delete`,
   `news_category.create`, `session.create|update`, `presentation.create|update`, `media.upload|delete`, `contact.update`.
   Chỉ ghi id + trường chính (slug, status) — **không** ghi nội dung body dài hay dữ liệu cá nhân người liên hệ.
3. Thay các đoạn insert `audit_logs` thủ công trong `users/actions.ts` bằng helper.
- **Kiểm tra:** mỗi thao tác tạo đúng 1 dòng `audit_logs` (SQL đọc: `select action, entity, created_at from audit_logs order by created_at desc limit 20`).

### [ ] FIX-14 — Kiểm quyền từng page admin, xử lý “không có quyền”, trang lỗi (SEC-08, HYG-03)
1. `lib/auth/require.ts`:
   - không có role → `redirect("/vi/dang-nhap?error=noaccess")`;
   - thiếu permission → `redirect("/admin/dashboard?error=forbidden")`.
2. `app/[locale]/dang-nhap/page.tsx`: nếu đã đăng nhập **và** `error === "noaccess"` → không redirect; hiển thị
   “Tài khoản chưa được gán vai trò” + nút Đăng xuất (form POST `/api/auth/signout`). Tránh vòng lặp redirect.
3. `app/admin/layout.tsx`: nhánh `roles.length === 0` → cùng redirect như trên.
4. Thêm `requireAdmin()`/`requirePermission()` vào: `admin/dashboard/page.tsx` (`requireAdmin`), `admin/news/new` (`news.write`),
   `admin/news/categories` (`news.read`; form chỉ hiện khi có `news.write`), `admin/pages/new` (`page.write`),
   `admin/conferences/[id]/programme/[sessionId]` (ẩn form khi thiếu `programme.write`).
5. Dashboard hiển thị banner khi `?error=forbidden`.
6. Thêm `app/not-found.tsx` (tiếng Việt, link `HOME_URL`) và `app/admin/error.tsx` (`"use client"`, nút thử lại).
- **Kiểm tra:** tài khoản viewer vào `/admin/users` → về dashboard có banner, không ra trang 500.

### [ ] FIX-15 — Chặn publish ở tầng DB (SEC-01, giai đoạn A) · migration mới, cần chạy dry-run
1. Tạo `supabase/migrations/0017_publish_guard.sql`:
   ```sql
   create or replace function public.guard_publish()
   returns trigger language plpgsql security definer set search_path = public as $$
   begin
     if auth.uid() is null then
       return new; -- service role / script: kiểm ở tầng app
     end if;
     if new.status::text = 'published'
        and (tg_op = 'INSERT' or old.status::text is distinct from 'published')
        and not public.has_permission(tg_argv[0]) then
       raise exception 'Missing permission %', tg_argv[0] using errcode = '42501';
     end if;
     return new;
   end $$;

   do $$
   declare r record;
   begin
     for r in select * from (values
       ('pages', 'page.publish'), ('page_translations', 'page.publish'),
       ('news', 'news.publish'), ('news_translations', 'news.publish'),
       ('news_categories', 'news.publish'),
       ('conferences', 'conference.publish'),
       ('sessions', 'programme.publish'), ('session_translations', 'programme.publish'),
       ('presentations', 'programme.publish'), ('presentation_translations', 'programme.publish')
     ) as t(tbl, perm) loop
       execute format('drop trigger if exists guard_publish on public.%I', r.tbl);
       execute format(
         'create trigger guard_publish before insert or update on public.%I
          for each row execute function public.guard_publish(%L)', r.tbl, r.perm);
     end loop;
   end $$;
   ```
2. Trước khi chạy: xác nhận các bảng trên đều có cột `status` (đọc `0004`–`0006`). Bảng nào không có thì bỏ khỏi danh sách.
3. `python scripts/apply_migrations.py` (dry-run) → chỉ `--apply` khi chủ dự án đồng ý; với script hiện tại sẽ chạy lại toàn bộ
   0001..0017 — làm FIX-19 trước nếu được.
4. Test bằng REST với JWT của editor: `PATCH /rest/v1/sessions?id=eq.<id>` body `{"status":"published"}` → 403/42501.
- Giai đoạn B (chuyển mutation sang client theo phiên) → ROADMAP R3, cần D5.

---

## GIAI ĐOẠN D — P2: DỮ LIỆU / LOGIC

### [ ] FIX-16 — Client Supabase public không cookie (DATA-07)
1. Tạo `lib/supabase/public.ts`:
   ```ts
   import "server-only";
   import { createClient } from "@supabase/supabase-js";

   export function createSupabasePublicClient() {
     const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
     if (!url || !key) throw new Error("Supabase public environment variables are not configured.");
     return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
   }
   ```
2. Dùng cho mọi truy vấn **đọc public**: `lib/programme/data.ts`, `lib/faculty/data.ts`, `getPublishedPage`,
   `getPublishedNews*`, `app/[locale]/hoi-nghi/page.tsx`.
3. Thêm `import "server-only"` vào `lib/programme/data.ts`, `lib/faculty/data.ts` (HYG-07) — kiểm build không lỗi
   (component client chỉ được `import type` từ các file này).
- **Kiểm tra:** đăng nhập admin, tạo báo cáo draft → trang public **không** hiện báo cáo đó.

### [ ] FIX-17 — Ngày giờ: giữ `published_at`, múi giờ VN (DATA-01, DATA-02, DATA-08)
1. `lib/utils/dates.ts` thêm (Việt Nam không có DST nên cộng/trừ 7h là chính xác):
   ```ts
   export const VN_TZ = "Asia/Ho_Chi_Minh";
   export function formatDateTimeVN(iso: string, locale: Locale = "vi") {
     return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN",
       { dateStyle: "short", timeStyle: "short", timeZone: VN_TZ }).format(new Date(iso));
   }
   export function formatDayVN(iso: string, locale: Locale = "vi") {
     return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN",
       { day: "2-digit", month: "2-digit", year: "numeric", timeZone: VN_TZ }).format(new Date(iso));
   }
   /** ISO (UTC) -> giá trị cho <input type="datetime-local"> theo giờ VN */
   export function toVNDateTimeLocal(iso: string) {
     return new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16);
   }
   /** "YYYY-MM-DDTHH:mm" (giờ VN) -> ISO UTC; trả null nếu không hợp lệ */
   export function fromVNDateTimeLocal(value: string) {
     const date = new Date(`${value}:00+07:00`);
     return Number.isNaN(date.getTime()) ? null : date.toISOString();
   }
   ```
2. Thay `toLocaleString`/`toLocaleDateString` ở `admin/contacts/page.tsx:93`, `tin-tuc/page.tsx:42`, `tin-tuc/[slug]/page.tsx:50`.
3. `components/admin/news-form.tsx:24` dùng `toVNDateTimeLocal`; `news/actions.ts` `publishedAt()` dùng `fromVNDateTimeLocal`.
4. `pages/actions.ts` update và `news/actions.ts` update: đọc `published_at` hiện tại; nếu đã có thì **giữ nguyên**,
   chỉ đặt `now()` khi chuyển sang `published` lần đầu; không đặt `null` khi hạ trạng thái.
- **Kiểm tra:** sửa trang đã publish 2 lần → `published_at` không đổi; tạo tin 09:00 giờ VN → hiển thị 09:00 cả local và Vercel.

### [ ] FIX-18 — Programme Builder: thứ tự & kiểm hợp lệ (DATA-05, DATA-06)
1. Trước khi sửa, chạy SQL đọc để biết dữ liệu import có trùng phòng không:
   ```sql
   select a.id as a_id, b.id as b_id, a.date_id, a.room_id, a.start_time, a.end_time, b.start_time, b.end_time
   from sessions a join sessions b
     on a.date_id = b.date_id and a.room_id = b.room_id and a.id < b.id
    and a.start_time < b.end_time and b.start_time < a.end_time
   where a.conference_id = (select id from conferences where slug = '2026');
   ```
   Có kết quả ⇒ báo chủ dự án (sửa phiên đó sẽ bị chặn “conflict”), **không tự sửa dữ liệu**.
2. `createPresentationAction`: `sort = (max sort trong session) + 1`.
3. Trang sửa phiên: sắp báo cáo theo `sort` rồi `start_time` (thống nhất với public).
4. Kiểm: `end_time > start_time` khi có cả hai; báo cáo nằm trong khung giờ phiên — **chặn khi status = published**, cho lưu draft kèm cảnh báo.
5. Session: kiểm `date_id`, `room_id` thuộc `conference_id` (truy vấn `conference_dates`/`rooms` theo `conference_id`).
6. Trang sửa phiên: `if (session.conference_id !== id) notFound()`.

### [ ] FIX-19 — Script migration/import an toàn (DATA-12, DATA-13)
1. `scripts/apply_migrations.py`: đọc version đã áp dụng từ `supabase_migrations.schema_migrations` (nếu bảng tồn tại),
   chỉ chạy file **chưa** áp dụng; in danh sách pending; giữ dry-run mặc định; ghi version sau khi chạy thành công.
2. `scripts/import_2026.py`: thoát ngay nếu không có cờ `--force`, kèm cảnh báo “ghi đè dữ liệu đã sửa qua CMS”.
3. Ghi vào `README.md` mục Database.
- Không làm: không chạy `--apply`/`--force` trên DB thật trong task này.

### [ ] FIX-20 — Ghi nhiều bảng không để lại dữ liệu mồ côi (DATA-04)
- `saveTranslations`, `saveNewsTranslations`, `savePresentationTranslation`, translations của session: trả `{ error }` thay vì `throw`.
- Luồng tạo mới: lỗi translation ⇒ xóa row cha vừa tạo ⇒ `redirect(...?error=server)`.
- Luồng cập nhật: lỗi ⇒ `redirect(...?error=server)` (không ném exception ra trang 500).
- Nhớ: `redirect()` không được nằm trong `try/catch`.

### [ ] FIX-21 — Giữ bộ lọc khi đổi view/ngày (DATA-09)
- Tạo client component `components/programme/filter-aware-link.tsx`: render `<a href>` bình thường; `onClick` đọc
  `window.location.search`, ghi đè `q`, `room`, `type` hiện tại vào URL đích rồi `router.push(...)`.
- Dùng cho nút List/Grid/Table và tab ngày trong `chuong-trinh/page.tsx`.
- **Kiểm tra:** gõ “ghép gan”, chọn phòng → bấm Grid → bộ lọc còn nguyên; bấm sang ngày khác → bộ lọc còn nguyên.

### [ ] FIX-22 — Dashboard chỉ dùng số liệu thật (DATA-10)
- Xóa các dòng hardcode trong `app/admin/dashboard/page.tsx:44-46`; thay bằng số liệu truy vấn (số trang, tin draft,
  phiên draft, liên hệ mới) hoặc bỏ hẳn khối “Trạng thái hệ thống”.

### [ ] FIX-23 — Dọn lỗi UI nhỏ (DATA-11, DATA-14, DATA-15, DATA-16)
1. `text-ink-600` (2 chỗ) → `text-ink-500`, hoặc thêm token `--color-ink-600` vào `app/globals.css`.
2. `site-header.tsx`, `site-footer.tsx`: link tới `/legacy/*.html` dùng `<a>` thay `next/link`.
3. Trang Users: hiển thị tất cả role của user; `assignRoleAction` chỉ xóa role global (`.is("conference_id", null)`).
4. (Cần D2) Thống nhất đích của nút “Liên hệ” trong `site-header.tsx`.

---

## GIAI ĐOẠN E — P3 & CHỐT

### [ ] FIX-24 — `middleware.ts` → `proxy.ts` (HYG-01)
1. `npx @next/codemod@latest middleware-to-proxy .` (hoặc đổi tay: tên file `proxy.ts`, export `proxy`).
2. Giữ nguyên `config.matcher` và logic.
3. **Kiểm tra:** `/` 307; `/admin` khi chưa đăng nhập → `/vi/dang-nhap?next=/admin`; `/foo` → `/vi/foo`;
   build không còn cảnh báo deprecate. Cập nhật `AGENTS.md` §2/§4.5 và `README.md`.

### [ ] FIX-25 — Chạy lại toàn bộ kiểm thử & cập nhật tài liệu
1. `npm run typecheck && npm run lint && npm run build`; `npm run smoke -- http://localhost:3100` → 0 lỗi.
2. Kiểm tay trên trình duyệt (desktop + mobile 375px): đăng nhập/đăng xuất, CRUD trang, tin, phiên, báo cáo, upload, liên hệ.
3. (D6) Kiểm trên Vercel Preview: archive, upload, đăng xuất.
4. Viết lại `TESTING_REPORT.md` (ngày, môi trường, lệnh, kết quả; mục “chưa kiểm” trung thực).
5. Đánh dấu các mục đã xong trong `REVIEW_2026-11-20.md` (thêm cột/ghi chú “Đã sửa ở commit …”).
