import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export type Translation = {
  locale: Locale;
  title: string | null;
  short_title?: string | null;
  status: string;
};

export type SessionPerson = {
  role: "chair" | "co_chair" | "discussant" | "moderator" | "presenter" | "invited_speaker";
  sort: number;
  people: {
    id: string;
    slug: string;
    full_name: string;
    display_name: string | null;
    title: string | null;
    institution: string | null;
    country: string | null;
  } | null;
};

export type Presentation = {
  id: string;
  start_time: string | null;
  end_time: string | null;
  sort: number;
  presentation_type: string | null;
  presentation_translations: Translation[];
  presentation_people: SessionPerson[];
};

export type ProgrammeSession = {
  id: string;
  start_time: string;
  end_time: string;
  program_number: string | null;
  is_separator: boolean;
  sort: number;
  session_translations: Translation[];
  rooms: { id: string; name_vi: string; name_en: string | null } | null;
  conference_dates: { id: string; date: string; label_vi: string | null; label_en: string | null };
  session_types: { code: string; name_vi: string | null; name_en: string | null; color: string | null } | null;
  session_people: SessionPerson[];
  presentations: Presentation[];
};

export type ConferenceTranslation = {
  locale: Locale;
  name: string | null;
  short_name: string | null;
  intro: string | null;
  status: string;
};

export type ConferenceInfo = {
  id: string;
  slug: string;
  year: number;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  conference_translations: ConferenceTranslation[];
};

export type ProgrammeData = {
  conference: ConferenceInfo;
  dates: { id: string; date: string; label_vi: string | null; label_en: string | null; kind: string }[];
  rooms: { id: string; name_vi: string; name_en: string | null; sort: number }[];
  types: { id: string; code: string; name_vi: string | null; name_en: string | null; is_break: boolean }[];
  sessions: ProgrammeSession[];
};

export function pickTranslation(
  translations: Translation[] | null | undefined,
  locale: Locale,
  fallback: Locale = "vi",
) {
  if (!translations?.length) return null;
  return (
    translations.find((item) => item.locale === locale && item.status === "published") ??
    translations.find((item) => item.locale === fallback && item.status === "published") ??
    null
  );
}

export async function getConferenceByYear(year: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conferences")
    .select(
      "id, slug, year, start_date, end_date, city, conference_translations(locale, name, short_name, intro, status)",
    )
    .eq("slug", year)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Conference query failed: ${error.message}`);
  return data as ConferenceInfo | null;
}

export async function getProgrammeData(year: string): Promise<ProgrammeData | null> {
  const supabase = await createSupabaseServerClient();
  const conference = await getConferenceByYear(year);
  if (!conference) return null;

  const [datesResult, roomsResult, typesResult, sessionsResult] = await Promise.all([
    supabase
      .from("conference_dates")
      .select("id, date, label_vi, label_en, kind, sort")
      .eq("conference_id", conference.id)
      .order("sort"),
    supabase
      .from("rooms")
      .select("id, name_vi, name_en, sort")
      .eq("conference_id", conference.id)
      .order("sort"),
    supabase.from("session_types").select("id, code, name_vi, name_en, is_break"),
    supabase
      .from("sessions")
      .select(
        `id, start_time, end_time, program_number, is_separator, sort,
         session_translations(locale, title, short_title, status),
         rooms(id, name_vi, name_en),
         conference_dates(id, date, label_vi, label_en),
         session_types(code, name_vi, name_en, color),
         session_people(role, sort, people(id, slug, full_name, display_name, title, institution, country)),
         presentations(
           id, start_time, end_time, sort, presentation_type,
           presentation_translations(locale, title, status),
           presentation_people(role, sort, people(id, slug, full_name, display_name, title, institution, country))
         )`,
      )
      .eq("conference_id", conference.id)
      .eq("status", "published")
      .order("start_time"),
  ]);

  for (const result of [datesResult, roomsResult, typesResult, sessionsResult]) {
    if (result.error) throw new Error(`Programme query failed: ${result.error.message}`);
  }

  const sessions = ((sessionsResult.data ?? []) as unknown as ProgrammeSession[]).map((session) => ({
    ...session,
    presentations: [...(session.presentations ?? [])].sort((a, b) => a.sort - b.sort),
    session_people: [...(session.session_people ?? [])].sort((a, b) => a.sort - b.sort),
  }));

  return {
    conference,
    dates: (datesResult.data ?? []) as ProgrammeData["dates"],
    rooms: (roomsResult.data ?? []) as ProgrammeData["rooms"],
    types: (typesResult.data ?? []) as ProgrammeData["types"],
    sessions,
  };
}

export async function getSessionById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, start_time, end_time, program_number, is_separator, sort,
       conference_id,
       session_translations(locale, title, short_title, status),
       rooms(id, name_vi, name_en),
       conference_dates(id, date, label_vi, label_en),
       session_types(code, name_vi, name_en, color),
       session_people(role, sort, people(id, slug, full_name, display_name, title, institution, country)),
       presentations(
         id, start_time, end_time, sort, presentation_type,
         presentation_translations(locale, title, status),
         presentation_people(role, sort, people(id, slug, full_name, display_name, title, institution, country))
       )`,
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Session query failed: ${error.message}`);
  return data as unknown as ProgrammeSession | null;
}

export function sessionTitle(session: ProgrammeSession, locale: Locale) {
  return pickTranslation(session.session_translations, locale)?.title ?? "Nội dung đang được cập nhật";
}

export function presentationTitle(presentation: Presentation, locale: Locale) {
  return (
    pickTranslation(presentation.presentation_translations, locale)?.title ??
    "Nội dung đang được cập nhật"
  );
}

export function typeName(
  session: ProgrammeSession,
  locale: Locale,
) {
  const type = session.session_types;
  if (!type) return null;
  return locale === "en" ? type.name_en || type.name_vi : type.name_vi || type.name_en;
}
