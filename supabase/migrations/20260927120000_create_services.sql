-- ============================================================
-- Services (the header of a service program)
-- + service_assignments (the key people: coordinator, preacher, ...)
-- ============================================================

-- 1. Services
create table public.services (
  id                uuid primary key default gen_random_uuid(),
  title             text not null default 'Sunday service',
  service_date      date,
  theme             text,
  program_starts_at time not null default '08:30',
  is_template       boolean not null default false,
  notes             text,
  created_at        timestamptz not null default now(),

  -- A real service needs a date; only templates may leave it empty
  constraint services_date_required check (is_template or service_date is not null)
);

-- 2. Key people per service. Free text for now; linked to real
--    profiles in Phase 2.
create table public.service_assignments (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services (id) on delete cascade,
  role_name    text not null,
  person_label text,
  position     int not null default 0,
  created_at   timestamptz not null default now()
);

-- Speeds up "all assignments of this service"
create index service_assignments_service_id_idx
  on public.service_assignments (service_id);

-- 3. Row Level Security
alter table public.services enable row level security;
alter table public.service_assignments enable row level security;

-- Services: every logged-in user reads, only pastors write
create policy "Logged-in users read services"
  on public.services for select to authenticated
  using (true);

create policy "Pastors create services"
  on public.services for insert to authenticated
  with check (public.is_pastor());

create policy "Pastors update services"
  on public.services for update to authenticated
  using (public.is_pastor())
  with check (public.is_pastor());

create policy "Pastors delete services"
  on public.services for delete to authenticated
  using (public.is_pastor());

-- Assignments: same rules
create policy "Logged-in users read assignments"
  on public.service_assignments for select to authenticated
  using (true);

create policy "Pastors create assignments"
  on public.service_assignments for insert to authenticated
  with check (public.is_pastor());

create policy "Pastors update assignments"
  on public.service_assignments for update to authenticated
  using (public.is_pastor())
  with check (public.is_pastor());

create policy "Pastors delete assignments"
  on public.service_assignments for delete to authenticated
  using (public.is_pastor());
