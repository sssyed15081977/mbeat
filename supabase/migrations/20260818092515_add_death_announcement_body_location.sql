-- Where the body/family can be visited for condolences, distinct from
-- janazah_location (the prayer itself) and burial_location.
alter table death_announcement
  add column body_location text;
