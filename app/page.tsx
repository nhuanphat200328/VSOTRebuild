import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(process.env.VSOT_LEGACY_2026_URL ?? "/legacy/2026/index.html");
}
