# Spec: Prayer Times v1

**Status:** Draft — awaiting Syed's review
**Branch:** `feature/prayer-times`
**Design rationale:** [mbeat-rebuild-context.md → "Prayer Times — design settled"](../mbeat-rebuild-context.md)
**Schema:** [20260925023357_create_prayer_times_schema.sql](../supabase/migrations/20260925023357_create_prayer_times_schema.sql)

This file says **what v1 must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

Give Melapalayam residents a **daily** reason to open mbeat: the current **jamaat times** of the masjids they pray at, which today only live on notice boards. The times are kept current by a masjid volunteer in a few taps.

**Only jamaat times, no adhan times.** People already know the adhan by hearing it, and the adhan time written on a board can be a few minutes off. Jamaat is the one time only the masjid sets and the one a resident acts on.

**Pilot scope:** the 3 masjids Syed maintains himself, with Syed as their volunteer.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see today's jamaat times for my masjids at a glance | I know when to leave for salah |
| U2 | Resident | see which jamaat is next | I don't have to work it out from a list |
| U3 | Resident | see how recently the times were checked | I know whether to trust them |
| U4 | Resident | pin the masjids I pray at ("My masjids") | they show first without searching |
| U5 | Masjid volunteer | change only the times that changed on the board | updating takes seconds, not minutes |
| U6 | Masjid volunteer | confirm "board unchanged" in one tap | freshness stays current when nothing moved |
| U7 | Syed (admin) | add masjids, their times and their volunteers from the Supabase dashboard | no admin UI has to be built for the pilot |

## 3. Acceptance criteria

