---
name: Pitchside Blackboard Analytics
colors:
  surface: '#061610'
  surface-dim: '#061610'
  surface-bright: '#2b3d35'
  surface-container-lowest: '#02110b'
  surface-container-low: '#0e1f18'
  surface-container: '#12231c'
  surface-container-high: '#1c2d26'
  surface-container-highest: '#273831'
  on-surface: '#d3e7dc'
  on-surface-variant: '#c7c7bf'
  inverse-surface: '#d3e7dc'
  inverse-on-surface: '#23342c'
  outline: '#91918a'
  outline-variant: '#464741'
  surface-tint: '#c8c6c1'
  primary: '#ffffff'
  on-primary: '#30312d'
  primary-container: '#e4e2dd'
  on-primary-container: '#656560'
  inverse-primary: '#5f5f5a'
  secondary: '#94d4b0'
  on-secondary: '#003823'
  secondary-container: '#0c5135'
  on-secondary-container: '#83c39f'
  tertiary: '#ffffff'
  on-tertiary: '#670500'
  tertiary-container: '#ffdad4'
  on-tertiary-container: '#c12714'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e4e2dd'
  primary-fixed-dim: '#c8c6c1'
  on-primary-fixed: '#1b1c18'
  on-primary-fixed-variant: '#474743'
  secondary-fixed: '#b0f1cb'
  secondary-fixed-dim: '#94d4b0'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#0c5135'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a7'
  on-tertiary-fixed: '#400200'
  on-tertiary-fixed-variant: '#910a00'
  background: '#061610'
  on-background: '#d3e7dc'
  surface-variant: '#273831'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 60px
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Anton
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.03em
  headline-sm:
    fontFamily: Anton
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.04em
  metric-huge:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: 0.01em
  metric-huge-mobile:
    fontFamily: Anton
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-tactical:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-mono:
    fontFamily: IBM Plex Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.08em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system channels the tactile tension of the manager's technical area—where analog chalkboards collide with elite, broadcast-grade telemetry. The visual aesthetic fuses high-contrast broadcast graphics with tactical pitch diagrams, avoiding sanitized corporate SaaS motifs and generic neon dashboards.

### Core Attributes
- **Tactical Authority:** Direct, urgent, and analytical. Surfaces mimic deep slate turf and technical boards under floodlights.
- **Physical Heritage:** Information is rendered with the dry density of chalk, field line tape, and magnetic counters rather than glossy synthetic glass.
- **Broadcast Precision:** High-impact condensed numerals, disciplined data hierarchies, and zero ambient blur or saturated futuristic gradients.
- **Atmospheric Contrast:** Monochromatic green-black foundations punctuated solely by deliberate chalk strokes, disciplined match-action green, and urgent touchline red.

## Colors

The palette is rooted in low-reflectance night pitches and technical locker-room slate. Pure digital white (`#FFFFFF`) is strictly forbidden; all highlights, labels, and primary marks execute in unbleached Chalk (`#F7F5EF`).

### Palette Application Rules
- **Base Canvas (`#12231C` - Night Pitch):** The absolute root canvas. Used across page backgrounds, structural shells, and deepest viewport levels.
- **Surface Elevation (`#182E25` - Slate Grass):** Card surfaces, analytical containers, tactical pitch backdrops, and active row indicators.
- **Primary Ink (`#F7F5EF` - Chalk):** Primary typographic layer, stat values, pitch lines, and tactile chalkboard strokes. Used at full opacity for primary telemetry, 60% for labels, and 8% (`rgba(247, 245, 239, 0.08)`) for tactical grid meshes and structural perimeter lines.
- **Tactical Metric Accent (`#2F6D4F` - Pitch Green):** Controlled positive variance, territory control zones, passing lanes, and successful press actions. Pairing wash: `rgba(47, 109, 79, 0.25)`.
- **Urgent Accent (`#E3402A` - Touchline Red):** Turnover states, opponent danger zones, physical load alerts, substitutions, and critical stoppage markers. Pairing wash: `rgba(227, 64, 42, 0.22)`.

## Typography

Typography establishes an assertive distinction between match telemetry and coach commentary.

- **Broadcast Numerical & Headline Authority (`Anton`):** Used exclusively for high-scale figures, match scoreboards, match clocks, xG metrics, and prominent section titles. All numeric implementations require `font-variant-numeric: tabular-nums` to maintain stability during real-time streaming updates. Anton is strictly uppercase when applied to tactical labels and match events.
- **Humanist Technical Commentary (`IBM Plex Sans`):** Delivers clean legibility across tactical diagrams, analytical logs, roster sheets, and player physical telemetry.
- **Tracking Discipline:** Tactical labels, player role designations, and pitch zone coordinates enforce wide tracking (`0.08em` to `0.12em`) in all-caps to replicate manual chalkboard notation and broadcast lower-thirds.

## Layout & Spacing

The layout operates on a disciplined 12-column broadcast grid built around an unyielding pitchside monitor format.

### Grid & Canvas Adaptation
- **Desktop (1200px+):** 12-column layout with 24px gutters and 32px canvas margins. Enables simultaneous side-by-side pitch telemetry (8 columns) and real-time positional data feeds (4 columns).
- **Tablet (768px - 1199px):** 8-column layout with 16px gutters and 24px margins. Tactical pitch collapses to top-screen prominence; event logs reflow into structured dual-column panels below.
- **Mobile (< 768px):** 4-column layout with 16px gutters and 16px margins. Telemetry renders as stacked tactical cards with horizontal scroll carousels for player heatmaps and substitutions.

