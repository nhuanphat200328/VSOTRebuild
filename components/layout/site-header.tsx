"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Globe2, Mail, MapPinned, Menu, Phone, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/config";
import type { getDictionary } from "@/lib/i18n/dictionary";

type Dict = ReturnType<typeof getDictionary>;

const navItems = [
  { key: "home", href: "" },
  { key: "about", href: "#gioi-thieu" },
  { key: "news", href: "/tin-tuc" },
  { key: "conference", href: "/hoi-nghi" },
  { key: "contact", href: "/lien-he" },
] as const;

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const otherLocale: Locale = locale === "vi" ? "en" : "vi";
  const parts = pathname.split("/");
  parts[1] = otherLocale;
  const switchHref = parts.join("/") || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur">
      <div className="hidden border-b border-line/60 bg-surface text-xs text-ink-500 md:block">
        <Container className="flex h-9 items-center justify-between gap-6">
          <p className="flex items-center gap-2">
            <MapPinned className="size-3.5 text-brand-600" aria-hidden />
            {dict.contact.address}
          </p>
          <div className="flex items-center gap-5">
            <a
              className="flex items-center gap-1.5 hover:text-brand-700"
              href="tel:+84983723493"
            >
              <Phone className="size-3.5" aria-hidden />
              +84 983 723 493
            </a>
            <a
              className="flex items-center gap-1.5 hover:text-brand-700"
              href="mailto:vsot@outlook.com.vn"
            >
              <Mail className="size-3.5" aria-hidden />
              vsot@outlook.com.vn
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="flex min-w-0 items-center gap-3"
          aria-label="VSOT"
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
              href={`/${locale}${item.href}`}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
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
            href={`/${locale}#lien-he`}
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
        className={cn(
          "border-t border-line bg-white lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="grid gap-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-brand-50"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
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


