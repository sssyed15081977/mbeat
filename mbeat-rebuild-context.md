# mbeat Rebuild — Context Handoff

## Project
mbeat (MPM Helpline) — free community-service PWA for Melapalayam, Tirunelveli, Tamil Nadu (~200,000 people). Consolidates fragmented WhatsApp-group civic info into one app. Same project as before — this is a from-scratch **rebuild**, not a new idea.

## Why rebuilding from scratch
The previous build (flat, module-by-module CRUD app) doesn't fit the new direction: a **Post-based, social-feed architecture** — "addictive" in a positive sense, designed for consistency and community benefit rather than compulsive engagement. Syed also wants to genuinely understand and own this codebase, not just have working code.

## Core architectural decisions (settled)

### Stack — confirmed good fit, no changes
- React PWA (Vite) → Supabase (Postgres + Auth + Storage + **Realtime**, Singapore region) → FastAPI (Phase 3+, for smart feed ranking) → Anthropic API (Phase 3+)
- Supabase Realtime will be used from the start — it's the mechanic behind live reaction counts / feed updates (not used in the previous build).
- PWA confirmed over native Android: single codebase, zero install friction, instant updates, no store gatekeeping. Fits solo-dev reality.
- iPhone/iOS not a concern — negligible iPhone usage observed in Melapalayam, so Web Push reliability is a non-issue (iOS Web Push has restrictions; Android does not).
- Geolocation API + plain Google Maps URL links cover "share location / open in maps" — no extra library needed.
- Infinite scroll: paginate via Supabase `.range()` + `IntersectionObserver`; add virtualization (`react-window` / `@tanstack/react-virtual`) later if a feed grows large.
- Feed-fetching must be decoupled behind a single hook (`useFeed()`) / later a single FastAPI endpoint, from day one — this is what keeps a future Redis/dedicated feed service swap cheap. No premature infra, just one clean seam.

### Data model — Post-based, not flat per-module tables
- Full Supabase schema **redesign** (not just frontend rebuild).
- Single unified `posts` table with a `type` enum (`blood_request`, `death_announcement`, `job`, `dua`, `fundraiser`, `discussion`, ...), rather than separate tables per module.
- `discussion` type reserved in the enum from day one but **not built or exposed in UI yet** — deliberate future-proofing for an eventual open community-discussion feature.
- Related tables: `reactions`, `flags`/reports, `reputation` (StackOverflow-style trust backbone, carried over from original plan).

### Moderation / trust model — structure over policing
- No generic free-text "say anything" post type — every post type has a constrained form (only relevant fields), which prevents most spam/misuse before any moderation logic runs.
- Graduated trust: new/unverified users' posts go into a review queue; users with a good track record earn auto-publish.
- Community self-polices via flags/downvotes pushing posts back to review or auto-hiding past a threshold; Syed is the backstop, not the front line.
- Real-name accountability required for posting (no anonymous posts) — fits a bounded real community and reduces bad behavior naturally.
- `discussion` type, when eventually built, gets a **stricter** trust gate than factual/urgent types (higher reputation threshold, faster flag-to-hide).

### First module: Death Announcements
- Chosen because it already has the largest, most engaged WhatsApp audience in Melapalayam, and user intent is unambiguous (wanting to know Janazah details to attend funeral prayers).
- Time-sensitivity is core to the design: `janazah_datetime` and `janazah_location` are first-class, visually prominent fields (not buried in free text), since fast reach is functionally tied to fulfilling a communal obligation (janazah is fard kifayah).
- Verified announcers (mosque committees, known figures) get auto-publish; others go through fast-track review.
- Reactions fit the content: "will attend janazah" / dua response (also serves as a headcount signal for the family) — not generic likes.
- A "share to WhatsApp" button is the intended growth loop: post on mbeat first, share the link into existing WhatsApp groups, let the better experience pull people back to the app over time. (Reading/importing WhatsApp messages into the app is not possible — no API for personal WhatsApp/group content, and unofficial scraping is against ToS and a privacy problem. Push-out via share link is the sanctioned path.)

