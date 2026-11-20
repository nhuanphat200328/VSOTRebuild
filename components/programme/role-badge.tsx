import type { Locale } from "@/lib/i18n/config";

const labels: Record<string, { vi: string; en: string; short: string; className: string }> = {
  chair: { vi: "Chủ tọa", en: "Chair", short: "C", className: "bg-red-700" },
  co_chair: { vi: "Đồng chủ tọa", en: "Co-chair", short: "C", className: "bg-red-700" },
  discussant: { vi: "Thảo luận", en: "Discussant", short: "D", className: "bg-amber-600" },
  moderator: { vi: "Điều phối", en: "Moderator", short: "M", className: "bg-slate-600" },
  presenter: { vi: "Báo cáo viên", en: "Presenter", short: "P", className: "bg-emerald-700" },
  invited_speaker: { vi: "Báo cáo mời", en: "Invited Speaker", short: "I", className: "bg-brand-700" },
};

export function RoleBadge({
  role,
  locale,
  showLabel = false,
}: {
  role: string;
  locale: Locale;
  showLabel?: boolean;
}) {
  const meta = labels[role] ?? labels.presenter;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-extrabold text-white ${meta.className}`}
        title={locale === "en" ? meta.en : meta.vi}
      >
        {meta.short}
      </span>
      {showLabel ? (
        <span className="text-xs font-semibold text-ink-500">
          {locale === "en" ? meta.en : meta.vi}
        </span>
      ) : null}
    </span>
  );
}

export function roleLabel(role: string, locale: Locale) {
  const meta = labels[role] ?? labels.presenter;
  return locale === "en" ? meta.en : meta.vi;
}
