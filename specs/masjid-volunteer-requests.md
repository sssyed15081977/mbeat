# Spec: Masjid volunteer requests v1

**Status:** draft — awaiting review (T1)
**Branch:** `feature/masjid-volunteer-requests`
**Builds on:** [prayer-times.md](prayer-times.md), [jamaat-board.md](jamaat-board.md), [masjid-notices.md](masjid-notices.md)
**Schema:** not written yet (T2)

This file says **what v1 must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

A masjid with a single volunteer goes stale when that person is away, busy or loses interest. v1 aims for **at least 2 volunteers per masjid**. When a masjid has fewer, the app asks the people who pray there to help.

- **Asking, not joining.** A volunteer's jamaat times and notices go live without review, so nobody becomes a volunteer with one tap. A user sends a **Volunteer request**, and **either** a current volunteer of that masjid (in the app) **or** Syed (dashboard) approves it.
- **Shown only where it matters.** The full offer lives on the masjid page. The Prayer Times tab shows one small line for the selected masjid. The Update times screen asks the current volunteer to invite someone they trust.
- **The target is a constant in code** (`MIN_MASJID_VOLUNTEERS = 2`), not a database setting.
- **Generic table, masjid-only UI.** Requests go in `entity_member_requests`, so blood-donor or clinic membership can reuse it later. v1 only handles `role = 'masjid_volunteer'`.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see when my masjid needs volunteers | I know my help is wanted |
| U2 | Signed-in resident | offer to volunteer for a masjid in a few taps | I can help keep its times and notices current |
| U3 | Requester | see that my request is waiting | I don't send it twice or wonder if it worked |
| U4 | Masjid volunteer | approve or decline requests for my masjid | I choose who shares the work, without waiting on Syed |
| U5 | Masjid volunteer | invite someone I trust when I'm the only volunteer | the masjid isn't left without updates when I'm away |
| U6 | Syed (admin) | approve a request from the dashboard | a masjid whose volunteer is gone can still get a new one |

## 3. Acceptance criteria

v1 is done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Counting volunteers
- [ ] **AC1** The app can tell how many volunteers each published masjid has, **without** learning who they are. `entity_members` stays readable only by each user for their own rows.
- [ ] **AC2** A masjid "needs volunteers" when its count is **below `MIN_MASJID_VOLUNTEERS` (2)**. This is one constant in the code, used by every check below.

### Masjid page — `/masjid/:id` (non-volunteers)
- [ ] **AC3** When the masjid needs volunteers, the bottom of the page (where volunteers see **Update times / Add notice**) shows a **volunteer section**:
  - one line, e.g. "This masjid has 1 volunteer. Volunteers keep its jamaat times and notices up to date."
  - an **Offer to volunteer** button.

  The section has a stable anchor (`#volunteer`) so other screens can link to it.
- [ ] **AC4** When the masjid has enough volunteers, the section is not shown.
- [ ] **AC5** A guest who taps **Offer to volunteer** is sent to sign in and comes back to the masjid page (same pattern as pinning).
- [ ] **AC6** For a signed-in user, **Offer to volunteer** opens a bottom sheet with:
  - the masjid's name,
  - one line on what volunteers do,
  - an optional **note** ("Tell the volunteers who you are", max 200 characters),
  - a **Send request** button.
- [ ] **AC7** Sending creates one `pending` request. The sheet closes, and the section then reads "Request sent. A volunteer will review it." with no button. It reads the same on every later visit while the request is pending.
- [ ] **AC8** A user can't have **two pending requests** for the same masjid, can't request a masjid they already volunteer for, and can't request an unpublished masjid. The database enforces all three, not only the hidden button.
- [ ] **AC9** After a **declined** request, the section shows the normal **Offer to volunteer** button again.
- [ ] **AC10** Send error: the sheet keeps the note and shows "Couldn't send — try again".

### Masjid page — `/masjid/:id` (volunteers)
- [ ] **AC11** When the masjid has pending requests, volunteers see a **Volunteer requests** list above the **Update times / Add notice** buttons. Each row shows:
  - the requester's name,
  - their note, if any,
  - when they asked ("2 days ago"),
  - **Approve** and **Decline** buttons.
