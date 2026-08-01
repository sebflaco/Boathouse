# Boathouse — Milestone 1 setup guide

This walks you through standing up the deployed skeleton: a Supabase project
(Postgres + Auth + RLS) and a Vercel deployment of this Next.js app. Follow it
top to bottom the first time. Allow ~20 minutes.

You will end with:

- A Supabase project in the **EU (Frankfurt)** region with the full schema and
  Row Level Security applied.
- The app deployed on Vercel, wired to Supabase.
- One **coach** account you can log in with, who can then invite the squad.

Dashboard menu labels occasionally move; when in doubt, search the dashboard.

---

## Part A — Supabase

### A1. Create the project

1. Go to <https://supabase.com/dashboard> and sign in.
2. **New project**.
   - **Name:** `boathouse` (anything).
   - **Database password:** generate a strong one and save it in your password
     manager — you'll need it for the CLI (optional) and DB access.
   - **Region:** **Central EU (Frankfurt) `eu-central-1`**. This keeps club data
     in the EU (GDPR — spec §7). Do not pick a US region.
   - Plan: **Free** is enough for a club.
3. Create it and wait ~2 minutes for provisioning.

### A2. Apply the database schema + RLS

You have two options. **Option 1 (SQL editor)** needs no local tooling and is
the quickest for a one-off. **Option 2 (CLI)** is better long-term because
migrations stay versioned in this repo.

#### Option 1 — paste the migrations in the SQL editor

In the dashboard: **SQL Editor → New query**. Run each file's contents **in
order**, one at a time (paste, **Run**, confirm success, move to the next):

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_new_user_trigger.sql`
3. `supabase/migrations/0003_rls.sql`
4. *(optional)* `supabase/seed.sql` — seeds the two demo teams and two races.

#### Option 2 — Supabase CLI (versioned migrations)

```bash
npm i -g supabase                 # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <your-project-ref>   # ref is in the project URL
supabase db push                  # applies everything in supabase/migrations
psql "$(supabase db url)" -f supabase/seed.sql    # optional demo data
```

`<your-project-ref>` is the subdomain of your project URL, e.g. `abcdefgh` in
`https://abcdefgh.supabase.co`.

### A3. Verify the schema landed

**Table Editor** should now list `teams`, `profiles`, `sessions`, `wellness`,
`feedback`, `events`, `availability`, and the rest. Each should show a green
**RLS enabled** shield. **Database → Policies** should list the policies from
`0003_rls.sql`. If any table shows RLS disabled, re-run `0003_rls.sql`.

### A4. Configure Auth

Boathouse is **invite-only — no self-signup** (spec §3).

1. **Authentication → Providers → Email**: ensure **Email** is enabled.
   Turn **Confirm email** ON. Leave **Enable email signups**… see next step.
2. **Authentication → Sign In / Providers** (or **Settings**): **disable public
   sign-ups** so only coach-issued invites create accounts. (Setting name is
   usually *"Allow new users to sign up"* — turn it OFF.) Invites via the
   service-role admin API still work with signups disabled.
