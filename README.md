# CoachAI

AI-powered decision-support platform for football coaches. See the cahier des
charges (Claude Doc, linked from project notes) for the full product spec,
and `design/stitch-prompts.md` for the "Pitchside" visual language.

## Structure

```
apps/web/
  src/          Next.js app (TypeScript, Tailwind, shadcn/ui, next-intl) —
                the coach-facing product.
  convex/       Convex backend: schema, queries, mutations, and the AI Coach
                action (LLM orchestration + tools). This is the whole backend.
design/
  stitch-prompts.md  Screen-by-screen Stitch prompts + motion specs.
```

Backend + database is **Convex**; auth is **Clerk**; the AI Coach uses
**Google Gemini** behind a provider-agnostic layer (swap in `convex/aiLlm.ts`).

## Getting started

Requires Node 22+, pnpm, a Convex account, a Clerk app, and a Gemini key —
no Docker, no local database.

**See [`docs/local-dev.md`](docs/local-dev.md) for the full setup.** In short:

```bash
pnpm install
cd apps/web && pnpm convex   # logs in, provisions a dev deployment, watches convex/
# set Clerk + Gemini env (see docs/local-dev.md), fill apps/web/.env.local
pnpm dev:web                 # http://localhost:3000  (in a second terminal)
```

## Status

- **Phase 1–3** — foundation, CRUD, and the AI Coach, first built on
  Supabase + a NestJS service. ✅
- **Convex + Clerk migration** — the whole backend re-platformed onto Convex
  functions with Clerk auth; Supabase and the NestJS service removed. ✅
  Builds green and typechecks; not yet run against a live Convex deployment.
- **Phase 4** — CSV import, the drag-and-drop player board (the `players.reorder`
  mutation is already in place), demo data. Next.
