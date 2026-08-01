"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";

export default function UpdatePasswordPage() {
  const [error, formAction, pending] = useActionState(updatePassword, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-carmine p-5">
      <div className="w-full max-w-[380px] rounded-xl border-t-[3px] border-brass bg-ivory p-8">
        <div className="disp mb-1 text-[20px] font-bold tracking-wordmark text-carmine">
          Boat<span className="text-brass">house</span>
        </div>
        <p className="mb-4 text-[13px] text-muted">Set a password to finish setting up your account.</p>

        <form action={formAction}>
          <label className="lbl" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="input"
            required
          />

          <label className="lbl" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            className="input"
            required
          />

          {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}

          <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full disabled:opacity-60">
            {pending ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
