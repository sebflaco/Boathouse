"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirm) {
    return "Passwords don't match.";
  }

  const supabase = await createClient();

  // Must have an active session from the invite/recovery link.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "Your link has expired. Ask your coach to resend the invite.";
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return error.message;
  }

  redirect("/");
}
