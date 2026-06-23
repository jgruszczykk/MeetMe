resource "vercel_project" "meetme" {
  name      = var.project_name
  framework = "nextjs"
  team_id   = var.vercel_team_id != "" ? var.vercel_team_id : null

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = "main"
  }
}

resource "vercel_project_domain" "production" {
  count = var.production_domain != "" ? 1 : 0

  project_id = vercel_project.meetme.id
  domain     = var.production_domain
}

locals {
  env_targets = compact([
    "production",
    var.enable_preview_env ? "preview" : "",
    var.enable_development_env ? "development" : "",
  ])

  # Non-secret env vars
  plain_env = {
    ADMIN_EMAIL                      = var.admin_email
    NEXT_PUBLIC_TURNSTILE_SITE_KEY   = var.turnstile_site_key
    RESEND_FROM_EMAIL                = var.resend_from_email
  }

  # Secrets — never logged by Terraform when sensitive = true
  secret_env = merge(
    {
      DATABASE_URL         = var.database_url
      ADMIN_SECRET         = var.admin_secret
      TURNSTILE_SECRET_KEY = var.turnstile_secret_key
      CRON_SECRET          = var.cron_secret
    },
    var.resend_api_key != "" ? { RESEND_API_KEY = var.resend_api_key } : {},
    var.sentry_dsn != "" ? { NEXT_PUBLIC_SENTRY_DSN = var.sentry_dsn } : {},
  )
}

resource "vercel_project_environment_variable" "plain" {
  for_each = local.plain_env

  project_id = vercel_project.meetme.id
  key        = each.key
  value      = each.value
  target     = local.env_targets
  sensitive  = false
}

resource "vercel_project_environment_variable" "secret" {
  for_each = local.secret_env

  project_id = vercel_project.meetme.id
  key        = each.key
  value      = each.value
  target     = local.env_targets
  sensitive  = true
}

# Production-only URL override (preview builds use Vercel auto URL in emails if needed)
resource "vercel_project_environment_variable" "app_url_production" {
  project_id = vercel_project.meetme.id
  key        = "NEXT_PUBLIC_APP_URL"
  value      = var.production_url
  target     = ["production"]
  sensitive  = false
}
