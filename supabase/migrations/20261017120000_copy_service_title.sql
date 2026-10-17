-- Add an optional new_title to copy_service, so a template can be named
-- in the same transaction. Changing the parameter list = drop + create.

drop function public.copy_service(uuid, date, boolean);

create function public.copy_service(
  source_id   uuid,
  new_date    date,
  as_template boolean default false,
  new_title   text default null      -- null = keep the source's title
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

  insert into public.service_assignments (service_id, role_name, person_label, position)
  select new_service_id,
         role_name,
         case when as_template then null else person_label end,
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

revoke execute on function public.copy_service(uuid, date, boolean, text) from public, anon;
grant execute on function public.copy_service(uuid, date, boolean, text) to authenticated;
