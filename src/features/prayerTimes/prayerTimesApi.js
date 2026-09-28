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
