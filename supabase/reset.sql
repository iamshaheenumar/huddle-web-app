-- ============================================================
-- Huddle Finance App — Reset Schema
-- DANGER: drops all app tables/functions and their data.
-- Run this in the Supabase SQL Editor, then run schema.sql.
-- ============================================================

drop table if exists
  public.expenses,
  public.group_invites,
  public.budget_categories,
  public.budgets,
  public.categories,
  public.group_members,
  public.groups,
  public.profiles
cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.create_group(text);
drop function if exists public.user_group_ids();
drop function if exists public.join_group_by_code(text);
drop function if exists public.get_invite_preview(text);
drop function if exists public.switch_active_group(uuid);
