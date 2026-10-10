-- ============================================================
-- Huddle Finance App — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  avatar_color text not null default '#3B6FF6',
  created_at timestamptz default now() not null
);

-- Groups (Home, Office, etc.)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Tracks which group's data the user currently sees. Added via alter table
-- (rather than inline on the profiles table above) because profiles is
-- created before groups and can't forward-reference it inline.
alter table public.profiles add column if not exists active_group_id uuid references public.groups(id) on delete set null;

-- Group members
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now() not null,
  unique (group_id, user_id)
);

-- Budget categories: system-wide defaults (group_id null) plus custom
-- categories owned by a single group.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  color text not null,
  bg_color text not null,
  is_default boolean not null default false
);

-- Added after the table already existed in some environments, so
-- "create table if not exists" above won't retroactively apply them.
alter table public.categories add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.categories add column if not exists created_by uuid references public.profiles(id) on delete set null default auth.uid();

-- Names are unique among defaults and within each group (case-insensitive),
-- so two groups can each have their own "Gym".
alter table public.categories drop constraint if exists categories_name_key;
create unique index if not exists categories_default_name_key on public.categories (lower(name)) where group_id is null;
create unique index if not exists categories_group_name_key on public.categories (group_id, lower(name)) where group_id is not null;

-- Monthly budgets (per group)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  total_amount numeric(12,2) not null default 0,
  created_at timestamptz default now() not null,
  unique (group_id, month, year)
);

-- Budget category allocations
create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid references public.budgets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  allocated_amount numeric(12,2) not null default 0,
  unique (budget_id, category_id)
);

-- Group invites (shareable join links)
create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  code text not null unique,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz,
  revoked boolean not null default false
);

-- Email invites sent via Supabase auth (tracks who was invited and whether
-- they've joined, so the invite page can list and resend them)
create table if not exists public.group_email_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  email text not null,
  invited_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  last_sent_at timestamptz default now() not null,
  accepted_at timestamptz,
  unique (group_id, email)
);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  category_id uuid references public.categories(id) not null,
  paid_by uuid references public.profiles(id) not null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  expense_date date not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.group_invites enable row level security;
alter table public.group_email_invites enable row level security;

-- Returns the current user's group ids. security definer so this lookup
-- bypasses RLS on group_members instead of re-triggering its own select
-- policy (which would otherwise recurse infinitely).
-- Must be defined before any policy that references it.
create or replace function public.user_group_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select group_id from public.group_members where user_id = auth.uid()
$$;

grant execute on function public.user_group_ids() to authenticated;

-- Returns group ids owned by the current user. security definer so the lookup
-- on groups bypasses groups_select (which itself queries group_members, causing
-- infinite recursion if called from a group_members policy without this guard).
create or replace function public.user_owned_group_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.groups where owner_id = auth.uid()
$$;

grant execute on function public.user_owned_group_ids() to authenticated;

-- Profiles: users can read/write their own profile
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (active_group_id is null or active_group_id in (select public.user_group_ids()))
  );

