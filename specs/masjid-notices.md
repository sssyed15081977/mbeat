# Spec: Masjid notices v1

**Status:** built 2026-10-05 (T1–T9); next is T10, Syed's phone walkthrough
**Branch:** `feature/masjid-notices`
**Builds on:** [prayer-times.md](prayer-times.md), [jamaat-board.md](jamaat-board.md)
**Schema:** [20261005120000_add_masjid_notices.sql](../supabase/migrations/20261005120000_add_masjid_notices.sql), applied 2026-10-05

This file says **what v1 must do and how we know it's done**. The *why* lives in the handoff doc; don't repeat it here.

---

## 1. Goal

A masjid's notice board carries more than jamaat times: announcements, Quran ayahs, hadiths, duas and donation appeals. Today you only see them if you stand in front of the board. v1 puts them in the app, on **each masjid's page below its Jamaat board**, as **Masjid notices** posted by that masjid's volunteer. The Prayer Times tab keeps its jamaat times on top and only links to the notices.

- **Photo first, text optional.** Boards are often handwritten in Tamil and Arabic. A volunteer can post a photo of the board and add a caption only if they want to.
- **Auto-published.** A masjid volunteer's notice for their own masjid goes live immediately, with no review. Every other post type still starts `pending`. The trust check happens earlier: Syed publishes each masjid, and only its volunteers can post for it.
- **Ayahs and hadiths must name their source.** Misattributed hadiths spread widely on WhatsApp; mbeat shouldn't add to that.
- **Donations are a normal notice kind,** with an optional UPI ID and payment QR, the volunteer's name and a fixed "confirm with the masjid" note.
- **Notices are posts.** They live in `posts` (`type = 'masjid_notice'`), so they also appear in the Feed and use the shared post detail page.

## 2. Users and stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | Resident | see my masjid's latest notices on its page, under its jamaat times | I learn about bayans, events and appeals without visiting the board |
| U2 | Resident | read a hadith or ayah with its source | I can trust it, and look it up |
| U3 | Resident | pay a masjid's donation appeal from my phone in one tap | I don't have to scan a QR shown on my own screen |
| U4 | Resident | share a notice on WhatsApp | others in my family and groups see it |
| U5 | Masjid volunteer | post a photo of the notice board in a few taps | keeping notices current is no extra work |
| U6 | Masjid volunteer | set a date after which a notice disappears | old events don't clutter the board |
| U7 | Masjid volunteer | edit or remove a notice I posted | mistakes can be fixed |
| U8 | Syed (admin) | hide a bad notice quickly | a wrong or fraudulent post doesn't stay up |

## 3. Acceptance criteria

v1 is done when every box is ticked. Each criterion should be checkable by hand at a **mobile width (360px)** in **both English and Tamil**.

### Posting (masjid volunteers)
- [ ] **AC1** The masjid page shows an **Add notice** button **only** to that masjid's volunteers, beside the **Update times** button and using the same check.
- [ ] **AC2** The form asks for: **kind** (required; one of பொது அறிவிப்பு / General announcement, Ayah, Hadith, Dua, Donation), **photo** (optional), **title** (optional), **text** (optional), **Source** (shown only for Ayah and Hadith, required for them), **Show until** (optional date), and for Donation only, **UPI ID** and **payment QR** (both optional).
- [ ] **AC3** A notice needs **at least a photo, a title or text**. The Post button stays disabled until one is given.
- [ ] **AC4** Posting creates the `posts` row and the `masjid_notice` row **in one step** (all or nothing), already `published`, linked to the masjid by `posts.entity_id`. The client can't choose the moderation status, and a non-volunteer can't post for a masjid (RLS / database function enforces it, not only the hidden button).
- [ ] **AC5** After posting, the volunteer returns to the masjid page and the new notice is at the top of its notices.
- [ ] **AC6** Photos (board photo and QR) use the existing `post-photos` bucket, under the uploader's folder, same as death announcements.
- [ ] **AC7** Post error: the form keeps what was entered and shows "Couldn't post — try again".

