"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-carmine p-5">
      <div className="w-full max-w-[380px] rounded-xl border-t-[3px] border-brass bg-ivory p-8">
        <div className="disp mb-1 text-[20px] font-bold tracking-wordmark text-carmine">
          Boat<span className="text-brass">house</span>
        </div>
        <p className="mb-4 text-[13px] text-muted">Training &amp; readiness for the whole crew.</p>

        <form action={formAction}>
          <label className="lbl" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            className="input"
            required
          />

          <label className="lbl" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="input"
            required
          />

          {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}

          <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full disabled:opacity-60">
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-[12px] text-muted">
          No account? Accounts are created by your coach — you&apos;ll get an email invite to set your password.
        </p>
      </div>
    </div>
  );
}
