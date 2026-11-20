import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { RoleBadge } from "@/components/programme/role-badge";
import { getConferenceByYear } from "@/lib/programme/data";
import { getFacultyForConference } from "@/lib/faculty/data";
import { isLocale, type Locale } from "@/lib/i18n/config";

type SearchParams = Record<string, string | string[] | undefined>;

function values(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function FacultyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; year: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: rawLocale, year } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const conference = await getConferenceByYear(year);
  if (!conference) notFound();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();
  const roleFilters = values(sp.role);

  let people = await getFacultyForConference(conference.id);
  if (q) {
    people = people.filter((person) =>
      [person.full_name, person.display_name, person.institution, person.country]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  if (roleFilters.length) {
    people = people.filter((person) =>
      person.roles.some((role) => roleFilters.includes(role)),
    );
  }

  const pageSize = 40;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const pageCount = Math.max(1, Math.ceil(people.length / pageSize));
  const current = people.slice((page - 1) * pageSize, page * pageSize);

  const base = `/${locale}/hoi-nghi/${year}/dien-gia`;
  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    for (const role of roleFilters) search.append("role", role);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${base}?${query}` : base;
  };

  return (
    <div className="bg-surface pb-20">
      <Container className="py-9">
        <Link
          href={`/${locale}/hoi-nghi/${year}`}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← {locale === "en" ? "Back to congress" : "Quay lại hội nghị"}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900">
          {locale === "en" ? "Faculty" : "Diễn giả"}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {locale === "en"
            ? "Chairs, discussants and presenters at the congress."
            : "Chủ tọa, thảo luận viên và báo cáo viên tại hội nghị."}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <RoleBadge role="chair" locale={locale} /> {locale === "en" ? "Chair" : "Chủ tọa"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RoleBadge role="discussant" locale={locale} /> {locale === "en" ? "Discussant" : "Thảo luận"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RoleBadge role="presenter" locale={locale} /> {locale === "en" ? "Presenter" : "Báo cáo viên"}
          </span>
        </div>

        <form className="mt-4 grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">{locale === "en" ? "Search" : "Tìm kiếm"}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              name="q"
              defaultValue={typeof sp.q === "string" ? sp.q : ""}
              placeholder={
                locale === "en"
                  ? "Name, institution, country..."
                  : "Tên, đơn vị, quốc gia..."
              }
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-400"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {(["chair", "discussant", "presenter"] as const).map((role) => (
              <label key={role} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  name="role"
                  value={role}
                  defaultChecked={roleFilters.includes(role)}
                  className="size-4 rounded border-line"
                />
                {role === "chair" ? (locale === "en" ? "Chair" : "Chủ tọa") : role === "discussant" ? (locale === "en" ? "Discussant" : "Thảo luận") : locale === "en" ? "Presenter" : "Báo cáo"}
              </label>
            ))}
          </div>
          <button className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700">
            {locale === "en" ? "Filter" : "Lọc"}
          </button>
        </form>

        <p className="mt-4 text-sm text-ink-500">
          {people.length} {locale === "en" ? "people" : "người"}
        </p>

        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
          {current.length === 0 ? (
            <p className="p-8 text-sm text-ink-500">
              {locale === "en" ? "No faculty found." : "Không tìm thấy diễn giả."}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {current.map((person) => (
                <li key={person.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex w-14 shrink-0 flex-wrap gap-1">
                      {person.roles.map((role) => (
                        <RoleBadge key={role} role={role} locale={locale} />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`${base}/${person.slug}`}
                        className="text-sm font-bold text-ink-900 hover:text-brand-700"
                      >
                        {person.display_name || person.full_name}
                      </Link>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                        {[person.institution, person.country].filter(Boolean).join(" · ") ||
                          (locale === "en" ? "Affiliation being updated" : "Đơn vị đang cập nhật")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 pl-17 sm:pl-0">
                    <span className="text-xs text-ink-500">
                      {person.presentationCount > 0
                        ? `${person.presentationCount} ${locale === "en" ? "abstracts" : "báo cáo"}`
                        : ""}
                    </span>
                    <Link
                      href={`${base}/${person.slug}`}
                      className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                    >
                      {locale === "en" ? "Profile" : "Hồ sơ"}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {pageCount > 1 ? (
          <nav className="mt-5 flex flex-wrap items-center gap-1.5" aria-label="Faculty pages">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((target) => (
              <Link
                key={target}
                href={pageHref(target)}
                className={`rounded-md border px-3 py-1.5 text-xs font-bold ${
                  target === page
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-ink-700 hover:border-brand-300"
                }`}
              >
                {target}
              </Link>
            ))}
          </nav>
        ) : null}
      </Container>
    </div>
  );
}
