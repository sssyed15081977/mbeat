# Spec: Amal tracker v1

**Status:** approved 2026-10-23 — ready to build (T2)
**Branch:** `feature/amal-tracker` (not created yet)
**Builds on:** [prayer-begins.md](prayer-begins.md) (`getBeginsTimes` sets when an amal day starts)
**Schema:** none. All data stays on the device (IndexedDB); no Supabase tables.

This file says **what v1 must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

A private, on-device tracker that helps a user stay **consistent** in their amals and reflect on them. "The most beloved deeds to Allah are the most consistent, even if small" (Bukhari 6464, Muslim 783).

- **Generic underneath, amals by default.** The engine tracks any *habit*: a definition with a value type and a schedule. v1 ships only built-in amal presets. Custom habits come later (§6), and they use the same model.
- **Local only.** Nothing leaves the phone, so there are no accounts, sync or sharing. Guests can use it fully, without signing in.
- **Its own bottom-nav tab** (decided 2026-10-23).

### Design principles (agreed 2026-10-23)
Every decision in this spec, and in later versions, is checked against these:

1. **Private.** The data never leaves the phone and is never shown to anyone else. Nothing is compared between people.
2. **No gamification.** No points, badges, levels, leaderboards or streak counters that reset to zero.
3. **Consistency over totals.** Show gentle patterns ("5 of the last 7 days"), not scores.
4. **Gentle with misses.** A habit not yet logged looks neutral, not red. "Missed" is a calm, plain state. Prayers have an **Excused** state that isn't a miss, and the app never asks why.
5. **Reflection, not scorekeeping.** One short ayah or hadith on muhasabah sits at the top of the screen.
6. **Verified content.** Rak'ah counts and preset wording are checked by an alim before release (T9), like the janazah guide.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | log today's five fard prayers in one tap each, including whether I prayed in jamaat at the masjid | I can see honestly how I'm doing |
| U2 | Resident | tick the sunnah before and after each prayer, plus Duha, Tahajjud and Witr | I build up the sunnah prayers gradually |
| U3 | Resident | tick my morning and evening adhkar | I don't forget them |
| U4 | Resident | fix yesterday's log, or log tahajjud after midnight against the right night | the record matches what I actually did |
| U5 | Resident | hide presets I'm not working on yet | the list stays short and doesn't discourage me |
| U6 | Resident | know my log stays on my phone | I'm comfortable recording misses |

## 3. Acceptance criteria

v1 is done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Tab and screen
- [ ] **AC1** The bottom nav gains an **Amals** tab, second in the order **Prayer Times · Amals · Feed · Find Now**, that opens the Amal tracker at `/amal`. It works for guests without signing in.
- [ ] **AC2** At the top, the screen shows the day it is logging ("Today", "Yesterday" or a date), with **‹ ›** to move back up to **6 days** and forward again. It can't go into the future.
- [ ] **AC3** One short hadith sits under the date line, small and muted (principle 5): *"The most beloved deeds to Allah are the most consistent, even if small." (Bukhari 6464, Muslim 783)*. v1 has this one fixed; rotating them is out of scope.
- [ ] **AC4** A one-line note near the bottom reads "Saved on this phone only", linking to a short explanation (principle 1, U6).

### Amal day
- [ ] **AC5** An **amal day** runs from **Fajr to Fajr**, using the Begins time from `getBeginsTimes` at Melapalayam with the user's calculation method. Between midnight and Fajr, "Today" still means the previous date, so tahajjud at 3am counts for that night (U4).

### Fard prayers
- [ ] **AC6** Each of the five fard prayers is one row. Tapping it opens a small picker of **levels**, with one tap to choose:
  - Missed
  - Made up late (qada)
  - On time, alone
  - Jamaat at home
  - Jamaat at masjid
  - Excused

  The chosen level shows on the row. Choosing again replaces it; there's also a "Clear" option.
- [ ] **AC7** A prayer that hasn't been logged shows as neutral (no colour, "Not logged"). Missed and Excused look calm and look different from each other, and neither is red (principle 4).
- [ ] **AC8** On Fridays a **Jumu'ah** row replaces Dhuhr. Its levels are **Missed**, **Prayed at masjid** and **Excused**. Excused covers anyone not obliged to attend (women, travellers, the ill), who pray Dhuhr instead. It is a separate habit (`jumuah`, Fridays only), while `dhuhr` runs every other day; both use the `weekdays` schedule.

