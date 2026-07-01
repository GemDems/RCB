# Sobers — Property Marketing Platform

A property marketing platform offering hyper-realistic 3D walkthroughs and digital twins. Buyers can explore properties virtually before visiting, powered by AI chat and photorealistic renders.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Wouter, Radix UI |
| Backend | Node.js, Express 5, TypeScript (ESM) |
| Database | PostgreSQL via Drizzle ORM |
| AI | Cohere AI (chat widget) |
| Email | Resend |
| Monorepo | pnpm workspaces |

## Project Structure

```
artifacts/
  api-server/       — Express backend (port from $PORT env var)
  sobers-website/   — React/Vite frontend
  mockup-sandbox/   — Design canvas preview tool
lib/
  db/               — Drizzle schema and database client
  api-zod/          — Shared Zod validation schemas
  api-client-react/ — React API client hooks
```

## Running the Project

Both services start automatically via Replit workflows:

- **Frontend** (`artifacts/sobers-website: web`): `pnpm --filter @workspace/sobers-website run dev`
- **API Server** (`artifacts/api-server: API Server`): `pnpm --filter @workspace/api-server run dev`

The API server builds with esbuild before starting (`build.mjs`), then runs the compiled output from `dist/`.

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `SESSION_SECRET` | Express session signing |
| `COHERE_API_KEY` | AI chat widget |
| `RESEND_API_KEY` | Email sending |
| `DATABASE_URL` | PostgreSQL (auto-provisioned by Replit) |

## Database

Schema lives in `lib/db/src/schema/`. Run `pnpm --filter @workspace/db run push` to apply schema changes to development. Replit manages production schema diffs at publish time.

## User Preferences

- Keep the project's existing structure and stack.
