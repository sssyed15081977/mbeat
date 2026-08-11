-- RLS policies for posts, death_announcement, lifecycle_status_history.
--
-- Trust model for this stage (reputation/verified-announcer system not built yet):
-- every post is publicly readable once moderation_status = 'published'; getting a post
-- to 'published' happens only via the service role (Syed approving from the Supabase
-- dashboard / a service-role script) — no client-side path to self-publish exists.


-- ── posts ──────────────────────────────────────────────────────────────────

-- Anyone (including anonymous visitors) can read published posts; an author can
-- always read their own posts regardless of status. Supports the WhatsApp
-- share-link growth loop without requiring login to view a shared announcement.
create policy posts_select on posts
  for select
  using (moderation_status = 'published' or author_id = auth.uid());

-- Authenticated users create their own posts, always starting as 'pending'.
create policy posts_insert_own on posts
  for insert
  to authenticated
  with check (author_id = auth.uid() and moderation_status = 'pending');

-- Authors can update their own posts (content + lifecycle_status). Locking
-- moderation_status/author_id from author edits is enforced by the trigger
-- below, not here — RLS's WITH CHECK only sees the proposed new row, not the
-- prior one, so it can't tell "unchanged" from "attacker set it back".
create policy posts_update_own on posts
  for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Prevents authors from changing moderation_status or author_id via their own
-- update policy above. service_role (dashboard / moderation scripts) is exempt,
-- since that's the intended path to approve/flag/hide a post.
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
  end if;
  return new;
end;
$$;

create trigger posts_protect_moderation_columns_trigger
  before update on posts
  for each row
  execute function posts_protect_moderation_columns();

-- Whenever lifecycle_status actually changes, stamp lifecycle_updated_at and
-- append a row to lifecycle_status_history — keeps the audit trail accurate
-- without relying on every call site to remember to write history separately.
create or replace function posts_log_lifecycle_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lifecycle_status is distinct from old.lifecycle_status then
    insert into lifecycle_status_history (post_id, old_status, new_status, changed_by)
    values (new.id, old.lifecycle_status, new.lifecycle_status, auth.uid());
    new.lifecycle_updated_at := now();
  end if;
  return new;
end;
$$;

create trigger posts_log_lifecycle_change_trigger
  before update on posts
  for each row
  execute function posts_log_lifecycle_change();


-- ── death_announcement ─────────────────────────────────────────────────────
-- 1:1 extension of posts, so visibility/ownership mirrors the parent post.

create policy death_announcement_select on death_announcement
  for select
  using (
    exists (
      select 1 from posts p
      where p.id = death_announcement.post_id
        and (p.moderation_status = 'published' or p.author_id = auth.uid())
    )
  );

create policy death_announcement_insert_own on death_announcement
  for insert
  to authenticated
  with check (
    exists (
      select 1 from posts p
      where p.id = death_announcement.post_id
        and p.author_id = auth.uid()
    )
  );

create policy death_announcement_update_own on death_announcement
  for update
  to authenticated
  using (
    exists (
      select 1 from posts p
      where p.id = death_announcement.post_id
        and p.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from posts p
      where p.id = death_announcement.post_id
        and p.author_id = auth.uid()
    )
  );


-- ── lifecycle_status_history ───────────────────────────────────────────────
-- Append-only audit trail. Readable by anyone who can read the parent post.
-- Deliberately no insert/update/delete policy for authenticated/anon roles —
-- the only writer is the security definer trigger above, so the log can't be
-- edited or backfilled from the client.

create policy lifecycle_status_history_select on lifecycle_status_history
  for select
  using (
    exists (
      select 1 from posts p
      where p.id = lifecycle_status_history.post_id
        and (p.moderation_status = 'published' or p.author_id = auth.uid())
    )
  );
