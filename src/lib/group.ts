import type { SupabaseClient } from '@supabase/supabase-js'

export type GroupSummary = { id: string; name: string }

// Resolves the caller's active group: profiles.active_group_id if set,
// falling back to their first group membership (and persisting that as
// active), falling back to auto-creating a default group if they have none.
export async function getActiveGroup(supabase: SupabaseClient, userId: string): Promise<GroupSummary> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_group_id, groups:active_group_id(id, name)')
    .eq('id', userId)
    .maybeSingle()

  const active = profile?.groups as unknown as GroupSummary | null
  if (active) return active

  const { data: gm } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const fallback = gm?.groups as unknown as GroupSummary | null
  if (fallback) {
    await switchActiveGroup(supabase, fallback.id)
    return fallback
  }

  const { data: created, error: createError } = await supabase.rpc('create_group', { group_name: 'My Group' })

  if (createError || !created?.[0]) throw new Error(createError?.message ?? 'Could not create group')

  return created[0] as unknown as GroupSummary
}

// Lists every group the caller belongs to, for the group-switcher menu.
export async function listUserGroups(supabase: SupabaseClient, userId: string): Promise<GroupSummary[]> {
  const { data } = await supabase
    .from('group_members')
    .select('groups(id, name)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })

  return ((data as unknown as { groups: GroupSummary }[]) ?? []).map(r => r.groups).filter(Boolean)
}

// Creates a new group and makes it the caller's active group (the
// create_group RPC sets active_group_id itself).
export async function createNewGroup(supabase: SupabaseClient, groupName: string): Promise<GroupSummary> {
  const { data, error } = await supabase.rpc('create_group', { group_name: groupName })

  if (error || !data?.[0]) throw new Error(error?.message ?? 'Could not create group')

  return data[0] as unknown as GroupSummary
}

// Switches which group is active for the caller. Throws if they're not a
// member of that group (validated server-side by switch_active_group).
export async function switchActiveGroup(supabase: SupabaseClient, groupId: string): Promise<void> {
  const { error } = await supabase.rpc('switch_active_group', { p_group_id: groupId })

  if (error) throw new Error(error.message)
}

function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function getOrCreateActiveInvite(supabase: SupabaseClient, groupId: string, userId: string): Promise<string> {
  const nowIso = new Date().toISOString()

  const { data: existing } = await supabase
    .from('group_invites')
    .select('code')
    .eq('group_id', groupId)
    .eq('revoked', false)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return (existing as unknown as { code: string }).code

  return createInvite(supabase, groupId, userId)
}

export async function regenerateInvite(supabase: SupabaseClient, groupId: string, userId: string): Promise<string> {
  await supabase.from('group_invites').update({ revoked: true }).eq('group_id', groupId).eq('revoked', false)
  return createInvite(supabase, groupId, userId)
}

async function createInvite(supabase: SupabaseClient, groupId: string, userId: string): Promise<string> {
  const code = generateInviteCode()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invite, error } = await supabase
    .from('group_invites')
    .insert({ group_id: groupId, code, created_by: userId, expires_at: expiresAt })
    .select('code')
    .single()

  if (error || !invite) throw new Error(error?.message ?? 'Could not create invite')

  return (invite as unknown as { code: string }).code
}
