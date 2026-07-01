# Sobers Website

A property marketing website with a React/Vite frontend and Express API backend.

## Run & Operate

Both services run as managed workflows on Replit:

- **Frontend** — `artifacts/sobers-website: web` workflow (port 5173, `BASE_PATH=/`)
- **API Server** — `artifacts/api-server: API Server` workflow (port 8080)

During initial setup, manual workflows were also configured as `Sobers Website` (port 5173) and `API Server` (port 8080) — these can be removed once the managed artifact workflows are confirmed stable.

Other useful commands:
- `pnpm run typecheck` — full typecheck across all packages (run from workspace root)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to Postgres (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS, Radix UI, Framer Motion, Wouter (routing), TanStack Query
- API: Express 5, Pino logging
- DB: PostgreSQL + Drizzle ORM (schema is empty — not yet connected)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sobers-website/src/App.tsx` — main frontend entry; currently has HeroSection + CinematicFooter
- `artifacts/api-server/src/app.ts` — Express app; currently only `/api/healthz` route
- `lib/db/src/schema/index.ts` — Drizzle schema (empty boilerplate)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks (from Orval codegen)
- `lib/api-zod/` — generated Zod schemas (from Orval codegen)

## Architecture decisions

- `PORT` and `BASE_PATH` env vars are required at startup for the frontend (enforced in `vite.config.ts`); `PORT` is required for the API server
- Orval codegen generates both React Query hooks and Zod validators from a single OpenAPI spec — run codegen after any spec change
- esbuild bundles the API server to `dist/index.mjs` for production

## Gotchas

- Run `tsc -b` (or `pnpm run typecheck` from the workspace root) for a correct full typecheck — running `tsc` inside `artifacts/api-server` alone may fail due to TypeScript project references needing libs built first
- `DATABASE_URL` secret must be set before any database operations

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