- [ ] **AC12** **Approve** asks for confirmation once ("Let {{name}} update this masjid's times and post notices?"), since it hands over posting rights that can't be removed in the app. On confirm, the requester becomes a `masjid_volunteer` and the row disappears. **Decline** needs no confirmation.
- [ ] **AC13** Approving or declining is allowed only for **volunteers of that masjid**; the database function checks it. A request is decided only once: if two volunteers act at the same time, the second gets "Already handled", and the list refreshes.
- [ ] **AC14** The requester's name comes from a function that returns **names only, never phone numbers**, and only to that masjid's volunteers.

### Prayer Times tab — `/`
- [ ] **AC15** When a masjid is selected and it needs volunteers, one muted line appears **below the Jamaat board**: "{{masjid}} needs volunteers. Offer to help →". It links to `/masjid/:id#volunteer`, and the masjid page scrolls to the volunteer section.
- [ ] **AC16** The line has a **✕** to dismiss it, remembered on the device per masjid for **30 days**. It's not shown to that masjid's own volunteers, or while the user has a pending request for it.
- [ ] **AC17** The line never pushes the Jamaat board down. It appears below the board only after the counts load, and nothing shows when they fail.

### Update times — `/masjid/:id/update` (volunteers only)
- [ ] **AC18** When the masjid needs volunteers, a short block above the form reads "You're the only volunteer for this masjid. Invite someone you trust." with an **Invite** button.
- [ ] **AC19** **Invite** shares a message plus the masjid page link with `#volunteer`, using the phone's share sheet (`navigator.share`). It falls back to a WhatsApp link (`https://wa.me/?text=…`). It uses the **same share helper** as the notice detail page (factored out of `MasjidNoticeDetail.jsx`, not copied).
- [ ] **AC20** When the masjid has pending requests, the same screen shows "{{count}} volunteer request(s) waiting →", linking to the masjid page's request list.
- [ ] **AC21** Neither block gets in the way of updating times: both sit above the form, are one or two lines each, and leave the form's primary action within thumb reach.

### Admin path
- [ ] **AC22** Syed can approve a request in the dashboard by setting its `status` to `approved`. The membership row is created by the database trigger in the same way as an in-app approval (check by hand).

### Cross-cutting (standing requirements)
- [ ] **AC23** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. Counts use i18next plurals ("1 volunteer" / "2 volunteers"). The requester's note is shown as typed, with `dir="auto"`.
- [ ] **AC24** Every new data-loading block handles the following states:
  - **loading:** a skeleton, or nothing for the tab's one-line prompt,
  - **empty:** the section is hidden,
  - **error:** a plain-language message and a retry for the request list; hidden for the prompts,
  - **offline.**
- [ ] **AC25** The bottom sheet isn't covered by the mobile keyboard while typing the note. Touch targets are at least 44px tall.

## 4. Screens

### 4.1 Masjid page — `/masjid/:id` (change)
The bottom of the page, by viewer:

| Viewer | Masjid needs volunteers | Masjid has enough |
|---|---|---|
| Guest | volunteer section; **Offer to volunteer** → sign in | nothing |
| Signed in, no request | volunteer section + **Offer to volunteer** | nothing |
| Signed in, request pending | "Request sent…" line | "Request sent…" line |
| Volunteer | **Volunteer requests** list (if any) + Update times / Add notice | same |

### 4.2 Offer to volunteer sheet
Bottom sheet, built the same way as `ChooseMasjidSheet`/`DisplaySettingsSheet`. It contains: masjid name · what volunteers do (one line) · optional note · **Send request**.

### 4.3 Prayer Times tab — `/` (change)
One dismissible line below the Jamaat board, for the selected masjid only (AC15–AC17). The tab adds no other UI.

### 4.4 Update times — `/masjid/:id/update` (change)
For volunteers, above the existing form: the invite block (AC18–AC19) and the waiting-requests link (AC20). The no-permission view for non-volunteers is unchanged.

### 4.5 Tamil labels
Drafts for Syed to check. The term "Volunteer request" and its Tamil form were confirmed 2026-10-14.