### Lifecycle status — separate from moderation status
- Every post type needs to be **status-showable**: not just visible/hidden (moderation status), but tracking *what's currently true about the real-world situation* — e.g. a death announcement moves through `upcoming_janazah` → `janazah_in_progress` → `completed` (becomes historical record); a blood request moves through `open` → `fulfilled`/`expired`.
- These are two distinct concepts, driven by different people: **moderation status** (`pending | published | flagged | hidden`) is about trust/spam; **lifecycle status** is about the unfolding real-world event, updated by the author/verified announcer.
- Lifecycle states are **type-specific** — each post type defines its own vocabulary and valid transitions (death announcement states ≠ blood request states ≠ job posting states). Not a single generic enum shared across all types.
- Schema: `posts.lifecycle_status` (text, meaning depends on `type`) + `posts.lifecycle_updated_at`, plus a `lifecycle_status_history` audit table (`post_id, old_status, new_status, changed_by, changed_at`) — fits the same accountability principle as the reputation/trust system.
- Status changes should propagate live via Supabase Realtime (e.g. "Janazah completed" updates on-screen without refresh) — a more meaningful early use of Realtime than just reaction counts.
- Feed ordering (`useFeed()`) must account for lifecycle status, not just `created_at` — an active/urgent post (e.g. `upcoming_janazah`) should rank above older but still-active posts, and historical/closed posts should fall away from prominence regardless of how "new" they are.
- **Auto-expiry deferred**: for now, all lifecycle status changes are manual (author/announcer updates it themselves). Scheduled auto-expiry (e.g. blood request auto-closing after N hours via a cron/Edge Function) goes into the Icebox for later — avoids pulling in scheduled-job infrastructure before it's actually needed.

### Folder structure — Post-based, not module-based
- Organized by **function**, not by old module names (no `src/CommunityInfo/`, `src/StudentHub/` islands) — reflects that every post type flows through one shared feed engine, one `useFeed()` hook, one reaction/flag/reputation system.
- Each post type gets its **own subfolder under `features/`** (e.g. `features/deathAnnouncement/`, later `features/job/`, `features/bloodRequest/`) — scales cleanly as each type's form/schema/status logic grows in complexity.
- Structure:
```
src/
  components/
    posts/        -- PostCard.jsx (generic shell), PostCard.<type>.jsx (type-specific rendering),
                      StatusBadge.jsx, ReactionBar.jsx, FlagButton.jsx
    ui/            -- generic, content-agnostic (Button, Modal, FAB)
  features/
    feed/          -- useFeed.js + feedApi.js — the decoupled feed-fetching seam (Redis-swap point later)
    deathAnnouncement/  -- Form, schema, and lifecycle-status config for this type only
    auth/           -- AuthContext, ProtectedRoute, ProfileCompletion (mandatory onboarding)
  lib/
    supabaseClient.js
  hooks/
    useReputation.js
  pages/
    FeedPage.jsx, PostDetailPage.jsx
```
- `features/feed/` is deliberately the smallest, most isolated folder — it's the seam that keeps a future Redis/dedicated feed service swap cheap.
- `components/ui/` must stay content-blind (no post/feature-specific logic) to avoid the tangled-mess problem from the previous build.

### Auth strategy
- Combine: offer Google login **and/or phone+OTP** (Supabase-native) for low-friction signup — phone+OTP likely fits Melapalayam's habits better than email.
- Mandatory one-time profile completion step right after first login (real name, phone, locality) before posting is allowed — this feeds the reputation/trust system regardless of which login method was used, and avoids relying on a Google display name as the "real" identity.

## Domain terminology protocol (locked)

Naming mistakes are expensive here because a name isn't just a label — it propagates into DB tables/columns, UI text, routes, and variable names all at once. Syed often describes a concept in his own words rather than the exact domain/community term, and previous work on another project showed Claude Code silently picking a name from the description that didn't match what domain experts/the community would actually call it, causing rework later. To prevent that in mbeat:

1. **Before creating any new page, report, table type, or field name from a description (not an explicit name Syed gave), state the proposed name and ask for confirmation** — do not silently pick a name and proceed.
2. **If a more standard/community term might exist for the concept, say so and propose it as an alternative**, rather than defaulting to Syed's phrasing or silently substituting a "better" term. Let Syed decide.
3. **Once a name is confirmed, it's locked.** Do not rename it later (DB columns/tables, UI labels, routes, variables) without an explicit rename instruction — and treat a rename as a deliberate refactor (flag what it touches: schema, RLS policies, components, etc.) rather than a casual correction.
4. **Glossary** — record confirmed terms here as they're locked in, so future sessions don't reopen settled naming:

