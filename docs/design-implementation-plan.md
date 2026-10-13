# Pitchside Redesign — Implementation Plan

Source of truth for re-skinning the whole CoachAI web app onto the Stitch
designs in `design/stitch/`. Read this top to bottom before writing any
code. Every screen, button and animation listed here is either **built**,
**recast** (kept visually but wired to real data), or **cut** — nothing is
left to improvisation.

---

## 0. What's in `design/stitch/`

```
design/stitch/
  DESIGN.md                      Stitch's design-token spec (colors, type scale, spacing, rules)
  <page>/web/code.html           Desktop design (static HTML + Tailwind CDN)
  <page>/web/screen.png          Desktop screenshot (when the export succeeded)
  <page>/mobile/code.html        Mobile design
  <page>/mobile/screen.png       Mobile screenshot
  _extras/chart-test/            One-off chart experiment (reference for chart styling)
  _extras/stitch_prompts.exported.md   The prompts as Stitch received them
```

- **22 pages, 43 of 44 variants.** Missing: `opponents-list/mobile` (no
  design) — build it from the web version + the rules in §5.18.
- **9 screenshots failed to export** (ai-coach-assistant ×2,
  opponents-add ×2, opponents-dossier ×2, opponents-list/web, settings ×2).
  Their `code.html` is intact — open it in a browser to see the design.
  **`code.html` is the source of truth**; screenshots are convenience.
- `design/stitch-prompts.md` holds the **motion notes** for every screen.
  Stitch only wired a handful of interactions (dashboard countdown,
  AI-coach mobile tabs, a few toggles); almost all animation must be built
  from those notes and §3 below.

How to view a design locally: open `design/stitch/<page>/<variant>/code.html`
directly in a browser (it loads Tailwind + fonts from CDN).

---

## 1. Ground rules for implementation

1. **Match the design visually, not structurally.** Re-create layouts,
   spacing, type, colors, borders, icons and copy hierarchy from each
   `code.html`. Do **not** paste the Stitch HTML in — rebuild it as typed
   React components using the shared primitives (§2).
2. **No fake data, ever.** Stitch filled screens with invented club names
   (Arsenal, Man City…), invented telemetry (xG, latency, PPDA, sprint km/h)
   and invented system status. Every number and name on screen must come
   from Convex or from the user's own input. Use the demo seed
   (`convex/demo.ts`) for realistic-looking data in development.
3. **One route, two layouts.** Each page renders its web layout at ≥768px
   (`md:`) and its mobile layout below. Prefer CSS-only switching
   (`hidden md:flex` / `md:hidden`) so SSR is stable. Where the two layouts
   are structurally different (Players board, AI Coach, Match detail),
   build `<XWeb/>` and `<XMobile/>` components fed by the **same** data
   hooks at the page level — never query twice. The drag-and-drop board
   must only mount **one** `DndContext`, so it uses a `useIsMobile()` client
   hook (matchMedia) instead of CSS switching.
