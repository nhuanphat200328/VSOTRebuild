# DATABASE_DESIGN.md — VSOT (Supabase PostgreSQL)

- Ngày: 2026-11-20
- Project ref: `nkxlapocuspqwcavymqz`
- PostgreSQL: 17.12
- Trạng thái kiểm tra: `public` **0 bảng**, `0 policy`, `auth.users` **0**,
  `storage.buckets` **0**, chưa có `supabase_migrations`.
- **Hiện trạng (2026-11-20, sau migrations 0001..0016):** 35 bảng public, 94 policy RLS, 3 bucket,
  4 role, 31 permission, 1 Super Admin, dữ liệu 2026 đã import. Dòng “0 bảng” phía trên là kết quả audit ban đầu.
- Khác biệt với thiết kế cần biết: `user_roles.conference_id` **chưa có FK** tới `conferences`; `has_permission()`
  **không xét** phạm vi hội nghị; RLS chưa phân biệt quyền publish (xem `REVIEW_2026-11-20.md` SEC-01, FIX-15).
- Thêm bảng mới: phải `enable row level security` + policy trong cùng migration (loop bật RLS ở 0009 chỉ chạy một lần).
- Extensions có sẵn: `pgcrypto`, `uuid-ossp`, `pg_stat_statements`,
  `supabase_vault`, `plpgsql`.

> DB đang trống → có thể tạo schema mới an toàn. Không có dữ liệu để mất.
> Mọi thay đổi sẽ đi qua migration có thứ tự; không DROP dữ liệu hiện hữu.

---

## 1. NGUYÊN TẮC

- UUID khoá chính (`gen_random_uuid()`).
- `created_at`, `updated_at` (trigger), `created_by`, `updated_by` (nullable).
- Soft delete: `deleted_at` cho nội dung; hard delete chỉ khi không còn tham chiếu.
- Bilingual: bảng `*_translations` cho nội dung dài.
- RLS bật trên mọi bảng ở schema `public`.
- Audit append-only.
- Không dùng JSON cho dữ liệu cần query; JSON chỉ cho cấu hình/landing blocks.

---

## 2. ENUM

```sql
create type locale as enum ('vi','en');
create type translation_status as enum
  ('missing','draft','pending_review','published','archived');
create type content_status as enum ('draft','published','archived');
create type conference_status as enum ('draft','published','archived');
create type assignment_role as enum
  ('chair','co_chair','discussant','moderator','presenter','invited_speaker');
create type contact_status as enum ('new','in_progress','resolved','spam');
create type legacy_status as enum ('draft','published','archived');
create type media_visibility as enum ('public','private');
```

---

## 3. AUTH / RBAC

```sql
profiles
  id uuid pk references auth.users(id) on delete cascade
  email text not null
  full_name text
  avatar_url text
  locale locale default 'vi'
  status text default 'active'        -- active | disabled
  last_login_at timestamptz
  created_at, updated_at

roles
  id uuid pk
  code text unique not null           -- super_admin | admin | editor | viewer
  name_vi text, name_en text
  is_system boolean default true

permissions
  id uuid pk
  code text unique not null           -- programme.write ...
  description text

role_permissions
  role_id uuid fk roles
  permission_id uuid fk permissions
  pk(role_id, permission_id)

user_roles
  id uuid pk
  user_id uuid fk profiles
  role_id uuid fk roles
  conference_id uuid null fk conferences   -- scope (null = global)
  created_at
  unique(user_id, role_id, conference_id)

audit_logs
  id uuid pk
  actor_id uuid null fk profiles
  actor_email text
  action text not null
  entity text
  entity_id text
  before jsonb
  after jsonb
  ip inet
  user_agent text
  created_at timestamptz default now()
```

Chống leo quyền:
- `super_admin` không thể bị xoá/đổi bởi `admin`.
- Chỉ `super_admin` gán role `super_admin`.
- Trigger/kiểm tra server action + RLS.

---

## 4. MEDIA / SETTINGS

```sql
media
  id uuid pk
  bucket text not null                -- media-public | documents | legacy
  path text not null
  file_name text
  mime_type text
  size_bytes bigint
  width int, height int
  alt_vi text, alt_en text
  caption_vi text, caption_en text
  visibility media_visibility default 'public'
  uploaded_by uuid fk profiles
  created_at
  unique(bucket, path)

site_settings
  key text pk
  value jsonb not null
  updated_by uuid fk profiles
  updated_at
```

---

## 5. NỘI DUNG TĨNH

