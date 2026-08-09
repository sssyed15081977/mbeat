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

## Immediate next step
Design the death-announcement Post schema in detail — starting with the base `posts` table (shared columns: `type` enum, moderation status, lifecycle status + `lifecycle_updated_at`, author, timestamps), then `death_announcement`-specific fields (`janazah_datetime`, `janazah_location`, etc.), then the lifecycle status states (`upcoming_janazah` → `janazah_in_progress` → `completed`) and the `lifecycle_status_history` audit table. Nothing has been created in Supabase yet (no tables/migrations) — this is schema design + first migration from scratch.

## Notes for whoever picks this up next
- Working in this session: `develop` branch, repo cloned at whichever machine's local path (see multi-system note above) — always confirm current branch before assuming `main`.
- Before trusting this doc's "already done" claims, spot-check the actual repo state (folders can exist but be empty, files can exist but be wrong — e.g. we once found `VITE_SUPABASE_URL` had `/rest/v1/` wrongly appended) rather than assuming the doc is authoritative.
- Syed prefers step-by-step confirmation before executing, narrated plans, and one file at a time when debugging — see "Working style / preferences" above.