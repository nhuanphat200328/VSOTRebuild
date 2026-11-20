# SYSTEM_ARCHITECTURE.md — VSOT Rebuild

- Ngày: 2026-11-20
- Trạng thái: thiết kế nền tảng (Phase 3), chưa thay đổi Production.

---

## 1. STACK

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components mặc định |
| Language | TypeScript (strict) | |
| UI | Tailwind CSS 4 | CSS-first config |
| Auth | Supabase Auth | email/password + invite; không public signup |
| DB | Supabase PostgreSQL 17 | project `nkxlapocuspqwcavymqz` |
| Authorization | RBAC + RLS | kiểm tra ở server + DB |
| Storage | Supabase Storage | buckets public/private |
| Hosting | Vercel | Preview trước, Production sau phê duyệt |
| Source | GitHub `nhuanphat200328/VSOTRebuild` | branch `ai-rebuild` |

Không dùng thêm UI kit nặng. Component tự viết + Tailwind.
Không dùng Prisma/Drizzle ở giai đoạn đầu; migration SQL + Supabase client
(type generated) để giảm tầng phụ thuộc.

---

## 2. CẤU TRÚC THƯ MỤC DỰ KIẾN

```
2027 demo/
  app/
    (public)/[locale]/
      layout.tsx
      page.tsx
      gioi-thieu/...
      tin-tuc/...
      hoi-nghi/[year]/
        chuong-trinh/page.tsx
        dien-gia/page.tsx
        phien/[id]/page.tsx
      lien-he/page.tsx
    (auth)/[locale]/dang-nhap/page.tsx
    admin/
      layout.tsx
      dashboard/page.tsx
      pages/...
      conferences/[id]/programme/...
      ...
    api/
      contact/route.ts
      bootstrap-super-admin/route.ts
      search/route.ts
    layout.tsx
    globals.css
  components/
    ui/              Button, Card, Badge, Input, Modal, Tabs...
    layout/          Header, Footer, LocaleSwitcher, MobileNav
    programme/       SessionCard, Timeline, GridView, TableView, AtAGlance, SearchBar
    faculty/         PersonRow, RoleBadge, PersonProfile
    admin/           DataTable, Editor, MediaPicker, PermissionGate
  lib/
    supabase/        browser.ts, server.ts, admin.ts, middleware.ts
    auth/            session.ts, rbac.ts, bootstrap.ts
    i18n/            config.ts, dictionary.ts, fallback.ts
    programme/       queries.ts, validation.ts, conflicts.ts, import.ts
    validation/      schemas.ts
    utils/           cn.ts, dates.ts, slug.ts, seo.ts
  messages/          vi.json, en.json
  supabase/
    migrations/      *.sql
    seed/            2026 programme import (JSON -> SQL)
    types/           database.types.ts
  content/
    2026/            source JSON đã chuẩn hoá
  docs/              (tuỳ chọn) tài liệu nội bộ
  public/
    brand/           logo, favicon
  tests/
    e2e/             Playwright
    unit/            Vitest
```

---

## 3. MODULE

1. **Public shell**: header/footer, locale, SEO, accessibility.
2. **Static content**: pages, news, activities, members, documents.
3. **Conference**: landing, dates, rooms, documents, archive.
4. **Programme Builder**: CRUD sessions/presentations, roles, validation,
   preview, publish.
5. **Public Programme**: List / Grid / Table / At a glance / Faculty / Search.
6. **Media**: Supabase Storage + metadata + dependency check.
7. **Contact**: form + spam protection + admin inbox.
8. **RBAC/Admin**: users, roles, permissions, audit log.
9. **Legacy archive**: metadata + static mount.
10. **i18n**: VI/EN, fallback VI, translation status per field/entity.

---

## 4. ROUTING & RENDERING

- App Router, `[locale]` segment.
- Public pages: Server Components, cache theo tag (`revalidateTag`).
- Admin: Server Components + Server Actions cho mutation.
- Programme filters: searchParams (URL state) để share/bookmark.
- Modal chi tiết phiên: route song song (`@modal`) hoặc client dialog + fetch;
  canonical page vẫn tồn tại cho SEO/share.
- API routes chỉ cho: contact submit, global search JSON (nếu cần), bootstrap.
- Không gọi Supabase bằng service role ở client.

