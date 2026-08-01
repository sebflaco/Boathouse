-- ============================================================================
-- Boathouse — optional dev/demo seed
-- Safe to run on a fresh project. Only seeds data that does NOT require auth
-- users (teams + club-wide events). Athletes, sessions, wellness and feedback
-- depend on invited accounts, so create those via coach invites once deployed.
-- A full prototype-parity seed lands in a later milestone.
-- ============================================================================

insert into public.teams (name)
select v.name
from (values ('Senior Men'), ('Senior Women')) as v(name)
where not exists (select 1 from public.teams t where t.name = v.name);

insert into public.events (date, title, type, team_id, notes)
select current_date + 19, 'Heineken Roeivierkamp', 'race'::public.event_type, null, 'Amsterdam'
where not exists (select 1 from public.events e where e.title = 'Heineken Roeivierkamp');

insert into public.events (date, title, type, team_id, notes)
select current_date + 47, 'NK Klein', 'race'::public.event_type, null, 'Bosbaan'
where not exists (select 1 from public.events e where e.title = 'NK Klein');
