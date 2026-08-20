// Field definitions for the death announcement form, mirroring the `posts` +
// `death_announcement` table columns (see
// supabase/migrations/20260811083220_create_posts_death_announcement_schema.sql).

// Labels live in the i18n resources (gender.<value>), not here — this is
// display-language-agnostic.
export const DEATH_ANNOUNCEMENT_GENDERS = ['male', 'female']

export const initialDeathAnnouncementForm = {
  // posts columns
  title: '',
  description: '',
  // death_announcement columns
  deceased_name: '',
  deceased_age: '',
  deceased_gender: '',
  announcer_relation: '',
  death_datetime: '',
  // UI-only: never persisted directly. Drives the initial lifecycle_status
  // choice explicitly, rather than inferring "not available" from body_location
  // being blank — blank often just means "at home, didn't feel the need to say".
  body_not_yet_available: false,
  body_location: '',
  janazah_datetime: '',
  janazah_location: '',
  burial_location: '',
  photo: null,
}

export const DEATH_ANNOUNCEMENT_PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const DEATH_ANNOUNCEMENT_PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
