import { supabase } from '../../lib/supabaseClient'

export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, death_announcement(photo_url)')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Bump a post when its real-world status changes (lifecycle_updated_at),
  // not just when it was first created — that's the update people actually
  // need to see (janazah time/location changed, completed, etc). A plain
  // content edit (typo fix) doesn't touch lifecycle_updated_at, so it can't
  // be used to bump a post back to the top.
  return [...data].sort((a, b) => {
    const aTime = new Date(a.lifecycle_updated_at || a.created_at).getTime()
    const bTime = new Date(b.lifecycle_updated_at || b.created_at).getTime()
    return bTime - aTime
  })
}

export async function fetchPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, death_announcement(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}
