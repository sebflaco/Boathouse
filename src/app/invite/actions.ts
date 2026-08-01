"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/domain";

export type InviteState = { ok: boolean; message: string } | null;

/**
 * Coach-only: invite a new user by email. Supabase emails a set-password link
 * (→ /auth/confirm → /update-password). The name/role/team are passed as user
 * metadata; the on_auth_user_created trigger turns them into a profile row.
 */
export async function inviteUser(_prevState: InviteState, formData: FormData): Promise<InviteState> {
  const supabase = await createClient();

  // Authorize: caller must be a signed-in coach.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "coach") {
    return { ok: false, message: "Only coaches can invite people." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = (String(formData.get("role") ?? "athlete") as Role) === "coach" ? "coach" : "athlete";
  const teamId = String(formData.get("team_id") ?? "").trim() || null;

  if (!email || !name) {
    return { ok: false, message: "Name and email are required." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name, role, team_id: teamId },
    redirectTo: `${siteUrl}/auth/confirm`,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: `Invite sent to ${email}.` };
}