-- Groups: members of the group can read; owner can write
drop policy if exists "groups_select" on public.groups;
create policy "groups_select" on public.groups for select using (
  id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert" on public.groups for insert with check (auth.uid() = owner_id);
drop policy if exists "groups_update" on public.groups;
create policy "groups_update" on public.groups for update using (auth.uid() = owner_id);

-- Creates a group and adds the caller as its owner in one transaction.
-- security definer because, between the two inserts, the caller isn't a
-- group_members row yet, so reading the just-inserted group back would
-- otherwise violate groups_select (RETURNING is checked against it).
create or replace function public.create_group(group_name text)
returns table(id uuid, name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
begin
  insert into public.groups (name, owner_id) values (group_name, auth.uid())
  returning groups.id into v_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, auth.uid(), 'owner');

  -- Qualify columns: the OUT params `id`/`name` from RETURNS TABLE would
  -- otherwise make bare `id` ambiguous.
  update public.profiles p set active_group_id = v_group_id where p.id = auth.uid();

  return query select g.id, g.name from public.groups g where g.id = v_group_id;
end;
$$;

grant execute on function public.create_group(text) to authenticated;

-- Atomically creates a profile and default group the instant a new auth
-- user is created, so every user has both from signup onward regardless
-- of which auth method created them. security definer is required because
-- this fires as part of an internal auth.users insert with no auth.uid()
-- context, so it must bypass RLS using the function owner's privileges.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_avatar_color text;
  v_group_name text;
  v_group_id uuid;
  v_colors text[] := array['#3B6FF6','#2E9E6B','#E5683E','#8A5CF0','#1FA0A6','#E5A020'];
begin
  v_display_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'New member');
  v_avatar_color := v_colors[1 + floor(random() * array_length(v_colors, 1))::int];

  insert into public.profiles (id, display_name, avatar_color)
  values (new.id, v_display_name, v_avatar_color);

  -- Users created by an email invite join the inviter's group on accept,
  -- so don't give them a default group of their own.
  if coalesce(new.raw_user_meta_data, '{}'::jsonb) ? 'invite_code' then
    return new;
  end if;

  v_group_name := coalesce(new.raw_user_meta_data->>'group_name', 'Home');

  insert into public.groups (name, owner_id) values (v_group_name, new.id)
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role) values (v_group_id, new.id, 'owner');

  update public.profiles p set active_group_id = v_group_id where p.id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Group members: members of same group can read; owner can insert
drop policy if exists "group_members_select" on public.group_members;
create policy "group_members_select" on public.group_members for select using (
  group_id in (select public.user_group_ids())
);
drop policy if exists "group_members_insert" on public.group_members;
create policy "group_members_insert" on public.group_members for insert with check (
  group_id in (select id from public.groups where owner_id = auth.uid())
  or user_id = auth.uid()
);
drop policy if exists "group_members_delete" on public.group_members;
create policy "group_members_delete" on public.group_members for delete using (
  group_id in (select public.user_owned_group_ids())
  and role != 'owner'
);

-- Categories: defaults are readable by everyone; custom ones only by members
-- of the owning group. Any member can add a custom category to their group.
-- The defaults branch keeps the app's first-run default seeding working.
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories for select using (
  group_id is null or group_id in (select public.user_group_ids())
);
drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert" on public.categories for insert with check (
  (group_id is null and is_default and auth.uid() is not null)
  or (group_id in (select public.user_group_ids()) and created_by = auth.uid() and not is_default)
);

-- Budgets: group members only
drop policy if exists "budgets_select" on public.budgets;
create policy "budgets_select" on public.budgets for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "budgets_insert" on public.budgets;
create policy "budgets_insert" on public.budgets for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "budgets_update" on public.budgets;
create policy "budgets_update" on public.budgets for update using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);

-- Budget categories: same as budgets
drop policy if exists "budget_categories_select" on public.budget_categories;
create policy "budget_categories_select" on public.budget_categories for select using (
  budget_id in (
    select b.id from public.budgets b
    join public.group_members gm on gm.group_id = b.group_id
    where gm.user_id = auth.uid()
  )
);
drop policy if exists "budget_categories_insert" on public.budget_categories;
create policy "budget_categories_insert" on public.budget_categories for insert with check (
  budget_id in (
    select b.id from public.budgets b
    join public.group_members gm on gm.group_id = b.group_id
    where gm.user_id = auth.uid()
  )
);
drop policy if exists "budget_categories_delete" on public.budget_categories;
create policy "budget_categories_delete" on public.budget_categories for delete using (
  budget_id in (
    select b.id from public.budgets b
    join public.group_members gm on gm.group_id = b.group_id
    where gm.user_id = auth.uid()
  )
);