### Structural Spacing Architecture
- Component interiors use dense spacing (`space-sm` to `space-md`) to echo the information density of professional coaching stations.
- Section partitions use firm `space-xl` spans enforced by subtle grid lines (`rgba(247, 245, 239, 0.08)`) rather than arbitrary negative whitespace.

## Elevation & Depth

Visual hierarchy rejects drop shadows, synthetic glow blurs, and neon halos entirely. Elevation is created through flat mechanical surface stepping and low-contrast perimeter rules.

### Structural Depth Architecture
1. **Level 0 (Pitch Substrate):** `#12231C`. The structural underlay of the whole display.
2. **Level 1 (Slate Containers):** `#182E25`. Tactical boards, match timeline trays, and analytical cards. Bound by a crisp `1px solid rgba(247, 245, 239, 0.08)`.
3. **Level 2 (Active Focus & Overlays):** `#182E25` surfaced with a faint tactical wash (`rgba(47, 109, 79, 0.25)` or `rgba(227, 64, 42, 0.22)`). Outlined by a sharp `1px solid rgba(247, 245, 239, 0.24)`.
4. **Overlays & Modals:** Strict `#12231C` base bounded with a `2px solid #F7F5EF` edge—evoking tactical magnetic whiteboards locked over an active plan.

## Shapes

The shape system is strictly sharp (`roundedness: 0`). 

No element carries rounded corners. Cards, chips, live counters, modals, and tactical plots adhere to rigid 90-degree geometry to reflect the utilitarian construction of physical coach clipboards, stadium LED ribbons, and technical pitch line markings. 

Data badges and tactical nodes may utilize 45-degree chamfered notches (via CSS clip-paths) for technical badges, maintaining clinical sports precision across every viewport.

## Components

### Buttons & Tactical Triggers
- **Primary Action (Call Play / Deploy):** Sharp `#F7F5EF` solid fill with `#12231C` Anton headline typography. Hover state: invert to `#182E25` background, `#F7F5EF` text, bounded by a `1px solid #F7F5EF`.
- **Secondary Action (Filter / Zone Select):** Sharp `#182E25` fill, `1px solid rgba(247, 245, 239, 0.16)`, `#F7F5EF` body text. Active toggle applies `rgba(47, 109, 79, 0.25)` wash with `#2F6D4F` inner left border (4px).
- **Destructive / Caution Trigger (Sub Out / High Press Risk):** `#182E25` fill, `1px solid #E3402A`, text rendered in `#E3402A`. Hover triggers solid `#E3402A` fill with `#F7F5EF` text.

### Chips & Tactical Tags
- Zero border-radius. Bound by `1px solid rgba(247, 245, 239, 0.12)`.
- Background: `#182E25`.
- Typography: `label-tactical` in `#F7F5EF` (all-caps, tracking-wide).
- Status variant: Prepend a 6px solid square glyph (`#2F6D4F` for low risk/in-possession, `#E3402A` for turnover vulnerability).

### Lists & Tactical Event Feeds
- Zebra row alternation is prohibited. Instead, entries are partitioned by `1px solid rgba(247, 245, 239, 0.08)`.
- Minute markers and player squad numbers use `Anton` with tabular numerals.
- Critical moments (goals, red cards, high-turnover sequences) gain an immediate left border accent of `3px solid #E3402A` and background tint `rgba(227, 64, 42, 0.08)`.

### Form Controls & Inputs
- **Text Inputs & Filter Selectors:** Sharp borders, `1px solid rgba(247, 245, 239, 0.16)`, `#12231C` background, `#F7F5EF` text. On focus: border shifts directly to `1px solid #F7F5EF` with zero glow.
- **Checkboxes & Radios:** Sharp square indicators (16px x 16px). Unselected: `#182E25` with `1px solid rgba(247, 245, 239, 0.24)`. Selected: filled with `#F7F5EF` displaying a `#12231C` inset square mark.

### Analytical Cards & Pitch Containers
- Background: `#182E25`.
- Perimeter: `1px solid rgba(247, 245, 239, 0.08)`.
- Header: Separated by a horizontal `1px solid rgba(247, 245, 239, 0.08)` rule, holding an Anton headline alongside a tracking-wide technical label.
- Data values inside cards use `metric-huge` paired with small uppercase tactical descriptions positioned directly beneath the figure.

### Custom Sports Domain Components
- **Tactical Chalk Pitch Board:** 2D canvas rendered in `#182E25` with field lines rendered in `rgba(247, 245, 239, 0.15)`. Tactical arrows render as chalk-textured dashes (`stroke-dasharray: 4, 4`).
- **Telemetry Spark-Bars:** Custom flat segmented bars representing stamina, pressure index, or territory hold. Segments use 2px gaps, tinted `#2F6D4F` for optimal performance and `#E3402A` for depletion/critical load.
- **Match Clock Lower-Third:** Compact `#12231C` block with full-width top border (`2px solid #F7F5EF`). Anton font numerals showing match minute and stoppage addition (`+4'`) with absolute baseline alignment.