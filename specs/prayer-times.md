# Spec: Prayer Times v1

**Status:** v1 complete — all acceptance criteria passed (2026-09-30)
**Branch:** `feature/prayer-times`
**Design rationale:** [mbeat-rebuild-context.md → "Prayer Times — design settled"](../mbeat-rebuild-context.md)
**Schema:** [20260925023357_create_prayer_times_schema.sql](../supabase/migrations/20260925023357_create_prayer_times_schema.sql)

This file says **what v1 must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

Give Melapalayam residents a **daily** reason to open mbeat: the current **jamaat times** of the masjids they pray at, which today only live on notice boards. The times are kept current by a masjid volunteer in a few taps.

**Only jamaat times, no adhan times.** People already know the adhan by hearing it, and the adhan time written on a board can be a few minutes off. Jamaat is the one time only the masjid sets and the one a resident acts on.

**Pilot scope:** the 3 masjids Syed maintains himself, with Syed as their volunteer. Syed adds them through the app's "Add masjid" screen (§4.5), the same path later volunteers will use, instead of seeding them from the dashboard.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see today's jamaat times for my masjids at a glance | I know when to leave for salah |
| U2 | Resident | see which jamaat is next | I don't have to work it out from a list |
| U3 | Resident | see how recently the times were checked | I know whether to trust them |
| U4 | Resident | pin the masjids I pray at ("My masjids") | they show first without searching |
| U5 | Masjid volunteer | change only the times that changed on the board | updating takes seconds, not minutes |
| U6 | Masjid volunteer | confirm "board unchanged" in one tap | freshness stays current when nothing moved |
| U7 | Signed-in user | add a masjid that isn't listed yet, with its jamaat times, and become its volunteer | new masjids come from people who pray there, not only from Syed |
| U8 | Syed (admin) | review a newly added masjid before anyone else sees it | wrong or duplicate masjids never reach residents |

## 3. Acceptance criteria

v1 is done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Viewing (residents)
- [x] **AC1** The Prayer Times tab lists "My masjids" first, then the other published masjids.
- [x] **AC2** Each masjid in the list shows its name, the **next jamaat** (prayer name + time) and its freshness.
- [x] **AC3** "Next jamaat" is worked out in **Asia/Kolkata** time, not the device's time zone. After Isha jamaat has passed, it shows tomorrow's Fajr.
- [x] **AC4** On Fridays, Jumu'ah replaces Dhuhr as the next and highlighted prayer. On other days Jumu'ah is not shown in "next jamaat".
- [x] **AC5** The masjid detail page lists the jamaat time for every prayer (Fajr → Isha, then Jumu'ah). The next jamaat is highlighted. No adhan times appear anywhere.
- [x] **AC6** Freshness reads "Confirmed today", "Confirmed yesterday" or "Confirmed N days ago", from `masjid.times_confirmed_at`.
- [x] **AC7** Once times are **more than 7 days** old, freshness shows as a warning ("Times may be out of date"). When `times_confirmed_at` is null, it reads "Not yet confirmed".
- [x] **AC8** A resident can pin or unpin a masjid from the list and from the detail page. The change shows **optimistically** (no spinner) and rolls back if the write fails.
- [x] **AC9** A masjid with no row for a prayer simply omits that prayer, whether it's Jumu'ah or a daily prayer. It is never shown as an error.

### Updating (masjid volunteers)
- [x] **AC10** The "Update times" button appears on the detail page **only** for that masjid's volunteers (checked via `entity_members`).
- [x] **AC11** The update screen opens **pre-filled** with the current jamaat time for each prayer.
- [x] **AC12** Saving writes **only the prayers that changed**. Unchanged prayers are not written, so they don't create history rows.
- [x] **AC13** Saving any change updates the freshness to "Confirmed today". The trigger does this; the client never sends `times_confirmed_at`.
- [x] **AC14** "Board unchanged" is one tap, needs no confirmation dialog, and updates the freshness to "Confirmed today".
- [x] **AC15** Every saved change appears as a new row in `masjid_prayer_times_history` (check this in the dashboard).
- [x] **AC16** A non-volunteer who opens `/masjid/:id/update` directly sees a plain "You can't update this masjid's times" message and can't save. RLS enforces this too.

### Adding a masjid (signed-in users)
- [x] **AC26** The Prayer Times tab has an "Add masjid" button that opens `/masjid/new`. For guests it asks them to sign in instead (same pattern as AC24). The page is gated like `/post/new`: sign-in plus a completed profile.
- [x] **AC27** The form asks for the masjid's name (required), its address (optional) and a jamaat time for each prayer (Fajr → Isha, then Jumu'ah). Each time is optional; a prayer left blank simply gets no row (same as AC9).
- [x] **AC28** Saving creates, **in one step** (all or nothing): the `entities` row (`category = 'masjid'`, `moderation_status = 'pending'`), its `masjid` row, a `masjid_prayer_times` row per filled-in prayer, and an `entity_members` row making the creator its `masjid_volunteer`. The client can't choose the moderation status or make anyone else the volunteer.
- [x] **AC29** After saving, the user sees "Thanks — this masjid will appear once it's reviewed" and returns to the Prayer Times tab. The new masjid doesn't appear in anyone's list until Syed sets it to `published` from the dashboard.
- [x] **AC30** The jamaat-time inputs are the same component on this form and on the volunteer update screen (4.3), not two copies.
- [x] **AC31** Save error: the form keeps what was typed and shows "Couldn't save — try again".

