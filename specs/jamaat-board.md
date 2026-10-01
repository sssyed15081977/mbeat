# Spec: Jamaat board

**Status:** v2 reviewed, open questions resolved (2026-10-01); prayer-begins merged (PR #7), build ready to start
**Branch:** `feature/jamaat-board`, rebased onto `develop` after PR #7 (2026-10-01)
**Builds on:** [prayer-times.md](prayer-times.md) (v1, done), [prayer-begins.md](prayer-begins.md) (must be merged first)
**Mockup:** three styles reviewed by Syed 2026-10-01 (claude.ai artifact "Jamaat Board Styles"). The mockup shows one column; this spec adds the Begins column.

This file says **what this feature must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

Show prayer times the way a masjid board does: one board with two columns, **Begins** (calculated for Melapalayam) and **Jamaat** (the chosen masjid's times). Residents pick one of three **board styles**, and the app remembers it on that phone.

- On the **Prayer Times tab**, the board replaces the "Today in Melapalayam" card from prayer-begins.md. With no masjid chosen, the Jamaat column is blank. The user chooses a masjid from the board itself.
- On a **masjid's page**, the same board replaces the plain jamaat list, filled with that masjid's times.

**This changes two earlier decisions:**
- prayer-begins.md §6 kept calculated times off the masjid page and away from jamaat times. They now sit side by side, on both screens.
- Draft v1 of this spec put the board only on the masjid page.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see Begins and Jamaat times side by side, like a masjid board | I can see both at a glance |
| U2 | Resident | choose my masjid on the board and have the app remember it | my masjid's times are there every time I open the app |
| U3 | Resident | choose the board style I like | the app looks the way I prefer |
| U4 | Resident | see how long until the next prayer (digital style) | I know whether I have time to reach the masjid |

## 3. Acceptance criteria

Done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Board content (all styles, both screens)
- [ ] **AC1** Top to bottom, the board shows: the Bismillah line (Arabic, بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ), the heading (§4), column headings **Begins** / **Jamaat**, then rows Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, and a Jumu'ah row set apart at the bottom.
- [ ] **AC2** The Begins column is filled exactly as prayer-begins.md specifies (Melapalayam coordinates, Asia/Kolkata, the saved calculation method, Shafi'i Asr). It is always filled, offline too.
- [ ] **AC3** The Jamaat column is blank when no masjid is chosen. When one is, it shows that masjid's times. The Sunrise row and any prayer the masjid has no time for show "—".
- [ ] **AC4** The Jumu'ah row shows the masjid's Jumu'ah jamaat time, and its Begins cell is blank. The Dhuhr row always reads "Dhuhr" on this board, overriding prayer-begins.md AC4a so that Fridays don't show two Jumu'ah rows.
- [ ] **AC5** One row is highlighted. With no masjid chosen, it's the **next Begins** (Sunrise is never highlighted; after Isha, tomorrow's Fajr is marked "tomorrow"). With a masjid chosen, it's the **next jamaat** from `getNextJamaat` (Jumu'ah on Fridays, "tomorrow" after the last jamaat). The row has `aria-current="true"` and visible text saying what it is ("Next jamaat" or "Next prayer").
- [ ] **AC6** The highlight and countdown move on by themselves while the screen stays open (`useNow`).
- [ ] **AC7** All times use the existing format ("5:10 AM") in both languages.
- [ ] **AC8** The board keeps its own look whether the phone is in light or dark mode.
- [ ] **AC9** The note "Calculated times. Adhan times may vary between masjids." (prayer-begins.md AC7) and the "Method: Karachi" control (prayer-begins.md AC9–AC12) sit directly under the board.

### Prayer Times tab — choosing a masjid
- [ ] **AC10** With no masjid chosen, the board heading reads **"Melapalayam"** with a **"Choose masjid ▾"** control.
- [ ] **AC11** Tapping that control (or the masjid name, once one is chosen) opens a bottom sheet listing **My masjids** first (if any), then **All masjids**, with the current one marked. It also has a **"No masjid"** option that clears the choice. Picking one closes the sheet and fills the Jamaat column immediately.
- [ ] **AC12** With a masjid chosen, the heading shows its name ▾ and its freshness label ("Confirmed 2 days ago"), plus a **"Masjid page"** link to `/masjid/:id`.
- [ ] **AC13** The choice is saved on the device (`localStorage` key `mbeat_selected_masjid`, the masjid id) and is still there after reopening the app. It works for guests.
- [ ] **AC14** If the saved masjid is missing from the loaded list (removed or hidden), the board falls back to "no masjid" silently and clears the saved value. Storage that throws also means "no masjid".
- [ ] **AC15** While the masjid list is loading or has failed, the Begins column still shows. The Jamaat column is blank, and the existing list error/retry handles the failure. The board doesn't show its own error.
- [ ] **AC16** Tapping a masjid in the lists below the board still opens its page, as today. It doesn't change the chosen masjid.

### Masjid page — `/masjid/:id`
- [ ] **AC17** The page shows the same board, filled with this masjid's jamaat times. The heading is the masjid's name, with no "Choose masjid" control. Opening a masjid's page doesn't change the chosen masjid on the tab.

### The three styles
- [ ] **AC18 Painted**: green board with an arched top and a gold border, cream numerals, and a small glowing lamp on the highlighted row.
- [ ] **AC19 Digital**: black LED panel with a live clock (h:mm, blinking colon, AM/PM indicator) and today's date at the top. Times are seven-segment digits with dim unlit segments behind them, and a lit arrow marks the highlighted row.
- [ ] **AC20 Digital countdown**: the bottom of the digital board reads "{{prayer}} · Jamaat in h:mm" when a masjid is chosen, or "{{prayer}} · Begins in h:mm" when none is. It follows the highlighted row and updates every minute.
- [ ] **AC21 Wooden**: wood-grain frame, a brass name plate and one brass plate per row, with a green tag and outline on the highlighted row.
- [ ] **AC22** Two time columns fit at 360px in every style without wrapping or horizontal scrolling, in both languages.

### Board style picker
- [ ] **AC23** Under the board (below the Method control), a **"Board style"** control shows three swatches labelled Painted / Digital / Wooden, with the current one marked. It appears on both screens.
- [ ] **AC24** Tapping a swatch switches the board immediately. The choice is saved on the device (`mbeat_jamaat_board_style`) and applies to both screens. A missing, unrecognised or unreadable value falls back to **Painted**.

### Cross-cutting (standing requirements)
- [ ] **AC25** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. The Bismillah line is Arabic in both languages, marked `lang="ar" dir="rtl"`.
- [ ] **AC26** Text on every board meets 4.5:1 contrast (large numerals at least 3:1). Check the wooden board's brass plates especially.
- [ ] **AC27** Screen readers hear each row as "prayer, begins time, jamaat time" (e.g. "Fajr, begins 4:52 AM, jamaat 5:10 AM"). Seven-segment digits are hidden from them and backed by plain text.
- [ ] **AC28** The style picker is a labelled radio group, and the masjid sheet follows prayer-begins.md AC15 (heading, current choice marked, closes with Escape or a tap outside). Both are keyboard-usable with visible focus, and touch targets are at least 44px.
- [ ] **AC29** The blinking colon and glow animations stop under `prefers-reduced-motion`.
- [ ] **AC30** The boards look right **offline**: their fonts ship with the app (§5).
- [ ] **AC31** On the tab, the board uses a **slim** version of each style (smaller Bismillah and arch, tighter rows) so that at 360×640 "My masjids" isn't pushed entirely off the first screen. This replaces prayer-begins.md AC16. The masjid page uses the full-size board.

## 4. Screens

### 4.1 Prayer Times tab — `/` (changed)
Order: **board** (heading: "Melapalayam" + "Choose masjid ▾", or the masjid name ▾ + freshness + "Masjid page" link), note, Method control, Board style picker, then the existing "My masjids" / "All masjids" lists, which are unchanged.

### 4.2 Masjid page — `/masjid/:id` (changed)
Order: back button, masjid header (name, address, freshness, pin, all unchanged), **board** (heading: masjid name), note, Method control, Board style picker, volunteer "Update times" button (unchanged, last).

### 4.3 Choose masjid sheet
Heading "Choose masjid", then "No masjid", then "My masjids" (if any) and "All masjids". It reuses the generic `components/ui/BottomSheet.jsx` from prayer-begins.md T5.

### 4.4 Labels — confirmed by Syed 2026-10-01 unless marked *draft*

| English | Tamil | Notes |
|---|---|---|
| Board style | பலகை வடிவம் | |
| Painted / Digital / Wooden | வண்ணப் பலகை / டிஜிட்டல் / மரப் பலகை | |
| Begins / Jamaat | தொடக்கம் / ஜமாஅத் | column headings |
| {{prayer}} · Jamaat in {{time}} | {{prayer}} · ஜமாஅத்துக்கு இன்னும் {{time}} | |
| {{prayer}} · Begins in {{time}} | {{prayer}} · தொடங்க இன்னும் {{time}} | |
| Melapalayam | மேலப்பாளையம் | |
| Choose masjid | மஸ்ஜிதைத் தேர்ந்தெடு | |
| No masjid | மஸ்ஜித் வேண்டாம் | |
| Masjid page | மஸ்ஜித் பக்கம் | |
| Next prayer | அடுத்த தொழுகை | |
| Next jamaat, tomorrow, Sunrise, prayer names, note, Method | *(existing keys)* | |

"Jamaat times" (ஜமாஅத் நேரங்கள், confirmed in v1) is no longer used as a heading, since the column headings say it.

## 5. Data and code

- **No database change.** The tab's masjid list already loads each masjid's jamaat times (`MASJID_COLUMNS` in `prayerTimesApi.js`), so choosing a masjid needs no extra fetch.
- **Code layout** (names confirmed 2026-10-01), all in `features/prayerTimes/`:
  - `JamaatBoard.jsx`: takes the Begins times, an optional masjid, and the "now" time. It works out the rows, the highlight and the countdown once, then renders the chosen style. It replaces `BeginsCard`'s list on the tab and `JamaatTimeList` in `MasjidDetailPage.jsx`.
  - `JamaatBoard.painted.jsx`, `JamaatBoard.digital.jsx`, `JamaatBoard.wooden.jsx`: drawing only, no logic.
  - `useBoardStyle.js`: the saved style, following the `useCalcMethod` pattern.
  - A hook for the saved masjid, plus the picker sheet and the style picker. Their names get confirmed when they're built.
- **Stored values:** `mbeat_jamaat_board_style` = `painted` (default) | `digital` | `wooden`; `mbeat_selected_masjid` = a masjid id.
- **Styling:** Tailwind for layout. Each style's colours go in `@theme` tokens in `src/index.css`. Effects Tailwind can't express (wood grain, brass, LED glow) go in one small CSS block per style.
- **Seven-segment digits:** an inline SVG per digit, built from a segment map, with no font.
- **Fonts (confirmed 2026-10-01):** bundled with `@fontsource` so the PWA precaches them: Marcellus (painted), Cinzel (wooden), and Amiri (Bismillah, Arabic subset). Only the weights in use, about 100 KB in total. Tamil falls back to Noto Serif Tamil or the system Tamil font.

## 6. Out of scope

- Syncing the board style or chosen masjid to `profiles` so they follow a signed-in user across phones.
- A per-masjid style (a volunteer choosing the look that matches the real board).
- Showing masjid adhan times (unchanged from prayer-times.md).
- More styles, custom colours, or board photos.
- Choosing a masjid by GPS or nearest-masjid.

## 7. Decisions and open questions

### Decided (2026-10-01)
1. **Three styles, and the user picks one.** The default is **Painted**.
2. **The Bismillah line is on all three boards.**
3. **The digital board has a countdown.**
4. **Two columns, Begins + Jamaat**, on the tab (replacing the Begins card) and on the masjid page.
5. **The Jamaat column is blank until a masjid is chosen.** The user chooses it from a picker on the board. Tapping a masjid in the list still opens its page.
6. **The chosen masjid is remembered on the device.**
7. **The highlight follows the next Begins** when no masjid is chosen, and the **next jamaat** when one is.
8. **Order:** finish and merge prayer-begins first, then rebase this branch onto `develop`.
9. **Fonts bundled; Tamil drafts from v1 confirmed.**
10. **Names:** the v1 names (§5) plus Begins / Jamaat column headings, "selected masjid" internally, and `mbeat_selected_masjid`.

11. **Jumu'ah:** a separate Jumu'ah row (jamaat only), and Dhuhr stays "Dhuhr" on Fridays (AC4).
12. **Slim board on the tab**, full size on the masjid page (AC31).
13. **Tamil drafts in §4.4 confirmed.**

### Open
None.

## 8. Task checklist

Prerequisite: prayer-begins.md T5–T8 done and merged to `develop`.

- [x] T1 Write this spec (v1, then v2 redesign); update the naming tables. *(2026-10-01)*
- [x] T2 Resolve §7's open questions; rebase onto `develop` after prayer-begins merges. *(2026-10-01)*
- [ ] T3 `JamaatBoard.jsx` + painted style (full and slim) + fonts. Replace the Begins card on the tab and the list on the masjid page.
- [ ] T4 Saved-masjid hook + "Choose masjid" sheet.
- [ ] T5 Digital style, with clock and countdown.
- [ ] T6 Wooden style.
- [ ] T7 `useBoardStyle.js` + Board style picker.
- [ ] T8 i18n pass: every key in `en.json` + `ta.json`; Tamil confirmed.
- [ ] T9 Walk through AC1–AC31 on a phone in both languages; tick the boxes.
- [ ] T10 PR `feature/jamaat-board` → `develop`, linking this spec.
