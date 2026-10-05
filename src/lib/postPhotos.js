import { supabase } from './supabaseClient'

// Photos for any post type go to the shared `post-photos` bucket, under the
// uploader's own folder (the bucket's RLS only allows `<user_id>/...`). See
// supabase/migrations/20260818083228_create_post_photos_bucket.sql.
export const POST_PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const POST_PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// 'type' | 'size' | null — the caller picks the message (postPhoto.typeError / sizeError).
export function validatePostPhoto(file) {
  if (!POST_PHOTO_ACCEPTED_TYPES.includes(file.type)) return 'type'
  if (file.size > POST_PHOTO_MAX_BYTES) return 'size'
  return null
}

// Returns the public URL.
export async function uploadPostPhoto(userId, file) {
  const extension = file.name.split('.').pop()
  const path = `${userId}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('post-photos').upload(path, file)
  if (error) throw error

  return supabase.storage.from('post-photos').getPublicUrl(path).data.publicUrl
}