| Working description | Confirmed term | Used in |
|---|---|---|
| Death notice / funeral post | Death Announcement (`type = 'death_announcement'`) | `posts.type`, folder `features/deathAnnouncement/` |
| Funeral prayer | Janazah | `janazah_datetime`, `janazah_location`, post title pattern |
| Who's posting on whose behalf | Announcer relation | `death_announcement.announcer_relation` |
| Pull/Search tab (shows people/entities with live status: available/busy/closed) | Find Now | Bottom nav tab label, `pages/FindNowPage.jsx` (future), `features/findNow/` (future) |

## Working style / preferences (for Claude Code to follow)
- Syed's background: ~10 years Google Apps Script, prior ASP.NET, Python as primary language, still learning React/modern web frameworks.
- Prefers Python where relevant; analogies are effective for learning new concepts.
- Prefers moderation in everything (also reflected in the product's design philosophy itself).
- Wants to genuinely understand the codebase this time — **narrate the plan before executing, explain what was built and why**, not just deliver a working diff.
- Step-by-step with confirmation at each stage; one file at a time when debugging.
- Muslim; appreciates Islamic-perspective framing where genuinely relevant to a design decision (not forced everywhere).
- Git workflow: feature branch → PR → merge to `develop`, branch cleanup after. Repo `mbeat`, public, on GitHub. Windows/PowerShell, VS Code, Python 3.14, Node.js v25 — repo cloned locally on whichever machine Syed is working from (path varies, he works across multiple systems).
- Idea management: new feature ideas go into GitHub Projects Icebox first.

## Progress log — repo/project skeleton (in progress)
- Old repo archived as `mbeat-v1-archive` (GitHub, renamed + archived); old local folder renamed to `mbeat-v1-archive-local`
- Fresh `mbeat` repo created (public), local folder re-initialized with clean git history, connected to `https://github.com/sssyed15081977/mbeat.git`
- Branch protection ruleset created; refined to target `main` only (PR-required) — `develop` left open for direct pushes to keep day-to-day scaffolding friction-free; full feature-branch → PR flow reserved for actual module work, not tooling setup
- `main` and `develop` branches created and pushed
- Vite + React scaffolded successfully; default starter CSS and unused scaffold assets (`App.css`, `react.svg`, `vite.svg`, `hero.png`) later removed once found still lingering
- Tailwind CSS v4 installed and configured CSS-first (`@import "tailwindcss"` + `@theme` block in `src/index.css`, not the old `tailwind.config.js` JS-based approach); verified working via a green/bold test render
- ESLint chosen as linter (over Oxlint)
- `vite-plugin-pwa` installed and configured in `vite.config.js` (manifest: name "mbeat", theme_color `#16a34a`, `display: standalone`, `registerType: autoUpdate`); placeholder PWA icons (green square, "M" mark, 192x192 + 512x512) generated and added to `public/`; `npm run build` verified working
- Folder structure created reflecting Post-based architecture (see above) — `components/posts/`, `components/ui/`, `features/feed/`, `features/deathAnnouncement/`, `features/auth/`, `lib/`, `hooks/`, `pages/` (folders exist but are still empty pending actual module work)
- Fresh Supabase project created (Postgres + Auth + Storage + Realtime, Singapore region — confirmed)
- `@supabase/supabase-js` installed; `src/lib/supabaseClient.js` created reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from env
- `.env` (gitignored, real credentials) + `.env.example` (committed, placeholder values) set up; anon key is in Supabase's newer `sb_publishable_...` key format
- Connection verified end-to-end with a throwaway smoke-test script calling `supabase.auth.getSession()` — confirmed reachable, not just "builds without error" (nothing imports `supabaseClient.js` yet, so a plain build wouldn't have caught a bad URL/key)
- All of the above committed to `develop` and pushed to `origin/develop` (through commit `7ce2d12`)

## Push vs Pull — a second core architectural split (locked)

Alongside the Feed (push — content published for others to discover), the app needs Search (pull — a user actively looking for help from a person or entity). These are treated as two distinct, parallel systems from the schema level up, not one forced into the other.

### Full-text search on `posts` (locked, applies starting with the first table)
- Every post type carries a generic `title text` + `description text` in the base `posts` table, alongside its type-specific structured fields. Structured fields (e.g. `janazah_datetime`, `janazah_location`) drive app logic (display, filtering, sorting); `title`/`description` exist so posts can be searched consistently regardless of type.
- `search_vector` is a `GENERATED ALWAYS AS ... STORED` tsvector column on `posts`, built from `title` + `description`, using the `'simple'` text search config (not `'english'`) — `'simple'` avoids English-specific stemming behaving oddly on mixed Tamil/Arabic/English content. Indexed with GIN.
- Applies to `profiles` and `entities` too (see below) — same pattern, own `search_vector` column each.

### People & Entities — NOT derived from `posts` (locked)
Doctors, tutors, and other individuals, plus entities like clinics, schools, pharmacies, are conceptually a **directory** (Yellow Pages — searched on demand, persistent, no lifecycle/expiry), not a **feed** (newspaper — pushed, event-like, lifecycle-driven). Forcing them into the `posts` table would give every profile a meaningless `lifecycle_status` and pollute the chronological feed. They get their own tables instead:

- **`profiles`** — 1:1 with `auth.users`, opt-in. Holds `profession`, `bio`, `status` (`available`/`busy`/`unavailable`), `moderation_status`, and its own `search_vector`.
- **`entities`** — clinics, schools, pharmacies, etc. Holds `name`, `category`, `description`, `address`, `lat`/`lng`, `moderation_status`, `search_vector`.
- **`entity_members`** — many-to-many join (`entity_id`, `user_id`, `role`) — lets one user (e.g. a doctor) be associated with more than one entity (his clinic, a pharmacy), and lets search cross-reference: searching "doctor" hits `profiles`, searching a clinic name hits `entities`, and `entity_members` links the two in results.

### Shared comment engine (locked)
Rather than making `profiles`/`entities` pretend to be posts just to be commentable, a single polymorphic `comments` table serves all three:

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  body text not null,
  commentable_type text not null check (commentable_type in ('post', 'profile', 'entity')),
  commentable_id uuid not null,
  created_at timestamptz not null default now()
);
create index comments_commentable_idx on comments (commentable_type, commentable_id);
```

Reactions could follow the same polymorphic pattern later if profile endorsements are wanted (conceptually closer to *tazkiyah* / trustworthy testimony than a generic star rating — worth keeping in mind when reactions-on-profiles are actually designed).

### UI placement (locked)
Feed-style UIs don't have a natural home for search/pull results — they're a different interaction (query in, filtered list out) from a continuous scroll. Pull gets its own primary navigation destination, not a search bar bolted onto the feed screen — mirrors the Feed/Search split seen in apps like Instagram or Twitter, and keeps the push/pull split visible at the navigation level, not just the database level.

- **Tab name: "Find Now"** (confirmed) — reflects that results show live status (available/busy/closed), not just static listings.
- Results use their own card design (`ProfileCard`, `EntityCard`) — not reused `PostCard`s — since a directory listing (status badge, quick-action, category) is a different shape from a feed post (timestamp-driven, lifecycle-driven).
- Suggested folder additions (future, not built yet):
```
components/
  findNow/       -- ProfileCard.jsx, EntityCard.jsx
features/
  findNow/       -- useFindNow.js (pull-side sibling to useFeed.js)
pages/
  FindNowPage.jsx
```

### Volunteer / capability model — amendment to `profiles` (locked)
Earlier draft gave `profiles` a single `profession text` field — too narrow. A person can hold multiple roles at once (e.g. a doctor who is *also* a blood donor and a general community-service volunteer), and role-specific data (like a blood donor's blood group) doesn't belong on a generic profile. This **replaces** the single-`profession` idea with a multi-role model, following the same base + type-specific-extension pattern already used for `posts`:

```sql
-- One row per role a person takes on — a person can have several
create table volunteer_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  role_type text not null check (role_type in ('doctor', 'blood_donor', 'community_service', 'tutor')),
  status text default 'available' check (status in ('available', 'busy', 'unavailable')),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','published','flagged','hidden')),
  created_at timestamptz not null default now(),
  unique (user_id, role_type)
);

