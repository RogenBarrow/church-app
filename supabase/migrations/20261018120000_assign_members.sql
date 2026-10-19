-- ============================================================
-- Key people can now be real members (profile_id), with a status
-- for "My schedule" (lesson 2.3). person_label stays: it holds the
-- name to SHOW (a member's name, or a guest like "Apostel Gilberto").
-- ============================================================

create type public.assignment_status as enum ('pending', 'accepted', 'declined');

alter table public.service_assignments
  add column profile_id uuid references public.profiles (id) on delete set null,
  add column status     public.assignment_status not null default 'pending';

create index service_assignments_profile_id_idx
  on public.service_assignments (profile_id);


-- copy_service: also copy the member (profile_id) when copying to a date.
-- Same parameters as before, so "create or replace" is enough.
create or replace function public.copy_service(
  source_id   uuid,
  new_date    date,
  as_template boolean default false,
  new_title   text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_service_id uuid;
  new_section_id uuid;
  sec            record;
begin
  if not as_template and new_date is null then
    raise exception 'A date is required to copy a service';
  end if;

  insert into public.services (title, service_date, theme, program_starts_at, is_template, notes)
  select coalesce(nullif(trim(new_title), ''), title),
         case when as_template then null else new_date end,
         null,
         program_starts_at,
         as_template,
         notes
  from public.services
  where id = source_id
  returning id into new_service_id;

  if new_service_id is null then
    raise exception 'Service not found';
  end if;

  -- Key people: templates keep only the roles; copies keep the people
  -- (status starts again at 'pending': it's a new Sunday)
  insert into public.service_assignments (service_id, role_name, person_label, profile_id, position)
  select new_service_id,
         role_name,
         case when as_template then null else person_label end,
         case when as_template then null else profile_id end,
         position
  from public.service_assignments
  where service_id = source_id;

  for sec in
    select id, position, title, leader_label
    from public.service_sections
    where service_id = source_id
    order by position
  loop
    insert into public.service_sections (service_id, position, title, leader_label)
    values (new_service_id, sec.position, sec.title, sec.leader_label)
    returning id into new_section_id;

    insert into public.service_items (section_id, position, fixed_start, duration_min, action, who, sound, screen)
    select new_section_id, position, fixed_start, duration_min, action, who, sound, screen
    from public.service_items
    where section_id = sec.id;
  end loop;

  return new_service_id;
end;
$$;