4. **All copy through next-intl** (`messages/{fr,ar,en}.json`). Stitch's
   copy is English-only and often overwrought; keep the tone ("Enter the
   dressing room") but make claims true (§4).
5. **RTL is first-class.** Arabic flips layout via `dir="rtl"` and logical
   properties (`ms-*`, `pe-*`, `start-*`). Anton has no Arabic glyphs — see
   §2.2.
6. **Reduced motion:** every animation in §3 checks `useReducedMotion()`
   from `motion/react` and falls back to an instant state change.
7. **Before touching Next.js APIs, read `apps/web/AGENTS.md`** — this is
   Next 16 with breaking changes; check `node_modules/next/dist/docs/`.

---

## 2. Foundations (Phase 1 — do this before any screen)

### 2.1 Design tokens → `apps/web/src/app/globals.css` (Tailwind v4 `@theme`)

Port `design/stitch/DESIGN.md` exactly, with these corrections:

| Rule | Decision |
|---|---|
| Stitch config sets `primary: #ffffff` | **Forbidden by DESIGN.md.** Map every "primary/white" usage to Chalk `#F7F5EF`. |
| Theme | **Dark-only.** Remove the current light Chalk theme. Light "paper" surfaces (team-sheet cards) use Chalk `#F7F5EF` with Night Pitch `#12231C` text. |
| Base canvas | `#12231C` (Night Pitch) page background; containers `#182E25` (Slate Grass); deeper wells `#0E1F18`. |
| Accents | Pitch Green `#2F6D4F` (+ light `#94D4B0` for text on dark), Touchline Red `#E3402A`. Washes: green `rgba(47,109,79,.25)`, red `rgba(227,64,42,.22)`. |
| Hairlines | `rgba(247,245,239,.08)` structural, `.16` inputs, `.24` focus/active containers. |
| Radius | **0 everywhere.** Exceptions only where the design shows them: status dots, avatar circles, the landing-page CTA pill. |
| Shadows | None on UI chrome. Allowed only on "physical objects": paper team-sheet cards, a dragged player token, bottom sheets. |
| Type scale | Register every DESIGN.md style as a utility: `text-display-lg` (56/60), `text-display-lg-mobile` (38/42), `text-headline-lg/md/sm`, `text-metric-huge` (64) / `-mobile` (44), `text-body-lg/md/sm`, `text-label-tactical` (11, 600, .12em, uppercase), `text-label-mono` (10, 500, .08em). Numbers always `tabular-nums`. |
| Spacing | `space-xs .25rem`, `sm .5`, `md 1`, `lg 1.5`, `xl 2`; gutters 16px mobile / 24px desktop; margins 16 / 24 / 32. |
| Background grain | Dotted grid used on hero/boards: `radial-gradient(rgba(247,245,239,.10) 1px, transparent 1px)` at `16px 16px`. Make it a utility `.bg-pitch-grid`. |

### 2.2 Fonts — `next/font/google` in the root layout

- `Anton` (display, numerals) → `--font-display`
- `IBM Plex Sans` 400/500/600/700 → `--font-sans`
- `IBM Plex Sans Arabic` 400/500/600/700 → used for body when `dir=rtl`
- Arabic display substitute for Anton: **`Noto Kufi Arabic` 800/900**
  (condensed-feeling, heavy). In RTL, `--font-display` resolves to it.
- Remove Inter / any other font currently loaded.

### 2.3 Icons

The designs use **Material Symbols Outlined** everywhere (773 usages) —
not lucide. To match exactly, self-host it (`material-symbols` npm package,
outlined variant) and build an `<Icon name="sports_soccer" />` component.
Remove lucide-react once no component uses it. Icon names are in each
`code.html` (`<span class="material-symbols-outlined">NAME</span>`).

### 2.4 Primitives — `apps/web/src/components/ui/`

Rebuild or add, matching DESIGN.md §Components:

| Primitive | Spec |
|---|---|
| `Button` variants | `primary` (Chalk fill, Night Pitch Anton text; hover inverts to `#182E25` bg + Chalk text + 1px Chalk border), `secondary` (`#182E25`, 1px `.16` border; active = green wash + 4px green inner-left border), `destructive` (`#182E25`, 1px red border, red text; hover solid red), `stamp` (see §3 `stampPress`; used for Accept/Modify/Reject and "Stamp & …" submit buttons), `pill` (landing CTA only: red, rounded-full). Sizes: default 40px, `lg` 48px, mobile full-width 56px. |
| `Chip` | 0 radius, 1px `.12` border, `#182E25`, `label-tactical`; optional 6px status square (green/red). Used for filter rows with counts, e.g. `ALL (14)`. |
| `Input`, `Textarea`, `Select` | Sharp 1px `.16` border on `#12231C`; focus → 1px Chalk, no glow. Labels above in `label-tactical`. Some auth/onboarding screens use **underline-only** fields — add `variant="underline"`. |
| `Checkbox`, `Radio` | 16px squares; selected = Chalk fill with Night Pitch inset square. |
| `Panel` (card) | `#182E25`, 1px `.08` border, header row separated by hairline: Anton title + `label-tactical` caption. |
| `PaperCard` | Chalk `#F7F5EF` surface, Night Pitch text, optional rotation (−1/0/1deg), tape/pin decoration, shadow — the team-sheet object from dashboard/landing. |
| `Metric` | `text-metric-huge` value + uppercase `label-mono` caption beneath. |
| `SegmentedTabs` | Shirt-number tabs (`07 FR`, `10 AR`, `09 EN`) for language; folder-divider tabs for profile/dossier sections. |
| `FormationPicker` | Large chalk formation glyph buttons (4-3-3, 4-2-3-1, 3-5-2, 4-4-2…) with hand-drawn selection circle (§3 `chalkDraw`). Horizontal scroll strip on mobile. Used by onboarding, team create, opponent add, settings. |
| `PitchDiagram` | SVG pitch (`#182E25`, lines at Chalk `.15`), dots from a formation string, optional dashed chalk arrows (`stroke-dasharray: 4 4`). Used by dashboard, teams, AI coach, landing. |
| `RatingDial` / `RatingBar` | 1–10 display; segmented spark-bar (2px gaps, green ≥ 7, red ≤ 4). |
| `RadarChart` | SVG radar of the **4 real ratings** (technical, physical, tactical, form) — Stitch drew a 5-axis PAC/PAS/DRI/DEF/PHY pentagon; we have 4 values, so draw a 4-axis diamond in the same style. |
| `BottomSheet` | Mobile modal: Night Pitch, 2px Chalk top edge, slides up (§3 `sheetUp`). Desktop modals: centered, Night Pitch with 2px Chalk border (DESIGN.md "Overlays"). |
| `Toast` | Lower-third style: `#12231C`, 2px Chalk top border, Anton label. |
| `EmptyState`, `Skeleton` | Not designed by Stitch — build in-system: chalk-outlined dashed box, Anton title, one CTA. Skeletons are flat `#182E25` blocks with a slow chalk-dust shimmer. |

### 2.5 App shell — one consistent navigation

Stitch invented a different sidebar on almost every screen ("Briefing
Room", "Telemetry & Press", "Live Matchday", "Analytics & Heatmaps",
"Squad & Subs"…). **Replace all of them with one shell** that maps to real
routes:

- **Web (≥768px):** fixed left sidebar 256px (`#0E1F18`), wordmark
  `COACHAI` + green square, then nav: Dashboard · Teams · Players
  (sub: List / Board) · Matches · Opponents · AI Coach · Settings. Active
  item = `#1C2D26` bg + Chalk bold text (as in dashboard `code.html`).
  Bottom of sidebar: club name + coach name/role (real), not "Pitch Link /
  System v4.2". Top bar (64px): page title in Anton + context chip (e.g.
  next match), user button (Clerk) on the right. **Remove** notification
  bells and help icons — there is no notification or help system.
- **Mobile (<768px):** top bar (wordmark or back-chevron + page title) and
  a fixed bottom tab bar (13 of the mobile designs use one): Dashboard ·
  Players · Matches · AI Coach · More (sheet with Teams, Opponents,
  Settings, language, sign out). Bottom bar respects `safe-area-inset-bottom`.

### 2.6 Motion library — `apps/web/src/lib/motion.ts`

Named presets built on `motion/react` (already installed). Every screen
uses these names; don't hand-roll one-offs.

