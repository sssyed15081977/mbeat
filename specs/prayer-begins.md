# Spec: Prayer Begins times

**Status:** built and checked on a phone (2026-10-01); in review
**Next:** after this merges, the "Today in Melapalayam" card is replaced by the two-column Begins + Jamaat board ([jamaat-board.md](jamaat-board.md), decided 2026-10-01). That spec overrides AC4a (Dhuhr stays "Dhuhr" on the board) and AC16, and reverses the §6 exclusion of calculated times on the masjid page / next to jamaat times.
**Branch:** `feature/prayer-begins-times`
**Builds on:** [prayer-times.md](prayer-times.md) (v1, done)
**Design rationale:** [mbeat-rebuild-context.md → "Prayer Times"](../mbeat-rebuild-context.md)

This file says **what this feature must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

Show residents when each prayer's time **begins** in Melapalayam, calculated from the sun's position, next to the masjid jamaat times the tab already shows.

Masjids' own adhan times differ from each other and from the calculated start times, sometimes by several minutes. A resident praying at home, or checking whether a prayer's time has started, needs the calculated start time, not any one masjid's board.

**This reverses part of an earlier decision** (prayer-times.md §6, "Adhan times, whether stored or shown", decided 2026-09-26). What changes and what doesn't:
- **Changed:** calculated **Begins** times are now **shown**.
- **Unchanged:** masjid adhan times are still not stored or shown. Masjid jamaat times stay manual, copied from notice boards; nothing is derived from the calculation.
- **Nothing is stored in the database.** The times are calculated on the phone, so there's no migration.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see today's Begins time for every prayer in Melapalayam | I know when each prayer's time starts, whatever a masjid's adhan says |
| U2 | Resident | see which prayer begins next | I don't have to work it out from a list |
| U3 | Resident | see sunrise | I know when Fajr's time ends |
| U4 | Resident | choose the calculation method I follow | the times match the method I trust |

## 3. Acceptance criteria

Done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### The card
- [x] **AC1** The Prayer Times tab (`/`) shows a **"Today in Melapalayam"** card above "My masjids", for guests and signed-in users alike.
- [x] **AC2** The card lists, in order: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, each with its Begins time ("Fajr · 4:52 AM"). Times use the same format as jamaat times (`formatJamaatTime`'s style: "4:52 AM" in both languages).
- [x] **AC3** Times are calculated for Melapalayam's fixed coordinates and shown in **Asia/Kolkata** time, whatever the phone's time zone or location. No location permission is ever requested.
- [x] **AC4** The prayer that begins next is highlighted. Sunrise is never highlighted: after Fajr begins, the next highlight is Dhuhr. After Isha begins, tomorrow's Fajr is highlighted and marked "tomorrow".
- [x] **AC4a** On Fridays the Dhuhr row reads **"Jumu'ah"** (same Begins time), matching how "next jamaat" treats Friday. *(Superseded on the board by jamaat-board.md AC4.)*
- [x] **AC5** The highlight moves on by itself while the screen stays open (reuse `useNow`).
- [x] **AC6** Asr uses the **Shafi'i** calculation (shadow equal to the object's length). There is no madhab setting.
- [x] **AC7** The card carries one short note: "Calculated times. Adhan times may vary between masjids." *(Wording changed by Syed 2026-09-30, from "Jamaat times are set by each masjid.")*
- [x] **AC8** The card works **offline** and never shows a loading state or skeleton, because nothing is fetched.

### Calculation method
- [x] **AC9** The bottom of the card shows the current method ("Method: Karachi"). Tapping it opens a bottom sheet listing: **Karachi** (default), **Muslim World League**, **Egyptian**, **Umm al-Qura**, **ISNA (North America)**. Each has a one-line explanation.
- [x] **AC10** Picking a method closes the sheet and updates the times immediately, with no save button or confirmation.
- [x] **AC11** The choice is saved on the device (`localStorage`) and is still there after closing and reopening the app. It works for guests; signing in is not required.
- [x] **AC12** A missing or unrecognised stored value falls back to Karachi without an error.

