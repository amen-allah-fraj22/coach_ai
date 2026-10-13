# Local development

The backend is **Convex** (database + serverless functions) and auth is
**Clerk**. Both have free dev tiers and run against the cloud dev
deployment — there is no Docker or local database to manage. You need
**Node 22+**, **pnpm**, a **Convex** account, a **Clerk** application, and a
**Gemini** API key (for the AI Coach).

## 1. Install dependencies

```bash
pnpm install
```

## 2. Set up Convex

From `apps/web`:

```bash
cd apps/web
pnpm convex   # = `npx convex dev`
```

The first run logs you into Convex (browser), creates a dev deployment,
writes `CONVEX_DEPLOYMENT` to `apps/web/.env.local`, regenerates
`convex/_generated/`, and then watches `convex/` and pushes changes. Leave
it running in its own terminal. It also prints your deployment URL — put it
in `.env.local` as `NEXT_PUBLIC_CONVEX_URL` (below).

## 3. Set up Clerk

1. Create an application at dashboard.clerk.com (enable Email + Password).
2. Copy the **Publishable key** and **Secret key** (API Keys).
3. Create a **JWT template** named exactly `convex` (Clerk has a Convex
   preset). Copy its **Issuer** URL (looks like `https://<sub>.clerk.accounts.dev`).
4. Tell Convex about that issuer:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-subdomain>.clerk.accounts.dev
```

## 4. Set the Gemini key on Convex

The AI Coach action runs on Convex's servers, so its key lives in Convex's
env, not in `.env.local`:

```bash
npx convex env set GEMINI_API_KEY <your-gemini-key>
# optional: npx convex env set GEMINI_MODEL gemini-2.5-flash
```

Get a free key from Google AI Studio.

## 5. Fill in `apps/web/.env.local`

`convex dev` already added `CONVEX_DEPLOYMENT`. Add the rest:

```
NEXT_PUBLIC_CONVEX_URL=<the URL convex dev printed>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
CLERK_SECRET_KEY=<Clerk secret key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 6. Run the app

In a second terminal (keep `convex dev` running in the first):

```bash
pnpm dev:web   # http://localhost:3000
```

Open http://localhost:3000, sign up through Clerk, then create a club in the
onboarding step, and you're in.

## Everyday notes

- **Two processes in dev:** `pnpm dev:convex` (backend, from `apps/web` it's
  `pnpm convex`) and `pnpm dev:web` (frontend). The Convex one must be
  running for any data to load.
- **Convex dashboard:** `npx convex dashboard` opens the deployment's tables,
  function logs, and env vars in the browser.
- **Generated types:** `convex/_generated/` is committed so the repo builds
  without a Convex login; `convex dev` keeps it in sync as you edit
  `convex/`. Don't edit it by hand.
- **Schema/functions** live in `apps/web/convex/`. Editing a file there is
  picked up by the running `convex dev`; no migration step.

## Going to production later

`npx convex deploy` promotes the functions to a production deployment; point
a production Clerk instance at it, set the same env vars on the prod
deployment, and host the Next.js app. No code changes.
