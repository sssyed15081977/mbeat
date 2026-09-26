-- Prayer Times v1: first slice of the Find Now directory (entities) plus
-- per-masjid jamaat times, kept current by masjid volunteers. Adhan times are
-- deliberately not stored: people know the adhan by hearing it, and the adhan
-- time written on a board can be a few minutes off.
--
-- Trust model for this stage: masjids and their volunteers are added only via
-- the service role (Syed from the Supabase dashboard) — no client-side path to
-- create a masjid or make yourself its volunteer. Volunteers can then update
-- their own masjid's times from the app.


-- ── entities ───────────────────────────────────────────────────────────────
-- Directory of places/organisations (Find Now). Only 'masjid' for now; more
-- categories (clinic, pharmacy, ...) get added to the check when confirmed.
create table entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('masjid')),
  description text,
  address text,
  lat double precision,
  lng double precision,

  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'published', 'flagged', 'hidden')),

  -- 'simple' config, same reasoning as posts.search_vector.
  search_vector tsvector generated always as (
    to_tsvector('simple',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index entities_category_idx on entities (category);
create index entities_search_vector_idx on entities using gin (search_vector);

alter table entities enable row level security;


-- ── entity_members ─────────────────────────────────────────────────────────
-- Links people to entities. role = 'masjid_volunteer' is what lets a user
-- update that masjid's times.
create table entity_members (
  entity_id uuid not null references entities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('masjid_volunteer')),
  created_at timestamptz not null default now(),
  primary key (entity_id, user_id, role)
);

create index entity_members_user_id_idx on entity_members (user_id);

alter table entity_members enable row level security;


-- ── masjid ─────────────────────────────────────────────────────────────────
-- 1:1 extension of entities for category = 'masjid' (same pattern as
-- death_announcement extending posts).
create table masjid (
  entity_id uuid primary key references entities(id) on delete cascade,
  -- Last time a volunteer checked the times against the notice board, either
  -- by saving changes or by tapping "board unchanged".
  times_confirmed_at timestamptz,
  times_confirmed_by uuid references auth.users(id)
);

alter table masjid enable row level security;


-- ── masjid_prayer_times ────────────────────────────────────────────────────
-- One row per masjid per prayer: its current jamaat time. Times are local
-- Melapalayam wall-clock times (`time`, no timezone), copied from the notice
-- board — deliberately not timestamptz, which would shift them.
create table masjid_prayer_times (
  entity_id uuid not null references masjid(entity_id) on delete cascade,
  prayer text not null
    check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah')),

  jamaat_time time not null,

  -- Stamped by trigger; null when set from the dashboard (service role).
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),

  primary key (entity_id, prayer)
);

alter table masjid_prayer_times enable row level security;


-- ── masjid_prayer_times_history ────────────────────────────────────────────
-- Append-only snapshot of every change to masjid_prayer_times. Written only
-- by the trigger below.
create table masjid_prayer_times_history (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references masjid(entity_id) on delete cascade,
  prayer text not null,
  jamaat_time time not null,
  -- Nullable, unlike lifecycle_status_history.changed_by: dashboard seeding
  -- has no auth.uid().
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create index masjid_prayer_times_history_entity_id_idx
  on masjid_prayer_times_history (entity_id);

alter table masjid_prayer_times_history enable row level security;


-- ── saved_entities ─────────────────────────────────────────────────────────
-- A user's pinned entities ("My masjids" in the UI). Generic so Find Now can
-- reuse it for other entity categories later.
create table saved_entities (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_id uuid not null references entities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, entity_id)
);

alter table saved_entities enable row level security;


-- ── helpers + triggers ─────────────────────────────────────────────────────

-- security definer so RLS policies can call it without recursing into
-- entity_members' own RLS.
create or replace function is_masjid_volunteer(target_entity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from entity_members
    where entity_id = target_entity_id
      and user_id = auth.uid()
      and role = 'masjid_volunteer'
  );
$$;

-- Clients can't choose who/when a confirmation was: any non-service-role
-- update to masjid stamps now() + the caller, so "board unchanged" is just
-- `update masjid set times_confirmed_at = now() where entity_id = ...`.
create or replace function masjid_stamp_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.entity_id := old.entity_id;
    new.times_confirmed_at := now();
    new.times_confirmed_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger masjid_stamp_confirmation_trigger
  before update on masjid
  for each row
  execute function masjid_stamp_confirmation();

-- Stamp who/when on every write, same reasoning as above.
create or replace function masjid_prayer_times_stamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

create trigger masjid_prayer_times_stamp_trigger
  before insert or update on masjid_prayer_times
  for each row
  execute function masjid_prayer_times_stamp();

-- On an actual change: append a history row, and count the save as a
-- confirmation of the masjid's times (saving implies the volunteer just
-- checked the board).
create or replace function masjid_prayer_times_log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.jamaat_time is distinct from old.jamaat_time then
    insert into masjid_prayer_times_history
      (entity_id, prayer, jamaat_time, changed_by)
    values
      (new.entity_id, new.prayer, new.jamaat_time, auth.uid());
  end if;

  update masjid
  set times_confirmed_at = now(), times_confirmed_by = auth.uid()
  where entity_id = new.entity_id;

  return null;
end;
$$;

create trigger masjid_prayer_times_log_change_trigger
  after insert or update on masjid_prayer_times
  for each row
  execute function masjid_prayer_times_log_change();


-- ── RLS policies ───────────────────────────────────────────────────────────

-- entities: anyone (incl. anonymous) reads published entities. No client
-- writes — service role only.
create policy entities_select on entities
  for select
  using (moderation_status = 'published');

-- entity_members: a user can see their own memberships (so the app knows
-- whether to show the "Update times" button). No client writes.
create policy entity_members_select_own on entity_members
  for select
  to authenticated
  using (user_id = auth.uid());

-- masjid: readable when the parent entity is published; only that masjid's
-- volunteers can update (i.e. confirm) it.
create policy masjid_select on masjid
  for select
  using (
    exists (
      select 1 from entities e
      where e.id = masjid.entity_id and e.moderation_status = 'published'
    )
  );

create policy masjid_update_volunteer on masjid
  for update
  to authenticated
  using (is_masjid_volunteer(entity_id))
  with check (is_masjid_volunteer(entity_id));

-- masjid_prayer_times: readable when the parent entity is published; that
-- masjid's volunteers can add and change its rows.
create policy masjid_prayer_times_select on masjid_prayer_times
  for select
  using (
    exists (
      select 1 from entities e
      where e.id = masjid_prayer_times.entity_id and e.moderation_status = 'published'
    )
  );

create policy masjid_prayer_times_insert_volunteer on masjid_prayer_times
  for insert
  to authenticated
  with check (is_masjid_volunteer(entity_id));

create policy masjid_prayer_times_update_volunteer on masjid_prayer_times
  for update
  to authenticated
  using (is_masjid_volunteer(entity_id))
  with check (is_masjid_volunteer(entity_id));

-- masjid_prayer_times_history: readable like its parent. No client writes —
-- the trigger above is the only writer.
create policy masjid_prayer_times_history_select on masjid_prayer_times_history
  for select
  using (
    exists (
      select 1 from entities e
      where e.id = masjid_prayer_times_history.entity_id and e.moderation_status = 'published'
    )
  );

-- saved_entities: each user manages only their own pins.
create policy saved_entities_select_own on saved_entities
  for select
  to authenticated
  using (user_id = auth.uid());

create policy saved_entities_insert_own on saved_entities
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy saved_entities_delete_own on saved_entities
  for delete
  to authenticated
  using (user_id = auth.uid());
