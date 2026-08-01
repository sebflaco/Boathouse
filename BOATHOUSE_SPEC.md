# Boathouse — Production Build Specification

Training & readiness platform for M.S.R.V. Saurus (rowing club, Maastricht, NL).
A working single-file React prototype (`boathouse.jsx`) accompanies this spec — it is the
authoritative reference for features, flows, and visual design. This document describes how
to rebuild it as a real, deployed, multi-user web application.

## 1. Goals

- Rowers log daily wellness and per-session feedback from their phones in under a minute.
- Coaches plan team programs, compare planned vs. actual training load, monitor athlete
  wellness trends, find shared availability, and manage the season in blocks toward races.
- Real per-user authentication (unlike the prototype's app-level login).
- Low/zero running cost; maintainable by a small club.

## 2. Recommended stack

- **Next.js** (App Router, TypeScript) — one codebase for UI + API routes.
- **Supabase** — Postgres, authentication, and Row Level Security (RLS). Choose the
  **Frankfurt (eu-central-1)** region: the club is in the Netherlands, keep data in the EU.
- **Tailwind CSS** for styling; **Recharts** for charts (matches prototype).
- **Vercel** for hosting (free Hobby tier is sufficient for a club).
- Mobile-first responsive layout — most athlete interactions happen on phones.

## 3. Roles & permissions

| Capability | Athlete | Coach |
|---|---|---|
| Log daily wellness check-in (own) | ✔ | — |
| Log session feedback incl. weights (own) | ✔ | — |
| View own team's schedule, own erg targets, own seat | ✔ | ✔ (all teams) |
| Set own availability | ✔ | ✔ |
| Create/edit teams, sessions, events | — | ✔ |
| View all athletes' wellness & feedback dashboards | — | ✔ |
| Invite users, assign teams | — | ✔ |

- Athletes must never see other athletes' wellness data or erg targets.
- Enforce with Supabase RLS policies, not just UI hiding.
- Auth: email + password with coach-generated invites (coach creates account, system emails
  an invite/set-password link). Password reset via email. No self-signup.

## 4. Data model

```
profiles      id (auth.uid), name, role ('athlete'|'coach'), team_id → teams
teams         id, name
sessions      id, date, team_id, sport, title, duration_min, planned_rpe, notes
              sport ∈ rowing|erging|strength|core|cycling|indoor_bike|alternative|other
              planned_load = duration_min × planned_rpe (computed)
strength_exercises   id, session_id, position, name, sets, reps, note
erg_targets   session_id, athlete_id, target_text        (per-athlete targets, e.g. "1:52.0 /500m")
boat_setups   session_id, boat_class, boat_name, oars    boat_class ∈ 1x|2x|2-|4x|4-|4+|8+
boat_seats    boat_setup_id, seat_label, athlete_id      (Bow, 2…7, Stroke, Cox per class)
wellness      id, athlete_id, date, physical, mental, stress, soreness (1–10),
              sleep_hours, comment                        UNIQUE(athlete_id, date)
feedback      id, session_id, athlete_id, actual_duration_min, actual_rpe, comment
              actual_load = duration × rpe (computed)     UNIQUE(session_id, athlete_id)
strength_actuals     feedback_id, exercise_id, weight_kg, note
events        id, date, title, type ('race'|'social'|'other'), team_id nullable (null = club-wide), notes
availability  user_id, date, slot ('M'|'A'|'E'), status ('available'|'busy')
              absence of row = unknown
```

## 5. Features (parity with prototype)

### Athlete
1. **This week (home):** daily check-in (5 sliders + comment, editable same day); this
   week's sessions grouped by day with planned load and week total; upcoming events.
2. **Session cards:** sport tag, duration, RPE, load; expandable details — notes, erg
   description, *own* erg target, strength table (sets×reps), boat lineup diagram with own
   seat highlighted (SVG shell as in prototype).
3. **Log session** (any session dated today or earlier): actual duration, own RPE, comment;
   for strength sessions, weight (kg) + note per exercise. Shows own actual load and %
   delta vs. plan after logging. Editable.
4. **Schedule:** upcoming weeks with sessions and weekly planned load totals.
5. **Availability:** next 14+ days × Morning/Afternoon/Evening; tap cycles
   available → busy → clear.

### Coach
1. **Program:** week navigator + team filter; create/edit/delete sessions with sport,
   duration, planned RPE (live load); strength exercise builder; per-athlete erg targets;
   boat class → seat dropdowns with live lineup diagram. Past sessions show team average
   actual load vs. plan, % delta, and logged count; details list per-athlete duration/RPE/
   load/delta/weights/comment.
2. **Season:** 16-week bar chart of planned weekly load per team, bars shaded by training
   block (blocks are the spans between races), race weeks in brass; block summary table
   (weeks, sessions, total & avg weekly load, target race).
3. **Planner:** select any mix of athletes/coaches (team quick-select); grid of next 14
   days × 3 slots showing available/total per slot, solid green when everyone is free;
   tapping a slot lists who is available / busy / hasn't filled in.
4. **Athletes:** per-athlete dashboards — planned vs. actual weekly load (grouped bars),
   sleep line (28 d, 8 h reference line), physical/mental/stress lines, recent check-in table.
5. **Squad:** teams CRUD; member list with team assignment; invite new users.
6. **Events:** races/socials/other, per team or club-wide; races drive Season blocks.

### Nice-to-have (post-launch)
- Email/push reminder if a session is unlogged by evening, and daily check-in reminder.
- Team-level wellness averages; ACWR-style load ratio warnings.
- CSV export of wellness/feedback for coaches.

## 6. Design system (from prototype — keep this look)

- **Palette:** Saurus carmine `#8A1B21` (primary, hover `#6E1418`), ivory `#F5F4EF`
  background, white cards with hairline `#E4E2D8` borders, brass `#A8863C` accent
  (key numbers, active tab underline, race markers), ink `#16211C`, muted `#6E756C`.
  Green `#2F6B4F` is reserved for availability/"on plan" semantics; slate `#3E5A74`
  for stress lines and neutral event types.
- **Type:** Archivo (uppercase, tracked, for labels/headings), Inter (body),
  IBM Plex Mono (all numbers and data).
- Understated and classy — no loud fills; sport indicated by a small colored dot + label.
- Signature element: the SVG boat shell lineup diagram.

## 7. Non-functional requirements

- GDPR-conscious: EU data region, per-user data deletion possible, minimal PII
  (name + email only).
- Fast on mobile data; charts lazy-loaded.
- Timezone: Europe/Amsterdam for all date logic; weeks start Monday.
- Seed script for demo/dev data mirroring the prototype's seed.

## 8. Suggested milestones

1. Scaffold Next.js + Supabase; schema + RLS; auth with invites. Deploy skeleton to Vercel.
2. Athlete flows: check-in, schedule, session details, session feedback, availability.
3. Coach program builder (incl. strength/erg/boat sub-editors) + events.
4. Coach dashboards: compliance views, Athletes charts, Season, Planner.
5. Polish pass against the design system; seed data; invite the real squad.