-- Role-specific structured fields, e.g. for blood donors
create table blood_donor_role (
  role_id uuid primary key references volunteer_roles(id) on delete cascade,
  blood_group text check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  last_donation_date date
);

-- Append-only contribution ledger, with a confirmation/trust mechanism
create table service_history (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references volunteer_roles(id),
  related_post_id uuid references posts(id),   -- optional: links to the blood_request post this fulfilled

  source text not null default 'self_reported'
    check (source in ('self_reported', 'org_confirmed')),
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,

  performed_at timestamptz not null default now(),
  logged_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
```

- **Who can log a `service_history` entry (decided): either the donor (self-reported) or the requester/org who received help — but org-confirmed entries carry more trust weight.** A self-reported entry starts with `source = 'self_reported'`; if later confirmed by the requester/org, the *same row* is updated (`source` → `'org_confirmed'`, `confirmed_by`/`confirmed_at` set) rather than creating a duplicate — one real-world event stays one row, with an upgradeable trust level.
- Actual reputation-score weighting logic (how much more an `org_confirmed` entry counts) is deferred to when the reputation system itself is built — this only locks the data model needed to support that later.
- Extends cleanly to future role types (`community_service`, `tutor`, etc.) the same low-cost way new post types are added: new `role_type` value + optional role-specific extension table if that type needs structured fields (a `community_service` role, for instance, might need no extension table at all if there's nothing beyond the generic role fields).

### Status quo
This whole section is a **locked plan for later** — Donor-Seeker Connect and Social Work are future modules. Nothing here has been created in Supabase yet. Only the `posts.search_vector` pattern is relevant to current work, since it applies starting with the death announcement table already being built.

## Database choice: Postgres/Supabase confirmed, NoSQL rejected (locked)

Considered switching to NoSQL given many post/profile/entity types are planned over time — decided **against** it, staying on Postgres/Supabase.

**Reasoning:**
- "Many types" ≠ "unpredictable structure." Every new post type is deliberately designed by Syed with a known, fixed field set, module by module — a relational pattern, not a schemaless one.
- Adding a new post type under the current design is low-cost and non-disruptive: add one value to the `type` CHECK list + create one small extension table (like `death_announcement`). Doesn't touch the base `posts` table or existing types.
- Switching to NoSQL would undo several already-locked, working decisions: RLS as the security layer (no clean NoSQL equivalent in Supabase), foreign key integrity (`lifecycle_status_history.post_id`, `entity_members`, `comments.commentable_id`), the `tsvector`/GIN full-text search already built, and Supabase Realtime (Postgres-native) — likely forcing a second full platform rebuild right after just completing one.
- **Escape hatch if per-type flexibility is ever genuinely needed**: a `type_data jsonb` column on `posts` for low-stakes/rarely-queried types, while types needing indexed structured fields (like `janazah_datetime`) keep their own proper extension table. Postgres supports both without abandoning the relational model.

## Progress log — first migration: posts + death_announcement schema (done)
- Work done on feature branch `feature/death-announcement-schema` (off `develop`), per the module-work branching rule.
- `supabase init` run locally — created `supabase/config.toml` and `supabase/migrations/`. CLI authenticated via `supabase login`; project linked via `supabase link --project-ref slalnatjabrcnjxngqoo`.
- First migration written and pushed: `supabase/migrations/20260811083220_create_posts_death_announcement_schema.sql`, creating three tables:
  - **`posts`** (base table) — `id`, `type` (checked enum), `author_id`, `title`, `description`, `moderation_status` (checked enum, default `pending`), `lifecycle_status` + `lifecycle_updated_at`, generated `search_vector` (`'simple'` config, GIN-indexed), `created_at`/`updated_at`. Indexes on `type` and `moderation_status`.
  - **`death_announcement`** (extension table, 1:1 via `post_id`) — `deceased_name` (not null), `deceased_age`, `deceased_gender` (checked `male`/`female`, nullable), `announcer_relation`, `janazah_datetime`, `janazah_location`, `burial_location` (nullable — UI treats null as same as `janazah_location`), `photo_url`.
  - **`lifecycle_status_history`** (shared audit table) — `post_id`, `old_status`, `new_status`, `changed_by`, `changed_at`. Indexed on `post_id`.
- **RLS enabled on all three tables, but no policies written yet** — this is a deliberate safe default (locks tables to service-role-only access for now), not an oversight. Policy design is real remaining work before the app can read/write these tables from the client.
- Verified via `supabase migration list` — local and remote migration timestamps match.
- Not yet done: RLS policies, the `deathAnnouncement` form/schema/UI in `features/deathAnnouncement/`, `useFeed()`, wiring lifecycle transitions to write `lifecycle_status_history` rows.

## Progress log — RLS policies for posts / death_announcement / lifecycle_status_history (done)
- Work done on feature branch `feature/posts-rls-policies` (off `develop`), PR #2, merged and branch cleaned up (local + remote).
- Decisions locked in (no reputation/verified-announcer system yet, so this stays conservative):
  - **Published posts are publicly readable, including by anonymous (unauthenticated) visitors** — supports the WhatsApp share-link growth loop (someone clicking a shared link shouldn't be forced to log in first).
  - **Moderation (`pending` → `published`/`flagged`/`hidden`) happens only via `service_role`** (Syed, through the Supabase dashboard or a service-role script) — no admin/moderator concept exists in RLS yet, deliberately, until the reputation system is designed.
  - **Authors can edit their own post's content and `lifecycle_status`**, but not `moderation_status` or `author_id` — enforced by a `security definer` trigger (`posts_protect_moderation_columns`) that silently reverts those two columns for any non-`service_role` update, since RLS's `WITH CHECK` can't see the pre-update row to distinguish "unchanged" from "reset by an attacker."
- New migration: `supabase/migrations/20260811165539_add_posts_rls_policies.sql`, applied to the remote Supabase project (`npx supabase db push`, verified via `migration list`). Contents:
  - `posts`: SELECT (published-or-own), INSERT (own, forced `pending`), UPDATE (own) policies; `posts_protect_moderation_columns` trigger (locks `moderation_status`/`author_id`); `posts_log_lifecycle_change` trigger — auto-appends to `lifecycle_status_history` and stamps `lifecycle_updated_at` whenever `lifecycle_status` changes (this pulls forward part of the "wire lifecycle transitions" work noted as not-yet-done in the previous log entry, since it's the same UPDATE path authors now use).
  - `death_announcement`: SELECT/INSERT/UPDATE policies mirror the parent `posts` row via an `exists` join on `post_id` (1:1 extension, same visibility/ownership rules).
  - `lifecycle_status_history`: SELECT policy only (readable by anyone who can read the parent post) — **deliberately no INSERT/UPDATE/DELETE policy for `authenticated`/`anon`**, so the only writer is the `security definer` trigger; keeps it a true append-only audit log, not just append-only by convention.
- Local dev machine needed `npx supabase login` (device-auth, browser) and `npx supabase link --project-ref slalnatjabrcnjxngqoo` re-run — the CLI link state lives in `supabase/.temp/` (gitignored, per-machine), so a fresh clone/machine always needs re-linking before `db push`/`migration list` work. Same applies to `gh` CLI auth (`gh auth login --web`, device code) for PR creation from a new machine.
- **RLS policies tested against the live project — all 21 cases passed.** Ran as a one-off Node script (REST API calls, not SQL Editor role-spoofing) against `mbeat-prod`: created two real throwaway users via the GoTrue admin API (needed since `posts.author_id` etc. have FK constraints into `auth.users`), signed in as each to get real JWTs, then exercised `posts` / `death_announcement` / `lifecycle_status_history` through PostgREST as anon, as each authenticated user, and as `service_role`. Covered: own-post insert forced to `pending`; spoofed `author_id` rejected; self-publish-on-insert rejected; anon/other-user blocked from pending posts; non-author update affects 0 rows; `service_role` can publish; anon sees published posts; author edits to `moderation_status`/`author_id` are silently reverted by the trigger (not errored); `lifecycle_status` edits succeed and auto-log to `lifecycle_status_history` with `lifecycle_updated_at` stamped; direct client inserts into `lifecycle_status_history` are blocked; `death_announcement` visibility/ownership mirrors the parent post; no delete policy exists for any client role. All test users, posts, and rows were deleted afterward and verified empty — no residue left in `mbeat-prod`.

## Immediate next step
Start the `features/deathAnnouncement/` form + schema that writes into this now-verified schema (title/description + `deceased_name`, `janazah_datetime`, `janazah_location`, etc., landing as a `pending` post per the tested insert policy).

## Notes for whoever picks this up next
- Working in this session: branch `develop` (RLS policy work was on `feature/posts-rls-policies`, now merged and deleted), repo cloned at whichever machine's local path (see multi-system note above) — always confirm current branch before assuming `main`.
- A fresh machine/clone needs `npx supabase login` + `npx supabase link --project-ref slalnatjabrcnjxngqoo` before any `supabase db push`/`migration list` command works, and `gh auth login --web` before `gh pr create` works — neither credential persists in the repo (both are gitignored/local-machine state).
- Before trusting this doc's "already done" claims, spot-check the actual repo state (folders can exist but be empty, files can exist but be wrong — e.g. we once found `VITE_SUPABASE_URL` had `/rest/v1/` wrongly appended) rather than assuming the doc is authoritative.
- Syed prefers step-by-step confirmation before executing, narrated plans, and one file at a time when debugging — see "Working style / preferences" above.