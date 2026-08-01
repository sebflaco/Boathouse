"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Enter your email and password.";
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Surface the real cause — a generic message here hides config errors
    // (unconfirmed email, invalid API key) behind "wrong password".
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return "Email or password doesn't match. Ask your coach for an invite.";
    }
    if (error.message.toLowerCase().includes("not confirmed")) {
      return "This account's email hasn't been confirmed. A coach can confirm it in Supabase (Authentication → Users → Confirm email).";
    }
    return `Login failed: ${error.message}`;
  }

  redirect("/");
}
