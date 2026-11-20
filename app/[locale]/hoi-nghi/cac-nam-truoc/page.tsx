import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, FileText, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { archiveConferences } from "@/lib/archive/conferences";
import { isLocale } from "@/lib/i18n/config";

export default async function PreviousConferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as "vi" | "en";

  return (
    <div className="bg-surface pb-20">
      <Container className="py-10">
        <Link
          href={`/${locale}/hoi-nghi`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {locale === "en" ? "Congresses" : "Hội nghị"}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {locale === "en" ? "Previous Conferences" : "Hội nghị các năm trước"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500">
          {locale === "en"
            ? "Archived VSOT congress websites, preserved in their original design."
            : "Kho lưu trữ website các kỳ hội nghị VSOT, giữ nguyên giao diện gốc."}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {archiveConferences.map((conference) => (
            <article key={conference.year} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              {conference.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conference.cover}
                  alt={`VSOT ${conference.year}`}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="grid h-40 place-items-center bg-brand-900 text-5xl font-extrabold text-white/90">
                  {conference.year}
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                  <CalendarDays className="size-4" aria-hidden />
                  {conference.year}
                  {conference.current ? (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] text-gold-600">
                      {locale === "en" ? "Current" : "Hiện tại"}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-2 text-base font-extrabold leading-snug text-ink-900">
                  {conference.name}
                </h2>
                {conference.dates || conference.location ? (
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    {conference.dates ? <span>{conference.dates}</span> : null}
                    {conference.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" aria-hidden />
                        {conference.location}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {conference.kind === "pending" ? (
                  <p className="mt-auto inline-flex w-fit rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-bold text-ink-500">
                    {locale === "en" ? "Backend migration pending" : "Đang chờ migrate backend PHP"}
                  </p>
                ) : (
                  <a
                    href={conference.href}
                    target={conference.kind === "site" ? "_blank" : undefined}
                    rel={conference.kind === "site" ? "noopener noreferrer" : undefined}
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    {conference.kind === "site" ? (
                      <>
                        {locale === "en" ? "Open website" : "Mở website"}
                        <ExternalLink className="size-3.5" aria-hidden />
                      </>
                    ) : (
                      <>
                        {locale === "en" ? "View programme PDF" : "Xem chương trình PDF"}
                        <FileText className="size-3.5" aria-hidden />
                      </>
                    )}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink-500">
          {locale === "en"
            ? "2018, 2019 and 2021 use a PHP/MySQL backend and are pending migration. Years 2020 and 2024 have no separate archived website."
            : "Các năm 2018, 2019 và 2021 dùng backend PHP/MySQL, đang chờ migrate. Các năm 2020 và 2024 không có website hội nghị riêng."}
        </p>
      </Container>
    </div>
  );
}