| English | Tamil (draft) | Notes |
|---|---|---|
| Volunteer request | தன்னார்வலர் கோரிக்கை | *Confirmed 2026-10-14* |
| Volunteer requests (list heading) | தன்னார்வலர் கோரிக்கைகள் | |
| Offer to volunteer | தன்னார்வலராக உதவ முன்வாருங்கள் | |
| This masjid has {{count}} volunteer(s). Volunteers keep its jamaat times and notices up to date. | இந்த மஸ்ஜிதுக்கு {{count}} தன்னார்வலர் உள்ளனர். தன்னார்வலர்கள் இதன் ஜமாஅத் நேரங்களையும் அறிவிப்புகளையும் புதுப்பித்து வைக்கிறார்கள். | |
| Tell the volunteers who you are (optional) | நீங்கள் யார் என்று தன்னார்வலர்களிடம் சொல்லுங்கள் (விருப்பம்) | |
| Send request | கோரிக்கையை அனுப்பவும் | |
| Request sent. A volunteer will review it. | கோரிக்கை அனுப்பப்பட்டது. ஒரு தன்னார்வலர் அதைப் பரிசீலிப்பார். | |
| Couldn't send — try again | அனுப்ப முடியவில்லை — மீண்டும் முயற்சிக்கவும் | |
| Approve | ஏற்கவும் | |
| Decline | நிராகரிக்கவும் | |
| Let {{name}} update this masjid's times and post notices? | {{name}} இந்த மஸ்ஜிதின் நேரங்களைப் புதுப்பிக்கவும் அறிவிப்புகளைப் பதிவிடவும் அனுமதிக்கவா? | |
| Already handled | ஏற்கனவே கையாளப்பட்டது | |
| {{masjid}} needs volunteers. Offer to help → | {{masjid}} மஸ்ஜிதுக்குத் தன்னார்வலர்கள் தேவை. உதவ முன்வாருங்கள் → | |
| You're the only volunteer for this masjid. Invite someone you trust. | இந்த மஸ்ஜிதுக்கு நீங்கள் மட்டுமே தன்னார்வலர். நம்பகமான ஒருவரை அழைக்கவும். | |
| Invite | அழையுங்கள் | |
| {{count}} volunteer request(s) waiting → | {{count}} தன்னார்வலர் கோரிக்கை காத்திருக்கிறது → | |
| (invite share text) Help keep {{masjid}}'s jamaat times up to date on Sahabi: | ஸஹாபியில் {{masjid}} ஜமாஅத் நேரங்களைப் புதுப்பித்து வைக்க உதவுங்கள்: | |

## 5. Data

One new migration. The names below are **proposed** until T1 (§7).

- **`entity_member_requests`** (*table name confirmed 2026-10-14*):
  - `id uuid primary key default gen_random_uuid()`
  - `entity_id uuid not null references entities(id) on delete cascade`
  - `user_id uuid not null references auth.users(id) on delete cascade`
  - `role text not null check (role in ('masjid_volunteer'))`, the same vocabulary as `entity_members.role`
  - `note text check (char_length(note) <= 200)`
  - `status text not null default 'pending' check (status in ('pending','approved','declined'))`
  - `created_at timestamptz not null default now()`, `decided_at timestamptz`, `decided_by uuid references auth.users(id)`, where `decided_by` is null when decided from the dashboard
  - unique partial index on `(entity_id, user_id, role) where status = 'pending'` (AC8)
- **Approval creates the membership in a trigger.** When `status` changes `pending → approved`, an `after update` trigger inserts the `entity_members` row (`on conflict do nothing`). This way the in-app path and the dashboard path (AC22) behave the same. A second trigger blocks any other status change: a decided request can't be changed again.
- **RLS:**
  - select: the requester sees their own rows; that masjid's volunteers see its rows (`is_masjid_volunteer(entity_id)`).
  - **No client insert or update policies**; the functions below are the only way in.
- **Functions** (`security definer`, like `create_masjid`):
  - `get_masjid_volunteer_counts()` → `(entity_id, volunteer_count)` for every published masjid. Counts only (AC1).
  - `request_to_volunteer(entity_id, note)` → new request id. It requires a signed-in caller, a published masjid, a caller who isn't already a volunteer of it, and no other pending request (AC8).
  - `decide_volunteer_request(request_id, approve boolean)`. It requires `is_masjid_volunteer` for the request's masjid and `status = 'pending'`; otherwise it raises "Already handled". It sets `status`, `decided_at` and `decided_by`, and the trigger does the rest (AC12, AC13).
  - `get_volunteer_requests(entity_id)` → `id, user_id, full_name, note, created_at` for pending requests, **only** to that masjid's volunteers (AC11, AC14). `get_author_names` can't be reused: it only returns names of people with a published post.
