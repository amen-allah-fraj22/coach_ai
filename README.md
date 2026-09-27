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

Requires Node >= 22 and pnpm.

```bash
pnpm install

# Web app (http://localhost:3000)
cp apps/web/.env.example apps/web/.env.local   # fill in your Supabase project's URL/anon key
pnpm dev:web

# AI Core (http://localhost:3001) — empty shell until Phase 3
cp apps/ai-core/.env.example apps/ai-core/.env
pnpm dev:ai-core
```

`apps/web` runs entirely against a Supabase project (Postgres + Auth) — apply
`supabase/migrations/` to your own project via the Supabase CLI or dashboard
SQL editor.

## Status

Phase 1 (foundation) — multi-tenant schema, Next.js scaffold with shadcn/ui
and French/Arabic/English i18n (RTL for Arabic), NestJS AI Core scaffold.
Phase 2 (core CRUD + auth) is next.
