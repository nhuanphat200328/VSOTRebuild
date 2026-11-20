import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProgrammeGrid } from "@/components/programme/programme-grid";
import { ProgrammeList } from "@/components/programme/programme-list";
import { ProgrammeTable } from "@/components/programme/programme-table";
import { getProgrammeData } from "@/lib/programme/data";
import { conferenceName, hasEnglishTranslation } from "@/lib/programme/conference";
import { formatDate, formatShortDate, formatWeekday } from "@/lib/utils/dates";
import { isLocale, type Locale } from "@/lib/i18n/config";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function hrefFor(
  base: string,
  params: SearchParams,
  overrides: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) search.set(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) search.set(key, value);
    else search.delete(key);
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; year: string }>;
}): Promise<Metadata> {
  const { locale, year } = await params;
  return {
    title: locale === "en" ? `Programme ${year}` : `Chương trình ${year}`,
  };
}

export default async function ProgrammePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; year: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: rawLocale, year } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const data = await getProgrammeData(year);
  if (!data) notFound();

  const sp = await searchParams;
  const view = ["list", "grid", "table"].includes(one(sp.view) ?? "")
    ? (one(sp.view) as "list" | "grid" | "table")
    : "list";
  const q = (one(sp.q) ?? "").trim().toLowerCase();
  const roomId = one(sp.room);
  const typeCode = one(sp.type);
  const selectedDate = one(sp.date) ?? data.dates[0]?.date ?? "";

  const base = `/${locale}/hoi-nghi/${year}/chuong-trinh`;

  let sessions = data.sessions;
  if (selectedDate && view !== "table") {
    sessions = sessions.filter((session) => session.conference_dates?.date === selectedDate);
  }
  if (selectedDate && view === "table") {
    sessions = sessions.filter((session) => session.conference_dates?.date === selectedDate);
  }
  if (roomId) sessions = sessions.filter((session) => session.rooms?.id === roomId);
  if (typeCode) sessions = sessions.filter((session) => session.session_types?.code === typeCode);
  if (q) {
    sessions = sessions.filter((session) => {
      const haystack = [
        ...session.session_translations.map((t) => t.title ?? ""),
        ...session.presentations.flatMap((p) => [
          ...p.presentation_translations.map((t) => t.title ?? ""),
          ...p.presentation_people.map((person) => person.people?.display_name ?? ""),
        ]),
        ...session.session_people.map((person) => person.people?.display_name ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const conferenceNameText = conferenceName(data.conference, locale);
  const enFallback = locale === "en" && !hasEnglishTranslation(data.conference);
  const sessionGroups = data.dates
    .map((date) => ({
      date,
      sessions: sessions.filter((session) => session.conference_dates?.date === date.date),
    }))
    .filter((group) => group.sessions.length > 0);

  const tableDate = data.dates.find((date) => date.date === selectedDate) ?? data.dates[0];

  return (
    <div className="bg-white pb-20">
      <div className="border-b border-line bg-surface">
        <Container className="py-9">
          <nav className="text-xs font-semibold text-ink-500">
            <Link className="hover:text-brand-700" href={`/${locale}`}>
              {locale === "en" ? "Home" : "Trang chủ"}
            </Link>
            <span className="mx-1.5">/</span>
            <Link className="hover:text-brand-700" href={`/${locale}/hoi-nghi`}>
              {locale === "en" ? "Congresses" : "Hội nghị"}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink-700">{conferenceNameText}</span>
          </nav>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                {locale === "en" ? "Scientific programme" : "Chương trình khoa học"}
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                {conferenceNameText}
                {data.conference.city ? ` · ${data.conference.city}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex w-fit rounded-full border border-line bg-white p-1">
                {(["list", "grid", "table"] as const).map((mode) => (
                  <Link
                    key={mode}
                    href={hrefFor(base, sp, { view: mode })}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ${
                      view === mode ? "bg-brand-600 text-white" : "text-brand-800 hover:bg-brand-50"
                    }`}
                  >
                    {mode === "list" ? "List" : mode === "grid" ? "Grid" : "Table"}
                  </Link>
                ))}
              </div>
              <Link
                href={`/${locale}/hoi-nghi/${year}/chuong-trinh/tong-quan`}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                {locale === "en" ? "At a glance" : "Tổng quan"}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-6">
        {enFallback ? (
          <p className="mb-4 rounded-lg border border-gold-300 bg-gold-100 px-4 py-2.5 text-sm text-ink-700">
            English translation is being updated. Showing Vietnamese content.
          </p>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Programme dates">
          {data.dates.map((date) => {
            const active = date.date === selectedDate;
            return (
              <Link
                key={date.id}
                href={hrefFor(base, sp, { date: date.date })}
                className={`flex shrink-0 flex-col items-center rounded-full border px-4 py-2 text-xs font-bold ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-ink-700 hover:border-brand-300"
                }`}
              >
                <span className="uppercase">{formatWeekday(date.date, locale)}</span>
                <span className={active ? "text-white/90" : "text-ink-500"}>
                  {formatShortDate(date.date, locale)}
                </span>
              </Link>
            );
          })}
        </nav>

        <form className="mt-4 grid gap-3 rounded-xl border border-line bg-white p-4 sm:grid-cols-[1fr_180px_180px_auto]">
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="view" value={view} />
          <label className="relative block">
            <span className="sr-only">{locale === "en" ? "Search" : "Tìm kiếm"}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              name="q"
              defaultValue={one(sp.q) ?? ""}
              placeholder={
                locale === "en"
                  ? "Session, presentation, speaker..."
                  : "Phiên, báo cáo, diễn giả..."
              }
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-400"
            />
          </label>
          <select
            name="room"
            defaultValue={roomId ?? ""}
            className="h-10 rounded-lg border border-line bg-white px-2 text-sm"
            aria-label={locale === "en" ? "Room" : "Hội trường"}
          >
            <option value="">{locale === "en" ? "All rooms" : "Tất cả hội trường"}</option>
            {data.rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {locale === "en" ? room.name_en || room.name_vi : room.name_vi}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={typeCode ?? ""}
            className="h-10 rounded-lg border border-line bg-white px-2 text-sm"
            aria-label={locale === "en" ? "Session type" : "Loại phiên"}
          >
            <option value="">{locale === "en" ? "All types" : "Tất cả loại phiên"}</option>
            {data.types.map((type) => (
              <option key={type.id} value={type.code}>
                {locale === "en" ? type.name_en || type.name_vi : type.name_vi || type.name_en}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {locale === "en" ? "Filter" : "Lọc"}
          </button>
        </form>

        <div className="mt-7">
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="text-sm font-semibold text-ink-700">
                {locale === "en" ? "No sessions found." : "Không tìm thấy phiên phù hợp."}
              </p>
              <Link
                href={base}
                className="mt-3 inline-block text-sm font-bold text-brand-700 hover:underline"
              >
                {locale === "en" ? "Clear filters" : "Xoá bộ lọc"}
              </Link>
            </div>
          ) : view === "list" ? (
            <div className="grid gap-8">
              {sessionGroups.map((group) => (
                <section key={group.date.id}>
                  <h2 className="flex items-center gap-2 border-b-2 border-gold-500 pb-2 text-xl font-extrabold text-brand-900">
                    <CalendarDays className="size-5 text-brand-500" aria-hidden />
                    {formatDate(group.date.date, locale)}
                  </h2>
                  <div className="mt-3">
                    <ProgrammeList sessions={group.sessions} locale={locale} />
                  </div>
                </section>
              ))}
            </div>
          ) : view === "grid" ? (
            <ProgrammeGrid sessions={sessions} locale={locale} />
          ) : (
            <>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-brand-900">
                <MapPin className="size-5 text-brand-500" aria-hidden />
                {tableDate ? formatDate(tableDate.date, locale) : ""}
              </h2>
              <ProgrammeTable sessions={sessions} rooms={data.rooms} locale={locale} />
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-ink-500">
          {locale === "en"
            ? "Times are local to the congress venue."
            : "Thời gian hiển thị theo giờ tại hội trường."}
        </p>
      </Container>
    </div>
  );
}

