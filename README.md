# CoachAI

AI-powered decision-support platform for football coaches. See the cahier des
charges (Claude Doc, linked from project notes) for the full product spec,
and `design/stitch-prompts.md` for the "Pitchside" visual language.

## Structure

```
apps/
  web/       Next.js app (TypeScript, Tailwind, shadcn/ui, next-intl) — the
             coach-facing product, talks to Supabase directly for CRUD.
  ai-core/   NestJS service — the AI Coach Assistant (LLM orchestration,
             tool-calling). Scaffolded in Phase 1; built out in Phase 3.
supabase/
  migrations/  Postgres schema: multi-tenant (clubs -> coaches -> teams ->
               players), Row Level Security, multi-coach support.
design/
  stitch-prompts.md  Screen-by-screen Stitch prompts + motion specs.
```

## Getting started

Requires Node 22+, pnpm, and Docker. The full backend (Postgres + Auth +
Studio) runs locally in Docker via the Supabase CLI — no cloud account needed.

**See [`docs/local-dev.md`](docs/local-dev.md) for the complete setup.** In short:

```bash
pnpm install
supabase start                                 # local Postgres + Auth + Studio
cp apps/web/.env.example apps/web/.env.local    # paste the printed anon key
cp apps/ai-core/.env.example apps/ai-core/.env  # paste service_role key + Gemini key
pnpm dev:web        # http://localhost:3000
pnpm dev:ai-core    # http://localhost:3001 (only for the AI Coach)
```

The same `supabase/migrations/` apply to a cloud project later via
`supabase db push` — moving off local is a URL swap, no code changes.

## Status

- **Phase 1** — monorepo, multi-tenant schema, Next.js + shadcn/ui, FR/AR/EN
  i18n (RTL), NestJS AI Core scaffold. ✅
- **Phase 2** — auth, club creation, coach invites, and CRUD for teams,
  players, opponents, matches and match events. ✅ Schema + RLS + the signup
  and invite RPCs validated against a real local Postgres.
- **Phase 3** — AI Core: provider-agnostic LLM layer (Gemini), tools over the
  club's data, structured Match Plan output, feedback loop. ✅ (not yet run
  against live Gemini)
- **Phase 4** — CSV import, drag-and-drop player board, demo data. Next.
