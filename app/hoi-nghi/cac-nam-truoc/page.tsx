import Link from "next/link";
import { CalendarDays, ExternalLink, FileText, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import fs from "node:fs";
import path from "node:path";
import { archiveConferences } from "@/lib/archive/conferences";

export const metadata = { title: "Hội nghị các năm trước" };

export default function ArchivePage() {
  const sharedDir = path.join(process.cwd(), "public", "legacy", "shared");
  const header = fs.readFileSync(path.join(sharedDir, "header.html"), "utf8");
  const footer = fs.readFileSync(path.join(sharedDir, "footer.html"), "utf8");

  return (
    <div className="flex min-h-screen flex-col">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/legacy/shared/header-footer-2026.css" />
      <div dangerouslySetInnerHTML={{ __html: header }} />
      <main className="flex-1 bg-surface pb-20">
        <Container className="py-10">
          <Link href="/legacy/2026/index.html" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Hội nghị 2026
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Hội nghị các năm trước
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500">
            Kho lưu trữ website các kỳ hội nghị VSOT, giữ nguyên giao diện gốc.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {archiveConferences.map((conference) => (
              <article key={conference.year} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                {conference.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={conference.cover} alt={`VSOT ${conference.year}`} className="h-40 w-full object-cover" />
                ) : (
                  <div className="grid h-40 place-items-center bg-brand-900 text-5xl font-extrabold text-white/90">
                    {conference.year}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                    <CalendarDays className="size-4" aria-hidden />
                    {conference.year}
                  </div>
                  <h2 className="mt-2 text-base font-extrabold leading-snug text-ink-900">{conference.name}</h2>
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
                      Đang chờ migrate backend PHP
                    </p>
                  ) : (
                    <a
                      href={conference.href}
                      target={conference.kind === "site" ? "_blank" : undefined}
                      rel={conference.kind === "site" ? "noopener noreferrer" : undefined}
                      className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700"
                    >
                      {conference.kind === "site" ? "Mở website" : "Xem chương trình PDF"}
                      {conference.kind === "site" ? <ExternalLink className="size-3.5" /> : <FileText className="size-3.5" />}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-ink-500">
            Các năm 2020 và 2024 không có website hội nghị riêng trong kho lưu trữ nguồn.
          </p>
        </Container>
      </main>
      <div dangerouslySetInnerHTML={{ __html: footer }} />
    </div>
  );
}