| Preset | Spec | Used on |
|---|---|---|
| `arcEnter` | y 12→0 + x 6→0 (curved feel), opacity 0→1, 350ms, ease `[0.22,1,0.36,1]` | section/content entrances, tab content swaps |
| `paperDrop` | y −20→0, rotate 0→target, spring (stiffness 300, damping 20), stagger 80ms | dashboard/landing team-sheet cards |
| `tokenLift` | scale 1→1.04, rotate 0→3deg, shadow expands, 150ms ease-out | drag start (board) |
| `dropSettle` | spring with ~8% overshoot, ~400ms; target lane pulses 2px red outline once over 500ms | drag end (board) |
| `flip3D` | rotateY 0→180, 350ms, `backface-visibility:hidden`, perspective 1000px | player token flip |
| `chalkDraw` | SVG `pathLength` 0→1; 300ms (circles) to 1200ms (hero arrows) | formation selection circle, pitch arrows, radar outline, checkmarks |
| `stampPress` | scale 1→0.92→1.05→1 over 220ms + ink-blot mark fades in | Accept/Modify/Reject, all "Stamp & …" submits |
| `flipDigit` | per-digit vertical roll | countdown clock, score steppers, kit-number stepper |
| `tickerIn` | y 24→0 + slight bounce | new rows in matches ticker, new match events |
| `marchingAnts` | infinite `stroke-dashoffset` on dashed border | CSV drop zone while dragging |
| `sheetUp` | y 100%→0, spring with slight overshoot | bottom sheets, match-add on mobile |
| `pageTurn` | skewY 2deg + x slide + fade, 300ms | onboarding steps, team tab switch |
| `marquee` | infinite linear translateX loop, pause on hover | landing ticker band, mobile stat ticker |
| `localeFlip` | content fades + slides 12px toward the new reading direction, 350ms | switching to/from Arabic |
| `rowSweep` | 2px chalk underline grows left→right 180ms before navigation | tapping list rows on mobile |

Hover patterns straight from the designs: paper cards `hover:rotate-0
hover:scale-[1.02]`; card CTA arrow `group-hover:translate-x-1`; nav items
`hover:bg-[#1C2D26]`.

---

## 3. Feature split — what we build vs. what we cut

Legend: **BUILD** = real feature, wired to Convex. **RECAST** = keep the
visual element, but feed it real data / repurpose it. **CUT** = remove from
the UI (no data source, or not worth it now). **LATER** = genuinely useful,
deferred past this redesign.

### 3.1 Global

| Element (as designed) | Verdict | Notes |
|---|---|---|
| Per-screen invented sidebars | RECAST | Unified shell (§2.5) |
| Notification bell, help icon | CUT | No such systems |
| "System sync / Delta latency 12ms / Pitch link encrypted / System v4.2 / Telemetry sync UTC" | CUT | Fake system status |
| "Matchday live 68' / match clock 63:42 / Touchline alert / Comms / Bench link / Pitchside mic" | CUT | No live-match feature |
| Real-club names & crests (Arsenal, Man City, Bayern…) | RECAST | Real data from Convex; crests become 3-letter monograms from the team/opponent name |
| "Export … (PDF)", "Print sheet", "Export CSV/ledger", "Export audit ledger" | LATER | Use browser print stylesheet later if wanted |
| "Sync pitch", "Transcribe" (voice), "Inspect phase simulation" | CUT | |
| Competition filter chips with counts (EPL/UCL/FA Cup) | RECAST | Build chips from the distinct `competition` values that actually exist |
| Empty / loading / error states | BUILD | Not designed — build in-system (§2.4) |

### 3.2 Per area

| Area | BUILD | RECAST | CUT / LATER |
|---|---|---|---|
| **Landing** | Hero, CTA, language switch, 3-phase cards, interactive drill-lab animation, doctrine cards, final CTA, footer | Every metric/claim → honest product facts (§5.1); ticker band → feature marquee | "Live recognition", "optical camera sync", "0.12s vision latency", "drone arrays/broadcast cameras", "system status: live floodlights" — all **CUT** (false claims) |
| **Auth** | Custom login & signup UI on Clerk hooks (email+password), password visibility toggle, FR/AR/EN switch | Signup's "club name" field → carried into onboarding (prefill) | "ES" language (designs show it on web) → AR. **Gaps to build in-system:** email-code verification step, forgot-password flow |
| **Invite** | Accept invite → join club | Club name from invite | — |
| **Onboarding** | Name, language, formation, playing style, risk tolerance (all exist on `coaches`) | — | — |
| **Dashboard** | Next-match broadcast header, 3 quick-action paper cards, fixtures timeline, demo-seed button | Countdown → to next `matchDate` (date-only: show **days/hours** to midnight-of, or add optional `kickoffTime`, see §6); "Injury intelligence" → **Squad availability** (injured/suspended players); "Opposition pattern" → next opponent's `weaknesses`; "Press intensity" bars → last match's real stats (possession, shots, on target); "Schedule density" → count of matches in next 14 days (computed) | "Board preset" widget, xG lines, referee, "high press risk" |
| **Teams** | List, create (name, age category, competition, formation), detail with live formation pitch + roster grouped by position | Age-category chips | "Home ground / pitch" field (not in schema), "Generate tactical dossier", per-team star ratings (▲▲▲) |
| **Players list** | Ledger table/list, search, position-group filter chips w/ counts, "Register athlete" | Availability pin from `availability` | "Sync pitch", "Export ledger" (LATER) |
| **Players board** | Lanes = `squadGroup`, drag within/between lanes (`players.reorder`), **Add lane** (squadGroup is free text), search, token flip to back (radar, notes, availability) | Mobile "Magnets on" toggle → **Edit lineup** toggle (drag only enabled when on, prevents accidental drags while scrolling) | "Formation lock", "Auto-balance", "Lock chart", "Reset", "Stamp lineup for kickoff", share; footer gauges (balance index, squad load, occupancy, "magnetic locks/gauss"); per-token sub-stats (sprint km/h, aerial %, duels %, xG threat, PSxG) |
| **Player add / edit** | Name, kit number*, position (pitch-zone picker), preferred foot, team, squad group, 4 rating dials, availability, notes, live token preview | — | "Add trait" chips |
| **Player profile** | Token card, radar (4 ratings), coach notes, recent matches (matches with events for this player), compare vs squad average of same position | "Assign tactical directive" → **Ask the AI about this player** (opens AI Coach with prefilled question) | Heatmap/territorial density, "benchmark vs league average", PDF export |
| **Matches history** | Ticker rows (date, opponent, score, result stripe), competition filter chips, "Record result", "Import spreadsheet", pagination | — | "Telemetry" wording |
| **Match add** | Opponent (search + "register new opponent" inline), date, home/away gates, competition, formations, score steppers, **Add scorer** (creates `goal` match events) | Stadium names → just "Home"/"Away" | — |
| **CSV import** | Drop zone, column mapping, import N matches, success state, import another | — | — |
| **Match detail** | Broadcast scoreline header, events timeline (web: two-sided; mobile: single column), event filter chips, log event (goal, assist, yellow, red, sub, injury, tactical change) with player chips, minute stepper, real match stats panel (possession, shots, on target, corners, fouls, cards) | "Post-match dossier metric breakdown" → only the real stats above | "VAR review" event type, PDF report |
| **Opponents list** | Card grid/list, search, "+ Scout new opponent" (quick-create modal → name → create → dossier) | Filter chips → by usual formation (opponents have no competition) | Competition chips, "Abort mission" wording |
| **Opponent add / edit** | Team name, usual formation picker, alt formations, playing / pressing / build-up / defensive style, strengths, weaknesses, set pieces | — | — |
| **Opponent dossier** | Sections: Style (all 4 style fields), Strengths, Weaknesses, Set pieces; web 2-col sticky-notes, mobile accordion | "Deploy counter-tactics" → **Ask the AI how to beat {opponent}** (AI Coach prefilled, opponent linked) | PDF/print, "Commit match plan" (duplicate) |
| **AI Coach** | Question box, optional linked match, quick-prompt chips (preset questions), loading state, match-plan view, Accept / Modify / Reject stamps (`ai.recordFeedback`), history of past recommendations | "Phases" accordion/card-flaps → the real plan sections (attacking, defensive, pressing, transition, set pieces, risks, alternatives, substitutions, training focus); pitch diagram → `formation` dots + `starting_xi` names (real), arrows are **illustrative per section** (decorative, not data) | Voice "transcribe", "sync pitch", "inspect simulation", "reset pins", "projected turnover rate / confidence %" (not in AI output) |
| **Settings** | Coach name, language (shirt tabs), preferred formation / style / risk, club name, coach roster (`coaches.listClubCoaches`), invite coach by email (`invites.createInvite`), save | Permission chips → just **Owner / Member** (real roles) | Club crest upload, "Tactical computation & telemetry engine" section, granular permissions (read telemetry / board write / full admin), audit export |

