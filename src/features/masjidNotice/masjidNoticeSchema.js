import { KOLKATA_OFFSET_MINUTES } from '../prayerTimes/nextJamaat'

// Mirrors masjid_notice.kind (supabase/migrations/20261005120000_add_masjid_notices.sql).
// Labels live in i18n (masjidNotice.kinds.<kind>).
export const MASJID_NOTICE_KINDS = ['announcement', 'ayah', 'hadith', 'dua', 'donation']

// These must name their source (AC14; database check masjid_notice_source_required).
export const KINDS_NEEDING_SOURCE = ['ayah', 'hadith']

// Today's date on the Melapalayam calendar, as "YYYY-MM-DD" — the format of
// masjid_notice.show_until.
export function kolkataToday(now = new Date()) {
  return new Date(now.getTime() + KOLKATA_OFFSET_MINUTES * 60 * 1000).toISOString().slice(0, 10)
}

// A notice is live through the end of its show_until day (AC13).
export function isNoticeLive(notice, today = kolkataToday()) {
  return !notice?.show_until || notice.show_until >= today
}

// Title shown for a notice: its own, or "Notice from {masjid}" (spec §5: a
// notice with no title stores '').
export function noticeTitle(post, t) {
  return post.title || t('masjidNotice.noticeFrom', { masjid: post.entities?.name ?? '' })
}

// The form's fields. `photo` / `qr` hold a newly picked File; the existing
// URLs are kept separately while editing.
export function initialNoticeForm(post) {
  const notice = post?.masjid_notice ?? {}
  return {
    kind: notice.kind ?? '',
    title: post?.title ?? '',
    description: post?.description ?? '',
    source_reference: notice.source_reference ?? '',
    show_until: notice.show_until ?? '',
    upi_id: notice.upi_id ?? '',
    photo: null,
    qr: null,
  }
}
