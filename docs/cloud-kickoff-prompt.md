# Cloud session kickoff prompt

Paste everything inside the fence below as the first message of the cloud
Claude Code session (repo: `amen-allah-fraj22/coach_ai`, branch
`claude/serene-lovelace-3ohcfe`).

```
You're picking up CoachAI, an AI decision-support web app for football
coaches. Repo: amen-allah-fraj22/coach_ai, branch claude/serene-lovelace-3ohcfe
(all work is on this branch, not main). Work on this branch.

## The project (read these first)
- README.md and docs/local-dev.md — setup and architecture.
- pnpm monorepo. App: apps/web (Next.js 16 + TypeScript + Tailwind v4 +
  next-intl FR/AR/EN with Arabic RTL). Backend: Convex in apps/web/convex
  (schema.ts is the data model; every function filters by clubId via
  requireCoach). Auth: Clerk. AI Coach: Gemini behind a provider layer in
  convex/aiLlm.ts, with a tool-calling loop in convex/ai.ts.
- IMPORTANT: apps/web/AGENTS.md — this Next.js version has breaking
  changes. Read node_modules/next/dist/docs/ before using Next APIs.
- Already installed and to be reused: motion (motion/react), @dnd-kit/core
  + sortable, next-intl, Clerk.
- Current state: all features work functionally (CRUD for teams, players,
  matches, match events, opponents; drag-and-drop squad board; CSV import;
  AI Coach with accept/modify/reject feedback; invites; demo seed). The UI
  is a plain first pass. Verified locally against a live Convex dev
  deployment.

## The task: full redesign onto the Stitch designs
The coach designed all 22 pages in Google Stitch, each with a separate
desktop and mobile version. They are in design/stitch/:
- design/stitch/DESIGN.md — the design-token spec (colors, type scale,
  spacing, component rules). Note: radius 0, no shadows on UI chrome,
  never pure white (use Chalk #F7F5EF).
- design/stitch/<page>/web/code.html + screen.png, and
  design/stitch/<page>/mobile/code.html + screen.png. code.html is the
  source of truth (open it in a browser); 9 screenshots failed to export
  but their HTML is intact. opponents-list has no mobile design.
- design/stitch-prompts.md — the original brief, including the motion
  notes for every screen (Stitch renders static screens, so most
  animation must be built from these notes).

The complete, authoritative plan is docs/design-implementation-plan.md.
Read it fully before writing code. It contains:
- §2 foundations: tokens, fonts (Anton, IBM Plex Sans, IBM Plex Sans
  Arabic, Noto Kufi Arabic for RTL display), Material Symbols icons,
  UI primitives, the single app shell that replaces Stitch's inconsistent
  per-screen sidebars, and the named motion presets (lib/motion.ts).
- §3 the feature split. Stitch invented a lot of things the product
  doesn't have (live match telemetry, xG, latency/system-status readouts,
  camera/drone claims, heatmaps, PDF export, fake club names). Each
  element is marked BUILD / RECAST (keep the visual, feed it real data) /
  CUT / LATER. Follow it — do not build CUT items, do not invent features
  that aren't listed, and never show fake data or false claims (this
  matters most on the landing page, whose copy must be rewritten to be
  true while keeping the layout).
- §5 a screen-by-screen spec for all 22 pages, web and mobile: sections,
  every button and what it does, data source, and animations. The
  landing page (§5.1) is the top priority after foundations.
- §6 the only backend changes allowed: players.jerseyNumber, a
  dashboard.summary query, optional matches.kickoffTime, a mock LLM
  provider, and prefilling the club name from signup into onboarding.
- §7 ten phases, one PR each, with a per-PR acceptance checklist.
- §8 known design gaps to fill using the same design system (empty /
  loading / error states, email verification, forgot password, delete
  confirmations, opponents-list mobile, 404).

## How to work
1. Start with Phase 1 (foundations) only. Before coding, reply with a short
   plan for Phase 1: the files you'll touch, how you'll structure the
   motion presets and primitives, and any conflicts you found between
   DESIGN.md, the code.html files and the plan. Then implement it.
2. One phase per PR against this branch (or stacked branches off it).
   Don't start the next phase until the current one meets the §7 checklist.
3. Implement the mock LLM provider (LLM_PROVIDER=mock) early. The Gemini
   key on the dev deployment is on the free tier (about 20 requests/day,
   and one AI Coach question can use up to 8 requests), so do UI work
   against the mock and only make real Gemini calls to verify.
4. Rebuild designs as typed React components using the shared
   primitives. Don't paste Stitch HTML or its Tailwind CDN config into the
   app.
5. Every string goes through next-intl in fr, ar and en. Check Arabic RTL
   on every screen.
6. Verify UI in a browser at 1440px and 390px wide against the
   screen.png/code.html before calling a phase done. If you can't run the
   app in this environment, say so explicitly rather than claiming the UI
   works.
7. Don't commit secrets or .env.local. Don't commit unrelated local churn
   (lockfile rewrites, regenerated convex/_generated from a different CLI
   version) unless it's intentional.
8. If something in the plan is ambiguous or seems wrong, ask me instead
   of guessing. Landing-page copy and the honest replacement metrics
   (§5.1) need my sign-off: propose them, don't finalize them alone.
```