---

## 5. DỮ LIỆU & TRUY VẤN

- Supabase client server-side đọc dữ liệu public qua RLS.
- Admin đọc/ghi qua RLS + permission; service role chỉ dùng trong
  bootstrap/migration/import script.
- Programme query theo conference + date + filter, kèm rooms/types/tracks.
- Search: Postgres `ilike`/`tsvector`; bảng search view/materialized nếu cần.
- Cache public: `unstable_cache`/`revalidate` theo conference/date.
- Không nhồi toàn bộ programme vào JSON column.

---

## 6. BILINGUAL

- Mọi entity nội dung có bản dịch theo locale.
- Bảng `*_translations` gồm `locale`, `status`, `title`, `body`, `seo`.
- Trạng thái: `missing`, `draft`, `pending_review`, `published`, `archived`.
- Fallback theo phương án C:
  1. Có bản dịch `published` → dùng.
  2. Không có → dùng VI.
  3. Hiển thị banner: `English translation is being updated.`
- Không auto-dịch máy thành bản chính thức.
- `hreflang` chỉ cho bản dịch đã publish; VI luôn canonical.

---

## 7. RBAC

Roles: `super_admin`, `admin`, `editor`, `viewer`.
Permissions dạng `resource.action`:
```
page.read page.write page.publish page.delete
news.read news.write news.publish news.delete
conference.read conference.write conference.publish
programme.read programme.write programme.publish
person.read person.write
media.read media.upload media.delete
contact.read contact.update
user.read user.invite user.role.update user.disable
settings.read settings.write
audit.read
```
- `super_admin`: tất cả + quản lý role/user + bootstrap.
- `admin`: quản lý nội dung/hội nghị/module được cấp; không sửa super_admin.
- `editor`: tạo/sửa nội dung; không publish nếu không có quyền.
- `viewer`: chỉ đọc admin.
- Kiểm tra quyền ở: middleware, server action, RLS.
- Không tin role từ client.

---

## 8. SECURITY

- Supabase Auth; không public signup (`disable_signup` hiện = false → **phải tắt**
  trong dashboard hoặc chặn ở app).
- RLS bật trên mọi bảng public.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ server; không prefix `NEXT_PUBLIC_`.
- Bootstrap Super Admin: endpoint server, secret env, chỉ khi chưa có super admin,
  transaction/advisory lock, log không chứa secret, vô hiệu sau khi dùng.
- Contact: validate Zod, honeypot, rate limit theo IP, lưu DB trước khi báo thành công.
- Media upload: giới hạn mime/size, strip metadata nếu cần, signed URL cho private.
- Audit log append-only (không UPDATE/DELETE cho user thường).
- Header bảo mật: CSP, HSTS, X-Frame-Options, Referrer-Policy.
- Secret đã chia sẻ trong chat: coi như lộ, rotate trước Production.

---

## 9. LEGACY ARCHIVE

- Metadata trong bảng `legacy_sites` (year, slug, title, path, cover, status).
- Static files copy sang `public/legacy/[year]/` hoặc host riêng.
- Rewrite `/legacy/[year]` → static index; chặn `.php` execution.
- Không sửa bản gốc trong PrototypeClone; copy một chiều.
- Với site PHP động: chỉ archive snapshot HTML/asset; nội dung DB cần dump riêng.
- `X-Robots-Tag: noindex` cho bản legacy nếu trùng nội dung.

---

## 10. DEPLOYMENT

- Vercel project mới; Preview cho branch `ai-rebuild`.
- Env: Supabase public + service role + bootstrap secret + site URL.
- Build: `next build`; lint/typecheck trong CI.
- Migrations: Supabase CLI hoặc SQL chạy có kiểm soát; không auto-DDL từ app.
- Production chỉ sau phê duyệt; domain giữ nguyên cho đến khi cutover.

---

## 11. GIAI ĐOẠN

0. Audit — xong.
1. Legacy cleanup — xong (báo cáo + manifest).
2. Content inventory — xong bản đầu.
3. System design — tài liệu này + DB/CMS/Sitemap.
4. Foundation — scaffold, design system, Supabase, auth.
5. Public site.
6. CMS.
7. Programme Builder.
8. Legacy archive.
9. Testing.
10. Preview deployment.