### Viewing (everyone, including guests)
- [ ] **AC8** The **Prayer Times tab** shows no notice cards. Instead: (a) when a masjid is selected, the Jamaat board shows a **Notice board →** link that opens that masjid's page scrolled to its notices (always shown, even if the masjid has none); (b) a hint line above the masjid list reads "Tap a masjid to see its jamaat times and notice board."
- [ ] **AC9** The **masjid page** shows a **Notice board** section with all of that masjid's live notices below its board, newest first. This is the main place to see a masjid's notices.
- [ ] **AC10** The **Feed** shows masjid notices alongside other posts, each card naming its masjid.
- [ ] **AC11** A notice card shows: the kind label, the masjid name, the title (or, when there's no title, "Notice from {masjid}"), the photo if any, the start of the text, and when it was posted ("2 days ago").
- [ ] **AC12** Tapping a card opens the post detail page (`/post/:id`): full photo (tap to enlarge, reusing `ImageLightbox`), full text, source, "show until" date, masjid name (links to the masjid page) and the volunteer's name.
- [ ] **AC13** A notice with a **Show until** date disappears from the masjid page and the Feed **after that day ends** in Asia/Kolkata time. Opening it by link still works, with a "This notice has ended" line.
- [ ] **AC14** Ayah and Hadith notices always show their **Source** line ("Source: Sahih al-Bukhari 1").
- [ ] **AC15** Guests can see notices on the masjid page and in shared links, and can **open any published post's detail page (`/post/:id`) without signing in**. This opens death announcement links to guests too (§7 decision 8).
- [ ] **AC16** No likes, reactions or counts appear on notices.

### Donations
- [ ] **AC17** A Donation notice with a UPI ID shows a **Pay with UPI** button that opens the phone's UPI app (`upi://pay?pa=…&pn=<masjid name>&cu=INR`) and a **Copy UPI ID** button. The copy button is the fallback when no UPI app opens.
- [ ] **AC18** A Donation notice with a QR shows the QR image, tap to enlarge.
- [ ] **AC19** Every Donation notice shows "Posted by {name}, masjid volunteer" and the fixed note "Confirm with the masjid before paying." These can't be turned off by the poster.

### Editing, removing, sharing
- [ ] **AC20** The notice's author sees **Edit** and **Remove** on its detail page. Edit reuses the posting form, pre-filled, at `/post/:id/edit`.
- [ ] **AC21** **Remove** asks for confirmation once (it's destructive), then deletes the notice and returns to the masjid page. Only the author can remove it (RLS).
- [ ] **AC22** Every notice's detail page has a **Share** button. It uses the phone's share sheet (`navigator.share`) when available and falls back to a WhatsApp link (`https://wa.me/?text=…`). The shared text is the title (or "Notice from {masjid}") plus the notice's link.
- [ ] **AC23** Syed can hide a notice by setting `posts.moderation_status = 'hidden'` in the dashboard; it then disappears everywhere (check by hand).

### Cross-cutting (standing requirements)
- [ ] **AC24** Every string goes through `useTranslation()`, with keys in both `en.json` and `ta.json`. Notice content itself (title, text, source) is shown as typed and isn't translated.
- [ ] **AC25** Arabic text in a notice displays right-to-left correctly (`dir="auto"` on user text).
- [ ] **AC26** All new non-root pages render a `BackButton`.
- [ ] **AC27** Every screen handles loading (skeleton), empty ("No notices yet"), error (plain-language message + retry) and offline.
- [ ] **AC28** On the masjid page, the Notice board section loads below the Jamaat board without shifting it, and the posting form isn't covered by the mobile keyboard.

## 4. Screens

### 4.1 Prayer Times tab — `/` (change)
- **No notice cards here**, so the jamaat times stay the first thing residents see (§7 decision 10).
- **New on the Jamaat board:** when a masjid is selected, a **Notice board →** link to `/masjid/:id`, scrolled to the Notice board section. Always shown; the masjid page handles the empty case. Not shown when no masjid is selected.
- **New above the masjid list:** one muted hint line, "Tap a masjid to see its jamaat times and notice board."

### 4.2 Masjid page — `/masjid/:id` (change)
- **New:** a **Notice board** section below the board: all live notices, newest first. It's the target of the Prayer Times tab's **Notice board →** link, so it needs a stable anchor.
- **Empty:** "No notices yet" in one muted line (not hidden, so residents learn the section exists).
- **Volunteers:** **Add notice** button beside **Update times**, at the bottom within thumb reach.

### 4.3 Add notice — `/masjid/:id/notice/new` (`pages/NewMasjidNoticePage.jsx`)
- **Content:** a `BackButton` (to `/masjid/:id`), the masjid's name as context, then the fields in AC2 in this order: kind (segmented chips), photo, title, text, source (Ayah/Hadith), UPI ID + QR (Donation), show until.
- **Primary action:** **Post**, disabled until AC3 is met.
- **No permission:** a non-volunteer who opens the URL sees "You can't post notices for this masjid." (same pattern as prayer-times.md AC16).

### 4.4 Notice detail — `/post/:id` (existing page, new type)
- `PostDetailPage` renders a new `MasjidNoticeDetail` for `type = 'masjid_notice'`, the same way it renders `DeathAnnouncementDetail` today.
- **Order:** kind label · masjid name (link) · title · photo · text · source · donation block (AC17–AC19) · show-until / ended line · posted by + when · Share · (author only) Edit, Remove.
- **Back:** to wherever the notice was opened from (masjid page or Feed). When opened directly, e.g. from a WhatsApp link, back goes to the notice's masjid page.
- **Guests:** the route no longer requires sign-in (AC15).

### 4.5 Edit notice — `/post/:id/edit` (existing route, new type)
- The route currently always renders `EditDeathAnnouncementPage`; it needs to pick the edit form by post type. The notice edit form is the 4.3 form pre-filled. The kind can't be changed after posting (keeps the Source / Donation rules simple).

### 4.6 Tamil labels

Rows without a date in Notes were confirmed 2026-10-05.

| English | Tamil | Notes |
|---|---|---|
| Masjid notice (post type) | அறிவிப்பு | *Locked 2026-10-03* |
| Notice board (section heading) | அறிவிப்புப் பலகை | *Locked 2026-10-03* |
| General announcement (kind) | பொது அறிவிப்பு | *Locked 2026-10-03* |
| Ayah | ஆயத் | *Locked 2026-10-03* |
| Hadith | ஹதீஸ் | *Locked 2026-10-03* |
| Dua | துஆ | *Locked 2026-10-03* |
| Donation | நன்கொடை | *Locked 2026-10-03* |
| Source | ஆதாரம் | *Locked 2026-10-03* |
| Show until | வரை காட்டு | *Locked 2026-10-03* |
| Add notice | அறிவிப்பைச் சேர்க்கவும் | |
| Post | பதிவிடு | follows the 2026-09-27 பதிவு decision |
| Posting… | பதிவிடப்படுகிறது… | |
| Kind | வகை | |
| Title | தலைப்பு | |
| Text | விவரம் | |
| Photo of the notice | அறிவிப்பின் புகைப்படம் | |
| UPI ID | UPI ஐடி | |
| Payment QR | பணம் செலுத்தும் QR | |
| Notice board → (link on the Jamaat board) | அறிவிப்புப் பலகை → | reuses the locked section name |
| Tap a masjid to see its jamaat times and notice board. | ஜமாஅத் நேரங்களையும் அறிவிப்புப் பலகையையும் பார்க்க மஸ்ஜிதைத் தொடவும். | hint above the masjid list |
| No notices yet | இன்னும் அறிவிப்புகள் இல்லை | |
| Notice from {{masjid}} | {{masjid}} அறிவிப்பு | |
| This notice has ended | இந்த அறிவிப்பு முடிந்துவிட்டது | |
| Pay with UPI | UPI மூலம் செலுத்தவும் | |
| Copy UPI ID | UPI ஐடியை நகலெடுக்கவும் | |
| Copied | நகலெடுக்கப்பட்டது | |
| Confirm with the masjid before paying. | பணம் செலுத்தும் முன் மஸ்ஜிதிடம் உறுதிசெய்யவும். | |
| Posted by {{name}}, masjid volunteer | பதிவிட்டவர்: {{name}}, மஸ்ஜித் தன்னார்வலர் | |
| Share | பகிரவும் | |
| Edit | திருத்தவும் | |
| Remove | நீக்கவும் | |
| Remove this notice? | இந்த அறிவிப்பை நீக்கவா? | |
| Couldn't post — try again | பதிவிட முடியவில்லை — மீண்டும் முயற்சிக்கவும் | |
| You can't post notices for this masjid. | இந்த மஸ்ஜிதுக்கு நீங்கள் அறிவிப்புகளைப் பதிவிட முடியாது. | |
| Add a photo, a title or some text. | புகைப்படம், தலைப்பு அல்லது விவரம் சேர்க்கவும். | |

## 5. Data

One new migration. All names below are confirmed (§7).

- **`posts.type`:** add `'masjid_notice'` to the check.
- **`posts.entity_id`** — `uuid null references entities(id) on delete cascade`, indexed. Which entity published the post; null for posts by individuals (every existing post). *Locked 2026-10-03.*
- **`masjid_notice`** — 1:1 extension of `posts`, same pattern as `death_announcement`:
  - `post_id uuid primary key references posts(id) on delete cascade`
  - `kind text not null check (kind in ('announcement','ayah','hadith','dua','donation'))`
  - `source_reference text` — check: required when `kind in ('ayah','hadith')`
  - `show_until date` — local Melapalayam date; the notice is live through the end of that day (Asia/Kolkata)
  - `photo_url text`
  - `upi_id text`, `payment_qr_url text` — check: null unless `kind = 'donation'`
- **Title:** `posts.title` is `not null`. A notice with no title stores `''`, and the UI shows the translated "Notice from {masjid}" instead. This keeps the fallback bilingual, unlike storing a generated English title. `search_vector` still covers the text.
- **Posting is one database function** (`rpc`), like `create_masjid`: `create_masjid_notice(entity_id, kind, title, description, source_reference, show_until, photo_url, upi_id, payment_qr_url)`. It's `security definer` and:
  - requires `is_masjid_volunteer(entity_id)` and a published masjid,
  - inserts `posts` (`type = 'masjid_notice'`, `author_id = auth.uid()`, `moderation_status = 'published'`) and `masjid_notice` together,
  - returns the new post id.

  This is the narrow exception to "every post starts `pending`". The existing `posts_insert_own` policy is unchanged, so a client still can't insert a published post directly. The migration header must say so.
- **No insert policy on `masjid_notice`.** The function is the only way to create one. Don't copy `death_announcement_insert_own` across; that would let any author attach a notice row to their own `pending` post without the volunteer check.
- **Editing:** the existing `posts_update_own` policy + `posts_protect_moderation_columns` trigger already let an author edit content but not `moderation_status`, `author_id`. The trigger must also lock `entity_id`, so an author can't move a notice to another masjid. New `masjid_notice` update policy: author only (mirrors `death_announcement_update_own`). `kind` is locked by a trigger.
- **Removing:** new `posts` delete policy: `author_id = auth.uid() and type = 'masjid_notice'`. The extension row goes with it (`on delete cascade`). Other post types still can't be deleted from the app. *(Photos left in Storage aren't cleaned up in v1.)*
- **Reading:** `masjid_notice` select policy mirrors `death_announcement_select`. Notice queries filter `show_until is null or show_until >= today in Asia/Kolkata`, worked out on the client and passed to the query.
- **Poster's name (AC12, AC19):** `profiles` is readable only by its owner, and it also holds phone numbers, so it can't simply be opened up. So a `security definer` function `get_author_names(user_ids uuid[])` returns only `id, full_name` (§7 decision 9).
- **Code:** data access in `features/masjidNotice/masjidNoticeApi.js`. `feedApi.fetchPosts()` gains a join to `masjid_notice` and the entity name. `PostCard` gets its type dispatch now (`PostCard.masjidNotice.jsx`), as its own comment planned for when a second type arrived.

## 6. Out of scope for v1

- Reading the text out of a notice-board photo with AI (stays a later idea).
- Reactions, likes, comments on notices.
- Notices from anything other than masjids (the `entity_id` column allows it later).
- Pinning a notice to the top, or ordering other than newest first.
- Push notifications for new notices.
- A review queue or in-app moderation; hiding is a dashboard action (AC23).
- Cleaning up Storage files of removed notices.
- Several photos per notice (one board photo, plus one QR for donations).
- Linking a masjid's death announcement notice to a Death Announcement post. Volunteers should post deaths as Death Announcements; v1 doesn't enforce it.
- Translating notice content between Tamil and English.

## 7. Decisions and open questions

### Decided (2026-10-03)
1. **Build on Prayer Times** rather than starting blood requests or Find Now.
2. **Names locked:** `masjid_notice` (type, extension table), folder `features/masjidNotice/`, section "Notice board", `posts.entity_id`, `kind` values `announcement`/`ayah`/`hadith`/`dua`/`donation`, `source_reference`, `show_until`, `photo_url`, `upi_id`, `payment_qr_url`, and the Tamil labels marked *Locked* in §4.6.
3. **One post type with kinds**, not separate post types per kind.
4. **Notices also appear in the Feed.**
5. **Donations are in v1**, as a normal kind with an optional UPI ID and payment QR.
6. **Auto-publish** a volunteer's notices for their own masjid; no review queue.

### Decided (2026-10-05)
7. **Names locked:** route `/masjid/:id/notice/new`, page `NewMasjidNoticePage.jsx`, database functions `create_masjid_notice` and `get_author_names`, component `MasjidNoticeDetail`.
8. **`/post/:id` is open to guests.** Shared WhatsApp links shouldn't ask readers to sign in. RLS already allows it (that migration's comment says it was meant for share links). This opens death announcement links to guests too.
9. **Show the volunteer's name,** through `get_author_names` (§5), which returns names only and never phone numbers.
10. **No notice cards on the Prayer Times tab** (Syed's call, replacing the "3 newest cards" proposal): notices live on the masjid page, so the tab's jamaat times are never pushed down. The tab gets a **Notice board →** link on the Jamaat board (always shown when a masjid is selected) and a hint line above the masjid list.
11. **Back from a notice's detail page** goes to wherever it was opened from; from a direct link, to the notice's masjid page.
12. **Tamil labels** in §4.6 confirmed, with "Posting…" as பதிவிடப்படுகிறது… and "See all" dropped.

## 8. Task checklist

Work top to bottom; each task is small enough for one sitting.

- [x] T1 Review this spec; resolve §7's open questions; add the locked names to CLAUDE.md and the handoff doc. *(done 2026-10-05)*
- [x] T2 Migration: `posts.type` + `posts.entity_id`, `masjid_notice` table + checks, `create_masjid_notice`, `get_author_names`, update/delete policies, trigger change; `supabase db push`. *(done 2026-10-05)*
- [x] T3 `masjidNoticeApi.js` + the posting form at `/masjid/:id/notice/new`, with photo and QR upload. Reached from the masjid page's **Add notice** button. *(done 2026-10-05)*
- [x] T4 Notice cards: `PostCard` type dispatch + `PostCard.masjidNotice.jsx`; Notice board section on the masjid page. *(done 2026-10-05)*
- [x] T5 Prayer Times tab: **Notice board →** link on the Jamaat board + hint line above the masjid list. *(done 2026-10-05)*
- [x] T6 Detail page: `MasjidNoticeDetail`, donation block, Share; move `/post/:id` out of sign-in so guests can open it. *(done 2026-10-05)*
- [x] T7 Edit and Remove: `/post/:id/edit` picks the form by type; delete with one confirmation. *(done 2026-10-05)*
- [x] T8 Feed: include notices with their masjid name; expired notices filtered out. *(done 2026-10-05)*
- [x] T9 i18n pass: every key in `en.json` + `ta.json`. *(done 2026-10-05)*
- [ ] T10 Post the first real notices for the 3 pilot masjids; walk through AC1–AC28 on a phone in both languages; tick the boxes above.
- [x] T11 PR `feature/masjid-notices` → `develop`, with the PR description linking this spec. *(opened as draft #10, 2026-10-05)*