-- Expenses: group members only
drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select" on public.expenses for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "expenses_insert" on public.expenses;
-- Any member can log an expense on behalf of another member of the same group.
create policy "expenses_insert" on public.expenses for insert with check (
  group_id in (select public.user_group_ids())
  and exists (
    select 1 from public.group_members gm
    where gm.group_id = expenses.group_id and gm.user_id = expenses.paid_by
  )
);
drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses for delete using (
  group_id in (select public.user_group_ids())
);

-- Group invites: members of the group can read/create/revoke
drop policy if exists "group_invites_select" on public.group_invites;
create policy "group_invites_select" on public.group_invites for select using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);
drop policy if exists "group_invites_insert" on public.group_invites;
create policy "group_invites_insert" on public.group_invites for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
  and created_by = auth.uid()
);
drop policy if exists "group_invites_update" on public.group_invites;
create policy "group_invites_update" on public.group_invites for update using (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
);

-- Email invites: members of the group can read/create/resend
drop policy if exists "group_email_invites_select" on public.group_email_invites;
create policy "group_email_invites_select" on public.group_email_invites for select using (
  group_id in (select public.user_group_ids())
);
drop policy if exists "group_email_invites_insert" on public.group_email_invites;
create policy "group_email_invites_insert" on public.group_email_invites for insert with check (
  group_id in (select public.user_group_ids())
  and invited_by = auth.uid()
);
drop policy if exists "group_email_invites_update" on public.group_email_invites;
create policy "group_email_invites_update" on public.group_email_invites for update using (
  group_id in (select public.user_group_ids())
);

