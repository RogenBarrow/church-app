-- ============================================================
-- Profiles + roles
-- One row per user, with our own data about them.
-- ============================================================

-- 1. The possible roles
create type public.app_role as enum ('member', 'pastor');

-- 2. The profiles table
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  role       public.app_role not null default 'member',
  created_at timestamptz not null default now()
);

-- 3. Turn on Row Level Security: from now on, NO ONE can read or
--    write rows unless a policy below allows it.
alter table public.profiles enable row level security;

-- 4. Helper: is the current user a pastor?
create function public.is_pastor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'pastor'
  );
$$;

-- 5. Policies
create policy "Users read own profile, pastors read all"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or public.is_pastor());

create policy "Users update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 6. Users may only change these columns, never their own role
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- 7. Create a profile automatically when someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 8. Backfill: users who signed up before this trigger existed
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