### Cross-cutting (standing requirements)
- [x] **AC14** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. Method names and explanations are translated too.
- [x] **AC15** The bottom sheet is keyboard- and screen-reader-usable: it has a heading, the current method is marked as selected, and it closes with Escape or a tap outside.
- [x] **AC16** Touch targets are comfortable, and the card doesn't push "My masjids" so far down that the first row is hidden below the fold at 360×640. *(Passes on Syed's phone; on the board this becomes jamaat-board.md AC31, the slim board.)*

## 4. Screens

### 4.1 Prayer Times tab — `/` (changed)
- New **"Today in Melapalayam"** card at the top, above the existing "My masjids" / "All masjids" sections, which are otherwise unchanged.
- Card layout: title, then six rows (prayer name · time), the next prayer highlighted, then the note (AC7), then the "Method: …" control (AC9).
- Keep it compact (AC16): a tight two-column list, not one card per prayer.

### 4.2 Method bottom sheet
- Heading "Calculation method", a list of the five methods (name + one-line explanation), the current one marked. Tapping one selects it and closes the sheet.
- If there is no reusable bottom-sheet component in `components/ui/` yet, build a generic, content-blind `BottomSheet.jsx` there so later features (post `•••` menus) can reuse it.

### 4.3 Tamil labels — confirmed by Syed 2026-09-30

Same convention as prayer-times.md §4.4: Arabic terms in Tamil script, AM/PM kept. Prayer names reuse the existing `prayer.*` keys.

| English | Tamil | Alternatives |
|---|---|---|
| Begins | தொடக்கம் | ஆரம்பம் |
| Today in Melapalayam | இன்று மேலப்பாளையத்தில் | |
| Sunrise | உதயம் | *Shortened from சூரிய உதயம் by Syed 2026-10-01 so it fits on the board* |
| tomorrow | நாளை | *(existing key)* |
| Calculated times. Adhan times may vary between masjids. | கணக்கிடப்பட்ட நேரங்கள். அதான் நேரங்கள் மஸ்ஜிதுக்கு மஸ்ஜித் மாறுபடலாம். | *Reworded 2026-09-30; Tamil awaiting confirmation (அதான் vs பாங்கு)* |
| Method: {{name}} | முறை: {{name}} | |
| Calculation method | கணக்கீட்டு முறை | |
| Karachi | கராச்சி | |
| Muslim World League | முஸ்லிம் உலக லீக் | |
| Egyptian | எகிப்திய முறை | |
| Umm al-Qura | உம்முல் குரா | |
| ISNA (North America) | ISNA (வட அமெரிக்கா) | |

Method explanations, confirmed by Syed 2026-10-01:

| Method | English | Tamil |
|---|---|---|
| Karachi | University of Islamic Sciences, Karachi. The usual method in India and Pakistan. | இஸ்லாமிய அறிவியல் பல்கலைக்கழகம், கராச்சி. இந்தியா, பாகிஸ்தானில் வழக்கமான முறை. |
| Muslim World League | Used in Europe, the Far East and parts of the Americas. | ஐரோப்பா, தூர கிழக்கு, அமெரிக்காவின் சில பகுதிகளில் பயன்படுகிறது. |
| Egyptian | Egyptian General Authority of Survey. Used in Africa, Syria and Lebanon. | எகிப்து பொது நில அளவை ஆணையம். ஆப்பிரிக்கா, சிரியா, லெபனானில் பயன்படுகிறது. |
| Umm al-Qura | Umm al-Qura University, Makkah. Used in Saudi Arabia. | உம்முல் குரா பல்கலைக்கழகம், மக்கா. சவூதி அரேபியாவில் பயன்படுகிறது. |
| ISNA (North America) | Islamic Society of North America. Used in the USA and Canada. | வட அமெரிக்க இஸ்லாமிய சங்கம். அமெரிக்கா, கனடாவில் பயன்படுகிறது. |

## 5. Data and calculation

