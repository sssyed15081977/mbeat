-- Masjid volunteer requests v1 (spec: specs/masjid-volunteer-requests.md §5).
--
-- A signed-in user asks to become a masjid's volunteer; one of that masjid's
-- current volunteers (in the app) or Syed (dashboard) approves it. The table
-- is generic (entity_member_requests) so other memberships can reuse it
-- later, but v1 only allows role = 'masjid_volunteer'.
--
-- Trust model: this is the second client path to an entity_members row
-- (after create_masjid, which only makes you volunteer of a masjid you add).
-- Nobody can make themselves a volunteer: the table has no client insert or
-- update policies, request_to_volunteer() only creates 'pending' rows, and
-- only decide_volunteer_request() (callable by that masjid's volunteers) or
-- the dashboard can approve one. The membership row is always created by the
-- trigger below, whichever way the request was approved (AC22).


-- ── entity_member_requests ─────────────────────────────────────────────────

create table entity_member_requests (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references entities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Same vocabulary as entity_members.role.
  role text not null check (role in ('masjid_volunteer')),
  -- "Tell the volunteers who you are" (AC6).
  note text check (char_length(note) <= 200),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  -- Stamped by trigger; decided_by is null when decided from the dashboard.
  decided_at timestamptz,
  decided_by uuid references auth.users(id)
);

-- One pending request per person per masjid (AC8). Also serves the
-- "pending requests for this masjid" lookups (leading entity_id).
create unique index entity_member_requests_one_pending_idx
  on entity_member_requests (entity_id, user_id, role)
  where status = 'pending';

create index entity_member_requests_user_id_idx on entity_member_requests (user_id);

alter table entity_member_requests enable row level security;


-- ── triggers ───────────────────────────────────────────────────────────────

-- A request is decided once (AC13): after that it can't change again. Only
-- the status can be changed; who asked, for what and when stay as they were.
-- Stamps when/who decided, so the dashboard path needs nothing but a status
-- change.
create or replace function entity_member_requests_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status <> 'pending' then
    raise exception 'Already handled' using hint = 'already_handled';
  end if;

  new.id := old.id;
  new.entity_id := old.entity_id;
  new.user_id := old.user_id;
  new.role := old.role;
  new.note := old.note;
  new.created_at := old.created_at;

  if new.status <> old.status then
    new.decided_at := now();
    new.decided_by := auth.uid();
  else
    new.decided_at := null;
    new.decided_by := null;
  end if;

  return new;
end;
$$;

create trigger entity_member_requests_guard_trigger
  before update on entity_member_requests
  for each row
  execute function entity_member_requests_guard();

-- Approval creates the membership, for both the in-app and dashboard paths.
create or replace function entity_member_requests_on_approve()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status = 'approved' then
    insert into entity_members (entity_id, user_id, role)
    values (new.entity_id, new.user_id, new.role)
    on conflict do nothing;
  end if;
  return null;
end;
$$;

create trigger entity_member_requests_on_approve_trigger
  after update on entity_member_requests
  for each row
  execute function entity_member_requests_on_approve();


-- ── RLS policies ───────────────────────────────────────────────────────────

-- Requesters see their own requests ("Request sent", AC7); a masjid's
-- volunteers see that masjid's requests. No insert/update/delete policies:
-- the functions below are the only way in.
create policy entity_member_requests_select on entity_member_requests
  for select
  to authenticated
  using (user_id = auth.uid() or is_masjid_volunteer(entity_id));


-- ── get_masjid_volunteer_counts ────────────────────────────────────────────
-- How many volunteers each published masjid has, without saying who (AC1):
-- entity_members stays readable only by each user for their own rows.
-- Masjids with no volunteers are included with 0.

create or replace function get_masjid_volunteer_counts()
returns table (entity_id uuid, volunteer_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, count(m.user_id)::integer
  from entities e
  left join entity_members m
    on m.entity_id = e.id and m.role = 'masjid_volunteer'
  where e.category = 'masjid'
    and e.moderation_status = 'published'
  group by e.id;
$$;

revoke execute on function get_masjid_volunteer_counts() from public;
-- Guests see "needs volunteers" too (AC3, AC5).
grant execute on function get_masjid_volunteer_counts() to anon, authenticated;


-- ── request_to_volunteer ───────────────────────────────────────────────────

create or replace function request_to_volunteer(
  entity_id uuid,
  note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  new_request_id uuid;
begin
  if caller is null then
    raise exception 'Must be signed in to offer to volunteer';
  end if;

  -- Volunteers decide by name, so the requester needs one (real names rule).
  if not exists (select 1 from profiles where id = caller) then
    raise exception 'Complete your profile before offering to volunteer';
  end if;

  if not exists (
    select 1 from entities e
    where e.id = request_to_volunteer.entity_id
      and e.category = 'masjid'
      and e.moderation_status = 'published'
  ) then
    raise exception 'This masjid is not available';
  end if;

  if is_masjid_volunteer(request_to_volunteer.entity_id) then
    raise exception 'You already volunteer for this masjid';
  end if;

  begin
    insert into entity_member_requests (entity_id, user_id, role, note)
    values (
      request_to_volunteer.entity_id,
      caller,
      'masjid_volunteer',
      nullif(trim(request_to_volunteer.note), '')
    )
    returning id into new_request_id;
  exception when unique_violation then
    raise exception 'You already have a request waiting for this masjid'
      using hint = 'already_requested';
  end;

  return new_request_id;
end;
$$;

revoke execute on function request_to_volunteer(uuid, text) from public, anon;
grant execute on function request_to_volunteer(uuid, text) to authenticated;


-- ── decide_volunteer_request ───────────────────────────────────────────────
-- Only that masjid's volunteers (AC13). The `status = 'pending'` filter makes
-- a second, concurrent decision update nothing, so it gets "Already handled".

create or replace function decide_volunteer_request(
  request_id uuid,
  approve boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_entity_id uuid;
begin
  select r.entity_id into request_entity_id
  from entity_member_requests r
  where r.id = decide_volunteer_request.request_id;

  if request_entity_id is null or not is_masjid_volunteer(request_entity_id) then
    raise exception 'Only this masjid''s volunteers can decide its requests';
  end if;

  update entity_member_requests
  set status = case when decide_volunteer_request.approve then 'approved' else 'declined' end
  where id = decide_volunteer_request.request_id
    and status = 'pending';

  if not found then
    raise exception 'Already handled' using hint = 'already_handled';
  end if;
end;
$$;

revoke execute on function decide_volunteer_request(uuid, boolean) from public, anon;
grant execute on function decide_volunteer_request(uuid, boolean) to authenticated;


-- ── get_volunteer_requests ─────────────────────────────────────────────────
-- A masjid's pending requests with the requester's name, only for that
-- masjid's volunteers (AC11, AC14). Names only, never phone numbers.
-- get_author_names can't be reused: it only names people with a published post.

create or replace function get_volunteer_requests(entity_id uuid)
returns table (id uuid, user_id uuid, full_name text, note text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.user_id, p.full_name, r.note, r.created_at
  from entity_member_requests r
  left join profiles p on p.id = r.user_id
  where r.entity_id = get_volunteer_requests.entity_id
    and r.status = 'pending'
    and is_masjid_volunteer(get_volunteer_requests.entity_id)
  order by r.created_at;
$$;

revoke execute on function get_volunteer_requests(uuid) from public, anon;
grant execute on function get_volunteer_requests(uuid) to authenticated;
