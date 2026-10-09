import { supabase } from '../../lib/supabaseClient'
import { isNoticeLive, kolkataToday } from '../masjidNotice/masjidNoticeSchema'

// Masjid notices show only while published and live (masjid-notices.md
// AC13, AC23). Their card has no status label, so unlike other types an
// author's own hidden notice isn't shown to them either.
function isShownInFeed(post, today) {
  if (post.type !== 'masjid_notice') return true
  return post.moderation_status === 'published' && isNoticeLive(post.masjid_notice, today)
}

export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, death_announcement(photo_url), masjid_notice(*), entities(id, name)')
    .order('created_at', { ascending: false })

  if (error) throw error

  const today = kolkataToday()

  // Bump a post when its real-world status changes (lifecycle_updated_at),
  // not just when it was first created — that's the update people actually
  // need to see (janazah time/location changed, completed, etc). A plain
  // content edit (typo fix) doesn't touch lifecycle_updated_at, so it can't
  // be used to bump a post back to the top.
  return data.filter((post) => isShownInFeed(post, today)).sort((a, b) => {
    const aTime = new Date(a.lifecycle_updated_at || a.created_at).getTime()
    const bTime = new Date(b.lifecycle_updated_at || b.created_at).getTime()
    return bTime - aTime
  })
}

export async function fetchPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, death_announcement(*), masjid_notice(*), entities(id, name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}