### Sunnah and other prayers, adhkar
- [ ] **AC9** The **sunnah before and after** each prayer appear as **done / not done** rows grouped under their prayer, with the rak'ah count shown, e.g. "Before Fajr · 2". These are the **12 rak'ahs** in §5. On Fridays the Dhuhr sunnah rows stay as they are, grouped under Jumu'ah; Jumu'ah-specific sunnah is out of scope.
- [ ] **AC9a** The Sunnah prayers group has a one-line muted caption: *"12 rak'ahs a day: a house in Jannah" (Muslim 728)*.
- [ ] **AC10** **Duha, Tahajjud and Witr** are done / not done rows under "Other prayers".
- [ ] **AC11** **Morning adhkar** and **Evening adhkar** are done / not done rows under "Adhkar". v1 doesn't show the adhkar text (§6).
- [ ] **AC12** Tapping a done / not done row toggles it immediately, with no Save button. The change is written in the background, and the row shows its new state straight away.

### Patterns (principle 3)
- [ ] **AC13** Each row shows a quiet **last-7-days strip** of seven small dots, filled for done (for fard: any level from qada up). It has no number, no streak and no percentage.

### Manage habits
- [ ] **AC14** A **Manage habits** link at the bottom opens `/amal/habits`, which lists every preset with a show/hide switch. Hidden habits disappear from the daily screen, but their past entries are kept. The page has a `BackButton` to `/amal`.
- [ ] **AC15** By default all presets are shown, except **Tahajjud and Duha**, which keeps a beginner's list short.

### Storage
- [ ] **AC16** Entries are stored in **IndexedDB** through `idb-keyval` (§5) and survive closing the app, reloading and going offline. On first use the app calls `navigator.storage.persist()` once; it works the same if the browser refuses.
- [ ] **AC17** If IndexedDB isn't available (some private modes), the screen still works for the session and shows one line: "Your browser isn't saving — entries will be lost when you close it."
- [ ] **AC18** Habit definitions live in code with fixed ids. Changing a preset's label or rak'ah count never touches stored entries.

### Cross-cutting (standing requirements)
- [ ] **AC19** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. Prayer names reuse the existing keys.
- [ ] **AC20** Covers the loading state (a skeleton while IndexedDB opens), the empty state (all habits hidden: "Choose habits to track →") and the error state (AC17). Offline works fully, since nothing is fetched.
- [ ] **AC21** Touch targets are at least 44px tall. The level picker is a bottom sheet built like `ChooseMasjidSheet`, and it isn't covered by the bottom nav or the safe area.

## 4. Screens

### 4.1 Amal tracker — `/amal` (new tab)
From top to bottom:
- the date line with ‹ ›
- the muhasabah line
- Fard prayers (5 rows)
- Sunnah prayers (grouped by prayer)
- Other prayers
- Adhkar
- the "Saved on this phone only" note
- the Manage habits link

Each row shows a label, its value or toggle, and the 7-day dots.

### 4.2 Level picker (bottom sheet)
The prayer name and its six levels as large tappable rows, plus Clear.

### 4.3 Manage habits — `/amal/habits`
A `BackButton`, then presets grouped as on 4.1, each with a show/hide switch.

### 4.4 Tamil labels
Drafts for Syed to check.

