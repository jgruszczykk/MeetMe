#!/usr/bin/env bash
set -euo pipefail

# Sync local .env values into terraform.tfvars for one-shot apply.
# Usage: ./scripts/infra-sync.sh && cd infra/terraform && terraform apply

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
TFVARS="${ROOT}/infra/terraform/terraform.tfvars"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env — copy from .env.example first."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

PROD_URL="${NEXT_PUBLIC_APP_URL:-https://meetme.vercel.app}"

cat > "$TFVARS" <<EOF
# Auto-generated from .env by scripts/infra-sync.sh — DO NOT COMMIT
vercel_api_token = "${VERCEL_API_TOKEN:-REPLACE_ME}"
vercel_team_id   = "${VERCEL_TEAM_ID:-}"

project_name = "meetme"
github_repo  = "jgruszczykk/MeetMe"

production_url    = "${PROD_URL}"
production_domain = "${PRODUCTION_DOMAIN:-}"

database_url = "${DATABASE_URL}"
admin_secret = "${ADMIN_SECRET}"
admin_email  = "${ADMIN_EMAIL}"
cron_secret  = "${CRON_SECRET}"

turnstile_site_key   = "${NEXT_PUBLIC_TURNSTILE_SITE_KEY}"
turnstile_secret_key = "${TURNSTILE_SECRET_KEY}"

resend_api_key    = "${RESEND_API_KEY:-}"
resend_from_email = "${RESEND_FROM_EMAIL:-MeetMe <onboarding@resend.dev>}"

sentry_dsn = "${NEXT_PUBLIC_SENTRY_DSN:-}"

enable_preview_env     = true
enable_development_env = false
EOF

echo "Wrote ${TFVARS}"
echo "Set VERCEL_API_TOKEN in .env or export before: terraform -chdir=infra/terraform apply"
