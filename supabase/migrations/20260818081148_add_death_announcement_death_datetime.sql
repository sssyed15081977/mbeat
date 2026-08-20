-- Date/time the person died, distinct from janazah_datetime (the funeral prayer time).
alter table death_announcement
  add column death_datetime timestamptz;