| English | Tamil (draft) | Notes |
|---|---|---|
| Amal tracker | அமல் குறிப்பேடு | Feature name; "notebook" rather than கண்காணிப்பு (which reads as surveillance) |
| Amals (tab) | அமல்கள் | |
| Today / Yesterday | இன்று / நேற்று | |
| Fard prayers | ஃபர்ளு தொழுகைகள் | |
| Sunnah prayers | சுன்னத் தொழுகைகள் | |
| Other prayers | மற்ற தொழுகைகள் | |
| Adhkar / Morning adhkar / Evening adhkar | திக்ர்கள் / காலை திக்ர் / மாலை திக்ர் | |
| Before {{prayer}} · {{count}} / After {{prayer}} · {{count}} | {{prayer}}க்கு முன் · {{count}} / {{prayer}}க்குப் பின் · {{count}} | Check how this joins with each prayer name |
| Missed | தவறியது | |
| Made up late (qada) | பின்னர் நிறைவேற்றியது (களா) | |
| On time, alone | நேரத்தில், தனியாக | |
| Jamaat at home | வீட்டில் ஜமாஅத் | |
| Jamaat at masjid | மஸ்ஜிதில் ஜமாஅத் | |
| Excused | விலக்கு | |
| Not logged | பதியவில்லை | |
| Clear | நீக்கு | |
| Manage habits | பழக்கங்களை நிர்வகி | |
| Saved on this phone only | இந்த ஃபோனில் மட்டும் சேமிக்கப்படும் | |
| Prayed at masjid (Jumu'ah) | மஸ்ஜிதில் தொழுதேன் | |
| "The most beloved deeds to Allah are the most consistent, even if small." (Bukhari 6464, Muslim 783) | "அல்லாஹ்விடம் மிகவும் விருப்பமான அமல்கள், குறைவாக இருந்தாலும் தொடர்ந்து செய்யப்படுபவையே." (புகாரி 6464, முஸ்லிம் 783) | AC3; translation to be checked (T9) |
| "12 rak'ahs a day: a house in Jannah" (Muslim 728) | "தினமும் 12 ரக்அத்கள்: சொர்க்கத்தில் ஒரு வீடு" (முஸ்லிம் 728) | AC9a |

## 5. Data (on device)

The names below are **proposed** until T1 (§7).

- **Habit definitions** live in `features/amalTracker/presetHabits.js`. Each one looks like this:
  ```js
  { id: 'fajr', group: 'fard', valueType: 'levels', schedule: { type: 'daily' } }
  { id: 'fajr_sunnah_before', group: 'sunnah', anchor: 'fajr', rakahs: 2, valueType: 'done', schedule: { type: 'daily' } }
  ```
  - `valueType`: `done` | `levels` (`count` is reserved for later).
  - `schedule.type`: `daily` | `weekdays` (with `days`, e.g. `jumuah` → Friday only, `dhuhr` → every other day). `hijri_days` is reserved for the fasting presets (§6).
  - A function `isDue(habit, amalDate)` decides whether a row shows on a given day, so new schedule types only need code in one place.
- **Fard levels** are stored in this order: `missed`, `qada`, `alone`, `jamaat_home`, `jamaat_masjid`, `excused`. Jumu'ah uses only `missed`, `jamaat_masjid` (label "Prayed at masjid") and `excused`.
- **Presets.** The sunnah rows are the **12 rak'ahs** promised a house in Jannah (Muslim 728; listed in Tirmidhi 415). Syed confirmed them on 2026-10-23:

  | Prayer | Fard row | Sunnah before | Sunnah after |
  |---|---|---|---|
  | Fajr | `fajr` | `fajr_sunnah_before` · 2 | — |
  | Dhuhr (Sat–Thu) / Jumu'ah (Fri) | `dhuhr` / `jumuah` | `dhuhr_sunnah_before` · 4 | `dhuhr_sunnah_after` · 2 |
  | Asr | `asr` | — | — |
  | Maghrib | `maghrib` | — | `maghrib_sunnah_after` · 2 |
  | Isha | `isha` | — | `isha_sunnah_after` · 2 |

  The other presets are `duha`, `tahajjud`, `witr`, `adhkar_morning` and `adhkar_evening`.
- **IndexedDB** via the `idb-keyval` package (`createStore`), database `mbeat_amal`, with two stores:
  - `entries`: key = amal date `YYYY-MM-DD`; value = `{ [habitId]: true | level }`. A habit with no key means "not logged".
  - `settings`: key `hiddenHabits` → an array of habit ids.
- **Client files** in `features/amalTracker/`:
  - `amalStore.js`: the only code that touches IndexedDB, with an in-memory fallback for AC17
  - `amalDay.js`: the Fajr-to-Fajr date (AC5)
  - `presetHabits.js`, `useAmalDay.js`
  - components `AmalTrackerPage` (in `pages/`), `HabitRow.jsx`, `LevelPickerSheet.jsx`, `ManageHabitsPage` (in `pages/`)

## 6. Out of scope for v1

In rough priority order for v2 and later:

- **Export / import to a file** (first in line for v2, since local data is lost with a new phone).
- **Fasting presets:** Monday/Thursday, the white days (13–15 of each Hijri month), and later Ashura, Arafah and six of Shawwal. This needs Hijri dates (`Intl` `islamic-umalqura`) with a **±1/2 day adjustment** for local moon sighting.
- A history or calendar view, and a weekly reflection view.
- **Custom habits** created by the user (`count` value type, weekday schedules).
- The adhkar text itself, as an Islamic Guide page linked from the row.
- Logging a prayer by tapping its row on the Jamaat board.
- An app lock, reminders or notifications, and optional sync to the account.
- Sunnah outside the 12 rak'ahs (e.g. before Asr, Jumu'ah-specific sunnah); rak'ah counts for Witr, Duha and Tahajjud.