- **Client:**
  - data access in `features/masjidVolunteers/masjidVolunteersApi.js`;
  - the constant and the "needs volunteers" check in `features/masjidVolunteers/volunteerTarget.js`;
  - the share helper moved out of `MasjidNoticeDetail.jsx` into `lib/share.js`.
- **Tab dismissals** (AC16) are kept in `localStorage` under `mbeat_volunteer_prompt_dismissed`, as a map of masjid id → dismissed-at.

## 6. Out of scope for v1

- Removing a volunteer, or a volunteer stepping down, in the app (still a dashboard job).
- Push or WhatsApp notifications to volunteers about new requests.
- A requester cancelling their own pending request.
- A different target per masjid, or storing the target in the database.
- Showing who the current volunteers are to non-volunteers.
- Sharing phone numbers between requester and volunteers.
- A cool-down after a declined request.
- Volunteer requests for other entity kinds (the table allows them later).

## 7. Decisions and open questions

### Decided (2026-10-14)
1. **Approval by either** a current volunteer of the masjid (in the app) or Syed (dashboard).
2. **Names confirmed:** "Volunteer request" (UI term), Tamil தன்னார்வலர் கோரிக்கை, table `entity_member_requests`.
3. **Target of 2 is a constant in the code** for v1.
4. **The invite link on the Update times screen is in v1.**
5. **Placement:** the masjid page is the main place (full offer + request list); the Prayer Times tab gets one dismissible line; the Update times screen gets the invite and a waiting-requests link, not a join request.

### Open — to confirm in T1
6. **Proposed names:**
   - status values: `pending` / `approved` / `declined`;
   - columns: `note`, `decided_at`, `decided_by`;
   - database functions: `get_masjid_volunteer_counts`, `request_to_volunteer`, `decide_volunteer_request`, `get_volunteer_requests`;
   - folder: `features/masjidVolunteers/`;
   - share helper: `lib/share.js`;
   - anchor: `#volunteer`;
   - storage key: `mbeat_volunteer_prompt_dismissed`;
   - UI labels: "Offer to volunteer", "Volunteer requests", "Invite".
7. **Optional note on a request** (AC6): keep it, so volunteers know who is asking? Or drop it, and show the name only?
8. **Tab prompt dismissal period:** 30 days (AC16)?
9. **Approve confirmation** (AC12): keep the one confirmation, given that rights can't be removed in the app?
10. **Tamil drafts** in §4.5.

## 8. Task checklist

Work top to bottom; each task is small enough for one sitting.

- [ ] T1 Review this spec; resolve §7's open questions; add the locked names to CLAUDE.md and the handoff doc.
- [ ] T2 Migration: `entity_member_requests` + indexes, triggers, RLS, the four functions; `supabase db push`.
- [ ] T3 `masjidVolunteersApi.js`, `volunteerTarget.js`; move the share helper to `lib/share.js` and switch `MasjidNoticeDetail` to it.
- [ ] T4 Masjid page: volunteer section, Offer to volunteer sheet, "Request sent" state (AC3–AC10).
- [ ] T5 Masjid page: volunteer request list with Approve / Decline (AC11–AC14).
- [ ] T6 Prayer Times tab: dismissible line below the Jamaat board (AC15–AC17).
- [ ] T7 Update times: invite block + waiting-requests link (AC18–AC21).
- [ ] T8 i18n pass: every key in `en.json` + `ta.json`, with plurals.
- [ ] T9 Walk through AC1–AC25 on a phone in both languages, with a second account as the requester; approve once in the app and once from the dashboard (AC22); tick the boxes above.
- [ ] T10 PR `feature/masjid-volunteer-requests` → `develop`, with the PR description linking this spec.
- [ ] T11 After merge: tick T10, update this spec's Status line and the progress log in [mbeat-rebuild-context.md](../mbeat-rebuild-context.md).
