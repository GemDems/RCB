# Sobers Website

A property marketing web application with hyper-realistic 3D walkthroughs and virtual tours.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Radix UI + Framer Motion (path: `artifacts/sobers-website/`)
- **Backend**: Express 5 + Pino logging (path: `artifacts/api-server/`)
- **Database**: PostgreSQL + Drizzle ORM (schema in `lib/db/` — currently empty boilerplate)
- **API layer**: OpenAPI-first; codegen via `orval` produces React Query hooks (`lib/api-client-react/`) and Zod schemas (`lib/api-zod/`)
- **Monorepo**: pnpm workspaces

## Running locally on Replit

Both services start automatically via workflows:

| Workflow | Command |
|---|---|
| `artifacts/sobers-website: web` | `pnpm --filter @workspace/sobers-website run dev` |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |

The frontend proxies `/api` requests to the API server at `localhost:8080`.

## Environment variables / secrets

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | For DB features | PostgreSQL connection string — set in Replit Secrets |
| `SESSION_SECRET` | For sessions | Set in Replit Secrets |
| `PORT` | Auto-set | Injected by Replit per artifact |
| `BASE_PATH` | Auto-set | Injected by Replit per artifact |

## Useful commands

```bash
# Install dependencies
pnpm install

# Run codegen (regenerate API client from openapi.yaml)
pnpm --filter @workspace/api-spec run codegen

# Typecheck everything
pnpm run typecheck
```

## User preferences

<!-- Agent: add user preferences here when asked to remember something -->