- **Library:** [`adhan`](https://github.com/batoulapps/adhan-js) (adhan-js, MIT). Runs in the browser, has no network calls and no dependencies.
- **Location:** fixed Melapalayam coordinates (about 8.69° N, 77.72° E), in one constant. Within the town the difference is under a minute, so there's no GPS.
- **Time zone:** Asia/Kolkata, reusing the existing fixed +5:30 offset in `nextJamaat.js` (`KOLKATA_OFFSET_MINUTES`) rather than a second copy.
- **Method map:** a small config mapping our stored value to the library's method: `karachi`, `muslim_world_league`, `egyptian`, `umm_al_qura`, `north_america`. Madhab is always Shafi'i (AC6). Default rounding (to the nearest minute).
- **Storage:** `localStorage` key `mbeat_prayer_calc_method`, following the existing `mbeat_language` key. No database column (see §6).
- **Code layout:** in `features/prayerTimes/`:
  - a pure helper (e.g. `beginsTimes.js`) that takes a date + method and returns the six times, plus "which prayer begins next". This is pure and easy to spot-check against a calendar.
  - a small hook for the saved method (read + write `localStorage`, with the AC12 fallback).
  - the card component and the method sheet.

  Exact file and component names get confirmed at the start of the build (naming protocol).

## 6. Out of scope

- Syncing the method to `profiles` so it follows a signed-in user across devices. Add it later, the way `preferred_language` works, if users ask for it.
- A Hanafi Asr option or a madhab setting (decided 2026-09-30: Shafi'i only).
- Per-prayer minute adjustments (ihtiyat / safety margins) or manual offsets.
- Using the user's GPS location, or other towns.
- Showing calculated times on the masjid detail page, or next to each jamaat time (decided 2026-09-30: card on the tab only).
- Showing masjid adhan times (unchanged from prayer-times.md).
- A monthly timetable, other dates, or Hijri dates.
- Makruh (disliked) times, Tahajjud / last third of the night, or Ishraq / Duha times.
- Notifications or reminders.
- A general Settings page.

## 7. Decisions and open questions

### Decided (2026-09-30)
1. **Show calculated times; label them "Begins"** (chosen over "Adhan times", which would clash with masjids' actual adhans, and "Prayer start times", which is long on a phone). Tamil draft: தொடக்கம்.
2. **The user chooses the method; Karachi is the default** (the standard in India).
3. **Asr is Shafi'i only.**
4. **Placement:** one card at the top of the Prayer Times tab.
5. **The method control lives on the card** (a bottom sheet), not on a Settings page, and it's **saved on the device only** for now.

6. **Fridays:** the Dhuhr row reads "Jumu'ah" (AC4a).
7. **Tamil labels in §4.3 confirmed as drafted.**
8. **No reference-calendar check.** No local printed calendar lists Begins times, so there's nothing to compare against. The previous AC13 was dropped; the times are trusted to the library and the chosen method.

### Open
None.

## 8. Task checklist

- [x] T1 Review this spec; resolve §7's open questions. Update the naming tables (CLAUDE.md + mbeat-rebuild-context.md) for "Begins" and the reversed adhan decision. *(2026-09-30)*
- [x] T2 `npm install adhan`; pure helper + method config. *(2026-09-30: checked for today in three phone time zones; identical results.)*
- [x] T3 Saved-method hook (`localStorage`, fallback). *(2026-09-30: `useCalcMethod.js`; storage errors fall back to Karachi.)*
- [x] T4 "Today in Melapalayam" card on the Prayer Times tab, with next-prayer highlight.
- [x] T5 Bottom sheet (generic `components/ui/BottomSheet.jsx` if none exists) + method picker. *(2026-10-01: `BottomSheet.jsx` + `CalcMethodPicker.jsx`; checked in Chrome at 360px: pick applies and closes, survives reload, Escape closes, focus returns to the button.)*
- [x] T6 i18n pass: every key in `en.json` + `ta.json`; Tamil confirmed. *(2026-10-01: key parity checked app-wide, no hardcoded strings; Tamil card and sheet fit at 360px.)*
- [x] T7 Walk through AC1–AC16 on a phone in both languages; tick the boxes. *(2026-10-01: all passed on Syed's phone.)*
- [ ] T8 PR `feature/prayer-begins-times` → `develop`, linking this spec.
