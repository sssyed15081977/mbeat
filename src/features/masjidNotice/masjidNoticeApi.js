import { supabase } from '../../lib/supabaseClient'
import { kolkataToday } from './masjidNoticeSchema'

// The columns every notice view needs: the post, its masjid_notice row and
// the masjid's name (posts.entity_id -> entities).
export const NOTICE_COLUMNS = '*, masjid_notice!inner(*), entities(id, name)'

// All-or-nothing, already published (AC4): the create_masjid_notice database
// function checks the caller is this masjid's volunteer.
export async function createMasjidNotice(entityId, fields) {
  const { data, error } = await supabase.rpc('create_masjid_notice', {
    entity_id: entityId,
    kind: fields.kind,
    title: fields.title,
    description: fields.description,
    source_reference: fields.source_reference,
    show_until: fields.show_until,
    photo_url: fields.photo_url,
    upi_id: fields.upi_id,
    payment_qr_url: fields.payment_qr_url,
  })

  if (error) throw error
  return data
}

// Author only (RLS). The kind can't change (a database trigger keeps it).
export async function updateMasjidNotice(postId, fields) {
  const { error: postError } = await supabase
    .from('posts')
    .update({ title: fields.title, description: fields.description })
    .eq('id', postId)
  if (postError) throw postError

  const { error } = await supabase
    .from('masjid_notice')
    .update({
      source_reference: fields.source_reference,
      show_until: fields.show_until,
      photo_url: fields.photo_url,
      upi_id: fields.upi_id,
      payment_qr_url: fields.payment_qr_url,
    })
    .eq('post_id', postId)
  if (error) throw error
}

// Author only (RLS). The masjid_notice row goes with it (on delete cascade).
// Photos stay in Storage (spec §6).
export async function deleteMasjidNotice(postId) {
  const { error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('id', postId)
  if (error) throw error
  // RLS hides rows you can't delete, so "nothing deleted" isn't an error from
  // the server; treat it as one.
  if (count === 0) throw new Error('Notice not removed')
}

// A masjid's live notices, newest first (AC9, AC13).
export async function fetchMasjidNotices(entityId) {
  const { data, error } = await supabase
    .from('posts')
    .select(NOTICE_COLUMNS)
    .eq('type', 'masjid_notice')
    .eq('entity_id', entityId)
    .eq('moderation_status', 'published')
    .or(`show_until.is.null,show_until.gte.${kolkataToday()}`, { referencedTable: 'masjid_notice' })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// The poster's name, or null. Names only, never phone numbers (§5).
export async function fetchAuthorName(userId) {
  const { data, error } = await supabase.rpc('get_author_names', { user_ids: [userId] })
  if (error) throw error
  return data?.[0]?.full_name ?? null
}
