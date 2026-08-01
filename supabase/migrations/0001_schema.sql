-- ============================================================================
-- Boathouse — 0001 schema
-- Training & readiness platform for M.S.R.V. Saurus.
-- Data model per BOATHOUSE_SPEC.md §4. All timestamps in UTC; date logic in the
-- app is Europe/Amsterdam, weeks start Monday.
-- ============================================================================

-- Enums -----------------------------------------------------------------------
create type public.user_role   as enum ('athlete', 'coach');
create type public.sport       as enum (
  'rowing', 'erging', 'strength', 'core',
  'cycling', 'indoor_bike', 'alternative', 'other'
);
create type public.boat_class  as enum ('1x', '2x', '2-', '4x', '4-', '4+', '8+');
create type public.event_type  as enum ('race', 'social', 'other');
create type public.avail_slot   as enum ('M', 'A', 'E');
create type public.avail_status as enum ('available', 'busy');

-- Teams -----------------------------------------------------------------------
create table public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- Profiles (one row per auth user) --------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null,
  role       public.user_role not null default 'athlete',
  team_id    uuid references public.teams (id) on delete set null,
  created_at timestamptz not null default now()
);
create index profiles_team_id_idx on public.profiles (team_id);

-- Sessions --------------------------------------------------------------------
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  team_id       uuid not null references public.teams (id) on delete cascade,
  sport         public.sport not null default 'rowing',
  title         text not null default '',
  duration_min  integer not null default 0 check (duration_min >= 0),
  planned_rpe   integer not null default 0 check (planned_rpe between 0 and 10),
  notes         text,
  -- planned_load = duration_min × planned_rpe (computed)
  planned_load  integer generated always as (duration_min * planned_rpe) stored,
  created_at    timestamptz not null default now()
);
create index sessions_team_date_idx on public.sessions (team_id, date);

-- Strength exercises (children of a session) ----------------------------------
create table public.strength_exercises (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  position   integer not null default 0,
  name       text not null default '',
  sets       integer,
  reps       integer,
  note       text
);
create index strength_exercises_session_idx on public.strength_exercises (session_id);

-- Per-athlete erg targets -----------------------------------------------------
create table public.erg_targets (
  session_id  uuid not null references public.sessions (id) on delete cascade,
  athlete_id  uuid not null references public.profiles (id) on delete cascade,
  target_text text not null default '',
  primary key (session_id, athlete_id)
);

-- Boat setup (one per rowing session, optional) -------------------------------
create table public.boat_setups (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  boat_class public.boat_class not null,
  boat_name  text,
  oars       text,
  unique (session_id)
);

-- Boat seats ------------------------------------------------------------------
create table public.boat_seats (
  boat_setup_id uuid not null references public.boat_setups (id) on delete cascade,
  seat_label    text not null,               -- Bow, 2..7, Stroke, Cox, Single
  athlete_id    uuid references public.profiles (id) on delete set null,
  primary key (boat_setup_id, seat_label)
);

-- Daily wellness check-in -----------------------------------------------------
create table public.wellness (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles (id) on delete cascade,
  date        date not null,
  physical    integer check (physical between 1 and 10),
  mental      integer check (mental between 1 and 10),
  stress      integer check (stress between 1 and 10),
  soreness    integer check (soreness between 1 and 10),
  sleep_hours numeric(3, 1) check (sleep_hours >= 0 and sleep_hours <= 24),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (athlete_id, date)
);
create index wellness_athlete_date_idx on public.wellness (athlete_id, date);

-- Session feedback (actuals) --------------------------------------------------
create table public.feedback (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.sessions (id) on delete cascade,
  athlete_id          uuid not null references public.profiles (id) on delete cascade,
  actual_duration_min integer check (actual_duration_min >= 0),
  actual_rpe          integer check (actual_rpe between 0 and 10),
  comment             text,
  created_at          timestamptz not null default now(),
  -- actual_load = duration × rpe (computed)
  actual_load integer generated always as (
    coalesce(actual_duration_min, 0) * coalesce(actual_rpe, 0)
  ) stored,
  unique (session_id, athlete_id)
);
create index feedback_athlete_idx on public.feedback (athlete_id);

-- Strength actuals (weight per exercise, child of feedback) -------------------
create table public.strength_actuals (
  feedback_id uuid not null references public.feedback (id) on delete cascade,
  exercise_id uuid not null references public.strength_exercises (id) on delete cascade,
  weight_kg   numeric(5, 1),
  note        text,
  primary key (feedback_id, exercise_id)
);

-- Events ----------------------------------------------------------------------
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  title      text not null,
  type       public.event_type not null default 'other',
  team_id    uuid references public.teams (id) on delete cascade,  -- null = club-wide
  notes      text,
  created_at timestamptz not null default now()
);
create index events_date_idx on public.events (date);

-- Availability ----------------------------------------------------------------
-- Absence of a row = unknown.
create table public.availability (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date    date not null,
  slot    public.avail_slot not null,
  status  public.avail_status not null,
  primary key (user_id, date, slot)
);
