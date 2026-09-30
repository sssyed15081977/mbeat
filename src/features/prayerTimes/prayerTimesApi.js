import { supabase } from '../../lib/supabaseClient'

// All-or-nothing: the create_masjid database function creates the masjid as
// 'pending', makes the caller its masjid_volunteer and saves any jamaat times
// given. `jamaatTimes` maps prayer -> "HH:mm"; blank prayers are left out.
export async function createMasjid({ name, address, jamaatTimes }) {
  const filledTimes = Object.fromEntries(
    Object.entries(jamaatTimes).filter(([, time]) => time),
  )

  const { data, error } = await supabase.rpc('create_masjid', {
    name,
    address: address || null,
    jamaat_times: filledTimes,
  })

  if (error) throw error
  return data
}

const MASJID_COLUMNS =
  'id, name, address, masjid(times_confirmed_at, masjid_prayer_times(prayer, jamaat_time))'

// Flattens entities -> masjid -> masjid_prayer_times into one object per
// masjid: { id, name, address, times_confirmed_at, prayer_times }.
function toMasjid(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    times_confirmed_at: row.masjid?.times_confirmed_at ?? null,
    prayer_times: row.masjid?.masjid_prayer_times ?? [],
  }
}

// Published masjids only. RLS already hides the rest; the filter just says so.
export async function fetchMasjids() {
  const { data, error } = await supabase
    .from('entities')
    .select(MASJID_COLUMNS)
    .eq('category', 'masjid')
    .eq('moderation_status', 'published')
    .order('name')

  if (error) throw error
  return data.map(toMasjid)
}

// Null when the masjid doesn't exist or isn't published.
export async function fetchMasjidById(id) {
  const { data, error } = await supabase
    .from('entities')
    .select(MASJID_COLUMNS)
    .eq('id', id)
    .eq('category', 'masjid')
    .eq('moderation_status', 'published')
    .maybeSingle()

  if (error) throw error
  return data ? toMasjid(data) : null
}

// The user's pinned masjids ("My masjids"), as a Set of entity ids.
export async function fetchSavedEntityIds(userId) {
  const { data, error } = await supabase
    .from('saved_entities')
    .select('entity_id')
    .eq('user_id', userId)

  if (error) throw error
  return new Set(data.map((row) => row.entity_id))
}

export async function saveEntity(userId, entityId) {
  const { error } = await supabase
    .from('saved_entities')
    .insert({ user_id: userId, entity_id: entityId })

  if (error) throw error
}

export async function unsaveEntity(userId, entityId) {
  const { error } = await supabase
    .from('saved_entities')
    .delete()
    .eq('user_id', userId)
    .eq('entity_id', entityId)

  if (error) throw error
}

// Whether to show "Update times". RLS enforces the real permission (AC16).
export async function fetchIsMasjidVolunteer(userId, entityId) {
  const { data, error } = await supabase
    .from('entity_members')
    .select('entity_id')
    .eq('user_id', userId)
    .eq('entity_id', entityId)
    .eq('role', 'masjid_volunteer')
    .maybeSingle()

  if (error) throw error
  return data !== null
}

// `changedTimes` maps prayer -> "HH:mm" for the changed prayers only (AC12),
// so unchanged prayers don't create history rows. The triggers stamp who/when
// and mark the masjid's times as confirmed.
export async function updateJamaatTimes(entityId, changedTimes) {
  const rows = Object.entries(changedTimes).map(([prayer, jamaatTime]) => ({
    entity_id: entityId,
    prayer,
    jamaat_time: jamaatTime,
  }))
  if (!rows.length) return

  const { error } = await supabase
    .from('masjid_prayer_times')
    .upsert(rows, { onConflict: 'entity_id,prayer' })

  if (error) throw error
}

// "Board unchanged" (AC14). The trigger overwrites the value sent here with
// the server's now() and the caller's id.
export async function confirmTimesUnchanged(entityId) {
  const { error } = await supabase
    .from('masjid')
    .update({ times_confirmed_at: new Date().toISOString() })
    .eq('entity_id', entityId)

  if (error) throw error
}
