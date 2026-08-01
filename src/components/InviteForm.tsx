"use client";

import { useActionState } from "react";
import { inviteUser, type InviteState } from "@/app/invite/actions";
import type { Team } from "@/lib/supabase/types";

export function InviteForm({ teams }: { teams: Team[] }) {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteUser, null);

  return (
    <div className="card">
      <h3 className="card-title">Invite a rower or coach</h3>
      <p className="mb-2 text-[13px] text-muted">
        They&apos;ll get an email to set their own password. No self-signup.
      </p>
      <form action={formAction}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[150px] flex-1">
            <label className="lbl" htmlFor="name">
              Full name
            </label>
            <input id="name" name="name" className="input" required />
          </div>
          <div className="min-w-[150px] flex-1">
            <label className="lbl" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" autoCapitalize="none" className="input" required />
          </div>
          <div className="min-w-[120px]">
            <label className="lbl" htmlFor="role">
              Role
            </label>
            <select id="role" name="role" className="input" defaultValue="athlete">
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="lbl" htmlFor="team_id">
              Team
            </label>
            <select id="team_id" name="team_id" className="input" defaultValue="">
              <option value="">— none —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
            {pending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>
      {state && (
        <p className={`mt-3 text-[13px] ${state.ok ? "text-ok" : "text-danger"}`}>{state.message}</p>
      )}
    </div>
  );
}