## 7. Decisions and open questions

### Decided (2026-10-23)
1. **Feature name** "Amal tracker". Folder `features/amalTracker/`, storage `mbeat_amal`.
2. **Terms:** a *habit* is a definition, and an *entry* is what was logged for a day (generic, so custom habits fit later).
3. **Placement:** a new bottom-nav tab.
4. **Fard levels:** five levels plus Excused (AC6).
5. **Design principles** as listed in §1.
6. **Local only:** no Supabase tables. Guests can use it.

7. **Names confirmed:**
   - tab label "Amals" / அமல்கள்
   - routes `/amal` and `/amal/habits`
   - "Manage habits"
   - level values and preset ids (§5)
   - IndexedDB database `mbeat_amal` with stores `entries` and `settings`
8. **Tab order:** Prayer Times · Amals · Feed · Find Now. This changes the order locked in `BottomNav.jsx`.
9. **Storage library:** `idb-keyval`.
10. **Jumu'ah** gets its own Friday row with three levels (AC8), not a combined "Jumu'ah / Dhuhr" row.
11. **Tahajjud and Duha are hidden by default.**
12. **The line at the top** is the "most consistent deeds" hadith (AC3), plus the 12-rak'ah caption (AC9a).
13. **Sunnah rak'ahs** are the 12 (Fajr 2 before, Dhuhr 4 before + 2 after, Maghrib 2 after, Isha 2 after), confirmed by Syed. Other sunnah prayers are ignored for now.

### Open
None. The Tamil hadith translations still need checking in T9.

## 8. Task checklist

Work top to bottom; each task is small enough for one sitting.

- [ ] T1 Review this spec; resolve §7's open questions; add the locked names to CLAUDE.md and the handoff doc; add the idea to the GitHub Projects Icebox and move it into scope.
- [x] T2 `amalStore.js` (IndexedDB + in-memory fallback, `storage.persist()`), `amalDay.js`, `presetHabits.js` with `isDue`.
- [x] T3 `AmalTrackerPage` at `/amal`, plus the bottom-nav tab (AC1–AC5).
- [ ] T4 Fard rows + `LevelPickerSheet` (AC6–AC8).
- [ ] T5 Sunnah, other prayers and adhkar rows (AC9–AC12).
- [ ] T6 7-day dots (AC13).
- [ ] T7 `ManageHabitsPage` at `/amal/habits` (AC14–AC15).
- [ ] T8 i18n pass: every key in `en.json` + `ta.json`.
- [x] T9 Check the Tamil wording of the two hadith lines (AC3, AC9a) and the level labels. Rak'ah counts were already confirmed 2026-10-23. Syed approved the drafts on 2026-10-24 ("OK for now"); revisit if anyone reports wording issues.
- [ ] T10 Walk through AC1–AC21 on a phone in both languages, including logging after midnight, reloading offline and a private window (AC17); tick the boxes above.
- [ ] T11 PR `feature/amal-tracker` → `develop`, with the PR description linking this spec.
- [ ] T12 After merge: tick T11, update this spec's Status line and the progress log in [mbeat-rebuild-context.md](../mbeat-rebuild-context.md).
