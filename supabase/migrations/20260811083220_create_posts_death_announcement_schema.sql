-- Base posts table: shared by every post type (death_announcement, blood_request, job, dua, fundraiser, discussion, ...)
create table posts (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('blood_request', 'death_announcement', 'job', 'dua', 'fundraiser', 'discussion')),
  author_id uuid not null references auth.users(id),

  title text not null,
  description text,

  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'published', 'flagged', 'hidden')),

  -- Vocabulary is type-specific; meaning depends on `type`. See lifecycle_status_history for the audit trail.
  lifecycle_status text,
  lifecycle_updated_at timestamptz,

  -- 'simple' config deliberately used instead of 'english' to avoid mis-stemming mixed Tamil/Arabic/English content.
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_type_idx on posts (type);
create index posts_moderation_status_idx on posts (moderation_status);
create index posts_search_vector_idx on posts using gin (search_vector);

alter table posts enable row level security;


-- death_announcement: 1:1 extension of posts for type = 'death_announcement'
create table death_announcement (
  post_id uuid primary key references posts(id) on delete cascade,

  deceased_name text not null,
  deceased_age int,
  deceased_gender text check (deceased_gender in ('male', 'female')),

  -- Who is posting on behalf of the deceased (e.g. son, mosque committee).
  announcer_relation text,

  janazah_datetime timestamptz,
  janazah_location text,
  -- Nullable: when not set, the UI treats burial as happening at janazah_location.
  burial_location text,

  photo_url text
);

alter table death_announcement enable row level security;


-- lifecycle_status_history: append-only audit trail for posts.lifecycle_status changes, shared across all post types
create table lifecycle_status_history (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid not null references auth.users(id),
  changed_at timestamptz not null default now()
);

create index lifecycle_status_history_post_id_idx on lifecycle_status_history (post_id);

alter table lifecycle_status_history enable row level security;
