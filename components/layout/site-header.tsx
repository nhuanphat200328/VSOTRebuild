"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Globe2, Mail, MapPinned, Menu, Phone, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import { archiveConferences } from "@/lib/archive/conferences";
import type { Locale } from "@/lib/i18n/config";
import type { getDictionary } from "@/lib/i18n/dictionary";

type Dict = ReturnType<typeof getDictionary>;

const navItems = [
  { key: "home", href: "/legacy/2026/index.html" },
  { key: "about", href: "/legacy/2026/gioi-thieu.html" },
  { key: "news", href: "/tin-tuc" },
  { key: "conference", href: "/legacy/2026/index.html" },
  { key: "contact", href: "/lien-he" },
] as const;

const archiveLinks = archiveConferences.filter(
  (conference) => conference.kind !== "pending" && conference.href,
);

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dict }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [mobileArchiveOpen, setMobileArchiveOpen] = useState(false);
  const otherLocale: Locale = locale === "vi" ? "en" : "vi";
  const parts = pathname.split("/");
  parts[1] = otherLocale;
  const switchHref = parts.join("/") || `/${otherLocale}`;
  const archiveActive = pathname.startsWith("/legacy/") || pathname.includes("/cac-nam-truoc");
  const hrefForNav = (href: string) =>
    href.startsWith("/legacy/") ? href : `/${locale}${href}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur">
      <div className="hidden border-b border-line/60 bg-surface text-xs text-ink-500 md:block">
        <Container className="flex h-9 items-center justify-between gap-6">
          <p className="flex items-center gap-2">
            <MapPinned className="size-3.5 text-brand-600" aria-hidden />
            {dict.contact.address}
          </p>
          <div className="flex items-center gap-5">
            <a className="flex items-center gap-1.5 hover:text-brand-700" href="tel:+84983723493">
              <Phone className="size-3.5" aria-hidden />
              +84 983 723 493
            </a>
            <a className="flex items-center gap-1.5 hover:text-brand-700" href="mailto:vsot@outlook.com.vn">
              <Mail className="size-3.5" aria-hidden />
              vsot@outlook.com.vn
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/legacy/2026/index.html"
          className="flex min-w-0 items-center gap-3"
          aria-label="VSOT — Hội nghị 2026"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold tracking-tight text-white shadow-sm">
            VSOT
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-bold text-ink-900 sm:text-base">
              Hội Ghép tạng Việt Nam
            </span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-ink-500">
              Vietnam Society of Organ Transplantation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={hrefForNav(item.href)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {dict.nav[item.key]}
            </Link>
          ))}

          <div
            className="group relative"
            onMouseEnter={() => setArchiveOpen(true)}
            onMouseLeave={() => setArchiveOpen(false)}
          >
            <button
              type="button"
              onClick={() => setArchiveOpen((value) => !value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-brand-50 hover:text-brand-700",
                archiveActive ? "bg-brand-50 text-brand-700" : "text-ink-700",
              )}
              aria-expanded={archiveOpen}
              aria-haspopup="true"
              aria-controls="desktop-archive-menu"
            >
              {dict.nav.archive}
              <ChevronDown className="size-4" aria-hidden />
            </button>
            <div
              id="desktop-archive-menu"
              className={cn(
                "absolute left-0 top-full z-50 min-w-56 rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-ink-900/10",
                archiveOpen ? "block" : "hidden group-hover:block group-focus-within:block",
              )}
            >
              {archiveLinks.map((conference) => (
                <a
                  key={conference.year}
                  href={conference.href}
                  onClick={() => setArchiveOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  <span>
                    {conference.year}
                    {conference.kind === "document" ? " (PDF)" : ""}
                  </span>
                  <span className="text-[11px] text-ink-500">
                    {conference.kind === "document" ? "PDF" : "Website"}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={switchHref}
            hrefLang={otherLocale}
            className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-xs font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 sm:flex"
          >
            <Globe2 className="size-4" aria-hidden />
            {otherLocale.toUpperCase()}
          </Link>
          <Link
            href="/legacy/2026/lien-he.html"
            className="hidden rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-flex"
          >
            {dict.actions.contact}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-700 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        className={cn("border-t border-line bg-white lg:hidden", open ? "block" : "hidden")}
      >
        <Container className="grid gap-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={hrefForNav(item.href)}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-brand-50"
            >
              {dict.nav[item.key]}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setMobileArchiveOpen((value) => !value)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-brand-50"
            aria-expanded={mobileArchiveOpen}
            aria-controls="mobile-archive-menu"
          >
            {dict.nav.archive}
            <ChevronDown
              className={cn("size-4 transition", mobileArchiveOpen ? "rotate-180" : "")}
              aria-hidden
            />
          </button>
          {mobileArchiveOpen ? (
            <div id="mobile-archive-menu" className="ml-3 grid gap-1 border-l border-line pl-3">
              {archiveLinks.map((conference) => (
                <a
                  key={conference.year}
                  href={conference.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-brand-50"
                >
                  {conference.year}
                  {conference.kind === "document" ? " (PDF)" : ""}
                </a>
              ))}
            </div>
          ) : null}

          <Link
            href={switchHref}
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold text-ink-700"
          >
            <Globe2 className="size-4" aria-hidden />
            {otherLocale === "en" ? "English" : "Tiếng Việt"}
          </Link>
        </Container>
      </div>
    </header>
  );
}