\* **Kit number is not in the schema** but the whole design system leans on
it (every token shows a shirt number). Add `jerseyNumber: v.optional(v.number())`
to `players` (§6). This is the only schema change the redesign genuinely
needs.

---

## 4. Copy rules

- Keep the Pitchside voice: "Enter the dressing room", "Stamp & record
  fixture", "Scouting ledger", "Club roster book".
- Never claim capabilities we don't have: no live tracking, video, cameras,
  latency, telemetry feeds, xG, "proprietary model v4.2". The AI is Gemini
  reading the coach's own squad, match and opponent data — say that.
- Stitch's `label-tactical` decoration strings (e.g. `[ TACTICAL INTELLIGENCE ]`,
  `SHEET: 11 / 18`) are fine when they're true or neutral; remove when they
  imply fake data.
- Every string in all three locales. Arabic numerals stay Western (0-9) for
  scores/minutes for consistency with broadcast style.

---

## 5. Screen-by-screen spec

For each screen: open both `code.html` files side by side with this spec.
"Web" = ≥768px, "Mobile" = <768px. Buttons not listed here are CUT.

### 5.1 Landing — `/` (highest priority; build first after foundations)

**Web** (`design/stitch/landing-page/web/`), sections top→bottom:

1. **Top nav** — `COACHAI` wordmark + `[ TACTICAL INTELLIGENCE ]` tag;
   anchor links (rename to honest: *How it works* · *AI Coach* ·
   *Manifesto*, smooth-scroll); `FR | AR | EN` switch (active underlined);
   right side: **Log in** text button (replaces the avatar circle).
2. **Hero** — full-bleed Night Pitch with `.bg-pitch-grid` dots + faint
   pitch outline (rect, center circle, halfway line, penalty boxes) +
   dashed chalk arrows + small numbered player circles. Status chip
   (green dot + label) → honest: `● AI COACH READY • FR · AR · EN`.
   Headline `YOUR TACTICAL` (Chalk) / `CO-PILOT` (green `#94D4B0`) with a
   hand-drawn underline under CO-PILOT. Subcopy rewritten (prepare
   matches, organise your squad, AI match plans from *your* data). Primary
   CTA red pill **ENTER THE DRESSING ROOM →** → `/signup`. Secondary text
   link `[ SEE HOW IT WORKS ]` → scrolls to §3. Four metric tiles →
   honest facts, e.g. `3` LANGUAGES · `1 CLICK` DEMO SQUAD · `8` DATA
   TOOLS THE AI READS · `0` SPREADSHEETS NEEDED (final wording needs
   product sign-off).
   *Motion:* pitch arrows `chalkDraw` stroke-by-stroke on load (~1.2s
   total, staggered); player circles fade in after; underline under
   CO-PILOT draws last; CTA has an idle red-border pulse (not a bounce);
   arrow inside CTA nudges 4px on hover.
3. **Ticker band** — thin full-width strip. Replace fake match readout
   with a `marquee` of real feature names / a clearly labelled demo
   fixture. Pauses on hover.
