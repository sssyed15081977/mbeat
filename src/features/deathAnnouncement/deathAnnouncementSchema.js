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
  janazah_datetime: '',
  janazah_location: '',
  burial_location: '',
}