-- Join a group via invite code. security definer is required because the
-- caller isn't a group member yet, so group_invites_select would otherwise
-- block them from reading the invite row to validate the code.
create or replace function public.join_group_by_code(invite_code text)
returns table(out_group_id uuid, out_group_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
begin
  select * into v_invite from public.group_invites
   where code = invite_code and revoked = false and (expires_at is null or expires_at > now());

  if v_invite is null then
    raise exception 'Invalid or expired invite code';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_invite.group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  update public.group_email_invites e set accepted_at = now()
   where e.group_id = v_invite.group_id
     and e.email = lower((select u.email from auth.users u where u.id = auth.uid()))
     and e.accepted_at is null;

  update public.profiles set active_group_id = v_invite.group_id where id = auth.uid();

  return query select g.id, g.name from public.groups g where g.id = v_invite.group_id;
end;
$$;

grant execute on function public.join_group_by_code(text) to authenticated;

-- Returns public-safe invite details (group name, inviter, current members) so
-- an unauthenticated visitor can preview an invite before signing up. security
-- definer + granted to anon because the visitor isn't a group member yet, so
-- group_invites_select / groups_select / group_members_select would otherwise
-- hide this from them entirely. Returns no rows for an invalid/expired code.
create or replace function public.get_invite_preview(invite_code text)
returns table(group_id uuid, group_name text, inviter_name text, member_count integer, members jsonb)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_invite record;
begin
  select * into v_invite from public.group_invites
   where code = invite_code and revoked = false and (expires_at is null or expires_at > now());

  if v_invite is null then
    return;
  end if;

  return query
  select
    g.id,
    g.name,
    p.display_name,
    (select count(*)::int from public.group_members gm where gm.group_id = g.id),
    (select coalesce(jsonb_agg(jsonb_build_object('display_name', pr.display_name, 'avatar_color', pr.avatar_color)), '[]'::jsonb)
       from public.group_members gm2
       join public.profiles pr on pr.id = gm2.user_id
       where gm2.group_id = g.id)
  from public.groups g
  join public.profiles p on p.id = v_invite.created_by
  where g.id = v_invite.group_id;
end;
$$;

grant execute on function public.get_invite_preview(text) to anon, authenticated;

-- Switches which group is "active" for the caller. Validates membership
-- explicitly so the error is clear, even though profiles_update's RLS
-- with check would also block a non-member group id.
create or replace function public.switch_active_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.group_members where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of that group';
  end if;

  update public.profiles set active_group_id = p_group_id where id = auth.uid();
end;
$$;

grant execute on function public.switch_active_group(uuid) to authenticated;

-- Saves a month's budget and replaces its category allocations in one
-- transaction, so a failure part-way can't leave a budget with its
-- allocations wiped. security invoker: the budgets/budget_categories RLS
-- policies still decide whether the caller may write.
-- p_allocations: [{ "category_id": uuid, "allocated_amount": number }, ...]
create or replace function public.save_budget(p_group_id uuid, p_month int, p_year int, p_total numeric, p_allocations jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_budget_id uuid;
begin
  insert into public.budgets (group_id, month, year, total_amount)
  values (p_group_id, p_month, p_year, p_total)
  on conflict (group_id, month, year) do update set total_amount = excluded.total_amount
  returning id into v_budget_id;

  delete from public.budget_categories where budget_id = v_budget_id;

  insert into public.budget_categories (budget_id, category_id, allocated_amount)
  select v_budget_id, (a->>'category_id')::uuid, (a->>'allocated_amount')::numeric
  from jsonb_array_elements(p_allocations) a
  where (a->>'allocated_amount')::numeric > 0;

  return v_budget_id;
end;
$$;

grant execute on function public.save_budget(uuid, int, int, numeric, jsonb) to authenticated;

-- ============================================================
-- Recurring expenses
-- A rule per recurring payment; each due date becomes a real expenses row
-- (tagged with recurring_id), so budgets, history and totals need no changes.
-- ============================================================

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  category_id uuid references public.categories(id) not null,
  paid_by uuid references public.profiles(id) not null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  -- Every due date is computed from start_date, so month-end dates don't drift
  -- (31 Jan → 28 Feb → 31 Mar).
  start_date date not null,
  -- Position in the series of next_due_date. Stored with the date so the daily
  -- job finds due rules by index instead of computing dates.
  next_index integer not null default 0,
  -- null once the series has ended.
  next_due_date date,
  end_type text not null default 'never' check (end_type in ('never', 'on_date', 'after_count')),
  end_date date,
  max_occurrences integer check (max_occurrences is null or max_occurrences > 0),
  occurrences_created integer not null default 0,
  -- false = paused
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  check (end_type <> 'on_date' or end_date is not null),
  check (end_type <> 'after_count' or max_occurrences is not null)
);

create index if not exists recurring_expenses_group_idx on public.recurring_expenses (group_id);
-- The only rows the daily job ever reads.
create index if not exists recurring_expenses_due_idx on public.recurring_expenses (next_due_date)
  where is_active and next_due_date is not null;

-- Past payments stay when their rule is deleted.
alter table public.expenses add column if not exists recurring_id uuid references public.recurring_expenses(id) on delete set null;
-- One payment per rule per date, however often (or from however many devices)
-- the generation runs.
create unique index if not exists expenses_recurring_date_key on public.expenses (recurring_id, expense_date)
  where recurring_id is not null;

alter table public.recurring_expenses enable row level security;

drop policy if exists "recurring_expenses_select" on public.recurring_expenses;
create policy "recurring_expenses_select" on public.recurring_expenses for select using (
  group_id in (select public.user_group_ids())
);
drop policy if exists "recurring_expenses_insert" on public.recurring_expenses;
create policy "recurring_expenses_insert" on public.recurring_expenses for insert with check (
  group_id in (select public.user_group_ids())
  and exists (
    select 1 from public.group_members gm
    where gm.group_id = recurring_expenses.group_id and gm.user_id = recurring_expenses.paid_by
  )
);
drop policy if exists "recurring_expenses_update" on public.recurring_expenses;
create policy "recurring_expenses_update" on public.recurring_expenses for update
  using (group_id in (select public.user_group_ids()))
  with check (
    group_id in (select public.user_group_ids())
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = recurring_expenses.group_id and gm.user_id = recurring_expenses.paid_by
    )
  );