4. **"Three phases of tactical mastery"** — section label `[ BRIEFING
   ARCHITECTURE ]`, Anton title, right-side intro text. Three dark tape-
   topped cards: **01. Prepare** (team-sheet chip, mini pitch with arrows,
   3-item checklist with square checkboxes, print status + kickoff clock),
   **02. Review** (telemetry-log chip, bar chart with one red peak bar,
   stat line, "stable lead 2-1"), **03. Ask the AI** (tactical-alert chip,
   quoted coach prompt, AI recommendation block with `EXECUTE NOW` stamp,
   sub trigger line, `APPLY` button, confidence-style footer → replace
   "confidence 94.1%" with something true like "Based on 18 squad
   records"). These are **illustrations** — static sample content, clearly
   not claims about the visitor's club.
   *Motion:* cards `paperDrop` when scrolled into view (stagger 80ms);
   bars grow from 0 height; card arrows `chalkDraw`; hover: card rises
   2px.
5. **"The Chalkboard Manifesto" + interactive drill lab** — left: label,
   title, paragraph, three phase buttons (`PHASE A: HIGH GEGENPRESS
   ACTIVE`, `B … STANDBY`, `C … STANDBY`, with colored status squares),
   quote card. Right: `TACTICAL LAB #08` panel — pitch with player nodes,
   dashed pass lines, press-radius circle, red X, `RUN SIMULATION` button.
   **Interaction (BUILD):** clicking a phase sets it ACTIVE, nodes move
   along curved paths to that phase's positions (400ms), arrows redraw
   (`chalkDraw`). `RUN SIMULATION` animates a ball along the pass path
   node-to-node and pulses the press circle. Purely illustrative — cut the
   fake "camera / FPS / grid coord / input seed" meta labels.
6. **"Engineered for the dressing room, not the boardroom"** — three
   numbered doctrine cards: `01` (Chalk numeral), `02` (green), `03`
   (red). Keep titles' spirit, rewrite bodies to true statements (e.g.
   "Half-time acceleration" must not mention video).
   *Motion:* numerals count/flip in on scroll (`flipDigit`).
7. **Final CTA band** — `[ DEPLOY ON YOUR SIDELINE ]`, `READY TO ENTER THE
   TECHNICAL AREA?`, red pill **START TACTICAL BRIEFING ▸** → `/signup`.
   Cut the "compatible with optical feeds…" line.
8. **Footer** — wordmark + tagline left; right: `© 2026 CoachAI`. Cut
   "system status / latency".

**Mobile** (`design/stitch/landing-page/mobile/`):

1. Top bar: `COACHAI` wordmark (drop the `PRO` badge — no plans exist) +
   `FR | AR | EN` segmented control (active = Chalk fill).
