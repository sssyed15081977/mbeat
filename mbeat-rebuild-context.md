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
- Git workflow: feature branch → PR → merge to `develop`, branch cleanup after. Repo `mbeat`, public, on GitHub. Windows/PowerShell, VS Code, Python 3.14, Node.js v25, project at `C:\Projects\mbeat`.
- Idea management: new feature ideas go into GitHub Projects Icebox first.

## Immediate next step
Set up the fresh repo/project skeleton (new or reset `mbeat` repo, Vite + React + Tailwind v4 PWA scaffold, fresh Supabase project/schema baseline) before designing the death-announcement Post schema in detail.
