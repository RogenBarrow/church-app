-- ============================================================
-- The run sheet: sections (PRE-SIRBISHI, ALABANSA & ADORASHON, ...)
-- and their items (the rows: time, action, who, sound, screen, minutes)
-- ============================================================

create table public.service_sections (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services (id) on delete cascade,
  position     int not null default 0,
  title        text not null,
  leader_label text,
  created_at   timestamptz not null default now()
);

create index service_sections_service_id_idx
  on public.service_sections (service_id);

create table public.service_items (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references public.service_sections (id) on delete cascade,
  position     int not null default 0,
  fixed_start  time,
  duration_min int check (duration_min >= 0),
  action       text not null,
  who          text,
  sound        text,
  screen       text,
  created_at   timestamptz not null default now()
);

create index service_items_section_id_idx
  on public.service_items (section_id);

-- Row Level Security: logged-in users read, pastors write
alter table public.service_sections enable row level security;
alter table public.service_items enable row level security;

create policy "Logged-in users read sections"
  on public.service_sections for select to authenticated
  using (true);

create policy "Pastors create sections"
  on public.service_sections for insert to authenticated
  with check (public.is_pastor());

create policy "Pastors update sections"
  on public.service_sections for update to authenticated
  using (public.is_pastor())
  with check (public.is_pastor());

create policy "Pastors delete sections"
  on public.service_sections for delete to authenticated
  using (public.is_pastor());

create policy "Logged-in users read items"
  on public.service_items for select to authenticated
  using (true);

create policy "Pastors create items"
  on public.service_items for insert to authenticated
  with check (public.is_pastor());

create policy "Pastors update items"
  on public.service_items for update to authenticated
  using (public.is_pastor())
  with check (public.is_pastor());

create policy "Pastors delete items"
  on public.service_items for delete to authenticated
  using (public.is_pastor());
