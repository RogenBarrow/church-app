-- ============================================================
-- Availability: members mark the dates they are NOT available
-- ("blockout dates"), e.g. away 8–15 Nov.
-- ============================================================

create table public.availability_blocks (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null default auth.uid()
             references public.profiles (id) on delete cascade,
  starts_on  date not null,
  ends_on    date not null,
  note       text,
  created_at timestamptz not null default now(),

  constraint availability_blocks_dates_in_order check (ends_on >= starts_on)
);

create index availability_blocks_profile_id_idx
  on public.availability_blocks (profile_id);

alter table public.availability_blocks enable row level security;

-- Everyone manages their OWN blocks; pastors can read everyone's (for scheduling)
create policy "Read own blocks, pastors read all"
  on public.availability_blocks for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_pastor()));

create policy "Create own blocks"
  on public.availability_blocks for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "Update own blocks"
  on public.availability_blocks for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Delete own blocks"
  on public.availability_blocks for delete to authenticated
  using (profile_id = (select auth.uid()));