```sql
pages
  id uuid pk
  slug text unique not null
  template text default 'default'
  status content_status default 'draft'
  published_at timestamptz
  sort int default 0
  created_by, updated_by
  created_at, updated_at, deleted_at

page_translations
  id uuid pk
  page_id uuid fk pages on delete cascade
  locale locale
  title text
  excerpt text
  body jsonb                          -- rich text blocks
  seo_title text, seo_description text
  status translation_status default 'missing'
  unique(page_id, locale)

news_categories
  id uuid pk
  slug text unique
  status content_status
  sort int

news_category_translations
  category_id, locale, name, description, status

news
  id uuid pk
  slug text unique
  category_id uuid null fk news_categories
  cover_media_id uuid fk media
  author_id uuid fk profiles
  status content_status
  published_at
  is_featured boolean
  created_at, updated_at, deleted_at

news_translations
  news_id, locale, title, excerpt, body jsonb,
  seo_title, seo_description, status

news_related
  news_id, related_news_id, sort
```

---

## 6. CONGRESS

```sql
conferences
  id uuid pk
  slug text unique not null           -- '2026','2027'
  year int not null
  status conference_status default 'draft'
  start_date date
  end_date date
  city text
  country text default 'Vietnam'
  theme_vi text, theme_en text
  brand_color text
  banner_media_id uuid fk media
  logo_media_id uuid fk media
  landing_config jsonb                -- bật/tắt section, thứ tự
  legacy_site_id uuid null fk legacy_sites
  created_at, updated_at, deleted_at
  unique(year)

conference_translations
  conference_id, locale, name, short_name, intro, description,
  venue_name, status

conference_dates
  id uuid pk
  conference_id uuid fk conferences
  date date not null
  label_vi text, label_en text
  kind text default 'scientific'      -- precongress | scientific | social
  sort int
  unique(conference_id, date)

rooms
  id uuid pk
  conference_id uuid fk conferences
  code text
  name_vi text not null
  name_en text
  floor text
  capacity int
  sort int
  unique(conference_id, code)

session_types
  id uuid pk
  code text unique                    -- plenary | concurrent | workshop | break ...
  name_vi text, name_en text
  color text
  is_break boolean default false

tracks
  id uuid pk
  conference_id uuid null fk conferences
  code text
  name_vi text, name_en text
  color text
  unique(conference_id, code)
```

---

## 7. PROGRAMME

```sql
sessions
  id uuid pk
  conference_id uuid fk conferences
  date_id uuid fk conference_dates
  room_id uuid fk rooms
  session_type_id uuid fk session_types
  track_id uuid null fk tracks
  start_time time not null
  end_time time not null
  program_number text
  status content_status default 'draft'
  sort int default 0
  legacy_sid text
  is_separator boolean default false
  separator_label_vi text, separator_label_en text
  created_at, updated_at, deleted_at
  check (end_time > start_time)

session_translations
  session_id uuid fk sessions
  locale locale
  title text
  short_title text
  description jsonb
  status translation_status
  unique(session_id, locale)

presentations
  id uuid pk
  session_id uuid fk sessions
  start_time time
  end_time time
  sort int
  presentation_type text
  abstract text
  keywords text[]
  status content_status default 'draft'
  legacy_pid text
  created_at, updated_at, deleted_at
  check (end_time is null or start_time is null or end_time > start_time)

presentation_translations
  presentation_id uuid fk presentations
  locale locale
  title text
  abstract text
  status translation_status
  unique(presentation_id, locale)
```

### 7.1. Vai trò (nhiều-nhiều)

```sql
session_people
  id uuid pk
  session_id uuid fk sessions on delete cascade
  person_id uuid fk people
  role assignment_role                   -- chair | co_chair | discussant | moderator
  sort int default 0
  unique(session_id, person_id, role)

presentation_people
  id uuid pk
  presentation_id uuid fk presentations on delete cascade
  person_id uuid fk people
  role assignment_role                   -- presenter | invited_speaker
  sort int default 0
  unique(presentation_id, person_id, role)
```

- Một người có thể có nhiều dòng ở nhiều session/presentation.
- Role summary = DISTINCT role theo person + conference.
- Không lưu `role` trực tiếp trên `people`.

### 7.2. Ràng buộc nghiệp vụ
- Cùng phòng, overlap thời gian → **cảnh báo chặn publish** (không auto-sửa).
- `presentation` phải nằm trong khoảng thời gian session (nếu có giờ).
- Session break có `is_separator=true` hoặc `session_type.is_break=true`;
  vẫn có start/end thật.
- Không tự đổi giờ/phòng khi import; chỉ báo lỗi.
- `legacy_sid`/`legacy_pid` unique theo conference để idempotent import.

Indexes:
```sql
create index on sessions (conference_id, date_id, start_time);
create index on sessions (room_id, start_time);
create index on presentations (session_id, sort);
create index on session_people (person_id, role);
create index on presentation_people (person_id, role);
create index on people using gin (to_tsvector('simple', coalesce(full_name,'')));
```

---

## 8. PEOPLE / FACULTY

```sql
people
  id uuid pk
  slug text unique
  full_name text not null
  display_name text
  title text                          -- GS, PGS, TS, BS...
  degree text
  position text
  institution text
  department text
  city text
  country text
  email_public text
  photo_media_id uuid fk media
  linkedin_url text
  orcid_url text
  status content_status default 'published'
  created_at, updated_at, deleted_at

person_translations
  person_id, locale, bio, position, institution, status
```

