# Stitch Design Prompts — "Pitchside" Visual Language

Companion to the cahier des charges (`CoachAI — Cahier des Charges`, Claude Doc),
Section 9 screen list, and matched 1:1 against the real routes in
`apps/web/src/app/[locale]/`.

## Why this direction

Generic AI-generated SaaS UI defaults to purple-to-blue gradients, floating
white cards with soft drop shadows, the Inter font, and stock icon packs — it
reads as a template, not a considered product. For CoachAI, this brief
instead borrows its visual language from the objects a coach actually works
with: the tactics board, the matchday team sheet, the touchline chalk marks.
That is where "creative and innovative" comes from here — not decoration, a
genuine metaphor.

**Innovation rule: no two screens should share the same layout skeleton.**
If a prompt below starts drifting toward "header + grid of white rounded
cards," stop and reach for a different object metaphor (a clipboard, a
scoreboard ticker, a scouting dossier, a stamped team sheet — see each
screen's prompt). Every screen must earn its layout from what a coach
actually does on that screen, not from a reusable dashboard template.

## Shared Style DNA

Paste this once if Stitch retains a style across screens; otherwise each
screen prompt below repeats the essentials so it stays on-brand alone.

```
Palette: deep near-black pitch green "Night Pitch" (#12231C) as the primary dark surface; warm off-white "Chalk" (#F7F5EF) as the light surface, never pure white; bold "Touchline Red" (#E3402A) as the one accent color for primary actions and alerts, used sparingly; muted "Pitch Green" (#2F6D4F) for success states. No purple, no blue-to-purple gradients anywhere.
Typography: a bold condensed sport-broadcast display face (Archivo Black / Anton style) for scores, formations, section titles and numbers; a warm humanist sans (IBM Plex Sans, paired with IBM Plex Sans Arabic for RTL) for body text — never the default Inter font.
Iconography: hand-sketched, slightly imperfect chalk-line icons — arrows, X/O markers, formation dots — like a real tactics board, never a geometric stock icon pack.
Texture: a very subtle grain/chalk-dust texture on dark surfaces instead of flat color or gradients; thin hairline rules instead of heavy drop-shadow cards.
Motion principle ("Pitchside Motion"): movement follows curved arcs like a pass, never straight linear slides; dragged elements lift with an expanding soft shadow, a 2-4 degree tilt and a spring/overshoot settle on drop, like picking up and placing a physical player token; confirmations render as a quick hand-drawn chalk checkmark or strikethrough stroke, not a generic icon fade.
Avoid entirely: purple/blue gradients, glassmorphism, generic rounded drop-shadow cards floating on white, default Material/Feather icon packs, centered symmetric hero-section layouts, the Inter font, generic four-stat-card dashboard rows, and reusing the same card-grid skeleton on more than one screen.
```

## How to use these prompts

CoachAI is **web-only** (one Next.js codebase, no native app) but must work
from a coach's phone on the touchline up to a laptop in the office. Each
page below is generated as **two separate Stitch screens — a Web prompt
and a Mobile prompt** — not one "responsive" screen. Don't let Stitch (or
whoever is prompting it) collapse them into a single adaptive mockup or
invent a middle-ground layout: generate both explicitly, then a developer
reconciles them into one responsive implementation.

**This is the complete page list.** It is generated directly from the app's
real routes (`apps/web/src/app/[locale]/`). Do not add, merge, split, or
skip pages when prompting Stitch — if a page is missing here, add it to this
file first rather than letting it get designed ad hoc.

| # | Page | Route |
|---|---|---|
| 1 | Landing / marketing | `/` |
| 2 | Log in | `/login` |
| 3 | Sign up | `/signup` |
| 4 | Join via invite | `/invite/[token]` |
| 5 | Coach onboarding | `/onboarding` |
| 6 | Dashboard | `/dashboard` |
| 7 | Teams — list | `/teams` |
| 8 | Teams — create | `/teams/new` |
| 9 | Teams — detail | `/teams/[id]` |
| 10 | Players — list | `/players` |
| 11 | Players — board (drag-and-drop) | `/players/board` |
| 12 | Players — add | `/players/new` |
| 13 | Players — profile | `/players/[id]` |
| 14 | Matches — history | `/matches` |
| 15 | Matches — add | `/matches/new` |
| 16 | Matches — CSV import | `/matches/import` |
| 17 | Matches — detail / match events | `/matches/[id]` |
| 18 | Opponents — list | `/opponents` |
| 19 | Opponents — add | `/opponents/new` |
| 20 | Opponents — dossier | `/opponents/[id]` |
| 21 | AI Coach Assistant | `/assistant` |
| 22 | Settings | `/settings` |

