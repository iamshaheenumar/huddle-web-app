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

-- Budget categories (system-wide)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  color text not null,
  bg_color text not null,
  is_default boolean not null default false
);

-- Added after the table already existed in some environments, so
-- "create table if not exists" above won't retroactively apply it.
alter table public.categories drop constraint if exists categories_name_key;
alter table public.categories add constraint categories_name_key unique (name);

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

  update public.profiles set active_group_id = v_group_id where id = auth.uid();

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

  v_group_name := coalesce(new.raw_user_meta_data->>'group_name', 'Home');

  insert into public.groups (name, owner_id) values (v_group_name, new.id)
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role) values (v_group_id, new.id, 'owner');

  update public.profiles set active_group_id = v_group_id where id = new.id;

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

-- Categories: public read, only system inserts (or authenticated users for custom)
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories for select using (true);
drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert" on public.categories for insert with check (auth.uid() is not null);

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
create policy "expenses_insert" on public.expenses for insert with check (
  group_id in (select group_id from public.group_members where user_id = auth.uid())
  and paid_by = auth.uid()
);
drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete" on public.expenses for delete using (paid_by = auth.uid());

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

-- ============================================================
-- Seed: default categories
-- ============================================================
insert into public.categories (name, icon, color, bg_color, is_default) values
  ('Groceries',       'ShoppingCart', '#2E9E6B', '#E6F4EC', true),
  ('Eating out',      'ForkKnife',    '#E5683E', '#FBE8E1', true),
  ('Bills & Utilities','Lightning',   '#3B6FF6', '#E9F0FE', true),
  ('Transport',       'Car',          '#1FA0A6', '#E0F3F4', true),
  ('Shopping',        'ShoppingBag',  '#8A5CF0', '#EFE9FD', true)
on conflict (name) do nothing;