- `full_name` giữ nguyên như nguồn; không tự chuẩn hoá tên.
- Deduplicate khi import: exact match + cảnh báo; không tự gộp người trùng tên
  nếu thiếu bằng chứng.

---

## 9. TÀI LIỆU / SPONSOR

```sql
conference_documents
  id uuid pk
  conference_id uuid fk conferences
  media_id uuid fk media
  doc_type text                       -- programme | abstract | invitation | map
  title_vi, title_en
  sort int
  is_public boolean default true
  created_at

sponsors
  id uuid pk
  name text
  logo_media_id uuid fk media
  website_url text
  level text
  sort int

conference_sponsors
  conference_id, sponsor_id, level, sort
```

---

## 10. CONTACT

```sql
contact_requests
  id uuid pk
  full_name text not null
  email text not null
  phone text
  organization text
  subject text
  message text not null
  locale locale default 'vi'
  status contact_status default 'new'
  spam_score numeric
  ip inet
  user_agent text
  created_at, updated_at

contact_notes
  id uuid pk
  request_id uuid fk contact_requests on delete cascade
  author_id uuid fk profiles
  note text
  created_at
```

---

## 11. LEGACY

```sql
legacy_sites
  id uuid pk
  slug text unique                    -- '2025','2026',...
  year int
  title text
  description text
  entry_path text                     -- /legacy/2025/index.html
  cover_media_id uuid fk media
  status legacy_status default 'draft'
  has_dynamic_content boolean default false
  notes text
  created_at, updated_at
```

---

## 12. RLS

Bật RLS cho tất cả bảng `public`.

### 12.1. Public read
- `conferences`, `conference_dates`, `rooms`, `session_types`, `tracks`,
  `sessions`, `session_translations`, `presentations`,
  `presentation_translations`, `session_people`, `presentation_people`,
  `people`, `person_translations`, `conference_documents`, `sponsors`,
  `legacy_sites`, `pages`, `page_translations`, `news`, `news_translations`:
  chỉ `SELECT` khi status published (+ translation published hoặc fallback vi).

### 12.2. Admin
- Helper:
```sql
create or replace function public.has_permission(p text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    join permissions p2 on p2.id = rp.permission_id
    where ur.user_id = auth.uid()
      and p2.code = p
  );
$$;
```
- Policy `INSERT/UPDATE/DELETE` dùng `has_permission('page.write')`, v.v.
- `profiles`: self select/update limited; `super_admin` xem tất cả.
- `user_roles`: chỉ `super_admin` (hoặc admin theo scope, trừ super_admin).
- `audit_logs`: chỉ `audit.read`; **không** policy UPDATE/DELETE.
- `contact_requests`: chỉ `contact.read/update`.
- Storage: bucket `media-public` public read; write theo permission.

### 12.3. Lưu ý kỹ thuật
- Hiện `anon` bị **401 khi gọi REST root** dù có `USAGE` trên schema public.
  Sau migration cần kiểm tra lại grant + API key; có thể phải dùng
  publishable key/secret mới hoặc bật Data API. Không bỏ qua.
- `auth.disable_signup` hiện `false` → phải tắt trong Supabase Dashboard;
  trigger `handle_new_user` (0013) đã chặn signup không có cờ `vsot_invite`.
- `SUPABASE_JWT_SECRET` không dùng trong app; chỉ để tham chiếu khi rotate.

---

## 13. MIGRATION PLAN

Thứ tự dự kiến:
1. `0001_extensions_enums.sql`
2. `0002_profiles_roles_permissions.sql`
3. `0003_media_settings_audit.sql`
4. `0004_pages_news.sql`
5. `0005_conferences_rooms_dates.sql`
6. `0006_people.sql`
7. `0007_programme.sql`
8. `0008_documents_sponsors_contact.sql`
9. `0009_legacy_sites.sql`
10. `0010_rls_policies.sql`
11. `0011_functions_triggers.sql`
12. `0012_seed_roles_permissions.sql`
13. `0013_import_2026_programme.sql` (idempotent, từ JSON)

Quy tắc:
- Không DROP bảng/cột có dữ liệu.
- Migration có thể chạy lại an toàn khi có thể (`if not exists`, upsert).
- Test trên DB trống hiện tại; backup trước khi áp dụng Production.
- Không chạy migration tự động từ app.

---

## 14. SEED 2026

- Nguồn: `hoinghi2026/data/programme.js` (JSON `window.VSOT_PROGRAMME`).
- Import idempotent theo `legacy_sid`/`legacy_pid`.
- Tạo conference `2026` (published), 5 dates, 6 rooms, session types, 65 sessions,
  255 presentations, 245+ people, assignments C/D/P.
- `programme.json` không dùng làm nguồn chính vì thiếu tên phòng.
- Không tạo dữ liệu cho 2027; conference `2027` ở trạng thái draft, nội dung
  "Nội dung đang được cập nhật".