drop policy if exists "recurring_expenses_delete" on public.recurring_expenses;
create policy "recurring_expenses_delete" on public.recurring_expenses for delete using (
  group_id in (select public.user_group_ids())
);

-- "Today" for recurring payments: the UTC date, the same basis the app uses for
-- an expense's default date (todayDate() in src/features/dashboard/dates.ts).
create or replace function public.recurring_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'utc')::date
$$;

-- The n-th date (0-based) of a series. Mirrored by occurrence() in src/lib/recurring.ts.
create or replace function public.recurring_occurrence(p_start date, p_frequency text, p_n integer)
returns date
language sql
immutable
as $$
  select case p_frequency
    when 'daily' then p_start + p_n
    when 'weekly' then p_start + 7 * p_n
    when 'monthly' then (p_start + make_interval(months => p_n))::date
    when 'yearly' then (p_start + make_interval(years => p_n))::date
  end
$$;

-- The due date at p_index, or null when the series has ended by then.
create or replace function public.recurring_next_due(
  p_start date, p_frequency text, p_index integer,
  p_end_type text, p_end_date date, p_max integer, p_created integer
)
returns date
language sql
immutable
as $$
  select case
    when p_end_type = 'after_count' and p_created >= p_max then null
    when p_end_type = 'on_date' and public.recurring_occurrence(p_start, p_frequency, p_index) > p_end_date then null
    else public.recurring_occurrence(p_start, p_frequency, p_index)
  end
$$;

-- Index of the first date in the series on or after p_from.
create or replace function public.recurring_first_index_on_or_after(p_start date, p_frequency text, p_from date)
returns integer
language plpgsql
immutable
as $$
declare
  n integer;
