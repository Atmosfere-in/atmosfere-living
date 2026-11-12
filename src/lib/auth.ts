import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./utils";
import type { Profile } from "./types";

export async function getSession() {
  if (!isSupabaseConfigured()) return { user: null, profile: null as Profile | null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user, profile: profile as Profile | null };
}

export async function requireUser(next = "/account") {
  const session = await getSession();
  if (!session.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session as { user: NonNullable<typeof session.user>; profile: Profile | null };
}

export async function requireAdmin() {
  const session = await requireUser("/admin");
  if (session.profile?.role !== "admin" || session.profile.is_blocked) redirect("/account?denied=1");
  return session as { user: NonNullable<typeof session.user>; profile: Profile };
}
