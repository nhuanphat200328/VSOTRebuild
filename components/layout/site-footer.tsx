import Link from "next/link";
import { Mail, MapPinned, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/i18n/config";
import type { getDictionary } from "@/lib/i18n/dictionary";

type Dict = ReturnType<typeof getDictionary>;

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  return (
    <footer className="border-t border-line bg-ink-900 text-white/80">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-sm font-extrabold text-white">
              VSOT
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">
                Hội Ghép tạng Việt Nam
              </span>
              <span className="block text-[11px] uppercase tracking-wide text-white/60">
                Vietnam Society of Organ Transplantation
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            {dict.about.body}
          </p>
        </div>

        <nav aria-label={dict.footer.about}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold-300">
            {dict.footer.about}
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link className="hover:text-white" href={`/${locale}#gioi-thieu`}>
                {dict.nav.about}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href={`/${locale}#hoi-nghi`}>
                {dict.nav.conference}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href={`/${locale}/hoi-nghi/cac-nam-truoc`}>
                {locale === "en" ? "Previous Conferences" : "Hội nghị các năm trước"}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={dict.footer.resources}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold-300">
            {dict.footer.resources}
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <span className="text-white/45">{dict.nav.documents}</span>
            </li>
            <li>
              <span className="text-white/45">{dict.nav.membership}</span>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold-300">
            {dict.footer.contact}
          </h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-2.5">
              <MapPinned className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
              <span>{dict.contact.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
              <a className="hover:text-white" href="tel:+84983723493">
                +84 983 723 493
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
              <a className="hover:text-white" href="mailto:vsot@outlook.com.vn">
                vsot@outlook.com.vn
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.footer.rights}
          </p>
          <div className="flex flex-wrap gap-4">
            <span>{dict.footer.privacy}</span>
            <span>{dict.footer.terms}</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
