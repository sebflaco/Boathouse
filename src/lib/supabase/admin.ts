import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client — SERVER ONLY. Bypasses RLS.
 * Used exclusively for coach-triggered invites (auth.admin.inviteUserByEmail).
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
