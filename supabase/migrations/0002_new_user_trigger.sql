-- ============================================================================
-- Boathouse — 0002 new-user trigger
-- When a coach invites someone (auth.admin.inviteUserByEmail with user metadata
-- { name, role, team_id }), automatically create the matching profile row.
-- No self-signup: profiles only ever appear alongside an auth user.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role public.user_role;
  meta_team uuid;
begin
  -- role from invite metadata, defaulting to 'athlete'
  begin
    meta_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  exception when others then
    meta_role := 'athlete';
  end;
  if meta_role is null then
    meta_role := 'athlete';
  end if;

  -- team_id from invite metadata (nullable)
  begin
    meta_team := nullif(new.raw_user_meta_data ->> 'team_id', '')::uuid;
  exception when others then
    meta_team := null;
  end;

  insert into public.profiles (id, name, role, team_id)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), new.email),
    meta_role,
    meta_team
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
