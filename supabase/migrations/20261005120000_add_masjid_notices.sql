-- Masjid notices v1 (spec: specs/masjid-notices.md §5).
--
-- A masjid volunteer posts the masjid's notice-board content (announcements,
-- ayahs, hadiths, duas, donation appeals) as posts of type 'masjid_notice',
-- with a 1:1 masjid_notice extension row.
--
-- Trust model change: every other post type starts 'pending' and only the
-- service role can publish it (20260811165539_add_posts_rls_policies.sql).
-- Masjid notices are the narrow exception: create_masjid_notice() below
-- creates them already 'published', and only for a published masjid the
-- caller volunteers for. posts_insert_own is unchanged, so a client still
-- can't insert a published post directly, and masjid_notice deliberately has
-- NO insert policy: the function is the only way to create one.


-- ── posts ──────────────────────────────────────────────────────────────────

alter table posts drop constraint posts_type_check;
alter table posts add constraint posts_type_check
  check (type in ('blood_request', 'death_announcement', 'job', 'dua', 'fundraiser', 'discussion', 'masjid_notice'));

-- Which entity published the post; null for posts by individuals.
alter table posts add column entity_id uuid references entities(id) on delete cascade;
create index posts_entity_id_idx on posts (entity_id);

-- Authors may edit content, but not who/what published it. Extends the
-- existing trigger function: entity_id (so a notice can't be moved to another
-- masjid) and type are now locked too.
create or replace function posts_protect_moderation_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.moderation_status := old.moderation_status;
    new.author_id := old.author_id;
    new.entity_id := old.entity_id;
    new.type := old.type;
  end if;
  return new;
end;
$$;

-- Authors can remove their own notices. Other post types still can't be
-- deleted from the app. The masjid_notice row goes with it (on delete cascade).
create policy posts_delete_own_masjid_notice on posts
  for delete
  to authenticated
  using (author_id = auth.uid() and type = 'masjid_notice');


-- ── masjid_notice ──────────────────────────────────────────────────────────

create table masjid_notice (
  post_id uuid primary key references posts(id) on delete cascade,

  kind text not null
    check (kind in ('announcement', 'ayah', 'hadith', 'dua', 'donation')),

  -- Required for ayahs and hadiths: misattributed hadiths spread widely.
  source_reference text,

  -- Local Melapalayam date; the notice is live through the end of that day
  -- (Asia/Kolkata). Null = no end date.
  show_until date,

  photo_url text,

  upi_id text,
  payment_qr_url text,

  constraint masjid_notice_source_required
    check (kind not in ('ayah', 'hadith') or nullif(trim(source_reference), '') is not null),
  constraint masjid_notice_payment_only_for_donation
    check (kind = 'donation' or (upi_id is null and payment_qr_url is null))
);

alter table masjid_notice enable row level security;

-- The kind can't change after posting (keeps the Source / Donation rules simple).
create or replace function masjid_notice_lock_kind()
returns trigger
language plpgsql
as $$
begin
  new.post_id := old.post_id;
  new.kind := old.kind;
  return new;
end;
$$;

create trigger masjid_notice_lock_kind_trigger
  before update on masjid_notice
  for each row
  execute function masjid_notice_lock_kind();

-- Visibility mirrors the parent post (same as death_announcement_select).
create policy masjid_notice_select on masjid_notice
  for select
  using (
    exists (
      select 1 from posts p
      where p.id = masjid_notice.post_id
        and (p.moderation_status = 'published' or p.author_id = auth.uid())
    )
  );

create policy masjid_notice_update_own on masjid_notice
  for update
  to authenticated
  using (
    exists (
      select 1 from posts p
      where p.id = masjid_notice.post_id
        and p.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from posts p
      where p.id = masjid_notice.post_id
        and p.author_id = auth.uid()
    )
  );


-- ── create_masjid_notice ───────────────────────────────────────────────────
-- All-or-nothing: the posts row and the masjid_notice row together (AC4).

create or replace function create_masjid_notice(
  entity_id uuid,
  kind text,
  title text default null,
  description text default null,
  source_reference text default null,
  show_until date default null,
  photo_url text default null,
  upi_id text default null,
  payment_qr_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  clean_title text := coalesce(trim(create_masjid_notice.title), '');
  clean_description text := nullif(trim(create_masjid_notice.description), '');
  clean_photo_url text := nullif(trim(create_masjid_notice.photo_url), '');
  new_post_id uuid;
begin
  if caller is null then
    raise exception 'Must be signed in to post a notice';
  end if;

  -- Real-name accountability: same bar as posting anything else.
  if not exists (select 1 from profiles where id = caller) then
    raise exception 'Complete your profile before posting';
  end if;

  if not exists (
    select 1 from entities e
    where e.id = create_masjid_notice.entity_id
      and e.category = 'masjid'
      and e.moderation_status = 'published'
  ) then
    raise exception 'This masjid is not available';
  end if;

  if not is_masjid_volunteer(create_masjid_notice.entity_id) then
    raise exception 'Only this masjid''s volunteers can post notices for it';
  end if;

  -- A notice needs at least a photo, a title or text (AC3).
  if clean_title = '' and clean_description is null and clean_photo_url is null then
    raise exception 'Add a photo, a title or some text';
  end if;

  insert into posts (type, author_id, entity_id, title, description, moderation_status)
  values ('masjid_notice', caller, create_masjid_notice.entity_id, clean_title, clean_description, 'published')
  returning id into new_post_id;

  -- Bad kinds, a missing source or payment details on a non-donation fail
  -- masjid_notice's checks and abort the whole call.
  insert into masjid_notice (post_id, kind, source_reference, show_until, photo_url, upi_id, payment_qr_url)
  values (
    new_post_id,
    create_masjid_notice.kind,
    nullif(trim(create_masjid_notice.source_reference), ''),
    create_masjid_notice.show_until,
    clean_photo_url,
    nullif(trim(create_masjid_notice.upi_id), ''),
    nullif(trim(create_masjid_notice.payment_qr_url), '')
  );

  return new_post_id;
end;
$$;

revoke execute on function create_masjid_notice(uuid, text, text, text, text, date, text, text, text) from public, anon;
grant execute on function create_masjid_notice(uuid, text, text, text, text, date, text, text, text) to authenticated;


-- ── get_author_names ───────────────────────────────────────────────────────
-- profiles is readable only by its owner (it also holds phone numbers), but
-- notices show "Posted by {name}, masjid volunteer" (AC12, AC19). This returns
-- names only, and only for people who have a published post, so it can't be
-- used to look up arbitrary users.

create or replace function get_author_names(user_ids uuid[])
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from profiles p
  where p.id = any(user_ids)
    and exists (
      select 1 from posts
      where posts.author_id = p.id
        and posts.moderation_status = 'published'
    );
$$;

revoke execute on function get_author_names(uuid[]) from public;
-- Guests can open notices too (AC15).
grant execute on function get_author_names(uuid[]) to anon, authenticated;
