# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

mbeat (MPM Helpline) — a free community-service PWA for Melapalayam, Tirunelveli, Tamil Nadu (~200,000 people). Consolidates fragmented WhatsApp-group civic info (death announcements, blood requests, jobs, etc.) into one app. This is a from-scratch **rebuild** of a prior flat/CRUD version, now using a **Post-based, social-feed architecture**.

Full design rationale, locked architectural decisions, and progress log live in [mbeat-rebuild-context.md](mbeat-rebuild-context.md) at the repo root — read it before making schema, naming, or folder-structure decisions. That file is the source of truth for *why* things are built the way they are; this file is the quick-start for *how* to work in the repo day to day.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview a production build locally
npm run lint      # ESLint over the whole repo
```

No test runner is configured yet.

## Stack

React 19 + Vite (PWA via `vite-plugin-pwa`) → Supabase (Postgres + Auth + Storage + Realtime, Singapore region) → FastAPI (Phase 3+, smart feed ranking) → Anthropic API (Phase 3+). Styling is Tailwind CSS v4, configured CSS-first via `@import "tailwindcss"` + `@theme` in `src/index.css` (not a JS `tailwind.config.js`).

Supabase client lives at `src/lib/supabaseClient.js`, reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from env (`.env`, gitignored; `.env.example` has placeholders).

i18n is `react-i18next`, configured at `src/lib/i18n/` (`en.json`/`ta.json` resource files, `setLanguage()` helper). The switcher is `components/ui/LanguageToggle.jsx` — reuse it, don't rebuild it. Preference persists to `localStorage` for guests and to `profiles.preferred_language` once signed in (synced in `AuthContext`/`ProfileCompletion`). See "Every page is mobile-first and bilingual" below — this setup is mandatory for all new UI, not just the login/feed screens it started on.

## Architecture

The codebase is still an early scaffold (only `App.jsx`, `main.jsx`, `index.css`, `lib/supabaseClient.js` exist so far), but the structure and its rationale are locked. Organize by **function**, not by old per-module names — every post type flows through one shared feed engine, one `useFeed()` hook, one reaction/flag/reputation system.

```
src/
  components/
    posts/        -- PostCard.jsx (generic shell), PostCard.<type>.jsx (type-specific rendering),
                      StatusBadge.jsx, ReactionBar.jsx, FlagButton.jsx
    ui/            -- generic, content-agnostic (Button, Modal, FAB) — must stay content-blind
  features/
    feed/          -- useFeed.js + feedApi.js — the decoupled feed-fetching seam
    deathAnnouncement/  -- form, schema, lifecycle-status config for this post type only
    auth/           -- AuthContext, ProtectedRoute, ProfileCompletion (mandatory onboarding)
  lib/
    supabaseClient.js
  hooks/
    useReputation.js
  pages/
    FeedPage.jsx, PostDetailPage.jsx
