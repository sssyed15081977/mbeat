-- Add masjid: any signed-in user with a completed profile can add a masjid
-- from the app (spec: specs/prayer-times.md §4.5, AC26–AC31).
--
-- This supersedes the trust model in 20260925023357_create_prayer_times_schema.sql
-- ("no client-side path to create a masjid or make yourself its volunteer").
-- There is now exactly one such path — this function — and it can only:
--   * create the masjid as 'pending' (hidden from everyone until Syed sets it
--     to 'published' from the dashboard), and
--   * make the caller, and nobody else, its masjid_volunteer.
-- The tables themselves still have no client insert policy on entities,
-- masjid or entity_members.
--
-- One function rather than four client-side inserts so that adding a masjid
-- is all-or-nothing (AC28).

create or replace function create_masjid(
  name text,
  address text default null,
  -- e.g. {"fajr": "05:15", "jumuah": "13:30"}. Prayers left out get no row.
  jamaat_times jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  clean_name text := nullif(trim(create_masjid.name), '');
  new_entity_id uuid;
  prayer_entry record;
begin
  if caller is null then
    raise exception 'Must be signed in to add a masjid';
  end if;

  -- Real-name accountability: same bar as posting.
  if not exists (select 1 from profiles where id = caller) then
    raise exception 'Complete your profile before adding a masjid';
  end if;

  if clean_name is null then
    raise exception 'Masjid name is required';
  end if;

  insert into entities (name, category, address, moderation_status)
  values (clean_name, 'masjid', nullif(trim(create_masjid.address), ''), 'pending')
  returning id into new_entity_id;

  insert into masjid (entity_id) values (new_entity_id);

  insert into entity_members (entity_id, user_id, role)
  values (new_entity_id, caller, 'masjid_volunteer');

  -- Unknown prayer names fail masjid_prayer_times' check constraint and bad
  -- times fail the ::time cast; either aborts the whole call. The existing
  -- triggers stamp updated_by, write history and set times_confirmed_at.
  for prayer_entry in
    select key, value from jsonb_each_text(coalesce(jamaat_times, '{}'::jsonb))
  loop
    if nullif(trim(prayer_entry.value), '') is not null then
      insert into masjid_prayer_times (entity_id, prayer, jamaat_time)
      values (new_entity_id, prayer_entry.key, prayer_entry.value::time);
    end if;
  end loop;

  return new_entity_id;
end;
$$;

-- Signed-in users only; guests are asked to sign in (AC26).
revoke execute on function create_masjid(text, text, jsonb) from public, anon;
grant execute on function create_masjid(text, text, jsonb) to authenticated;
