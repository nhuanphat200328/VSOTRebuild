import {
  ArrowRight,
  CalendarDays,
  Mail,
  MapPin,
  MapPinned,
  Presentation,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const stats = [
    { icon: CalendarDays, value: "5", label: dict.conference.stats.days },
    { icon: MapPin, value: "6", label: dict.conference.stats.halls },
    { icon: Users, value: "65", label: dict.conference.stats.sessions },
    { icon: Presentation, value: "255", label: dict.conference.stats.presentations },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(13,129,205,0.55),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(233,172,55,0.22),transparent_38%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <Container className="relative py-20 sm:py-24 lg:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">
            <Sparkles className="size-3.5" aria-hidden />
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand-200">
            {dict.hero.subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {dict.hero.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#hoi-nghi"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-black/10 transition hover:bg-gold-300"
            >
              {dict.actions.conferenceDetails}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href="#gioi-thieu"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {dict.actions.learnMore}
            </a>
          </div>
        </Container>
      </section>

      <section className="relative z-10 -mt-8">
        <Container>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-xl shadow-brand-900/5 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="bg-white px-5 py-6 text-center sm:px-6">
                <item.icon className="mx-auto size-5 text-brand-500" aria-hidden />
                <p className="mt-2 text-2xl font-extrabold text-ink-900">{item.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="gioi-thieu" className="scroll-mt-24 py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              VSOT
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {dict.about.title}
            </h2>
            <div className="mt-6 h-1 w-16 rounded-full bg-gold-500" />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9">
            <p className="text-lg leading-relaxed text-ink-700">{dict.about.body}</p>
            <p className="mt-5 inline-flex rounded-lg border border-dashed border-brand-200 bg-white px-3 py-2 text-sm text-ink-500">
              {dict.about.updating}
            </p>
          </div>
        </Container>
      </section>

      <section id="hoi-nghi" className="scroll-mt-24 border-y border-line bg-surface py-20">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                {dict.conference.title}
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                {dict.conference.name}
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-500">
              <MapPin className="size-3.5 text-brand-500" aria-hidden />
              {dict.conference.location}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <CalendarDays className="size-5 text-brand-500" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-ink-500">
                {dict.conference.title}
              </p>
              <p className="mt-1 text-lg font-bold text-ink-900">
                {dict.conference.dates}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <MapPinned className="size-5 text-brand-500" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-ink-500">
                {dict.conference.location}
              </p>
              <p className="mt-1 text-lg font-bold text-ink-900">
                {dict.conference.location}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-700">
            {dict.conference.summary}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-500">
            {dict.conference.note}
          </p>
          <Link
            href={`/${locale}/hoi-nghi/2026`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            {dict.actions.conferenceDetails}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Container>
      </section>

      <section id="lien-he" className="scroll-mt-24 py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {dict.footer.contact}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900">
              {dict.contact.title}
            </h2>
            <div className="mt-6 h-1 w-16 rounded-full bg-gold-500" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-5">
              <MapPinned className="size-5 text-brand-500" aria-hidden />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink-500">
                {dict.footer.contact}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                {dict.contact.address}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5">
              <Phone className="size-5 text-brand-500" aria-hidden />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink-500">
                {dict.contact.phone}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                (+84) 8 38 554 138
              </p>
              <p className="text-sm text-ink-700">+84 983 723 493</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 sm:col-span-2">
              <Mail className="size-5 text-brand-500" aria-hidden />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink-500">
                {dict.contact.email}
              </p>
              <a
                className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:underline"
                href="mailto:vsot@outlook.com.vn"
              >
                vsot@outlook.com.vn
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

