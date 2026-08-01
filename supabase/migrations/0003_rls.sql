-- ============================================================================
-- Boathouse — 0003 Row Level Security
-- Enforces the role/permission matrix from BOATHOUSE_SPEC.md §3 at the database
-- level. Key rule: athletes must NEVER read other athletes' wellness data or
-- erg targets. Coaches read everything; only coaches write program/team data.
--
-- Helper functions are SECURITY DEFINER so they read `profiles` without being
-- caught by profiles' own RLS (which would otherwise recurse).
-- ============================================================================

-- Helpers ---------------------------------------------------------------------
create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'coach'
  );
$$;

create or replace function public.my_team_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select team_id from public.profiles where id = auth.uid();
$$;

-- true if the caller may read the given session (coach, or same team)
create or replace function public.can_read_session(sid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_coach() or exists (
    select 1 from public.sessions s
    where s.id = sid and s.team_id = public.my_team_id()
  );
$$;

-- true if the caller may read the session behind a boat setup
create or replace function public.can_read_boat_setup(setup_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.boat_setups b
    where b.id = setup_id and public.can_read_session(b.session_id)
  );
$$;

-- true if the caller owns the feedback row
create or replace function public.owns_feedback(fid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.feedback f
    where f.id = fid and f.athlete_id = auth.uid()
  );
$$;

-- true if the caller may read the feedback row (coach, or owner)
create or replace function public.can_read_feedback(fid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_coach() or public.owns_feedback(fid);
$$;

grant execute on function
  public.is_coach(),
  public.my_team_id(),
  public.can_read_session(uuid),
  public.can_read_boat_setup(uuid),
  public.owns_feedback(uuid),
  public.can_read_feedback(uuid)
to authenticated;

-- Enable RLS ------------------------------------------------------------------
alter table public.teams              enable row level security;
alter table public.profiles           enable row level security;
alter table public.sessions           enable row level security;
alter table public.strength_exercises enable row level security;
alter table public.erg_targets        enable row level security;
alter table public.boat_setups        enable row level security;
alter table public.boat_seats         enable row level security;
alter table public.wellness           enable row level security;
alter table public.feedback           enable row level security;
alter table public.strength_actuals   enable row level security;
alter table public.events             enable row level security;
alter table public.availability       enable row level security;

-- Teams -----------------------------------------------------------------------
create policy "teams: read (all authenticated)"
  on public.teams for select to authenticated
  using (true);
create policy "teams: coach write"
  on public.teams for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Profiles --------------------------------------------------------------------
-- Read: self, any coach, or a teammate (needed for boat lineup names).
create policy "profiles: read self / team / coach"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_coach()
    or (team_id is not null and team_id = public.my_team_id())
  );
-- Update: coaches manage anyone (name, role, team); users may edit own name.
create policy "profiles: coach update any"
  on public.profiles for update to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Delete: coaches only.
create policy "profiles: coach delete"
  on public.profiles for delete to authenticated
  using (public.is_coach());
-- (INSERT happens via the security-definer new-user trigger, not directly.)

-- Sessions --------------------------------------------------------------------
create policy "sessions: read own team or coach"
  on public.sessions for select to authenticated
  using (public.is_coach() or team_id = public.my_team_id());
create policy "sessions: coach write"
  on public.sessions for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Strength exercises ----------------------------------------------------------
create policy "strength_exercises: read if session readable"
  on public.strength_exercises for select to authenticated
  using (public.can_read_session(session_id));
create policy "strength_exercises: coach write"
  on public.strength_exercises for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Erg targets -----------------------------------------------------------------
-- Athletes see ONLY their own target; coaches see all.
create policy "erg_targets: read own or coach"
  on public.erg_targets for select to authenticated
  using (public.is_coach() or athlete_id = auth.uid());
create policy "erg_targets: coach write"
  on public.erg_targets for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Boat setups -----------------------------------------------------------------
create policy "boat_setups: read if session readable"
  on public.boat_setups for select to authenticated
  using (public.can_read_session(session_id));
create policy "boat_setups: coach write"
  on public.boat_setups for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Boat seats ------------------------------------------------------------------
create policy "boat_seats: read if setup readable"
  on public.boat_seats for select to authenticated
  using (public.can_read_boat_setup(boat_setup_id));
create policy "boat_seats: coach write"
  on public.boat_seats for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Wellness --------------------------------------------------------------------
-- Athletes read/write only their own; coaches read all (never write).
create policy "wellness: read own or coach"
  on public.wellness for select to authenticated
  using (public.is_coach() or athlete_id = auth.uid());
create policy "wellness: insert own"
  on public.wellness for insert to authenticated
  with check (athlete_id = auth.uid());
create policy "wellness: update own"
  on public.wellness for update to authenticated
  using (athlete_id = auth.uid()) with check (athlete_id = auth.uid());
create policy "wellness: delete own"
  on public.wellness for delete to authenticated
  using (athlete_id = auth.uid());

-- Feedback --------------------------------------------------------------------
create policy "feedback: read own or coach"
  on public.feedback for select to authenticated
  using (public.is_coach() or athlete_id = auth.uid());
create policy "feedback: insert own"
  on public.feedback for insert to authenticated
  with check (athlete_id = auth.uid());
create policy "feedback: update own"
  on public.feedback for update to authenticated
  using (athlete_id = auth.uid()) with check (athlete_id = auth.uid());
create policy "feedback: delete own"
  on public.feedback for delete to authenticated
  using (athlete_id = auth.uid());

-- Strength actuals ------------------------------------------------------------
create policy "strength_actuals: read own or coach"
  on public.strength_actuals for select to authenticated
  using (public.can_read_feedback(feedback_id));
create policy "strength_actuals: insert own"
  on public.strength_actuals for insert to authenticated
  with check (public.owns_feedback(feedback_id));
create policy "strength_actuals: update own"
  on public.strength_actuals for update to authenticated
  using (public.owns_feedback(feedback_id)) with check (public.owns_feedback(feedback_id));
create policy "strength_actuals: delete own"
  on public.strength_actuals for delete to authenticated
  using (public.owns_feedback(feedback_id));

-- Events ----------------------------------------------------------------------
-- Club-wide (null team) or own team; coaches see all.
create policy "events: read club / own team / coach"
  on public.events for select to authenticated
  using (public.is_coach() or team_id is null or team_id = public.my_team_id());
create policy "events: coach write"
  on public.events for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- Availability ----------------------------------------------------------------
-- Everyone manages their own; coaches read all (for the planner).
create policy "availability: read own or coach"
  on public.availability for select to authenticated
  using (public.is_coach() or user_id = auth.uid());
create policy "availability: insert own"
  on public.availability for insert to authenticated
  with check (user_id = auth.uid());
create policy "availability: update own"
  on public.availability for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "availability: delete own"
  on public.availability for delete to authenticated
  using (user_id = auth.uid());
