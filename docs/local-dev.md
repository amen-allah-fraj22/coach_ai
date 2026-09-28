# Local development

The whole stack runs on your machine — no cloud accounts, no cost. The only
prerequisites are **Node 22+**, **pnpm**, and **Docker** (Docker Desktop on
Mac/Windows). Docker is what runs the local database and auth.

## Why not just a plain Postgres (pgAdmin)?

The app doesn't only use Postgres — it uses Supabase Auth (sign-up / login),
`auth.uid()` inside the Row Level Security policies, and the `supabase-js`
client. A bare Postgres has none of those, so it can't run the app without
rebuilding authentication from scratch. The Supabase CLI gives you the *whole*
Supabase (Postgres + Auth + a Studio UI) locally in Docker, and the exact same
code then works against a cloud project later by swapping two env values.

You can still point pgAdmin at the local database once it's running (see the
end) — it's a normal Postgres on port 54322.

## 1. Install the Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase
# Windows (scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
# or npm, any OS
pnpm add -g supabase
```

## 2. Start the local stack

From the repo root:

```bash
supabase start
```

The first run pulls Docker images (a few minutes). It then applies everything
in `supabase/migrations/` and prints a block like:

```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

Those keys are the well-known local development keys — they are safe to use
locally and are NOT secrets (never reuse them for a real project).

## 3. Fill in the env files

`apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
AI_CORE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`apps/ai-core/.env`:

```
PORT=3001
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
LLM_PROVIDER=gemini
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-2.5-flash
```

The web app runs with just the first file; the AI Core (`/assistant`) needs a
Gemini key. Get a free one from Google AI Studio.

## 4. Run the apps

```bash
pnpm dev:web       # http://localhost:3000
pnpm dev:ai-core   # http://localhost:3001  (only needed for the AI Coach)
```

Open http://localhost:3000, go to **Create a club**, sign up, and you're in.
Email confirmation is turned off in local config (`supabase/config.toml`), so
sign-up logs you straight in.

## Everyday commands

```bash
supabase stop            # stop the stack (keeps data)
supabase stop --no-backup   # stop and wipe local data
supabase db reset        # re-apply all migrations from scratch (fresh DB)
supabase migration new <name>   # scaffold a new migration file
```

After adding a migration file to `supabase/migrations/`, `supabase db reset`
re-applies the whole set — the same files will run against the cloud project
later via `supabase db push`.

## Inspecting data

- **Studio**: http://localhost:54323 — tables, SQL editor, and the auth users
  list, all in the browser.
- **pgAdmin / any client**: host `localhost`, port `54322`, database
  `postgres`, user `postgres`, password `postgres`.

## Moving to a cloud project later

Create a Supabase project, run `supabase db push` to apply these same
migrations to it, turn email confirmations back on, and change the two
`SUPABASE_URL` / key pairs in the env files. No code changes.
