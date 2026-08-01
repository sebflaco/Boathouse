# Boathouse

Training & readiness platform for **M.S.R.V. Saurus** (rowing club, Maastricht, NL).
Rowers log daily wellness and per-session feedback from their phones; coaches plan
team programs, track planned-vs-actual load, watch wellness trends, and manage the
season toward races.

This repo is the production rebuild of the single-file prototype
(`boathouse.jsx`), per `BOATHOUSE_SPEC.md`.

> **Status: Milestone 1** — scaffold, database schema + RLS, and invite-based
> auth, deployable to Vercel. Athlete/coach feature screens land in later
> milestones (spec §8).

## Stack

- **Next.js** (App Router, TypeScript) — UI + API/route handlers + server actions
- **Supabase** — Postgres, Auth, Row Level Security (EU / Frankfurt region)
- **Tailwind CSS** — styling, with the prototype's "Regatta" design tokens
- **Recharts** — charts (used from the dashboards milestone onward)
- **Vercel** — hosting (Hobby tier)

## Getting started

**Deploying it?** Follow **[SETUP.md](./SETUP.md)** — step-by-step Supabase and
Vercel dashboard instructions.

**Running locally:**

```bash
cp .env.example .env.local     # fill in your Supabase keys (see SETUP.md §A5)
npm install
npm run dev                    # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm start` · `npm run lint` ·
`npm run typecheck`.

## Project layout

```
src/
  app/
    layout.tsx              Root layout + fonts (Archivo / Inter / IBM Plex Mono)
    globals.css             Tailwind + "Regatta" component classes
    page.tsx                Authenticated home (role-aware shell)
    login/                  Email + password sign-in (server action)
    update-password/        Set password after an invite / reset
    invite/actions.ts       Coach-only invite (service-role admin API)
    auth/confirm/route.ts   Verifies invite/recovery links (token_hash)
    auth/callback/route.ts  PKCE/OAuth code exchange
    actions.ts              signOut
  components/               TopBar, InviteForm
  lib/
    supabase/               server / client / admin / middleware clients + types
    domain.ts               Sports, boat classes, slots, load()
    fonts.ts                next/font setup
  middleware.ts             Session refresh + route guard

supabase/
  migrations/
    0001_schema.sql         Tables per spec §4 (computed loads, uniques, FKs)
    0002_new_user_trigger.sql  Invite metadata → profiles row
    0003_rls.sql            Row Level Security for the §3 permission matrix
  seed.sql                  Optional demo teams + races
```

## Security model

Access control is enforced in the database with RLS, not just the UI (spec §3):

- **Athletes** read only their **own** wellness and erg targets, and only their
  team's sessions/events. They write only their own wellness, feedback and
  availability.
- **Coaches** read everything and own all program/team/event writes.

Helper functions (`is_coach()`, `my_team_id()`, …) are `SECURITY DEFINER` to read
`profiles` without recursing through its own policies. The `service_role` key is
used **only** server-side for coach-issued invites.

## Reference

- `BOATHOUSE_SPEC.md` — the authoritative product spec.
- `boathouse.jsx` — the original prototype (features, flows, visual design).