Each entry below has: a **Web prompt** (desktop/tablet, ≥768px — paste as
one Stitch generation), a **Mobile prompt** (phone, <768px — paste as a
second, separate Stitch generation), and **Motion notes** (a brief for the
developer implementing the interaction in code — Stitch only renders
static screens, so these aren't for Stitch).

---

## 1. Landing / marketing — `/`

**Web prompt:**
```
A full-bleed Night Pitch dark hero, no header nav bar — just the CoachAI wordmark top-left in the bold condensed display face. Centered, a large hand-chalked headline in Chalk white ("Your tactical co-pilot") over a faint hand-drawn pitch-and-arrow illustration bleeding off the edges of the viewport, not a boxed hero image. A single Touchline Red pill CTA button below the headline. Below the fold, three "matchday briefing" style panels (not stat cards) illustrating prepare / review / ask-the-AI, each a slightly rotated team-sheet paper on a Chalk background. A quiet language switcher (FR / AR / EN as shirt-number tabs) sits bottom-left.
```

**Mobile prompt:**
```
Same Night Pitch hero but single-column and shorter: wordmark top-left, hand-chalked headline and the pitch illustration scaled down and cropped to stay legible at phone width, CTA pill full-width below the headline. The three briefing panels stack full-width in a single column below the fold instead of sitting side by side. Language switcher moves into a small top-right menu instead of sitting bottom-left.
```

- Motion notes: the pitch illustration's chalk arrows draw themselves stroke-by-stroke on load (about 1.2s total); the CTA pill has a subtle idle pulse on its red border (not a bounce) to draw the eye without looking like a notification badge.

---

## 2. Log in — `/login`

**Web prompt:**
```
A full-screen split layout: left third is a deep Night Pitch dark panel with a large hand-chalked ball-trajectory illustration arcing across it and the wordmark "CoachAI" in the bold condensed display face; right two-thirds is a Chalk-white panel holding the login form. Inputs are minimal underlined fields, not boxed, labeled above in small caps. The primary button is a solid Touchline Red pill labeled "Enter the dressing room" with a small chalk-arrow icon. Below the form, two quiet secondary links: "New here? Create a club" and "Have an invite code? Join your club's squad instead."
```

**Mobile prompt:**
```
The Night Pitch panel collapses to a short dark header band (wordmark and a small version of the chalk ball-trajectory illustration) above a full-width Chalk form panel below it, rather than a side-by-side split. Inputs and the CTA pill span the full width. The two secondary links stack on their own line each, with enough spacing to stay comfortably tappable.
```

- Motion notes: the arrow icon in the submit button nudges forward 4px along a curved path on hover/focus; on submit, the button morphs into a small spinning-ball loader instead of a generic spinner.

---

## 3. Sign up — `/signup`

**Web prompt:**
```
Same split layout as Log in (Night Pitch panel left third, Chalk form panel right two-thirds) so the two screens read as a pair, but the right panel form collects club name and coach name in addition to email/password, under the heading "Create your club". The primary button reads "Set up the dressing room". A laminated-tab style toggle at the top of the form lets a visitor flip to "Log in" instead without a full page navigation.
```

**Mobile prompt:**
```
Same collapsed single-column structure as the mobile Log in screen (dark header band above a full-width form), with the extra club-name and coach-name fields stacked in the same underlined-field style. The Log in / Sign up toggle becomes two equal-width tabs pinned just under the header band.
```

- Motion notes: the Log in / Sign up tab switch cross-fades the form fields with a slight upward arc rather than a flat slide, matching the tab motion described for onboarding.

---

## 4. Join via invite — `/invite/[token]`

**Web prompt:**
```
A single centered card on a Chalk background (no split panel — this is a one-off arrival screen, not the main auth flow) styled like a hand-written invitation note pinned with a small chalk drawing pin icon. It shows the inviting club's name and crest placeholder in the display face, the text "You've been added to the squad", and a single Touchline Red pill button "Accept and join [Club Name]". Below it, small print explains the invited email must match to proceed, with a muted link "Wrong account? Log in as someone else."
```

**Mobile prompt:**
```
The same pinned-note card, now full-width with generous side padding instead of a fixed centered card width, stacked content (club name, message, button) all full-width. The pin icon and card shadow scale down slightly to avoid dominating the small viewport.
```

- Motion notes: the card enters with a slight paper-drop-and-settle (falls 12px and eases to rest with a small bounce), like a note being pinned up; on accept, the pin icon "pops" with a quick scale burst before navigating to onboarding.

---

## 5. Coach onboarding — `/onboarding`

**Web prompt:**
```
A single-column step wizard styled as a physical team-sheet clipboard viewed with a subtle 2-degree perspective tilt, centered in the viewport at a comfortable reading width (not full-bleed). Step dots along the top are small football icons that fill Touchline Red as each step completes. Step 1 collects name and preferred language as three shirt-number-style toggle tabs: FR / AR / EN. Step 2, "Your Philosophy", shows a horizontal row of large tappable formation glyphs (4-3-3, 4-4-2, 3-5-2) drawn in the chalk-line icon style; selecting one draws a hand-drawn circle stroke around it. Step 3 asks playing style and risk tolerance via a horizontal tempo-gauge slider from "Cautious" to "All-in", marked by a small flag icon.
```

**Mobile prompt:**
```
The same clipboard wizard, now full-width with the 2-degree tilt reduced to near-flat (a strong tilt reads as a layout bug at small sizes). The row of formation glyphs in Step 2 becomes a horizontally swipeable strip instead of a fixed row, since three large glyphs side-by-side won't fit a phone width. The tempo-gauge slider in Step 3 spans the full width with a larger touch handle.
```

- Motion notes: step transitions use a paper-turn skew, like flipping a clipboard page, not a flat slide; selecting a formation glyph draws its circle outline stroke-by-stroke over about 300ms; the tempo slider's flag has slight elastic lag when dragged.

---

## 6. Dashboard — `/dashboard`

**Web prompt:**
```
Not a grid of stat cards — a "matchday briefing sheet" instead. A Night Pitch dark header band shows the next match as a broadcast-style scoreline card: crest placeholder, "vs [Opponent]", a stadium-clock countdown in bold tabular numerals, and formation badges for both teams. Below it, three quick-action tiles styled as slightly scattered team-sheet cards (rotated -1, 0 and 1 degree, like papers on a desk) for "Prepare this match", "Review last match" and "Ask the AI Coach", each with a chalk-line icon and a one-line AI insight teaser. A slim sidebar lists upcoming fixtures as a vertical timeline with a moving "you are here" marker.
```

**Mobile prompt:**
```
The Night Pitch scoreline band stays full-width at top but shrinks the countdown clock and drops the formation badges to a smaller inline row under the score. The three quick-action tiles stack full-width in a single column, rotation reduced to a subtle ±0.5 degree so they don't visually overlap at narrow widths. The fixtures sidebar moves below the quick-action tiles as a horizontally scrollable strip of upcoming-match chips instead of a vertical timeline.
```

- Motion notes: on load, the three tiles drop into their resting rotated position with a staggered spring (about 80ms apart), like papers being set down one after another; the countdown clock ticks with a mechanical flip-number animation, never a fade.

---

## 7. Teams — list — `/teams`

**Web prompt:**
```
A roster-book layout: teams listed as folder-style index tabs along the left edge, each labeled in the display face and color-coded by age category, with a player-count and formation-glyph preview on each tab. The main panel shows whichever team is hovered/focused as a quick-glance summary card (crest placeholder, formation mini-pitch diagram, coach notes excerpt) with a Touchline Red "Open team" pill. A small "+ New team" tab sits at the bottom of the index, visually distinct (dashed chalk-line border) from the real team tabs.
```

**Mobile prompt:**
```
The folder-tab index becomes a vertical list of full-width team rows (crest, name, age category badge, player count) instead of side tabs — tapping a row navigates straight to the team detail page rather than showing an inline preview panel, since there's no room for a side-by-side preview at phone width. The "+ New team" entry is the last row, styled with the same dashed chalk-line border treatment.
```

- Motion notes: hovering/focusing a team tab on web slides the summary panel's content in with a soft horizontal arc, not a snap; on mobile, tapping a row triggers a brief chalk-underline sweep under the row label before navigating.

---

## 8. Teams — create — `/teams/new`

**Web prompt:**
```
A centered blank-team-sheet form on Chalk, styled like a fresh physical team sheet laid on a desk with a very slight drop shadow (not a boxed card — the page background shows through around the paper's edges). Fields: team name, age category (as shirt-number tabs), default formation (the same large tappable formation glyphs as onboarding). A Touchline Red "Create team" stamp-style button bottom-right of the sheet.
```

**Mobile prompt:**
```
The team-sheet paper becomes full-bleed (edge to edge, no visible page margin around it) so it reads as the whole screen rather than a floating card. Formation glyphs become a horizontally swipeable strip as in the mobile onboarding Step 2. The "Create team" button becomes a full-width bar pinned to the bottom of the viewport rather than inline at the sheet's bottom-right.
```

- Motion notes: selecting a formation glyph draws its circle outline stroke-by-stroke, matching onboarding; on submit, the whole sheet briefly "lifts" (scale 1.02, shadow expands) before the success chalk-checkmark animation plays and the page navigates to the new team's detail.

---

## 9. Teams — detail — `/teams/[id]`

**Web prompt:**
```
An editable team-sheet header card at the top (team name, age category, default formation dropdown) with a live pitch diagram beside it — small chalk-line pitch outline with dots for each starting position, repositioning the moment the formation dropdown changes. Below, the squad renders as a compact roster list grouped by position (Goalkeepers, Defenders, Midfielders, Forwards), each row a mini player-token (jersey number, name, rating dial) — this is a read/manage view, distinct from the drag-and-drop Players board.
```

**Mobile prompt:**
```
The header card and pitch diagram stack vertically instead of sitting side by side, with the pitch diagram scaled to a smaller fixed size centered under the header fields. The position-grouped roster list stays a single column (it already reads well at phone width) but position group headers become sticky while scrolling, so a coach always knows which group they're looking at.
```

- Motion notes: changing the formation dropdown animates the pitch dots repositioning along curved paths to their new spots over about 400ms, never snapping instantly; sticky group headers on mobile have a subtle 1px chalk hairline that appears only once the header is pinned, to signal it's "stuck".

---

## 10. Players — list — `/players`

**Web prompt:**
```
A dense scouting-ledger table on Chalk: rows styled like ruled lines on a paper ledger rather than a boxed data-grid — thin hairline row dividers, no cell borders, no zebra-striping. Columns: jersey-number badge, name, position, team, a 1-10 rating dial, availability shown as a small colored jersey-pin icon. A clipboard-clip styled search bar and position-filter chips sit above the table. Clicking a row navigates to that player's profile.
```

**Mobile prompt:**
```
The ledger table becomes a single-column list of player-token row cards (jersey badge, name, position, rating dial, availability pin all in one compact row) instead of a multi-column table, since a wide table can't fit phone width without horizontal scrolling. The search bar and filter chips sit above, with filter chips in a horizontally scrollable strip.
```

- Motion notes: filtering by a position chip re-sorts the list with a FLIP-style reflow (rows slide to their new position, not a jump-cut or fade); row press on mobile gives a brief chalk-underline sweep before navigating, matching the Teams list row interaction.

---

## 11. Players — board (drag-and-drop) — `/players/board`

**Web prompt:**
```
A vertical depth-chart board styled as a magnetic tactics whiteboard: grouped lanes ("Starting XI", "Bench", "Reserves", or a custom coach-named group) rendered as chalk-outlined horizontal zones on a Night Pitch board, laid out side by side as columns so a coach can see all lanes at once. Each player is a small rounded token card — jersey-number badge, name, position abbreviation, a tiny 1-10 rating dial — styled like a magnetic player counter. A thin chalk-line clipboard-clip styled search bar sits at the top. Tapping a token flips it to reveal the full profile on the back: age, ratings as a small pentagon/radar chart, availability as a colored jersey-pin icon, coach notes.
```

**Mobile prompt:**
```
The lanes stack as full-width vertical sections (Starting XI, then Bench, then Reserves, scrollable top to bottom) instead of side-by-side columns, since multiple columns can't fit phone width. Each lane header is sticky while its tokens scroll past underneath, and a lane can be collapsed/expanded by tapping its header to help long rosters fit. Player tokens keep the same visual design but grow slightly to keep a comfortable touch target for drag.
```

- Motion notes (the flagship interaction, spec this precisely for the developer): drag lift is 150ms ease-out with the shadow expanding, a 3-degree rotate and a 1.04x scale; the dragged token trails the cursor with a slight elastic lag rather than tracking 1:1; dropping into a lane settles with a spring overshoot of about 8% before resting, over roughly 400ms, and the lane briefly pulses a 2px Touchline Red outline once over 500ms to confirm the drop; the profile flip is a 3D Y-axis rotation over 350ms; reordering within a lane reflows neighboring tokens by sliding them to their new slot (a FLIP-style animation), never a jump-cut.
- Responsive notes: on touch devices the drag lift triggers on a short press-and-hold rather than immediately on touchdown, so a tap-to-flip and a drag-to-reorder don't conflict; touch targets on each token stay at least 44px tall; cross-lane dragging on mobile (moving a token from a collapsed lane into another) auto-expands the destination lane when a dragged token hovers over its collapsed header for ~400ms.

---

## 12. Players — add — `/players/new`

**Web prompt:**
```
A centered blank player-token form on Chalk, styled like filling out a physical player registration card. Fields: name, jersey number (shown live updating a preview token badge as you type), position (chalk-line position-pitch glyph picker — tap a zone on a small pitch outline instead of a dropdown), team assignment, initial 1-10 rating dial (draggable dial, not a number input). A live preview of the resulting player token sits to the right of the form as you fill it in.
```

**Mobile prompt:**
```
The live token preview moves above the form (instead of beside it) as a small pinned card that updates as fields are filled, since there's no room for a side-by-side preview. The position picker's mini pitch outline stays but grows to a comfortable tap size; the rating dial becomes a horizontal drag-slider instead of a circular dial, which is easier to operate with a thumb.
```

- Motion notes: the live preview token updates each field with a tiny flash-highlight (not a hard refresh) so it reads as "live"; submitting draws a quick chalk-checkmark stroke across the preview token before navigating to the player's new profile.

---

## 13. Players — profile — `/players/[id]`

**Web prompt:**
```
A two-column player-profile "scouting card": left column is a large vertical player-token card (jersey badge, name, position, photo placeholder as a chalk-sketch silhouette, availability pin) with ratings shown as a pentagon/radar chart beneath it; right column holds tabbed sections — Coach Notes (handwritten-note styling), Recent Matches (compact scoreline ticker rows), Comparisons — switched via folder-divider tabs, not a generic underline tab bar.
```

**Mobile prompt:**
```
The two columns stack: the player-token card and radar chart first, full-width, followed by the tabbed sections below. The folder-divider tabs become a horizontally scrollable strip of tabs rather than a fixed row, matching the Opponents dossier pattern.
```

- Motion notes: switching between profile tabs uses a soft horizontal swipe, like flipping folder dividers (shared motion language with the Opponents dossier); the radar chart draws its outline stroke-by-stroke on first view, about 500ms.

---

## 14. Matches — history — `/matches`

**Web prompt:**
```
History as a vertical scoreboard ticker: each past match is a horizontal strip styled like a broadcast lower-third graphic, showing date, opponent and score in bold tabular numerals, with a colored result stripe along the left edge (Touchline Red for a loss, Pitch Green for a win, chalk-gray for a draw). Two distinct entry points sit above the ticker as team-sheet-style tiles: "Add match" and "Import from spreadsheet" (the latter showing a small hand-drawn illustration of a spreadsheet pouring into a folder).
```

**Mobile prompt:**
```
The scoreboard ticker strips stay full-width single rows (already mobile-friendly) but drop the date to a smaller secondary line under the opponent name to keep the score numerals large and legible. The "Add match" and "Import from spreadsheet" tiles stack full-width above the ticker instead of sitting side by side.
```

- Motion notes: new rows enter the ticker sliding up from the bottom with a slight bounce, like a live score alert.

---

## 15. Matches — add — `/matches/new`

**Web prompt:**
```
A slide-up sheet styled as a blank team-sheet form (not a full page chrome change — it overlays the Matches history ticker, dimmed behind it) with fields: opponent (searchable, with a "+ new opponent" inline option), date, home/away toggle styled as two stadium-gate icons, final score as two large tabular-numeral steppers side by side with a "vs" chalk mark between them.
```

**Mobile prompt:**
```
The same slide-up sheet becomes a full-screen takeover on mobile (not a partial overlay — there's no room to show the dimmed ticker behind it meaningfully), sliding up from the bottom edge. The two score steppers stay side by side since they're compact, but every other field stacks full-width.
```

- Motion notes: the sheet slides up with a slight overshoot-and-settle, not a linear slide; the score steppers increment with a quick flip-number animation matching the dashboard countdown clock's numeral style.

---

## 16. Matches — CSV import — `/matches/import`

**Web prompt:**
```
A dedicated import screen (reached from the "Import from spreadsheet" tile) centered on Chalk: a large drop zone bordered in a dashed chalk-line stroke with the hand-drawn spreadsheet-pouring-into-a-folder illustration inside it, and a plain "browse files" text link beneath for non-drag users. Once a file is dropped, the zone is replaced by a column-mapping table styled like ruled ledger paper, matching CSV columns to CoachAI fields, with a Touchline Red "Import N matches" confirm button once mapping is complete.
```

**Mobile prompt:**
```
The drop zone becomes primarily a tap target (drag-and-drop isn't a natural mobile gesture) — same dashed chalk-line border and illustration, but the dominant call to action is "Choose file" rather than "drag here". The column-mapping ledger table becomes a vertical stack of mapping rows (one CSV column to one CoachAI field per row) instead of a table, to avoid horizontal scrolling.
```

- Motion notes: the drop zone animates a marching-ants dash offset while a file is dragged over it (web only), then turns solid Pitch Green with a stroke-drawn checkmark on a successful drop/selection; the mapping table/list rows fade+slide in one at a time as columns are detected.

---

## 17. Matches — detail / match events — `/matches/[id]`

**Web prompt:**
```
A match-center layout: a broadcast-style scoreline header (same style as the dashboard's next-match card but showing the final result) followed by a vertical match-events timeline — a thin chalk-line runs down the center, with events branching left for our team and right for the opponent: a chalk-drawn ball icon for goals, a card-shaped tick for bookings, a running-figure icon for substitutions, each stamped with the minute in the display face. Adding an event opens a compact inline picker anchored at the chosen minute on the timeline, not a full-screen modal.
```

**Mobile prompt:**
```
The scoreline header stays full-width at the top, shrunk to match the mobile dashboard scoreline treatment. The events timeline's center line moves to the left edge and both teams' events render as a single column of rows, each stamped with a small team badge instead of branching left/right, since true left/right branching doesn't fit phone width. Adding an event opens as a bottom sheet instead of an inline anchored picker.
```

- Motion notes: a new event makes the vertical line briefly "grow" past the new marker, like a stroke extending, and the marker pops in with a small spring bounce; the minute picker snaps to one-minute increments with a tactile-feeling detent.

---

## 18. Opponents — list — `/opponents`

**Web prompt:**
```
A scouting-dossier layout: the opponent list is a row of folder-tab cards, each with a crest placeholder and usual formation shown as a mini pitch glyph, laid out in a wrapping grid. A "+ Scout new opponent" tile with a dashed chalk-line border sits among them, visually distinct from the real opponent cards.
```

**Mobile prompt:**
```
The wrapping grid of folder-tab cards becomes a single-column list of full-width opponent rows (crest, name, formation glyph) instead of a grid, since multi-column cards compress too much at phone width. The "+ Scout new opponent" entry is the last row in the list, same dashed-border treatment.
```

- Motion notes: hovering a folder-tab card on web lifts it 4px with an expanding soft shadow, like picking up a dossier folder; tapping a row on mobile gives the same chalk-underline sweep used on the Teams and Players lists.

---

## 19. Opponents — add — `/opponents/new`

**Web prompt:**
```
A centered blank scouting-dossier form on Chalk, styled like starting a new folder: team name, usual formation (same large tappable formation glyphs as onboarding/team creation, for consistency), and three open hand-labeled text sections — Style, Strengths, Weaknesses — styled as sticky-note dividers, matching the opponent dossier detail screen's visual language from the start.
```

**Mobile prompt:**
```
The form fields and the three sticky-note sections all stack full-width in a single column; the formation glyphs become a horizontally swipeable strip as elsewhere on mobile.
```

- Motion notes: selecting a formation glyph draws its circle outline stroke-by-stroke, matching onboarding and team creation; the three sticky-note sections have a subtly different paper-color tint each, consistent with the dossier detail screen.

---

## 20. Opponents — dossier — `/opponents/[id]`

**Web prompt:**
```
A dossier-style panel: crest placeholder and usual-formation mini pitch glyph at the top, divided below into hand-labeled sections — Style, Strengths, Weaknesses, Set Pieces — like sticky-note dividers in a scouting folder, each with a subtly different paper-color tint. Strengths carry small Pitch Green chalk-tick icons, weaknesses small Touchline Red chalk-cross icons. Sections sit side by side in a two-column arrangement where space allows.
```

**Mobile prompt:**
```
The sticky-note sections stack in a single column, full width, in the order Style, Strengths, Weaknesses, Set Pieces. Each section becomes a collapsible accordion (tap the sticky-note tab to expand/collapse) so a coach can jump straight to the one they need without scrolling past all four on a small screen.
```

- Motion notes: opening a dossier (navigating in from the list) has the panel content fade+rise slightly rather than appearing instantly; switching/expanding sections uses a soft vertical unfold on mobile and a horizontal swipe between sections on web, like flipping folder dividers.

---

## 21. AI Coach Assistant — `/assistant`

**Web prompt:**
```
Split into two panels. A slim left chat column looks like handwritten notes on a touchline notepad: the coach's questions appear as a scrawled speech-bubble note, the AI's replies appear as structured Match Plan cards, never generic chat bubbles. The main right panel renders the AI output as a tactics-board sheet: a pitch diagram with formation dots and chalk-sketch arrows for build-up, pressing and transition patterns, plus labeled sections for each strategy as folded card-flap tabs. Each recommendation ends with three tactile buttons styled like rubber team-sheet stamps: a green Accept stamp, an amber pencil Modify stamp, a red cross Reject stamp.
```

**Mobile prompt:**
```
The two panels become two full-width views switched by a small "Chat / Match Plan" tab toggle pinned at the top, instead of showing both at once. The notepad chat view and the tactics-board sheet keep their visual language but each take the full viewport when active. The three stamp buttons stay anchored at the bottom of the Match Plan view as a full-width row so they're reachable with a thumb.
```

- Motion notes: while the AI is generating, show a small pitch-diagram loader where dotted arrows draw and redraw themselves in a loop, not a generic spinner; new tactical arrows on the pitch diagram draw themselves stroke-by-stroke, staggered about 600ms apart per arrow; tapping a stamp button plays a quick scale-down-then-up stamp-press with the mark appearing via a slight ink-blot texture pop; switching the mobile Chat/Match Plan toggle cross-fades with a slight horizontal arc, not a flat cut.

---

## 22. Settings — `/settings`

**Web prompt:**
```
A quieter, utilitarian screen styled like an equipment-room inventory sheet rather than a typical settings page: sections in a simple vertical list with hairline dividers for name, language, club info and coach roster, at a comfortable centered reading width rather than full-bleed. The language switcher is three tappable shirt-number tabs — FR / AR / EN — instead of a dropdown. The coach roster lists every coach in the club using the same player-token visual language as the Players screen, with "Invite a coach" styled as writing a new name on a blank jersey tag.
```

**Mobile prompt:**
```
The same vertical list of sections, now full-width edge-to-edge with the hairline dividers as the only separation. The coach roster's player-tokens stay full-width single rows rather than any grid. "Invite a coach" becomes a full-width action row at the bottom of the roster section rather than an inline button.
```

- Motion notes: selecting Arabic mirrors the entire panel to RTL with a smooth horizontal flip over about 350ms, so the language change reads as intentional rather than a jump-cut glitch; writing a new coach's name in the "Invite a coach" jersey tag has the text appear with a quick handwriting-style stroke-in rather than a typed-character fade.