```

Each post type gets its own subfolder under `features/`. `features/feed/` is deliberately the smallest, most isolated folder — it's the seam that keeps a future Redis/dedicated feed service swap cheap.

### Two parallel systems: Feed (push) vs Find Now (pull)

- **Feed** — content published for others to discover (`posts` table, chronological + lifecycle-aware ranking).
- **Find Now** — a user actively searching for a person/entity with live status (available/busy/closed). Lives in `features/findNow/`, its own nav tab, its own card components (`ProfileCard`, `EntityCard`) — not `PostCard`.

These are treated as distinct from the schema level up; do not force one into the other's shape.

### Data model (Supabase/Postgres, no tables created yet)

- Single unified `posts` table with a `type` enum (`blood_request`, `death_announcement`, `job`, `dua`, `fundraiser`, `discussion`, ...) rather than one table per module. Each type gets its own small extension table (e.g. `death_announcement`) for type-specific fields.
- Every post type is **status-showable** on two independent axes, updated by different people:
  - `moderation_status` (`pending | published | flagged | hidden`) — trust/spam, driven by reviewers/community flags.
  - `lifecycle_status` (text, vocabulary is type-specific) — the real-world event's progress, updated by the author/verified announcer, e.g. death announcement: `upcoming_janazah` → `janazah_in_progress` → `completed`. Tracked with `lifecycle_updated_at` + an audit table `lifecycle_status_history`.
- `posts`, `profiles`, and `entities` each carry a generated `search_vector` tsvector column (from `title`/`description`, `'simple'` text search config — deliberately not `'english'`, to avoid mis-stemming mixed Tamil/Arabic/English content), GIN-indexed.
- People/entities (doctors, clinics, schools, pharmacies) are a **directory**, not a feed — they live in `profiles` (1:1 with `auth.users`) and `entities`, joined via `entity_members`, not folded into `posts`.
- Comments are polymorphic across posts/profiles/entities via one `comments` table (`commentable_type`, `commentable_id`).
- NoSQL was considered and rejected — every post type has a known, fixed field set; RLS, FK integrity, tsvector search, and Realtime are all Postgres-native and already load-bearing. Escape hatch if ever needed: a `type_data jsonb` column on `posts` for low-stakes types, alongside proper extension tables for indexed/structured types.

### Moderation / trust model

Every post type uses a constrained form (no generic free-text post type), which prevents most spam before moderation logic runs. New/unverified users' posts go to a review queue; a good track record earns auto-publish. Community flags/downvotes can push a post back to review. Real names are required to post (no anonymous posts).

## Naming protocol (locked — follow this exactly)

Names propagate into DB tables/columns, UI text, routes, and variables all at once, so getting one wrong is expensive to unwind. Before creating any new page, table, type, or field name **from a description** (i.e. not an explicit name the user gave):

1. State the proposed name and ask for confirmation — never silently pick one and proceed.
2. If a more standard/community term might exist for the concept, say so and offer it as an alternative rather than defaulting to the user's phrasing or silently substituting your own.
3. Once confirmed, the name is locked — do not rename later (schema, UI, routes, variables) without an explicit rename instruction, and treat any rename as a deliberate refactor (flag everything it touches: schema, RLS policies, components).
4. Confirmed terms so far:

| Working description | Confirmed term | Used in |
|---|---|---|
| Death notice / funeral post | Death Announcement (`type = 'death_announcement'`) | `posts.type`, folder `features/deathAnnouncement/` |
| Funeral prayer | Janazah | `janazah_datetime`, `janazah_location`, post title pattern |
| Who's posting on whose behalf | Announcer relation | `death_announcement.announcer_relation` |
| Pull/Search tab | Find Now | Bottom nav tab label, `pages/FindNowPage.jsx` (future), `features/findNow/` (future) |
| Death announcement lifecycle stages | `upcoming_janazah` → `janazah_in_progress` → `completed` | `posts.lifecycle_status` (when `type = 'death_announcement'`), `features/deathAnnouncement/lifecycleStatus.js` |

Keep this table in sync with [mbeat-rebuild-context.md](mbeat-rebuild-context.md) as new terms get locked.

## UI/UX guidelines

mbeat uses a social-feed *architecture* but its content is civic-utility, not entertainment (death announcements, blood requests, jobs) — borrow interaction patterns from Instagram/TikTok/Pinterest/WhatsApp selectively, filtered through "does this make sense on a death announcement or blood request," not wholesale. No cloning of another platform's branding or exact layout.

**Core philosophy**
- Content first, interface second; minimize decisions the user has to make per screen.
- Prefer direct manipulation over multi-step navigation; avoid dialogs/confirmation screens/intermediate pages unless the action is destructive or hard to reverse.
- Progressive disclosure: primary actions visible, secondary actions behind `•••` / menus / bottom sheets.
- Every tap gives immediate visual feedback; prefer optimistic UI over spinners.
- A user should rarely need to ask "what am I supposed to do here?"

**Visual design**
- Strong hierarchy via whitespace, typography, and grouping — not by wrapping everything in a bordered card.
- Consistent spacing scale, corner radius, shadows, and component sizes — centralize as Tailwind `@theme` tokens in `src/index.css` rather than one-off values per component.
- Lightweight, not enterprise-dashboard-dense. Avoid decorative gradients/animations/shadows with no purpose.

**Mobile-first & touch**
- Design and check mobile widths first (this is already a standing requirement — see below). Thumb-reachable controls, bottom nav, bottom sheets for secondary actions.
- Comfortable touch targets, adequate spacing between interactive elements; never rely on top-corner-only placement for frequent actions.
- Respect safe areas, notches, and the mobile keyboard (composers/inputs shouldn't get covered).

**Navigation**
- Bottom nav is the primary nav pattern, but mbeat's tabs are **Feed** and **Find Now** (locked, see "Two parallel systems" above) plus whatever else gets confirmed through the naming protocol — do not default to a generic Home/Discover/Create/Messages/Profile layout without confirming names/scope first.
- User should always know: where they are, where they can go, how to get back, how to do the primary action for that screen.
- **Every non-root page (any screen reached by navigating forward — create/edit forms, detail views, settings) must render a `BackButton` (`components/ui/BackButton.jsx`) to a known destination.** This is a checklist item when building any new page, not just something to notice after the fact — it was missed once on the death-announcement form page and shouldn't recur.

**Post/feed interactions**
- Engagement affordances (reactions, save, share, comment) route through the shared `ReactionBar`/`FlagButton`/comment system — don't build type-specific versions.
- Match the affordance to the content: a like/heart pattern that suits a `discussion` or `fundraiser` post may be tone-deaf on a `death_announcement` or `blood_request` — check with the user before adding "social" mechanics (likes, follows) to a serious-content post type rather than assuming Instagram-style engagement applies uniformly across `posts.type`.
- Feed should read as continuous scroll, not isolated pages; opening a post's comments should feel like a layer over the feed (bottom sheet / detail overlay), not full navigation-away, where practical.

**Micro-interactions & states**
- Optimistic updates on reactions/saves; don't wait on the server round-trip to show the new state.
- Every component that fetches or mutates data needs to account for: loading, empty, error, offline, no-permission, no-results. Skeleton loaders over blank screens or bare spinners.
- Errors are actionable and in plain language ("Something went wrong — try again"), never raw status codes/stack traces, with a retry path that doesn't force navigating away.
- Keep animations short, smooth, purposeful; respect `prefers-reduced-motion`.

**Accessibility**
- Sufficient color contrast, visible focus states, semantic HTML, ARIA labels where native semantics fall short, screen-reader-friendly controls, readable text at larger font sizes.

**Explicitly not adopted from generic social-app UX playbooks:**
- No TikTok-style autoplay/infinite full-screen content consumption — mismatched for civic posts users are meant to act on (call, donate, attend), not passively consume.
- No follow/following graph unless a specific feature calls for it and the naming/scope has been confirmed.
- Bilingual support (see below) is not covered by generic UX guidance and stays a hard requirement layered on top of all of the above — a beautiful screen that skipped `useTranslation()` isn't done.

## Working style

- Narrate the plan before executing; explain what was built and why — the user is deliberately building understanding of the codebase, not just collecting a working diff.
- Step-by-step with confirmation at each stage; one file at a time when debugging.
- Repo is cloned across multiple machines — never hardcode local paths.
- Git workflow: feature branch → PR → merge to `main` (protected, PR-required); `develop` is left open for direct pushes for day-to-day scaffolding. Reserve the full feature-branch flow for actual module work.
- **Keep each feature branch scoped to the work its name describes — do not let unrelated work accumulate on it.** This was violated once: `feature/auth-google-login` picked up the feed engine and death-announcement form/UI work partway through, which meant unrelated scope had to be merged as one lump before the branch could close out. Before adding a commit, check whether the change actually belongs to the current branch's named scope; if it doesn't, say so and confirm switching to (or creating) the right branch first rather than committing it where you are. `develop` is the exception — it's explicitly the catch-all for day-to-day scaffolding, so this rule applies to `feature/*` branches, not to `develop` itself.
- New feature ideas go into GitHub Projects Icebox first, not straight into scope.
- **Every page is mobile-first and bilingual — standing requirement, not a per-task ask.** Most users are on phones, so build and check layouts at mobile widths first (desktop is a bonus, not the target). Every user-facing string goes through `react-i18next` (`useTranslation()` + a key in both `src/lib/i18n/locales/en.json` and `ta.json`) — never hardcode display text. Reuse `components/ui/LanguageToggle.jsx` and the existing `preferred_language` sync rather than rebuilding language handling per page.
- Reuse before writing: check for an existing component/hook/util that already does the job (or is close to it) before adding new code, and factor out shared logic when a second page needs what a first page already has, instead of copy-pasting.
