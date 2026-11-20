import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(200),
  full_name: z.string().min(2).max(200).optional(),
});

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expected = process.env.SUPER_ADMIN_BOOTSTRAP_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Bootstrap is not configured." }, { status: 503 });
  }

  const provided = request.headers.get("x-bootstrap-secret") ?? "";
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { email, password, full_name } = parsed.data;
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL;
  if (configuredEmail && configuredEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Email does not match bootstrap configuration." }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();

  const { count, error: countError } = await admin
    .from("user_roles")
    .select("id, roles!inner(code)", { count: "exact", head: true })
    .eq("roles.code", "super_admin");

  if (countError) {
    return NextResponse.json({ error: "Unable to verify bootstrap state." }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "Super Admin already exists." }, { status: 409 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { vsot_invite: "true", full_name: full_name ?? "Super Admin" },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Unable to create user." },
      { status: 400 },
    );
  }

  const { data: granted, error: rpcError } = await admin.rpc("bootstrap_super_admin", {
    p_user_id: created.user.id,
  });

  if (rpcError || granted !== true) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: "Super Admin bootstrap was already completed." },
      { status: 409 },
    );
  }

  await admin.from("audit_logs").insert({
    actor_id: created.user.id,
    actor_email: email,
    action: "bootstrap.super_admin",
    entity: "profiles",
    entity_id: created.user.id,
  });

  return NextResponse.json({ ok: true });
}
