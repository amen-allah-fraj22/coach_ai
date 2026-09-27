# Stitch Design Prompts — "Pitchside" Visual Language

Companion to the cahier des charges (`CoachAI — Cahier des Charges`, Claude Doc), Section 9 screen list.

## Why this direction

Generic AI-generated SaaS UI defaults to purple-to-blue gradients, floating white cards with soft drop shadows, the Inter font, and stock icon packs — it reads as a template, not a considered product. For CoachAI, this brief instead borrows its visual language from the objects a coach actually works with: the tactics board, the matchday team sheet, the touchline chalk marks. That is where "creative and innovative" comes from here — not decoration, a genuine metaphor.

## Shared Style DNA

Paste this once if Stitch retains a style across screens; otherwise each screen prompt below repeats the essentials so it stays on-brand alone.

```
Palette: deep near-black pitch green "Night Pitch" (#12231C) as the primary dark surface; warm off-white "Chalk" (#F7F5EF) as the light surface, never pure white; bold "Touchline Red" (#E3402A) as the one accent color for primary actions and alerts, used sparingly; muted "Pitch Green" (#2F6D4F) for success states. No purple, no blue-to-purple gradients anywhere.
Typography: a bold condensed sport-broadcast display face (Archivo Black / Anton style) for scores, formations, section titles and numbers; a warm humanist sans (IBM Plex Sans, paired with IBM Plex Sans Arabic for RTL) for body text — never the default Inter font.
Iconography: hand-sketched, slightly imperfect chalk-line icons — arrows, X/O markers, formation dots — like a real tactics board, never a geometric stock icon pack.
Texture: a very subtle grain/chalk-dust texture on dark surfaces instead of flat color or gradients; thin hairline rules instead of heavy drop-shadow cards.
Motion principle ("Pitchside Motion"): movement follows curved arcs like a pass, never straight linear slides; dragged elements lift with an expanding soft shadow, a 2-4 degree tilt and a spring/overshoot settle on drop, like picking up and placing a physical player token; confirmations render as a quick hand-drawn chalk checkmark or strikethrough stroke, not a generic icon fade.
Avoid entirely: purple/blue gradients, glassmorphism, generic rounded drop-shadow cards floating on white, default Material/Feather icon packs, centered symmetric hero-section layouts, the Inter font, generic four-stat-card dashboard rows.
```

## Screen prompts

Each prompt is self-contained — copy the fenced block straight into Stitch. "Motion notes" below each is a brief for whoever implements the interaction in code (Stitch renders static screens; these describe the intended motion so nothing gets lost between design and build).

### 1. Sign up / Login / Club creation

```
A full-screen split layout: left third is a deep Night Pitch dark panel with a large hand-chalked ball-trajectory illustration arcing across it and the wordmark "CoachAI" in the bold condensed display face; right two-thirds is a Chalk-white panel holding the auth form. Two tabs at the top styled like laminated team-sheet tabs: "Log in" and "Create a club" — the active tab has a Touchline Red underline. Inputs are minimal underlined fields, not boxed, labeled above in small caps. The primary button is a solid Touchline Red pill labeled "Enter the dressing room" with a small chalk-arrow icon. Below the form, a quiet secondary link: "Have an invite code? Join your club's squad instead."
```

- Motion notes: tab switch cross-fades content with a slight upward arc rather than a flat slide; the arrow icon nudges forward 4px along a curved path on hover; on submit, the button morphs into a small spinning-ball loader instead of a generic spinner.

### 2. Coach onboarding (profile and philosophy)

```
A single-column step wizard styled as a physical team-sheet clipboard viewed with a subtle 2-degree perspective tilt. Step dots along the top are small football icons that fill Touchline Red as each step completes. Step 1 collects name and preferred language as three shirt-number-style toggle tabs: FR / AR / EN. Step 2, "Your Philosophy", shows a horizontal row of large tappable formation glyphs (4-3-3, 4-4-2, 3-5-2) drawn in the chalk-line icon style; selecting one draws a hand-drawn circle stroke around it. Step 3 asks playing style and risk tolerance via a horizontal tempo-gauge slider from "Cautious" to "All-in", marked by a small flag icon.
```

- Motion notes: step transitions use a paper-turn skew, like flipping a clipboard page, not a flat slide; selecting a formation glyph draws its circle outline stroke-by-stroke over about 300ms; the tempo slider's flag has slight elastic lag when dragged.

### 3. Dashboard

```
Not a grid of stat cards — a "matchday briefing sheet" instead. A Night Pitch dark header band shows the next match as a broadcast-style scoreline card: crest placeholder, "vs [Opponent]", a stadium-clock countdown in bold tabular numerals, and formation badges for both teams. Below it, three quick-action tiles styled as slightly scattered team-sheet cards (rotated -1, 0 and 1 degree, like papers on a desk) for "Prepare this match", "Review last match" and "Ask the AI Coach", each with a chalk-line icon and a one-line AI insight teaser. A slim sidebar lists upcoming fixtures as a vertical timeline with a moving "you are here" marker.
```

- Motion notes: on load, the three tiles drop into their resting rotated position with a staggered spring (about 80ms apart), like papers being set down one after another; the countdown clock ticks with a mechanical flip-number animation, never a fade.

### 4. Team management

