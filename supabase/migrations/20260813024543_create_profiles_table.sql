-- profiles: 1:1 with auth.users, opt-in. This first pass only holds the
-- mandatory onboarding fields (real-name accountability) required before a
-- user may post. Directory fields for the future Find Now module
-- (profession, bio, status, moderation_status, search_vector) are
-- deliberately deferred to when that module is actually built.
create table profiles (
  id uuid primary key references auth.users(id),

  full_name text not null,
  phone text not null,
  locality text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- A user can only see/create/edit their own profile row. No public directory
-- read yet — that's Find Now's job, not built yet.
create policy profiles_select_own on profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_insert_own on profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own on profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