2. Status line → honest chip (no "system online / telemetry v4.2 / feed
   live").
3. Hero: left-aligned `YOUR TACTICAL` / `CO-PILOT`, subcopy, a framed
   mini pitch card (nodes 4 / 8 / 10 / red 9, dashed arrows, `Z14 VACATED`
   tag, `OVERLOAD PHASE +2` caption — fine as illustration).
4. Full-width **square** red CTA `ENTER THE DRESSING ROOM →` (56px).
5. 2×2 metric grid (same honest facts as web).
6. `MATCHDAY BRIEFING` section with `STAGE 1 TO 3`: three stacked cards
   (01 Prepare with overload diagram + 3 checkboxes; 02 Review with big
   `2-1` scoreline + bar chart; 03 Ask the AI with red border, prompt
   block, recommendation, `EXECUTE NOW` stamp, red sub-trigger bar with
   white `DEPLOY` button).
7. "Touchline philosophy / The Chalkboard Manifesto" text + bold quote.
8. Three numbered points (01 / 02 / 03).
9. Stat ticker `marquee` (replace fake xG / recovery numbers).
10. Footer: big wordmark, short tagline, white full-width **START
    TACTICAL BRIEFING** button → `/signup`. Cut server/encryption line.

*Mobile motion:* same presets, shorter durations (×0.8); no hover states;
cards `arcEnter` on scroll.

### 5.2 Log in — `/login`
Web: split layout — left dark panel (wordmark, chalk ball-trajectory
illustration), right form; title `ENTER THE DRESSING ROOM`; email +
password (eye toggle); primary submit; links "New here? Create a club" →
`/signup`, "Have an invite? Join your squad" (explain: open the invite
link). Language switch must be `FR | AR | EN` (design shows ES — wrong).
Mobile: dark header band + full-width form, `Forgot?` link beside password
label → Clerk reset flow (build in-system). Submit: arrow nudge on hover;
on submit the button morphs into a spinning-ball loader. Errors render as
red-bordered lower-third under the field.
Implementation: custom UI using Clerk `useSignIn()`; keep Google OAuth as
a `secondary` button **only if** product wants it (not in design).

### 5.3 Sign up — `/signup`
Web: same split as login (they're a pair) with `LOG IN | SIGN UP` laminated
tabs on top of the form; fields: coach name, club name, email, password;
CTA `SET UP THE DRESSING ROOM →`. Mobile: collapsed header + stacked
fields. Implementation: `useSignUp()` + email-code verification step (not
designed — build as a one-field form in the same panel, 6 underlined
digit boxes, `flipDigit` on entry). Club name is passed to onboarding
(prefilled) since the club is created there (`clubs.createClubAndOwner`).
Tab switch: `arcEnter` cross-fade.

### 5.4 Join via invite — `/invite/[token]`
Pinned-note card: club monogram, `YOU'VE BEEN ADDED TO THE SQUAD`, CTA
`ACCEPT AND JOIN {CLUB} →` (`invites.acceptInvite`), small print about
matching email, "Wrong account? Log in as someone else". Mobile version has
a close (×) and shirt-number decorations (10/07/04) — keep decorative; cut
the language-list inputs (English/Spanish/German). Motion: card
`paperDrop` in; on accept the pin pops (scale burst) then navigate to
`/onboarding` or `/dashboard`.

### 5.5 Coach onboarding — `/onboarding`
Web: clipboard wizard (2deg tilt) — step 1 name (underlined field) +
language shirt tabs (`07 FR`, `10 AR`, `09 EN`); step 2 core philosophy
`FormationPicker`; step 3 risk & press tempo slider (Cautious → All-in,
flag handle) mapped to `riskTolerance` low/medium/high plus playing-style
choice. CTA `COMPLETE BRIEFING & ENTER SQUAD →`. Mobile: flat (no tilt),
back arrow, formation strip scrolls horizontally, CTA `COMPLETE BRIEFING`
full-width. Motion: `pageTurn` between steps, `chalkDraw` selection
circle, slider flag elastic lag, step dots fill red.

### 5.6 Dashboard — `/dashboard`
Web (`dashboard/web`): broadcast header band (home vs away monograms,
formation chips, `VS`, competition), **countdown** block (`flipDigit`
seconds); `MANAGER'S BRIEFING DESK` title; three Chalk `PaperCard`s
rotated −1/0/+1 with tape/pin/red "Touchline priority" label:
**Prepare this match** (next opponent, mini pitch, AI teaser = latest
recommendation headline or opponent weakness, `DEPLOY →` → `/assistant`
with match linked), **Review last match** (result chip, real stats bars,
`EXPAND →` → match detail), **Ask the AI Coach** (last question asked +
latest recommendation, `LAUNCH →` → `/assistant`). Two info cards below:
Squad availability, Next-opponent weakness. Right column `CAMPAIGN TRAIL`
timeline: past result → **YOU ARE HERE** (red ping dot) → upcoming
fixtures (fading opacity) + schedule-density bar. Demo-seed button when
the club has no data. Mobile: scoreline band smaller, cards stack with
±0.5deg, fixtures as horizontal chip strip; `handleCardClick` in the
mobile `code.html` shows the tap feedback to replicate.
Motion: cards `paperDrop` stagger 80ms; countdown `flipDigit`; red ping
dot on YOU ARE HERE (CSS `animate-ping`).
Backend: add `convex/dashboard.ts` → `summary` query returning next match,
last match, upcoming list, latest recommendation, availability counts,
next opponent weaknesses (one round-trip).

### 5.7 Teams — list — `/teams`
Web: roster-book — folder index tabs per team (age-category color, player
count, formation mini-dots, ▲ markers → CUT), summary panel for hovered
team, `+ NEW SQUAD FOLDER` dashed tab. Cut print/CSV. Mobile: `CLUB ROSTER
BOOK` title, filter chips `ALL SQUADS (n) | SENIOR | ACADEMY | YOUTH`
(derived from `ageCategory`), full-width team rows, `+ REGISTER NEW SQUAD`
dashed row. The mobile `code.html` has a `showNotification` toast — use
our Toast. Motion: hover slides summary in (`arcEnter`); mobile `rowSweep`.

### 5.8 Teams — create — `/teams/new`
Paper team-sheet form: name, age category chips (`01 SENIOR`, `23 U-23`,
`21 U-21`, `18 U-18`, `AC ACADEMY`, `YO YOUTH`), competition, default
formation picker. CTA `STAMP & CREATE SQUAD →` (`stampPress`, then sheet
lifts 1.02 + chalk checkmark, navigate to detail). Cut "home ground"
field and "generate tactical dossier". Mobile: full-bleed sheet, CTA
pinned bottom.

### 5.9 Teams — detail — `/teams/[id]`
Web: header (team name huge Anton, edit / + add player buttons), live
formation pitch beside header (dots move on formation change — 400ms
curved), position filter chips `ALL (n) | GK | DEF | MID | FWD`, roster
grouped by position as mini tokens. Mobile: stacked; formation selector
row (`SYSTEM // 4-3-3 …` with swap icon) opens a sheet; sticky position
group headers (`01 // GOALKEEPERS (2)` …) with hairline that appears when
pinned; `+ ADD PLAYER`. Cut print/export, notifications.

### 5.10 Players — list — `/players`
Web: `FIRST TEAM SCOUTING LEDGER` — ruled-ledger table (no zebra; hairline
rows): kit #, name, position, team, rating dial, availability pin;
search input; position chips with counts; `+ REGISTER ATHLETE`. Row click
→ profile. Mobile: `SCOUTING LEDGER`, search with clear (×), chips incl.
`U-21` (derived from team age category), token rows, the designed empty
state `NO ATHLETES FOUND` + `RESET FILTERS`. Motion: filter = FLIP reflow
(`motion` `layout`), mobile `rowSweep`.

### 5.11 Players — board — `/players/board` (flagship interaction)
Web: header strip (title `MAGNETIC TACTICS WHITEBOARD // SQUAD DEPTH
CHART`, keep as title only — cut "v2.4 / slate surface live / magnetic
locks / drift resistance"); search; formation chip (team's
`defaultFormation`, display only); `+ ADD LANE` (creates a new
squadGroup name via inline input). Lanes as columns: `STARTING XI`
(grouped by line: forwards / midfield / defence / GK as in design),
`BENCH // ROTATION`, `RESERVES & U-21`, plus custom lanes; each lane
header shows count. Tokens: kit #, position chip, rating, name, short
role line (from position/notes — not fake stats), flip icon. Back of
token: name/kit header, age (from DOB), 4-axis radar, coach notes,
availability, `FLIP FRONT`. Empty-lane drop target `DROP TOKEN HERE`.
Mobile: lanes stacked vertically, sticky collapsible lane headers,
**Edit lineup** toggle (replaces "Magnets on"), search, tokens min 44px.
Motion (exact): `tokenLift` on drag start; token trails pointer with
slight elastic lag (spring on the overlay position); `dropSettle` +
lane red-outline pulse on drop; within-lane reflow via FLIP
(`@dnd-kit/sortable` + `motion` layout); `flip3D` on tap/flip icon;
touch: press-and-hold 250ms activates drag (dnd-kit `TouchSensor` delay),
so tap-to-flip and drag don't conflict; dragging over a collapsed lane
header for 400ms expands it. Persist with `players.reorder` (optimistic
update).

### 5.12 Players — add / edit — `/players/new` (+ edit mode on profile)
Web: `PHYSICAL PLAYER ENROLLMENT` registration card + live token preview
(right). Fields: name, kit # stepper (`flipDigit`), position via pitch
zone buttons (`GK LB LCB RCB RB CDM CM CAM LW ST RW` — map LCB/RCB→CB etc.
to stored string), preferred foot `LEFT | RIGHT` (+ BOTH), team, squad
group chips (`SENIOR A / U-23 / U-18 / ACADEMY` → real team/squadGroup
values), 4 rating dials, availability, notes. CTA `STAMP & REGISTER
ATHLETE →`, secondary `DISCARD DRAFT // REVERT`. Mobile: preview pinned on
top, rating as horizontal sliders, `CANCEL` top-right. Cut "Add trait".
Motion: preview fields flash on change; submit → `stampPress` + chalk
check across the preview, then navigate to profile.

### 5.13 Players — profile — `/players/[id]`
Web: `PLAYER DOSSIER CARD` — large token (kit, name, position,
availability), radar, `EVALUATED KEY STRENGTHS` (derive from highest
ratings), tabs as folder dividers: `COACH NOTES (HANDWRITTEN)` (editable,
handwriting-style italic), `RECENT MATCHES (TICKER)` (matches with this
player's events), `PEER COMPARISONS` (vs same-position squad average —
real computation). CTA **ASK THE AI ABOUT THIS PLAYER** (recast of
"Assign tactical directive"), Edit button. Cut heatmap, league benchmark,
PDF. Mobile: `chevron_left SQUAD`, stacked card + radar, scrollable tab
strip `COACH NOTES · RECENT MATCHES · COMPARISONS · TACTICAL METRICS`,
CTA full-width bottom. Motion: tab swipe (`arcEnter` horizontal), radar
`chalkDraw` 500ms on first view.

### 5.14 Matches — history — `/matches`
Web: two entry tiles (`RECORD MATCH FIXTURE` → `/matches/new`, `BATCH …
IMPORT` with drop illustration → `/matches/import`; rename "telemetry" to
"spreadsheet"), competition chips with counts, ticker rows (date,
opponent, score in Anton, left result stripe red/green/gray, `MATCH CENTER
→`), `PREV 6 | NEXT 6` pagination. Mobile: chips (`ALL (n) | …`), `+ NEW
MATCH`, rows with date under opponent, `LOAD OLDER FIXTURES (n
REMAINING)`. Motion: rows `tickerIn`.

### 5.15 Matches — add — `/matches/new`
Web: modal over the dimmed history (`OFFICIAL MATCH REPORT ENTRY`,
`DISMISS // ESC`): opponent selector with `CHANGE` + `+ REGISTER UNLISTED
OPPONENT` (inline create), competition chips (existing values + free
text), date, team, `HOME GATE / AWAY GATE` toggle (stadium / flight icons;
no stadium names), score steppers `— 2 + vs — 1 +`, optional formations,
stats (possession/shots/… collapsible "Match stats"), CTA `STAMP & RECORD
FIXTURE →`. Mobile: full-screen sheet (`sheetUp`) with close (×), swap
icon, `+ ADD SCORER` rows (player picker + minute) → creates goal events.
Motion: steppers `flipDigit`; submit `stampPress`.
Route: keep `/matches/new` as a page; on web render it as a modal look
(page with dimmed ledger behind is optional — a full page styled as the
modal is acceptable).

### 5.16 Matches — CSV import — `/matches/import`
Web: `DROP MATCH SPREADSHEET HERE` dashed zone + `Select ledger file`,
then `COLUMN MAPPING SHEET` (ruled rows: CSV column → CoachAI field
select), `IMPORT N MATCHES →`, success `N MATCHES COMMITTED`, `Import
another`, `Discard file & restart`. Uses existing
`matches.importRows`. Mobile: tap-to-choose primary, mapping as stacked
rows, CTA `STAMP & IMPORT N MATCHES →`. Motion: `marchingAnts` during
drag-over, zone turns green + chalk check on accept, mapping rows
`arcEnter` one by one.

### 5.17 Matches — detail — `/matches/[id]`
Web: broadcast scoreline header (home/away names, big score), `EXPORT`
cut, `+ LOG TACTICAL EVENT`; filter chips `ALL EVENTS (n) | GOALS | CARDS
| SUBS | TACTICAL SHIFTS`; centre-line timeline with our events left,
theirs right, minute in Anton; inline event picker (type buttons
`GOAL | YELLOW | RED | SUB | TACTICAL` + assist/injury, player chips with
kit #, `+ OTHER…`, minute stepper, `CANCEL` / `STAMP EVENT`); `POST-MATCH
DOSSIER` stats panel (real fields only). Mobile: back `Matches`, chips,
timeline on left edge with team badges, `+ LOG` opens bottom sheet `ADD
MATCH EVENT` → `CONFIRM & STAMP EVENT →`. Cut "VAR review". Motion: line
grows past new marker, marker spring-pops (`tickerIn`), minute stepper
detent.

### 5.18 Opponents — list — `/opponents`
Web (`opponents-list/web/code.html`, no screenshot): `OPPONENT
INTELLIGENCE` title, search (`FILTER BY CLUB, FORMATION…`), formation
filter chips (recast from competition chips), folder-tab cards (monogram,
name, formation glyph, `OPEN FULL DOSSIER →`), `+ SCOUT NEW OPPONENT`
dashed card → quick-create modal (name field, `INITIALIZE DOSSIER` /
`CANCEL`) → creates then routes to the dossier. **Mobile (no design):**
single-column full-width rows (monogram, name, formation), search on top,
chips scroll horizontally, `+ SCOUT NEW OPPONENT` as last dashed row,
quick-create as bottom sheet. Motion: card hover lift 4px; `rowSweep`.

### 5.19 Opponents — add / edit — `/opponents/new`
Web (`INITIAL ENCOUNTER SPECIFICATION`): name, formation picker cards
(`4-3-3`, `4-2-3-1`, `3-5-2`, `4-4-2` with descriptive sublabels), style
/ strengths / weaknesses textareas as tinted sticky-notes (+ pressing,
build-up, defensive, set-piece fields — add them, they exist in schema),
`DISCARD DRAFT`, `CREATE SCOUTING DOSSIER`. Mobile: stacked, back arrow,
CTA bottom. Motion: `chalkDraw` selection, `stampPress` on create.

### 5.20 Opponents — dossier — `/opponents/[id]`
Web: header (name, formation), sticky-note sections in 2 columns: Style
(playing / pressing / build-up / defensive), Strengths (green chalk
ticks), Weaknesses (red chalk crosses), Set pieces. CTA **DEPLOY
COUNTER-TACTICS** → AI Coach prefilled "How do we beat {name}?". Edit
button. Mobile: accordion sections (`SECTION 01 TACTICAL STYLE …
expand_more`), `toggleDossierSection` behaviour from the mobile
`code.html`, CTA bottom. Motion: content fade-rise in; accordion vertical
unfold; web section switch horizontal swipe.

### 5.21 AI Coach — `/assistant`
Web: left notepad chat column (coach questions as scrawled notes, input
`Scrawl question or tactical modification…`, optional linked-match
select, quick-prompt chips), right tactics-board sheet: headline +
summary, pitch with `formation` dots labelled from `starting_xi`,
plan sections as card-flap tabs (Attacking / Defensive / Pressing /
Transition / Set pieces / Risks / Alternatives / Subs / Training),
reasoning collapsible, stamp row `ACCEPT DIRECTIVE` (green) · `MODIFY`
(amber, opens comment) · `DISCARD` (red) → `ai.recordFeedback`. Past
recommendations list. Mobile: top toggle `MATCH PLAN | TOUCHLINE CHAT`
(`switchView` in mobile `code.html`), plan sections as accordions
(`toggleFlap`), stamp row anchored bottom, quick-prompt chips above the
input (`⚡ Simulate subs`, `📊 Pressing intensity`, `🎯 Set-piece defense`
→ preset questions; drop the emoji, use Material icons).
Loading: pitch-diagram loader with dotted arrows drawing/redrawing in a
loop. Errors (e.g. Gemini 429 quota) → styled red lower-third with a
human message ("AI limit reached — try again in a few minutes"), not the
raw Convex error.
Motion: arrows `chalkDraw` staggered 600ms; stamps `stampPress` + ink
blot; view toggle `arcEnter` horizontal.

### 5.22 Settings — `/settings`
Web (`OPERATIONAL LEDGER & SETTINGS`): sections with hairlines — Club
identity (club name only), Language (`TACTICAL KIT // TAG` shirt cards for
EN / FR / AR with check), Coach philosophy (formation chips 4-3-3,
3-4-2-1, 4-2-3-1, 5-3-2 + style + risk — `MODIFY SHAPE MATRIX` → inline
edit), Coach roster (token rows, role chip Owner/Member), Invite coach
(`ISSUE TECHNICAL PASSPORT // INVITE COACH`: name + email, `STAMP
INVITATION & ISSUE PASS`), `SAVE CONFIGURATION`. Cut telemetry engine
section, permission matrix, audit export. Mobile: full-width sections,
language as `ZONE A FR / ZONE B AR / PRIMARY EN` cards, `Invite staff
member →` row. Motion: `localeFlip` when switching to/from Arabic; invite
name writes in with a handwriting stroke.

---

## 6. Backend changes required (small)

1. `players.jerseyNumber: v.optional(v.number())` + form + seed data.
2. `convex/dashboard.ts` → `summary` query (one round-trip for §5.6).
3. Optional: `matches.kickoffTime: v.optional(v.string())` ("HH:mm") so
   the countdown can show hours/minutes. Without it, count down to the
   match **date** in days + hours.
4. `LLM_PROVIDER=mock` provider in `convex/aiLlm.ts` returning a canned
   `Recommendation` — **needed for UI work**: the Gemini free tier on the
   dev key allows only ~20 requests/day and one question can use up to 8
   requests (tool loop, `MAX_STEPS = 8`).
5. Prefill onboarding club name from signup (Clerk `unsafeMetadata` or a
   query param).

No other schema changes. Anything that needs more than this is CUT.

---

## 7. Phases (one PR each, in order)

| # | Phase | Contents | Done when |
|---|---|---|---|
| 1 | Foundations | Tokens, fonts, icons, primitives, motion presets, app shell (web sidebar + mobile bottom bar), mock LLM provider | Existing pages render in the new shell without breaking; `pnpm build` + typecheck + lint green |
| 2 | Landing | §5.1 web + mobile, honest copy in 3 locales | Side-by-side visual check vs `landing-page/*/screen.png` at 1440 and 390 widths |
| 3 | Auth & entry | Login, signup (+ verification, forgot password), invite, onboarding | Full signup → onboarding → dashboard flow works in FR/AR/EN |
| 4 | Dashboard | §5.6 + `dashboard.summary` + `jerseyNumber` field | Demo seed renders a fully populated dashboard; empty club shows empty states |
| 5 | Players | List, board, add/edit, profile | Drag between lanes persists; flip works; touch drag works on a phone viewport |
| 6 | Teams | List, create, detail | Formation change animates pitch dots |
| 7 | Matches | History, add, import, detail | CSV import + event logging work end-to-end |
| 8 | Opponents | List (+ mobile design), add, dossier | "Deploy counter-tactics" opens AI Coach prefilled |
| 9 | AI Coach | §5.21 with mock + real provider, feedback stamps, error state | Works with `LLM_PROVIDER=mock`; one real Gemini call verified |
| 10 | Settings + polish | §5.22, RTL pass on every screen, reduced-motion pass, a11y pass (focus, 44px targets, contrast) | Every screen checked in Arabic RTL at both widths |

### Per-PR acceptance checklist
- [ ] Web layout matches `screen.png` / `code.html` at 1440px; mobile at 390px.
- [ ] Every visible button does something real, or it was removed per §3.
- [ ] No hard-coded fake names/numbers; data from Convex.
- [ ] All strings in `fr`, `ar`, `en`; Arabic renders RTL with Kufi display font.
- [ ] Motion uses `lib/motion.ts` presets and respects reduced motion.
- [ ] Empty, loading and error states exist.
- [ ] `pnpm --filter web build`, typecheck and lint pass.
- [ ] Manually exercised in the browser (golden path + one edge case).

---

## 8. Known gaps in the designs (build in-system, don't invent new styles)

- `opponents-list/mobile` (missing)
- Email verification code step, forgot-password flow
- Empty, loading, error states on every list/detail screen
- Delete confirmations (players, teams, matches, opponents, events)
- Edit modes (reuse the add forms prefilled)
- 404 / not-found page (suggest: "Off the pitch" chalk diagram)
- AI quota / network error message
