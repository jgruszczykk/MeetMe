# MeetMe

A meeting scheduling app with a creative booking flow, admin CRM, and availability engine.

## Stack

- **Next.js 16** (App Router) + **Vercel**
- **Neon** (Postgres) + **Drizzle ORM**
- **next-intl** (PL + EN)
- **Cloudflare Turnstile** + **Resend** email
- **Framer Motion** + **canvas-confetti**

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set `DATABASE_URL` to your Neon connection string.

3. Push schema and seed:

```bash
npm run db:push
npm run db:seed
```

4. Start dev server:

```bash
npm run dev
```

5. Open:
   - Landing: http://localhost:3000/pl
   - Booking: http://localhost:3000/pl/book/default (or `/pl/book` — redirects to default host)
   - Admin: http://localhost:3000/pl/admin (password = `ADMIN_SECRET`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to Neon |
| `npm run db:seed` | Seed default host + availability |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e tests |

## Features

- **Booking flow**: duration → location → location detail → configurable intake questions → date/time → contact → review → submit → WOW success
- **Dedicated booking link**: `/{locale}/book/{slug}` — copy from admin dashboard
- **Admin confirm/cancel** with email notifications (includes intake summary)
- **User cancel** (pending only) via email link
- **CRM**: clients, tags, notes, booking history, CSV export (with intake columns)
- **Intake questions**: admin CRUD at `/admin/settings/intake`
- **Availability**: weekly rules, exceptions, manual overrides
- **Configurable**: durations, locations, buffers, min notice, daily limit, host slug
- **Reminders**: 24h / 1h cron for confirmed bookings

## Faza 5 — Production hardening

- **Sentry** — opcjonalny monitoring błędów (`NEXT_PUBLIC_SENTRY_DSN`)
- **Vercel Analytics** — włączone na produkcji
- **Landing** — sekcje features, FAQ, footer z linkami prawnymi
- **Strony legal** — `/privacy`, `/terms` (PL + EN)
- **E2E** — pełny flow `book → admin confirm` (`e2e/full-flow.spec.ts`)
- **CRM** — historia emaili w profilu klienta

## Deployment

Deploy to Vercel with env vars from `.env.example`. Set `CRON_SECRET` for the reminders endpoint.

### Infrastructure as Code (Terraform)

Vercel project + env variables are managed via Terraform:

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# fill in secrets, then:
cd infra/terraform && terraform init && terraform apply
```

Or sync from local `.env`:

```bash
# add VERCEL_API_TOKEN to .env first
npm run infra:sync
npm run infra:apply
```

See [infra/README.md](infra/README.md) for full docs and GitHub Actions setup.
