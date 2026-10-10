-- ============================================================
-- Huddle Finance App — Reset Schema
-- DANGER: drops all app tables/functions and their data.
-- Run this in the Supabase SQL Editor, then run schema.sql.
-- ============================================================

-- Ignore the error when pg_cron or the job isn't there.
do $$ begin perform cron.unschedule('process-recurring-expenses'); exception when others then null; end $$;

drop table if exists
  public.expenses,
  public.recurring_expenses,
  public.group_email_invites,
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
drop function if exists public.set_recurring_active(uuid, boolean);
drop function if exists public.update_recurring_expense(jsonb);
drop function if exists public.create_recurring_expense(jsonb, uuid, timestamptz);
drop function if exists public.catch_up_recurring(uuid);
drop function if exists public.process_recurring_expenses(uuid, date);
drop function if exists public.recurring_first_index_on_or_after(date, text, date);
drop function if exists public.recurring_next_due(date, text, integer, text, date, integer, integer);
drop function if exists public.recurring_occurrence(date, text, integer);
drop function if exists public.recurring_today();
