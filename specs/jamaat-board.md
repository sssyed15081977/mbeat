# Spec: Jamaat board

**Status:** draft (2026-10-01), names confirmed; awaiting review
**Branch:** `feature/jamaat-board` (from `develop`)
**Builds on:** [prayer-times.md](prayer-times.md) (v1, done)
**Mockup:** the three styles, reviewed by Syed 2026-10-01 (claude.ai artifact "Jamaat Board Styles")

This file says **what this feature must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

On the masjid detail page (`/masjid/:id`), show the jamaat times as a **board that looks like the one in the masjid**, instead of the plain list. Residents pick one of three **board styles**, and the app remembers their choice on that phone.

Only the look changes. The data, the "next jamaat" logic (including Jumu'ah on Fridays), the freshness label and the volunteer "Update times" button stay as they are.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see a masjid's jamaat times on something that looks like its notice board | the page feels familiar and I can read it at a glance |
| U2 | Resident | choose the board style I like | the page looks the way I prefer |
| U3 | Resident | see how long until the next jamaat (digital style) | I know whether I have time to reach the masjid |

## 3. Acceptance criteria

Done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### The board (all styles)
- [ ] **AC1** The masjid detail page shows the jamaat times as a board in the chosen style, replacing the current list. Guests and signed-in users see it alike.
- [ ] **AC2** Every board shows, top to bottom: the Bismillah line (Arabic, بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ), the masjid name, the heading "Jamaat times", the five daily prayers (Fajr → Isha), and Jumu'ah set apart below them. Prayers the masjid has no time for are left out, as today.
- [ ] **AC3** The next jamaat is highlighted using the existing `getNextJamaat` result, so on Fridays Jumu'ah is highlighted instead of Dhuhr, and after Isha tomorrow's first jamaat is marked "tomorrow". The highlighted row keeps `aria-current="true"` and its visible "Next jamaat" text.
- [ ] **AC4** The highlight moves on by itself while the page stays open (`useNow`, as today).
- [ ] **AC5** Times use the existing format (`formatJamaatTime`: "5:10 AM") in both languages.
- [ ] **AC6** A masjid with no times shows the existing "no times" message inside the board frame, in the chosen style.
- [ ] **AC7** The freshness label ("Confirmed 2 days ago") stays on the page and is readable in every style.
- [ ] **AC8** Each board has a fixed look of its own: it doesn't change between the phone's light and dark modes.

### The three styles
- [ ] **AC9 Painted**: green board with an arched top and a gold border. Prayer names on the left, dotted leaders, large cream numerals on the right. A small glowing lamp and gold tint mark the next jamaat.
- [ ] **AC10 Digital**: black LED panel. A live clock (h:mm, blinking colon, AM/PM indicator) and today's date sit at the top. Times are seven-segment digits with dim unlit segments behind them. A lit arrow marks the next jamaat.
- [ ] **AC11 Digital countdown**: the bottom of the digital board reads "{{prayer}} · Jamaat in h:mm", counting down to the next jamaat (including into tomorrow) and updating every minute.
- [ ] **AC12 Wooden**: wood-grain frame, one brass plate per prayer, and a brass name plate. A green "Next jamaat" tag and green outline mark the next jamaat.

### Board style picker
- [ ] **AC13** Under the board, a **"Board style"** control shows three small swatches labelled Painted / Digital / Wooden, with the current one marked as selected.
- [ ] **AC14** Tapping a swatch switches the board immediately, with no save button or confirmation.
- [ ] **AC15** The choice is saved on the device (`localStorage` key `mbeat_jamaat_board_style`) and applies to every masjid page, after reopening the app too. It works for guests.
- [ ] **AC16** A missing or unrecognised stored value falls back to **Painted** without an error, and so does storage that throws.

### Cross-cutting (standing requirements)
- [ ] **AC17** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. The Bismillah line is Arabic in both languages, marked `lang="ar" dir="rtl"`.
- [ ] **AC18** Text on every board meets 4.5:1 contrast (large numerals at least 3:1). Check the wooden board's brass plates especially.
- [ ] **AC19** Screen readers hear each row as "prayer, time" (for example "Fajr, 5:10 AM"), whatever the visual style. The seven-segment digits are hidden from them and backed by plain text.
- [ ] **AC20** The picker is a labelled radio group: keyboard-usable, with visible focus, and with touch targets at least 44px.
- [ ] **AC21** The blinking colon and any glow animation stop under `prefers-reduced-motion`.
- [ ] **AC22** The boards look right **offline**: their fonts ship with the app (see §5), not from Google Fonts at runtime.
- [ ] **AC23** At 360×640, the board's first prayer row is visible without scrolling below the masjid header.

## 4. Screens

### 4.1 Masjid detail — `/masjid/:id` (changed)
Order, top to bottom: back button, masjid header (name, address, freshness, pin), **board**, **Board style picker**, volunteer "Update times" button (unchanged, last, thumb-reachable).

Skeleton loading stays as it is today. It doesn't need to imitate the board.

### 4.2 Labels — confirmed by Syed 2026-10-01 unless marked *draft*

| English | Tamil | Notes |
|---|---|---|
| Board style | பலகை வடிவம் | picker label |
| Jamaat times | ஜமாஅத் நேரங்கள் | board heading |
| Painted | வண்ணப் பலகை | *draft* |
| Digital | டிஜிட்டல் | *draft* |
| Wooden | மரப் பலகை | *draft* |
| {{prayer}} · Jamaat in {{time}} | {{prayer}} · ஜமாஅத்துக்கு இன்னும் {{time}} | *draft* |
| Next jamaat / tomorrow / no times / prayer names | *(existing keys)* | |

## 5. Data and code

- **No database change.** Nothing new is fetched.
- **Code layout** (names confirmed 2026-10-01), all in `features/prayerTimes/`:
  - `JamaatBoard.jsx`: works out the rows (prayer, formatted time, next/tomorrow flags) once, then renders the chosen style. The `JamaatTimeList` in `MasjidDetailPage.jsx` moves here.
  - `JamaatBoard.painted.jsx`, `JamaatBoard.digital.jsx`, `JamaatBoard.wooden.jsx`: drawing only, no logic. Same pattern as `PostCard.<type>.jsx`.
  - `useBoardStyle.js`: saved style plus setter. It copies the `useCalcMethod` pattern (that hook is on `feature/prayer-begins-times`, not yet on `develop`).
  - The picker component. Its name gets confirmed when it's built.
- **Stored values:** `painted` (default), `digital`, `wooden`.
- **Styling:** Tailwind for layout. Each style's colours go in `@theme` tokens in `src/index.css` (e.g. `--color-board-painted-gold`) rather than one-off hex values. Effects Tailwind can't express (wood grain, brass gradient, LED glow) go in one small CSS block per style.
- **Seven-segment digits:** an inline SVG per digit, built from a segment map. No font and no images.
- **Fonts:** bundle them with `@fontsource` packages so they're precached by the PWA and work offline (AC22). Use Marcellus (painted), Cinzel (wooden) and Amiri (Bismillah, Arabic subset only), loading only the weights in use. Tamil text falls back to Noto Serif Tamil or the system Tamil font, because the decorative faces have no Tamil letters. *Proposed: these would be the app's first web fonts, adding roughly 100 KB in total. Confirm in review.*

## 6. Out of scope

- Saving the style to `profiles` so it follows a signed-in user across phones (same reasoning as the calculation method).
- A per-masjid style, e.g. a masjid volunteer choosing the look that matches their real board.
- Showing Begins times or adhan times on the board.
- More styles, custom colours, or user-uploaded board photos.
- Using the board on the Prayer Times tab's masjid list.

## 7. Decisions and open questions

### Decided (2026-10-01)
1. **Three styles, and the user picks one** (Painted, Digital, Wooden), chosen over a single fixed style.
2. **Default is Painted.**
3. **The Bismillah line is on all three boards.**
4. **The digital board has the countdown** (AC11).
5. **Saved on the device only.**
6. **Names** in §5 and the "Board style" / ஜமாஅத் நேரங்கள் labels confirmed.

### Open
1. Tamil labels marked *draft* in §4.2.
2. Bundling the three web fonts (§5), or using system serif fonts instead (lighter, but loses most of the look).

## 8. Task checklist

- [x] T1 Write this spec; update the naming tables (CLAUDE.md + mbeat-rebuild-context.md). *(2026-10-01)*
- [ ] T2 Resolve §7's open questions.
- [ ] T3 `JamaatBoard.jsx` + painted style + fonts; replace the list on the detail page.
- [ ] T4 Digital style, with clock and countdown.
- [ ] T5 Wooden style.
- [ ] T6 `useBoardStyle.js` + Board style picker.
- [ ] T7 i18n pass: every key in `en.json` + `ta.json`; Tamil confirmed.
- [ ] T8 Walk through AC1–AC23 on a phone in both languages; tick the boxes.
- [ ] T9 PR `feature/jamaat-board` → `develop`, linking this spec.
