import { supabase } from '../../lib/supabaseClient'

// Volunteer counts for every published masjid, as a Map of entity id ->
// count. Counts only, never who the volunteers are (AC1).
export async function fetchVolunteerCounts() {
  const { data, error } = await supabase.rpc('get_masjid_volunteer_counts')
  if (error) throw error
  return new Map(data.map((row) => [row.entity_id, row.volunteer_count]))
}

// The masjids the user has a pending request for, as a Set of entity ids
// (AC7, AC16). RLS shows each user only their own requests.
export async function fetchMyPendingRequestIds(userId) {
  const { data, error } = await supabase
    .from('entity_member_requests')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('role', 'masjid_volunteer')
    .eq('status', 'pending')

  if (error) throw error
  return new Set(data.map((row) => row.entity_id))
}

// The database function checks sign-in, a published masjid, not already a
// volunteer and no other pending request (AC8).
export async function requestToVolunteer(entityId, note) {
  const { data, error } = await supabase.rpc('request_to_volunteer', {
    entity_id: entityId,
    note: note || null,
  })
  if (error) throw error
  return data
}

// Only that masjid's volunteers; a request already decided by someone else
// fails with "Already handled" (AC13).
export async function decideVolunteerRequest(requestId, approve) {
  const { error } = await supabase.rpc('decide_volunteer_request', {
    request_id: requestId,
    approve,
  })
  if (error) throw error
}

export function isAlreadyHandled(error) {
  return error?.hint === 'already_handled'
}

// A masjid's pending requests, oldest first, with the requester's name
// (never their phone number). Empty for anyone but its volunteers (AC14).
export async function fetchVolunteerRequests(entityId) {
  const { data, error } = await supabase.rpc('get_volunteer_requests', { entity_id: entityId })
  if (error) throw error
  return data
}
