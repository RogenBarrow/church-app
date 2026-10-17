-- ============================================================
-- copy_service: copies a service with its key people, sections
-- and items, in ONE transaction (all or nothing).
--
--   as_template = false → a new real service on new_date
--   as_template = true  → a template (no date, no theme, no names)
--
-- Returns the id of the new service.
-- ============================================================

create function public.copy_service(
  source_id   uuid,
  new_date    date,
  as_template boolean default false
)
returns uuid
language plpgsql
security invoker          -- runs as the caller, so RLS applies: only pastors can insert
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

  -- 1. The service itself
  insert into public.services (title, service_date, theme, program_starts_at, is_template, notes)
  select title,
         case when as_template then null else new_date end,
         null,                -- a new Sunday gets a new theme
         program_starts_at,
         as_template,
         notes
  from public.services
  where id = source_id
  returning id into new_service_id;

  if new_service_id is null then
    raise exception 'Service not found';
  end if;

  -- 2. Key people: same roles; templates don't keep the names
  insert into public.service_assignments (service_id, role_name, person_label, position)
  select new_service_id,
         role_name,
         case when as_template then null else person_label end,
         position
  from public.service_assignments
  where service_id = source_id;

  -- 3. Sections, and for each section its items
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

-- Only logged-in users may call it (and RLS then requires a pastor)
revoke execute on function public.copy_service(uuid, date, boolean) from public, anon;
grant execute on function public.copy_service(uuid, date, boolean) to authenticated;
