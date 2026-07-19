# Quarterly Theory OS

The research, learning, journaling, and backtesting platform for Quarterly Theory traders.

This repository is built **incrementally, module by module** — each module ships with its own
Prisma schema additions, service/repository layer, API routes, and UI, fully wired end-to-end
before the next module starts. See [Module Status](#module-status) below for what's real today.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui-style primitives |
| Database | PostgreSQL (Supabase or Neon in production) |
| ORM | Prisma |
| Auth | Auth.js v5 (Credentials + Google + Apple, database sessions) |
| Data fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Payments | Stripe |
| Rich text | TipTap (Knowledge Library module) |
| Motion | Framer Motion |
| Monorepo | pnpm workspaces + Turborepo |

## Repository Structure

```
quarterly-theory-os/
├── apps/
│   └── web/                     # The Next.js application
│       ├── app/                 # App Router routes
│       │   ├── (marketing)/     # Public marketing pages
│       │   ├── (auth)/          # Login, register, password reset
│       │   ├── (app)/           # Authenticated app shell
│       │   └── api/             # Route handlers
│       ├── components/ui/       # Design-system primitives (Button, Input, Card, Form...)
│       ├── features/            # Feature-based modules (see below)
│       ├── hooks/                # App-wide hooks not tied to one feature
│       ├── lib/                 # Cross-cutting utilities (auth, db, env, email...)
│       ├── types/                # App-level ambient type declarations
│       └── middleware.ts        # Route protection
├── packages/
│   ├── database/                # @qt/database — Prisma schema + client singleton
│   └── types/                    # @qt/types — Shared Zod schemas + API types
├── docker-compose.yml            # Local Postgres + Redis
└── turbo.json
```

### Feature module anatomy

Every module under `apps/web/features/<name>/` follows the same shape, so the codebase stays
predictable as it grows:

```
features/<name>/
├── components/     # Client components specific to this feature
├── hooks/          # React Query hooks calling this feature's API routes
├── repositories/   # The ONLY files that call Prisma directly for this feature's models
├── services/       # Business logic — orchestrates repositories, email, other services
└── schemas/        # Feature-local Zod schemas (cross-feature schemas live in @qt/types)
```

Route handlers in `app/api/**` stay thin: parse + validate the request, call a service function,
translate the result to an HTTP response. They never contain business logic or call Prisma
directly — that's what the service/repository layers are for.

---

## Getting Started

**Requires:** Node 20+, pnpm 9+, Docker (for local Postgres/Redis).

```bash
# 1. Install dependencies
pnpm install

# 2. Start local Postgres + Redis
docker compose up -d

# 3. Copy env template and fill in secrets
cp .env.example .env
# Minimum to run locally: DATABASE_URL (already set for docker-compose),
# AUTH_SECRET (generate with `npx auth secret`).
# Everything else (Stripe, Resend, OAuth, Upstash) is optional in dev —
# see the comments in .env.example for what each unlocks.

# 4. Push the schema to your local database
pnpm db:push

# 5. (optional) Seed an admin user
pnpm db:seed

# 6. Run the app
pnpm dev
```

The app runs at `http://localhost:3000`.

### Without Resend/Upstash configured

- **Email** falls back to logging the email content to the console instead of sending it — so you
  can copy the verification/reset link straight from your terminal during local development.
- **Rate limiting** falls back to an in-memory limiter. This is explicitly **not safe for
  production** (see `lib/rate-limit.ts`) — it exists purely so `pnpm dev` works with zero external
  dependencies.

---

## Module Status

| Module | Status | Notes |
|---|---|---|
| **Authentication** | ✅ Complete | Register, login, email verification, forgot/reset password, Google + Apple OAuth, database sessions, route protection middleware, rate limiting |
| Dashboard | 🔜 Next | Placeholder page only, proves auth wiring |
| Knowledge Library / JEM CMS | Planned | Schema stubbed in `schema.prisma` |
| Quarter Sequence Research | Planned | |
| Trade Journal | Planned | |
| Backtesting | Planned | |
| Economic Calendar | Planned | |
| AI Assistant | Planned | |
| TradingView Integration | Planned | |
| Billing (Stripe) | Planned | Schema stubbed in `schema.prisma` |
| Admin Panel | Planned | Middleware already gates `/admin/**` by role |
| Notifications | Planned | |

Each module lands as its own increment: schema → repository → service → API routes → UI →
wired together → next module. This keeps every diff reviewable and every module independently
testable.

---

## Scripts

```bash
pnpm dev              # Run the app in development
pnpm build            # Production build
pnpm lint             # ESLint across the monorepo
pnpm typecheck        # tsc --noEmit across the monorepo
pnpm db:generate      # Regenerate the Prisma client
pnpm db:push          # Push schema changes to the database (dev)
pnpm db:migrate       # Create a migration (use instead of db:push once in production)
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Run the seed script
```

## Deployment Notes

- **Database:** point `DATABASE_URL` / `DIRECT_URL` at Supabase or Neon. Use `DIRECT_URL` for the
  non-pooled connection Prisma needs for migrations when deploying to serverless (Vercel).
- **Migrations:** switch from `db:push` to `prisma migrate deploy` once there's a production
  database — `db:push` is a dev-only convenience that doesn't generate migration history.
- **Auth:** set `NEXTAUTH_URL` (or `AUTH_URL` in Auth.js v5) to your production domain, and rotate
  `AUTH_SECRET` per environment.
- **Stripe webhooks:** point the webhook endpoint at `/api/stripe/webhook` once the Billing module
  lands, and set `STRIPE_WEBHOOK_SECRET` from the Stripe dashboard for that endpoint specifically.