### Navigation and access
- [x] **AC21** A bottom nav shows three tabs in this order: **Prayer Times · Feed · Find Now**. The current tab is visibly marked.
- [x] **AC22** The Find Now tab carries a "Coming soon" badge. Tapping it shows a short "Coming soon" message and doesn't navigate anywhere.
- [x] **AC23** Opening the app lands on Prayer Times, both from the home-screen PWA icon and from the bare URL.
- [x] **AC24** Guests (not signed in) can use the Prayer Times tab and the masjid detail page. The pin toggle, the Feed tab and the update page ask a guest to sign in instead.
- [x] **AC25** After signing in from one of those prompts, the user returns to the page they were on, not to a default page.

### Cross-cutting (standing requirements)
- [x] **AC17** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`.
- [x] **AC18** All non-root pages (`/masjid/:id`, `/masjid/:id/update`, `/masjid/new`) render a `BackButton`.
- [x] **AC19** Every screen handles loading (with a skeleton), empty, error (plain-language message + retry) and offline.
- [x] **AC20** Touch targets are comfortable and the update form isn't covered by the mobile keyboard.

## 4. Screens

### 4.1 Prayer Times tab — `/` (`/prayer-times` redirects here)
- **Content:** a "My masjids" section, then an "All masjids" section. Each row shows the masjid name, next jamaat, freshness, and a pin toggle. Tapping a row opens the detail page. An "Add masjid" button (AC26) sits below the list.
- **Empty "My masjids":** a one-line hint ("Pin the masjids you pray at") above the full list.
- **No masjids at all:** "No masjids added yet." with the "Add masjid" button.
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

### 4.4 Tamil labels — confirmed by Syed 2026-09-30

The spellings follow what the app already uses for Islamic terms (ஜனாஸா, தொழுகை): Arabic terms in Tamil script. The "Tamil" column is what ships; the alternatives were considered and not chosen. To change a label later, change the Tamil column, not the English key.

| English | Tamil | Alternatives considered |
|---|---|---|
| Prayer Times (tab) | தொழுகை நேரங்கள் | |
| Feed (tab) | பதிவுகள் | *Decided 2026-09-27: "post" is always பதிவு (verb: பதிவிடு), never இடுகை / ஃபீட்* |
| Find Now (tab) | தேடல் | இப்போது தேடு |
| Coming soon | விரைவில் | |
| Masjid | மஸ்ஜித் | *Decided 2026-09-27: மஸ்ஜித் everywhere, never பள்ளிவாசல்* |
| My masjids | எனது மஸ்ஜித்கள் | |
| All masjids | அனைத்து மஸ்ஜித்கள் | |
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
| Pin the masjids you pray at | நீங்கள் தொழும் மஸ்ஜித்களைப் பின் செய்யவும் | |
| Sign in to pin masjids | மஸ்ஜித்களைப் பின் செய்ய உள்நுழையவும் | |
| Update times | நேரங்களைப் புதுப்பிக்கவும் | |
| Save changes | மாற்றங்களைச் சேமிக்கவும் | |
| Board unchanged | அறிவிப்புப் பலகையில் மாற்றமில்லை | |
| Add masjid | மஸ்ஜிதைச் சேர்க்கவும் | |
| Masjid name | மஸ்ஜித் பெயர் | |
| Address | முகவரி | |
| Jamaat times (form heading) | ஜமாஅத் நேரங்கள் | |
| Adding… | சேர்க்கிறது… | |
| Done | முடிந்தது | |
| Thanks — this masjid will appear once it's reviewed | நன்றி — சரிபார்த்த பிறகு இந்த மஸ்ஜித் காட்டப்படும் | |
| No jamaat times yet | ஜமாஅத் நேரங்கள் இன்னும் சேர்க்கப்படவில்லை | *Added during T8* |
| tomorrow (after "Next jamaat") | நாளை | *Added during T8* |
| You're offline. Connect to the internet and try again. | இணைய இணைப்பு இல்லை. இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும். | *Added during T8* |
| This masjid isn't available. | இந்த மஸ்ஜித் கிடைக்கவில்லை. | *Added during T9* |
| Back to Prayer Times | தொழுகை நேரங்களுக்குத் திரும்பவும் | *Added during T9* |
| You can't update this masjid's times. | இந்த மஸ்ஜிதின் நேரங்களை நீங்கள் புதுப்பிக்க முடியாது. | *Added during T10* |

### 4.5 Add masjid — `/masjid/new` (`pages/NewMasjidPage.jsx`)
- **Content:** a `BackButton` (to `/`), a name input, an address input, then the same jamaat-time inputs as 4.3, all empty.
- **Primary action:** **Add masjid**, disabled until a name is entered.
- **After saving:** the form is replaced by the "will appear once it's reviewed" message (AC29) and a **Done** button that goes to `/`. (Decided 2026-09-27: shown in place rather than handed to the next page, so it works before the Prayer Times tab exists.)
- **Save error:** see AC31.

## 5. Data

All tables, triggers and RLS policies are in the migration linked above. `masjid_prayer_times` holds one row per masjid per prayer, with a single `jamaat_time`. Client-side rules:
- **Read path:** `entities` (published, `category = 'masjid'`) → `masjid` → `masjid_prayer_times`. `saved_entities` holds the user's pins, and `entity_members` holds the user's own volunteer roles.
- **Write paths:**
  - Pins are an insert or delete on `saved_entities`.
  - Changed prayers are an update or insert on `masjid_prayer_times`.
  - "Board unchanged" is `update masjid set times_confirmed_at = now()`, which the trigger overwrites with the server's values anyway.
  - Adding a masjid is **one call to a database function** (`rpc`), not four client-side inserts, because AC28 must be all-or-nothing. The function is `security definer`: it always sets `moderation_status = 'pending'` and makes `auth.uid()` the volunteer, whatever the client sends. It needs a **new migration**. The first migration's header says there's no client-side way to create a masjid; the new migration's header should say that this is now superseded. Function: `create_masjid(name, address, jamaat_times jsonb)` (name confirmed 2026-09-27).
  - Publishing a masjid stays a dashboard action (`entities.moderation_status = 'published'`). There's no client path to it.
- **Keep the data access out of the page components:** it goes in a single `features/prayerTimes/prayerTimesApi.js`, following the same pattern as `features/feed/feedApi.js`.

## 6. Out of scope for v1

- Adhan times, whether stored or shown (decided 2026-09-26; see §1).
- Admin UI for reviewing or publishing masjids, or for adding more volunteers to an existing masjid. Both are done from the dashboard.
- Showing a user their own pending masjid in the app (e.g. a "Waiting for review" badge). They see only the thank-you message (AC29).
- Editing a masjid's name or address from the app.
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

### Decided (2026-09-27)
7. **An "Add masjid" screen comes before the rest of the UI** and replaces seeding the pilot from the dashboard (§4.5, AC26–AC31).
8. **Any signed-in user can add a masjid.** It starts as `pending`, its creator becomes its `masjid_volunteer`, and Syed publishes it from the dashboard. This is the same review model as posts, so no admin role is needed yet. (Chosen over admin-only creation, which would have needed a new admin concept.)
9. **The add form includes the jamaat times**, so one screen fully sets up a masjid.
10. **Names confirmed:** route `/masjid/new`, page `NewMasjidPage.jsx`, UI label "Add masjid", database function `create_masjid`.

### Decided (2026-09-28)
11. **Friday at a masjid with no Jumu'ah row:** "next jamaat" shows its Dhuhr instead of skipping the midday slot.
12. **Jamaat times read "5:15 AM" in both languages.** Tamil keeps AM/PM, matching the notice boards, rather than முற்பகல்/பிற்பகல்.

### Decided (2026-09-30)
13. **Tamil labels in §4.4 confirmed as drafted**, including the ones added during T8–T10. No alternatives were taken.

### Open
None.

## 8. Task checklist

Work top to bottom; each task is small enough for one sitting.

- [x] T1 Review this spec; resolve the open questions in §7. *(Tamil labels confirmed 2026-09-30.)*
- [x] T2 Commit the migration + naming-table updates; `supabase db push`. *(Pushed by Syed 2026-09-26.)*
- [x] T3 Migration for the "add masjid" database function (§5); `supabase db push`. *(Pushed by Syed 2026-09-27.)*
- [x] T4 Add masjid page (4.5) at `/masjid/new`: the shared jamaat-time inputs (AC30) and `createMasjid()` in a new `features/prayerTimes/prayerTimesApi.js`. Reached by typing the URL until T8 adds the button. *(Tested by Syed 2026-09-28.)*
- [x] T5 Add the 3 pilot masjids through that page, then publish them from the dashboard. *(Replaces the old dashboard-seeding task.)* *(Done by Syed 2026-09-30.)*
- [x] T6 Rest of `prayerTimesApi.js` + pure helpers (next jamaat in Asia/Kolkata, freshness label).
- [x] T7 Routing + bottom nav: guest-accessible Prayer Times and masjid routes, the landing route rename (§7 decision 6), the Find Now "Coming soon" tab, and returning to the same page after sign-in.
- [x] T8 Prayer Times tab (4.1), incl. optimistic pinning and the "Add masjid" button. *(Tested by Syed 2026-09-30.)*
- [x] T9 Masjid detail page (4.2). *(Tested by Syed 2026-09-30.)*
- [x] T10 Volunteer update page (4.3), reusing the jamaat-time inputs from T4. *(Tested by Syed 2026-09-30.)*
- [x] T11 i18n pass: every key in `en.json` + `ta.json`. *(2026-09-30: English and Tamil keys match exactly, every key the code uses exists in both, and there's no hardcoded display text in the Prayer Times screens.)*
- [x] T12 Walk through AC1–AC31 on a phone in both languages; tick the boxes above. *(All passed, Syed 2026-09-30.)*
- [ ] T13 PR `feature/prayer-times` → `develop`, with the PR description linking this spec.
