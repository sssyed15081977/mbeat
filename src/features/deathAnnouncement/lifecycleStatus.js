// Locked vocabulary for posts.lifecycle_status when posts.type = 'death_announcement'.
// See CLAUDE.md naming protocol table. Labels live in the i18n resources
// (lifecycleStatus.deathAnnouncement.<value>), not here.
//
// awaiting_body and body_available split what used to be a single
// upcoming_janazah stage, so the feed can distinguish "don't come yet, body
// still in transit" from "visitors welcome now" — see the rationale in
// DeathAnnouncementForm's inferInitialLifecycleStatus.
export const DEATH_ANNOUNCEMENT_LIFECYCLE_STATUSES = [
  'awaiting_body',
  'body_available',
  'upcoming_janazah',
  'janazah_in_progress',
  'completed',
]
