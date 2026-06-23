# MeetMe — Infrastructure as Code

Terraform manages the **Vercel project**, **GitHub integration**, and **environment variables**.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Vercel API token](https://vercel.com/account/tokens)
- GitHub repo connected to your Vercel account (OAuth)

## Quick start

```bash
cd infra/terraform

# 1. Copy and fill secrets (never commit terraform.tfvars)
cp terraform.tfvars.example terraform.tfvars

# 2. Initialize providers
terraform init

# 3. Preview changes
terraform plan

# 4. Apply
terraform apply
```

## What Terraform creates

| Resource | Description |
|----------|-------------|
| `vercel_project` | Next.js project linked to GitHub `main` |
| `vercel_project_domain` | Optional custom domain |
| `vercel_project_environment_variable` | All env vars from `.env.example` |

### Managed environment variables

| Key | Sensitive | Targets |
|-----|-----------|---------|
| `DATABASE_URL` | yes | production, preview*, development* |
| `ADMIN_SECRET` | yes | * |
| `ADMIN_EMAIL` | no | * |
| `NEXT_PUBLIC_APP_URL` | no | production |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | * |
| `TURNSTILE_SECRET_KEY` | yes | * |
| `RESEND_API_KEY` | yes | * (if set) |
| `RESEND_FROM_EMAIL` | no | * |
| `CRON_SECRET` | yes | * |
| `NEXT_PUBLIC_SENTRY_DSN` | yes | * (if set) |

\* Controlled by `enable_preview_env` / `enable_development_env` in tfvars.

## Passing secrets without a file

```bash
export TF_VAR_vercel_api_token="vercel_..."
export TF_VAR_database_url="postgresql://..."
export TF_VAR_admin_secret="$(openssl rand -base64 32)"
export TF_VAR_cron_secret="$(openssl rand -base64 32)"
# ... other TF_VAR_* 

terraform apply
```

## Remote state (recommended for teams)

Uncomment the `backend "s3"` block in `versions.tf` and configure a bucket.

## CI/CD

GitHub Actions workflow `.github/workflows/terraform.yml` runs `terraform plan` on PRs and `apply` on `main` (with secrets).

### Required GitHub secrets

Add **all** of the following — not only the Vercel token. Values can come from your local `.env` / Neon / Vercel.

Use **either**:

- **Repository secrets** — Settings → Secrets and variables → Actions → *Repository secrets*, **or**
- **Environment secrets** — Settings → Environments → **Production** → *Environment secrets*  
  (the workflow sets `environment: Production`)

| Secret | Maps to | Example |
|--------|---------|---------|
| `VERCEL_API_TOKEN` or `TF_VAR_VERCEL_API_TOKEN` | Vercel API token | `vercel_...` from [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `TF_VAR_DATABASE_URL` | `DATABASE_URL` | Neon connection string |
| `TF_VAR_ADMIN_SECRET` | `ADMIN_SECRET` | strong password |
| `TF_VAR_ADMIN_EMAIL` | `ADMIN_EMAIL` | `you@example.com` |
| `TF_VAR_CRON_SECRET` | `CRON_SECRET` | random string |
| `TF_VAR_TURNSTILE_SITE_KEY` | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key |
| `TF_VAR_TURNSTILE_SECRET_KEY` | `TURNSTILE_SECRET_KEY` | Turnstile secret |
| `TF_VAR_PRODUCTION_URL` | `NEXT_PUBLIC_APP_URL` (prod) | `https://meetme.vercel.app` |

Optional: `TF_VAR_VERCEL_TEAM_ID`, `TF_VAR_RESEND_API_KEY`, `TF_VAR_SENTRY_DSN`, `TF_VAR_PRODUCTION_DOMAIN`

## Neon database

Database is provisioned separately (Neon console or Neon Terraform provider).  
After creating a Neon project, paste `DATABASE_URL` into `terraform.tfvars` and run `terraform apply`.

```bash
# From repo root — push schema after DATABASE_URL is set in Vercel
npm run db:push
npm run db:seed
```

## Updating env vars

1. Edit `terraform.tfvars`
2. Run `terraform apply`

Terraform is the source of truth — manual changes in Vercel UI may be overwritten on next apply.