```
A roster-book layout: teams listed as folder-style index tabs along the left edge, each labeled in the display face and color-coded by age category. The main panel shows the selected team as an editable team-sheet header card, with the default formation rendered as a small live pitch diagram (dots on a chalk-line pitch outline) that updates the moment the formation dropdown changes.
```

- Motion notes: switching a team tab triggers a page-flip transition on the main panel, not a fade; changing the formation dropdown animates the pitch dots repositioning along curved paths to their new spots over about 400ms, never snapping instantly.

### 5. Players — the animation centerpiece

```
A vertical depth-chart board styled as a magnetic tactics whiteboard: grouped lanes ("Starting XI", "Bench", "Reserves", or a custom coach-named group) rendered as chalk-outlined horizontal zones on a Night Pitch board. Each player is a small rounded token card — jersey-number badge, name, position abbreviation, a tiny 1-10 rating dial — styled like a magnetic player counter. A thin chalk-line clipboard-clip styled search bar sits at the top. Tapping a token flips it to reveal the full profile on the back: age, ratings as a small pentagon/radar chart, availability as a colored jersey-pin icon, coach notes.
```

- Motion notes (the flagship interaction, spec this precisely for the developer): drag lift is 150ms ease-out with the shadow expanding, a 3-degree rotate and a 1.04x scale; the dragged token trails the cursor with a slight elastic lag rather than tracking 1:1; dropping into a lane settles with a spring overshoot of about 8% before resting, over roughly 400ms, and the lane briefly pulses a 2px Touchline Red outline once over 500ms to confirm the drop; the profile flip is a 3D Y-axis rotation over 350ms; reordering within a lane reflows neighboring tokens by sliding them to their new slot (a FLIP-style animation), never a jump-cut.

### 6. Matches (history, add match, CSV import)

```
History as a vertical scoreboard ticker: each past match is a horizontal strip styled like a broadcast lower-third graphic, showing date, opponent and score in bold tabular numerals, with a colored result stripe along the left edge (Touchline Red for a loss, Pitch Green for a win, chalk-gray for a draw). "Add match" opens a slide-up sheet styled as a blank team-sheet form. A distinct "Import from spreadsheet" tile shows a hand-drawn illustration of a spreadsheet pouring into a folder, with a drop zone bordered in a dashed chalk-line stroke.
```

- Motion notes: new rows enter the ticker sliding up from the bottom with a slight bounce, like a live score alert; the CSV drop zone animates a marching-ants dash offset while a file is dragged over it, then turns solid Pitch Green with a stroke-drawn checkmark on a successful drop.

### 7. Opponents

```
A scouting-dossier layout: the opponent list is a row of folder-tab cards, each with a crest placeholder and usual formation shown as a mini pitch glyph. Selecting one opens a dossier-style panel divided into hand-labeled sections — Style, Strengths, Weaknesses, Set Pieces — like sticky-note dividers in a scouting folder, each with a subtly different paper-color tint. Strengths carry small Pitch Green chalk-tick icons, weaknesses small Touchline Red chalk-cross icons.
```

- Motion notes: opening a dossier expands the panel outward from the selected card's position, not a generic centered modal fade; switching between dossier sections uses a soft horizontal swipe, like flipping folder dividers.

### 8. Match Events

```
A vertical match-center timeline: a thin chalk-line runs down the center, with events branching left for our team and right for the opponent — a chalk-drawn ball icon for goals, a card-shaped tick for bookings, a running-figure icon for substitutions — each stamped with the minute in the display face. Adding an event opens a compact inline picker anchored at the chosen minute on the timeline, not a full-screen modal.
```

- Motion notes: a new event makes the vertical line briefly "grow" past the new marker, like a stroke extending, and the marker pops in with a small spring bounce; the minute picker snaps to one-minute increments with a tactile-feeling detent.

### 9. AI Coach Assistant (chat and Match Plan view)

```
Split into two panels. A slim left chat column looks like handwritten notes on a touchline notepad: the coach's questions appear as a scrawled speech-bubble note, the AI's replies appear as structured Match Plan cards, never generic chat bubbles. The main right panel renders the AI output as a tactics-board sheet: a pitch diagram with formation dots and chalk-sketch arrows for build-up, pressing and transition patterns, plus labeled sections for each strategy as folded card-flap tabs. Each recommendation ends with three tactile buttons styled like rubber team-sheet stamps: a green Accept stamp, an amber pencil Modify stamp, a red cross Reject stamp.
```

- Motion notes: while the AI is generating, show a small pitch-diagram loader where dotted arrows draw and redraw themselves in a loop, not a generic spinner; new tactical arrows on the pitch diagram draw themselves stroke-by-stroke, staggered about 600ms apart per arrow; tapping a stamp button plays a quick scale-down-then-up stamp-press with the mark appearing via a slight ink-blot texture pop.

### 10. Settings

```
A quieter, utilitarian screen styled like an equipment-room inventory sheet rather than a typical settings page: sections in a simple vertical list with hairline dividers for name, language, club info and coach roster. The language switcher is three tappable shirt-number tabs — FR / AR / EN — instead of a dropdown. The coach roster lists every coach in the club using the same player-token visual language as the Players screen, with "Invite a coach" styled as writing a new name on a blank jersey tag.
```

- Motion notes: selecting Arabic mirrors the entire panel to RTL with a smooth horizontal flip over about 350ms, so the language change reads as intentional rather than a jump-cut glitch.