v1 is done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Viewing (residents)
- [ ] **AC1** The Prayer Times tab lists "My masjids" first, then the other published masjids.
- [ ] **AC2** Each masjid in the list shows its name, the **next jamaat** (prayer name + time) and its freshness.
- [ ] **AC3** "Next jamaat" is worked out in **Asia/Kolkata** time, not the device's time zone. After Isha jamaat has passed, it shows tomorrow's Fajr.
- [ ] **AC4** On Fridays, Jumu'ah replaces Dhuhr as the next and highlighted prayer. On other days Jumu'ah is not shown in "next jamaat".
- [ ] **AC5** The masjid detail page lists the jamaat time for every prayer (Fajr → Isha, then Jumu'ah). The next jamaat is highlighted. No adhan times appear anywhere.
- [ ] **AC6** Freshness reads "Confirmed today", "Confirmed yesterday" or "Confirmed N days ago", from `masjid.times_confirmed_at`.
- [ ] **AC7** Once times are **more than 7 days** old, freshness shows as a warning ("Times may be out of date"). When `times_confirmed_at` is null, it reads "Not yet confirmed".
- [ ] **AC8** A resident can pin or unpin a masjid from the list and from the detail page. The change shows **optimistically** (no spinner) and rolls back if the write fails.
- [ ] **AC9** A masjid with no row for a prayer simply omits that prayer, whether it's Jumu'ah or a daily prayer. It is never shown as an error.

### Updating (masjid volunteers)
- [ ] **AC10** The "Update times" button appears on the detail page **only** for that masjid's volunteers (checked via `entity_members`).
- [ ] **AC11** The update screen opens **pre-filled** with the current jamaat time for each prayer.
- [ ] **AC12** Saving writes **only the prayers that changed**. Unchanged prayers are not written, so they don't create history rows.
- [ ] **AC13** Saving any change updates the freshness to "Confirmed today". The trigger does this; the client never sends `times_confirmed_at`.
- [ ] **AC14** "Board unchanged" is one tap, needs no confirmation dialog, and updates the freshness to "Confirmed today".
- [ ] **AC15** Every saved change appears as a new row in `masjid_prayer_times_history` (check this in the dashboard).
- [ ] **AC16** A non-volunteer who opens `/masjid/:id/update` directly sees a plain "You can't update this masjid's times" message and can't save. RLS enforces this too.

### Navigation and access
- [ ] **AC21** A bottom nav shows three tabs in this order: **Prayer Times · Feed · Find Now**. The current tab is visibly marked.
- [ ] **AC22** The Find Now tab carries a "Coming soon" badge. Tapping it shows a short "Coming soon" message and doesn't navigate anywhere.
- [ ] **AC23** Opening the app lands on Prayer Times, both from the home-screen PWA icon and from the bare URL.
- [ ] **AC24** Guests (not signed in) can use the Prayer Times tab and the masjid detail page. The pin toggle, the Feed tab and the update page ask a guest to sign in instead.
- [ ] **AC25** After signing in from one of those prompts, the user returns to the page they were on, not to a default page.

### Cross-cutting (standing requirements)
- [ ] **AC17** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`.
- [ ] **AC18** Both non-root pages (`/masjid/:id`, `/masjid/:id/update`) render a `BackButton`.
- [ ] **AC19** Every screen handles loading (with a skeleton), empty, error (plain-language message + retry) and offline.
- [ ] **AC20** Touch targets are comfortable and the update form isn't covered by the mobile keyboard.

## 4. Screens

### 4.1 Prayer Times tab — `/` (`/prayer-times` redirects here)
- **Content:** a "My masjids" section, then an "All masjids" section. Each row shows the masjid name, next jamaat, freshness, and a pin toggle. Tapping a row opens the detail page.
- **Empty "My masjids":** a one-line hint ("Pin the masjids you pray at") above the full list.
- **No masjids at all:** "No masjids added yet."
- **Loading:** skeleton rows (reuse `components/ui/Skeleton.jsx`).
- **Error:** "Couldn't load prayer times — try again" with a retry button.

### 4.2 Masjid detail — `/masjid/:id`
- **Content:** a `BackButton` (to `/`), the masjid name and address, the freshness line, the pin toggle, then a list of prayers with their jamaat times ("Fajr · 5:15 AM"), the next one highlighted.
- **"Update times" button:** only for volunteers (AC10), placed within thumb reach.
- **Not found / not published:** "This masjid isn't available" with a back link.

### 4.3 Volunteer update — `/masjid/:id/update`
- **Content:** a `BackButton` (to `/masjid/:id`), then one time input per prayer, pre-filled with its current jamaat time.
- **Primary action:** **Save changes**, disabled until something changes.
- **Secondary action:** **Board unchanged**, always enabled.
- **After either action:** return to the detail page with the freshness updated.
- **No permission:** see AC16.
- **Save error:** keep the volunteer's edits and show "Couldn't save — try again".

### 4.4 Tamil labels — ⚠ draft, awaiting Syed's check

The spellings follow what the app already uses for Islamic terms (ஜனாஸா, தொழுகை): Arabic terms in Tamil script. Where local usage differs, change the Tamil column, not the English key.

| English | Tamil (proposed) | Alternatives to consider |
|---|---|---|
| Prayer Times (tab) | தொழுகை நேரங்கள் | |
| Feed (tab) | ஃபீட் | matches the existing `feed.loadError` |
| Find Now (tab) | தேடல் | இப்போது தேடு |
| Coming soon | விரைவில் | |
| Masjid | பள்ளிவாசல் | மஸ்ஜித் |
| My masjids | எனது பள்ளிவாசல்கள் | |
| All masjids | அனைத்துப் பள்ளிவாசல்கள் | |
| Jamaat | ஜமாஅத் | ஜமாத் |
| Next jamaat | அடுத்த ஜமாஅத் | |
| Fajr | ஃபஜ்ர் | சுப்ஹு |
| Dhuhr | லுஹர் | ளுஹர் |
| Asr | அஸர் | அஸ்ர் |
| Maghrib | மஃரிப் | மக்ரிப் |
| Isha | இஷா | |
| Jumu'ah | ஜும்ஆ | ஜுமுஆ |
| Confirmed today | இன்று உறுதிசெய்யப்பட்டது | |
| Confirmed yesterday | நேற்று உறுதிசெய்யப்பட்டது | |
| Confirmed N days ago | {{count}} நாட்களுக்கு முன் உறுதிசெய்யப்பட்டது | |
| Not yet confirmed | இன்னும் உறுதிசெய்யப்படவில்லை | |
| Times may be out of date | நேரங்கள் பழையதாக இருக்கலாம் | |
| Pin the masjids you pray at | நீங்கள் தொழும் பள்ளிவாசல்களைப் பின் செய்யவும் | |
| Sign in to pin masjids | பள்ளிவாசல்களைப் பின் செய்ய உள்நுழையவும் | |
| Update times | நேரங்களைப் புதுப்பிக்கவும் | |
| Save changes | மாற்றங்களைச் சேமிக்கவும் | |
| Board unchanged | அறிவிப்புப் பலகையில் மாற்றமில்லை | |

## 5. Data

All tables, triggers and RLS policies are in the migration linked above. `masjid_prayer_times` holds one row per masjid per prayer, with a single `jamaat_time`. Client-side rules:
- **Read path:** `entities` (published, `category = 'masjid'`) → `masjid` → `masjid_prayer_times`. `saved_entities` holds the user's pins, and `entity_members` holds the user's own volunteer roles.
- **Write paths:**
  - Pins are an insert or delete on `saved_entities`.
  - Changed prayers are an update or insert on `masjid_prayer_times`.
  - "Board unchanged" is `update masjid set times_confirmed_at = now()`, which the trigger overwrites with the server's values anyway.
- **Keep the data access out of the page components:** it goes in a single `features/prayerTimes/prayerTimesApi.js`, following the same pattern as `features/feed/feedApi.js`.

## 6. Out of scope for v1

- Adhan times, whether stored or shown (decided 2026-09-26; see §1).
- Admin UI for adding masjids or volunteers (it's done from the dashboard, per U7).
- Astronomical or calculated times; automatic sunrise/sunset rules.
- User confirmations ("✓ time was right" / "⚠ time changed") and alerts to volunteers.
- Reading times from a photo of the notice board.
- Linking a death announcement's janazah time to a masjid's jamaat time.
- Map, distance or search across masjids. That's Find Now's job, and with 3 masjids a list is enough.
- Push notifications or reminders.
- Deleting a prayer row from the app. The migration has no delete policy, so it's done from the dashboard.

## 7. Decisions and open questions

### Decided (2026-09-26)
1. **Bottom nav:** Prayer Times, Feed, and Find Now shown as "Coming soon" (AC21–AC22).
2. **Guests can view prayer times without signing in** (AC24). Pinning and volunteer updates still need an account.
3. **Tamil labels:** drafted by Claude in §4.4; Syed verifies them before T9.
4. **The freshness warning stays at 7 days** (AC7).
5. **The app lands on Prayer Times** (AC23).
6. **Route rename for the landing change** (confirmed):
   - `/` shows Prayer Times.
   - Feed moves from `/` to `/feed`.
   - `/prayer-times` redirects to `/`.
   - Everything that currently navigates to `/` for the Feed (the login redirect, the page after posting a death announcement) moves to `/feed`.

   This was chosen over only changing the PWA's start URL, which would still land browser visitors on Feed.

### Open
1. **Tamil labels in §4.4**, waiting for Syed's check (blocks T9).

## 8. Task checklist

Work top to bottom; each task is small enough for one sitting.

- [x] T1 Review this spec; resolve the open questions in §7. *(Done except the Tamil label check.)*
- [ ] T2 Commit the migration + naming-table updates; `supabase db push`.
- [ ] T3 Seed the pilot data from the dashboard: 3 masjids (entities + masjid rows), their jamaat times, and Syed as `masjid_volunteer`.
- [ ] T4 `prayerTimesApi.js` + pure helpers (next jamaat in Asia/Kolkata, freshness label).
- [ ] T5 Routing + bottom nav: guest-accessible Prayer Times and masjid routes, the landing route rename (§7 decision 6), the Find Now "Coming soon" tab, and returning to the same page after sign-in.
- [ ] T6 Prayer Times tab (4.1), incl. optimistic pinning.
- [ ] T7 Masjid detail page (4.2).
- [ ] T8 Volunteer update page (4.3).
- [ ] T9 i18n pass: every key in `en.json` + `ta.json`.
- [ ] T10 Walk through AC1–AC25 on a phone in both languages; tick the boxes above.
- [ ] T11 PR `feature/prayer-times` → `develop`, with the PR description linking this spec.