begin
  if p_from <= p_start then
    return 0;
  end if;
  -- Estimate, then step to the exact index (month-end clamping can be off by one).
  n := case p_frequency
    when 'daily' then p_from - p_start
    when 'weekly' then (p_from - p_start) / 7
    when 'monthly' then ((extract(year from p_from) - extract(year from p_start)) * 12
                         + extract(month from p_from) - extract(month from p_start))::int
    when 'yearly' then (extract(year from p_from) - extract(year from p_start))::int
  end;
  while n > 0 and public.recurring_occurrence(p_start, p_frequency, n - 1) >= p_from loop
    n := n - 1;
  end loop;
  while public.recurring_occurrence(p_start, p_frequency, n) < p_from loop
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Creates the expenses for every due date up to p_today, for one group or (from
-- the daily cron job) all groups. Returns how many expenses it inserted.
-- security definer: the cron job has no auth.uid(), so RLS would hide every
-- row. Not callable by app users directly; they go through catch_up_recurring().
create or replace function public.process_recurring_expenses(p_group_id uuid default null, p_today date default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := coalesce(p_today, public.recurring_today());
  r public.recurring_expenses%rowtype;
  v_inserted integer := 0;
  v_rows integer;
  v_steps integer;
begin
  -- skip locked: an overlapping run (cron + an app catch-up) leaves the rule to
  -- whichever run locked it first instead of waiting on it.
  for r in
    select * from public.recurring_expenses
     where is_active
       and next_due_date is not null
       and next_due_date <= v_today
       and (p_group_id is null or group_id = p_group_id)
     for update skip locked
  loop
    -- The payer left the group: pause instead of logging spend in their name.
    if not exists (
      select 1 from public.group_members gm where gm.group_id = r.group_id and gm.user_id = r.paid_by
    ) then
      update public.recurring_expenses set is_active = false, updated_at = now() where id = r.id;
      continue;
    end if;

    v_steps := 0;
    -- Capped so a long-missed daily rule can't run away in one call; the next
    -- run carries on from where this one stopped.
    while r.next_due_date is not null and r.next_due_date <= v_today and v_steps < 400 loop
      insert into public.expenses (group_id, category_id, paid_by, amount, note, expense_date, recurring_id)
      values (r.group_id, r.category_id, r.paid_by, r.amount, r.note, r.next_due_date, r.id)
      on conflict (recurring_id, expense_date) where recurring_id is not null do nothing;
      get diagnostics v_rows = row_count;
      v_inserted := v_inserted + v_rows;

      -- Counted even on a conflict: a payment for that date exists either way.
      r.occurrences_created := r.occurrences_created + 1;
      r.next_index := r.next_index + 1;
      r.next_due_date := public.recurring_next_due(
        r.start_date, r.frequency, r.next_index, r.end_type, r.end_date, r.max_occurrences, r.occurrences_created
      );
      v_steps := v_steps + 1;
    end loop;

    update public.recurring_expenses
       set next_index = r.next_index,
           next_due_date = r.next_due_date,
           occurrences_created = r.occurrences_created,
           updated_at = now()
     where id = r.id;
  end loop;

  return v_inserted;
end;
$$;

revoke execute on function public.process_recurring_expenses(uuid, date) from public, anon, authenticated;

-- Run by the app when it opens: a safety net for missed cron runs. A no-op
-- (one index lookup) when nothing is due.
create or replace function public.catch_up_recurring(p_group_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.group_members where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of that group';
  end if;

  return public.process_recurring_expenses(p_group_id);
end;
$$;

grant execute on function public.catch_up_recurring(uuid) to authenticated;

-- Creates a rule and, when it starts today or earlier, its first payment, in
-- one transaction. Ids come from the device, so a retried call is a no-op.
-- security invoker: RLS decides whether the caller may write.
-- p_rule: { id, group_id, category_id, paid_by, amount, note, frequency,
--           start_date, end_type, end_date, max_occurrences }
create or replace function public.create_recurring_expense(
  p_rule jsonb,
  p_first_expense_id uuid default null,
  p_first_created_at timestamptz default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := (p_rule->>'id')::uuid;
  v_start date := (p_rule->>'start_date')::date;
  v_frequency text := p_rule->>'frequency';
  v_end_type text := coalesce(p_rule->>'end_type', 'never');
  v_end_date date := (p_rule->>'end_date')::date;
  v_max integer := (p_rule->>'max_occurrences')::integer;
  v_first boolean := p_first_expense_id is not null
    and v_start <= public.recurring_today()
    and (v_end_type <> 'on_date' or v_start <= v_end_date);
  v_created integer := case when v_first then 1 else 0 end;
begin
  insert into public.recurring_expenses (
    id, group_id, category_id, paid_by, amount, note, frequency, start_date,
    end_type, end_date, max_occurrences, occurrences_created, next_index, next_due_date
  ) values (
    v_id, (p_rule->>'group_id')::uuid, (p_rule->>'category_id')::uuid, (p_rule->>'paid_by')::uuid,
    (p_rule->>'amount')::numeric, nullif(p_rule->>'note', ''), v_frequency, v_start,
    v_end_type, v_end_date, v_max, v_created, v_created,
    public.recurring_next_due(v_start, v_frequency, v_created, v_end_type, v_end_date, v_max, v_created)
  )
  on conflict (id) do nothing;

  -- An earlier attempt already got this far.
  if not found then
    return;
  end if;

  if v_first then
    insert into public.expenses (id, group_id, category_id, paid_by, amount, note, expense_date, recurring_id, created_at)
    values (
      p_first_expense_id, (p_rule->>'group_id')::uuid, (p_rule->>'category_id')::uuid, (p_rule->>'paid_by')::uuid,
      (p_rule->>'amount')::numeric, nullif(p_rule->>'note', ''), v_start, v_id, coalesce(p_first_created_at, now())
    )
    on conflict do nothing;
  end if;
end;
$$;

grant execute on function public.create_recurring_expense(jsonb, uuid, timestamptz) to authenticated;

-- Saves an edited rule. Changes apply to future payments only. A new schedule
-- (frequency or start date) restarts from its first date on or after today;
-- an ended rule whose end was extended resumes from today, never backfilling.
-- p_rule: same shape as create_recurring_expense.
create or replace function public.update_recurring_expense(p_rule jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := (p_rule->>'id')::uuid;
  v_old public.recurring_expenses%rowtype;
  v_start date := (p_rule->>'start_date')::date;
  v_frequency text := p_rule->>'frequency';
  v_end_type text := coalesce(p_rule->>'end_type', 'never');
  v_end_date date := (p_rule->>'end_date')::date;
  v_max integer := (p_rule->>'max_occurrences')::integer;
  v_index integer;
begin
  select * into v_old from public.recurring_expenses where id = v_id for update;
  if not found then
    raise exception 'Recurring payment not found';
  end if;

  if v_old.frequency <> v_frequency or v_old.start_date <> v_start then
    v_index := public.recurring_first_index_on_or_after(v_start, v_frequency, public.recurring_today());
  elsif v_old.next_due_date is null then
    v_index := greatest(v_old.next_index, public.recurring_first_index_on_or_after(v_start, v_frequency, public.recurring_today()));
  else
    v_index := v_old.next_index;
  end if;

  update public.recurring_expenses set
    category_id = (p_rule->>'category_id')::uuid,
    paid_by = (p_rule->>'paid_by')::uuid,
    amount = (p_rule->>'amount')::numeric,
    note = nullif(p_rule->>'note', ''),
    frequency = v_frequency,
    start_date = v_start,
    end_type = v_end_type,
    end_date = v_end_date,
    max_occurrences = v_max,
    next_index = v_index,
    next_due_date = public.recurring_next_due(v_start, v_frequency, v_index, v_end_type, v_end_date, v_max, v_old.occurrences_created),
    updated_at = now()
  where id = v_id;
end;
$$;

grant execute on function public.update_recurring_expense(jsonb) to authenticated;

-- Pauses or resumes a rule. Resuming skips the dates missed while paused: the
-- next payment is the first date on or after today.
create or replace function public.set_recurring_active(p_id uuid, p_active boolean)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  r public.recurring_expenses%rowtype;
  v_index integer;
begin
  select * into r from public.recurring_expenses where id = p_id for update;
  if not found then
    raise exception 'Recurring payment not found';
  end if;

  v_index := case
    when p_active then greatest(r.next_index, public.recurring_first_index_on_or_after(r.start_date, r.frequency, public.recurring_today()))
    else r.next_index
  end;

  update public.recurring_expenses set
    is_active = p_active,
    next_index = v_index,
    next_due_date = public.recurring_next_due(r.start_date, r.frequency, v_index, r.end_type, r.end_date, r.max_occurrences, r.occurrences_created),
    updated_at = now()
  where id = p_id;
end;
$$;

grant execute on function public.set_recurring_active(uuid, boolean) to authenticated;

-- Daily at 00:05 UTC (the date basis above). pg_cron is available on every
-- Supabase plan; scheduling a job under an existing name replaces it.
create extension if not exists pg_cron;
select cron.schedule('process-recurring-expenses', '5 0 * * *', $$select public.process_recurring_expenses()$$);

-- ============================================================
-- Seed: default categories
-- ============================================================
insert into public.categories (name, icon, color, bg_color, is_default) values
  ('Groceries',       'ShoppingCart', '#2E9E6B', '#E6F4EC', true),
  ('Eating out',      'ForkKnife',    '#E5683E', '#FBE8E1', true),
  ('Bills & Utilities','Lightning',   '#3B6FF6', '#E9F0FE', true),
  ('Transport',       'Car',          '#1FA0A6', '#E0F3F4', true),
  ('Shopping',        'ShoppingBag',  '#8A5CF0', '#EFE9FD', true)
on conflict ((lower(name))) where group_id is null do nothing;
