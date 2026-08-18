import { supabase } from '../../lib/supabaseClient'

export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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
