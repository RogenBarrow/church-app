-- ============================================================
-- Approval: draft → approved, with automatic reset to draft
-- whenever an approved program changes.
-- ============================================================

-- 1. Status + who/when approved
create type public.service_status as enum ('draft', 'submitted', 'approved');

alter table public.services
  add column status      public.service_status not null default 'draft',
  add column approved_by uuid references public.profiles (id) on delete set null,
  add column approved_at timestamptz;


-- 2. BEFORE UPDATE on services: guard and bookkeeping
create function public.services_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Only pastors may approve
  if new.status = 'approved' and old.status <> 'approved' and not public.is_pastor() then
    raise exception 'Only pastors can approve a service';
  end if;

  -- The header of an approved service changed → back to draft
  if old.status = 'approved' and new.status = 'approved'
     and (new.title, new.service_date, new.theme, new.program_starts_at, new.notes)
         is distinct from
         (old.title, old.service_date, old.theme, old.program_starts_at, old.notes) then
    new.status := 'draft';
  end if;

  -- Becoming approved → record who and when (never trust the client for this)
  if new.status = 'approved' and old.status <> 'approved' then
    new.approved_by := auth.uid();
    new.approved_at := now();
  end if;

  -- Not approved → no approver
  if new.status <> 'approved' then
    new.approved_by := null;
    new.approved_at := null;
  end if;

  return new;
end;
$$;

create trigger services_before_update
  before update on public.services
  for each row execute function public.services_before_update();


-- 3. Changes to sections / key people / items reset their service to draft.
--    security definer: later (Phase 3) leaders will edit items without being
--    allowed to update services themselves; the reset must still happen.

create function public.reset_service_from_section()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.services
  set status = 'draft'
  where status = 'approved'
    and id in (old.service_id, new.service_id);
  return null;
end;
$$;

create function public.reset_service_from_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.services s
  set status = 'draft'
  from public.service_sections sec
  where s.status = 'approved'
    and s.id = sec.service_id
    and sec.id in (old.section_id, new.section_id);
  return null;
end;
$$;

create trigger service_sections_reset_status
  after insert or update or delete on public.service_sections
  for each row execute function public.reset_service_from_section();

create trigger service_assignments_reset_status
  after insert or update or delete on public.service_assignments
  for each row execute function public.reset_service_from_section();

create trigger service_items_reset_status
  after insert or update or delete on public.service_items
  for each row execute function public.reset_service_from_item();

-- Trigger functions are never called directly
revoke execute on function public.services_before_update() from public, anon, authenticated;
revoke execute on function public.reset_service_from_section() from public, anon, authenticated;
revoke execute on function public.reset_service_from_item() from public, anon, authenticated;


-- 4. Members only see approved services (pastors see everything).
--    The child tables simply ask "can you see the parent?": the subquery
--    on services is itself filtered by the services policy.

drop policy "Logged-in users read services" on public.services;
create policy "Members read approved services, pastors read all"
  on public.services for select to authenticated
  using (status = 'approved' or (select public.is_pastor()));

drop policy "Logged-in users read assignments" on public.service_assignments;
create policy "Read assignments of visible services"
  on public.service_assignments for select to authenticated
  using (exists (select 1 from public.services s where s.id = service_id));

drop policy "Logged-in users read sections" on public.service_sections;
create policy "Read sections of visible services"
  on public.service_sections for select to authenticated
  using (exists (select 1 from public.services s where s.id = service_id));

drop policy "Logged-in users read items" on public.service_items;
create policy "Read items of visible sections"
  on public.service_items for select to authenticated
  using (exists (select 1 from public.service_sections sec where sec.id = section_id));