3. **Authentication → URL Configuration:**
   - **Site URL:** your production URL, e.g. `https://boathouse.vercel.app`
     (you'll get this from Vercel in Part B — come back and set it).
   - **Redirect URLs (allow-list):** add both:
     - `https://boathouse.vercel.app/**`
     - `http://localhost:3000/**` (for local dev)
     The invite/recovery links redirect to `/auth/confirm`, which must be
     inside an allowed URL.
4. **Email templates** (**Authentication → Emails/Templates**). The default
   templates work. The **Invite user** and **Reset password** templates use
   `{{ .ConfirmationURL }}` — leave that intact; our `/auth/confirm` route
   consumes the `token_hash` it carries and forwards the user to
   `/update-password`.
5. **SMTP (recommended before inviting real people).** Supabase's built-in email
   is rate-limited and only sends to your own team addresses. For the real squad,
   set **Authentication → Emails → SMTP Settings** to a provider (Resend,
   Postmark, Brevo, etc.). Until then, invites only reliably reach the project
   owner's email.

### A5. Collect the API keys

**Project Settings → API** (and **API Keys**). Copy three values — you'll paste
them into Vercel and `.env.local`:

| Value | Env var | Exposure |
|---|---|---|
| Project URL (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` | public |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public (RLS protects data) |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **secret — server only** |

The `service_role` key bypasses RLS. It's used **only** server-side for
coach-triggered invites. Never expose it to the browser or commit it.

---

## Part B — Vercel

### B1. Import the repo

1. Push this repo to GitHub (see the root `README.md` if it isn't already).
2. <https://vercel.com/new> → **Import** the `boathouse` repository.
3. Vercel auto-detects **Next.js**. Leave build settings at defaults
   (build `next build`, output handled automatically).

### B2. Environment variables

Before the first deploy, add these under **Settings → Environment Variables**
(apply to **Production**, **Preview**, and **Development**):

```
NEXT_PUBLIC_SUPABASE_URL        = https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <anon key>
SUPABASE_SERVICE_ROLE_KEY       = <service_role key>   # mark as sensitive
NEXT_PUBLIC_SITE_URL            = https://<your-app>.vercel.app
```

Set `NEXT_PUBLIC_SITE_URL` to the domain Vercel gives you (or your custom
domain). It's used to build invite/reset redirect links, so it must match a URL
you allow-listed in **A4.3**.

### B3. Deploy

Click **Deploy**. When it's live:

1. Copy the production URL.
2. Go back to **Supabase → Authentication → URL Configuration** and make sure
   the **Site URL** and **Redirect URLs** use that exact domain (**A4.3**).
3. If you changed `NEXT_PUBLIC_SITE_URL` after the first deploy, **redeploy** so
   the new value is baked in.

---

## Part C — Create the first coach

Signups are disabled and invites require a coach, so bootstrap the first coach
by hand in Supabase.

1. **Authentication → Users → Add user → Create new user.**
   - Email: the head coach's email.
   - Password: set a temporary one (tick *Auto Confirm User* so they can log in
     immediately).
2. That insert fires the `on_auth_user_created` trigger, which creates a
   `profiles` row — but with the default role `athlete`. Promote them:
   **SQL Editor**, run (replace the email):

   ```sql
   update public.profiles
   set role = 'coach'
   where id = (select id from auth.users where email = 'coach@example.com');
   ```

3. Open the deployed app, log in as that coach. You'll see the **coach** home
   with the **Invite a rower or coach** card. From there, invite the squad —
   each person gets an email to set their own password.

> Tip: create your teams first (Table Editor → `teams`, or they're seeded by
> `seed.sql`) so you can assign people to a team as you invite them.

---

## Part D — Verify it works end to end

- Log in as the coach → you reach the coach home (no redirect loop).
- Invite yourself at a second email → you receive the email → the link lands on
  **/update-password** → set a password → you're in.
- As an athlete, confirm you **cannot** read another athlete's data. Quick RLS
  smoke test in the SQL editor:

  ```sql
  -- Simulate an athlete and confirm they only see their own wellness rows.
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"<athlete-user-uuid>","role":"authenticated"}';
  select count(*) from public.wellness;          -- only their own
  select count(*) from public.erg_targets;       -- only their own targets
  reset role;
  ```

  A coach's UUID in the same test should see all rows. If an athlete sees
  more than their own, re-check `0003_rls.sql` applied cleanly.

---

## Local development (optional)

```bash
cp .env.example .env.local     # fill in the same four values
npm install
npm run dev                    # http://localhost:3000
```

Use `http://localhost:3000` as `NEXT_PUBLIC_SITE_URL` locally, and make sure
`http://localhost:3000/**` is in the Supabase redirect allow-list.

---

## What's in this milestone (and what isn't)

**In:** Next.js + TypeScript + Tailwind scaffold with the "Regatta" design
tokens; the full Postgres schema and RLS; email/password auth; coach-issued
invites; set-password and password-reset flows; a deployable skeleton.

**Next milestones (per `BOATHOUSE_SPEC.md` §8):** athlete flows (check-in,
schedule, session logging, availability); coach program builder; dashboards
(compliance, Athletes, Season, Planner); design polish and full seed data.
