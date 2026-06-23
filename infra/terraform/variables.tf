variable "vercel_api_token" {
  type        = string
  sensitive   = true
  description = "Vercel API token (https://vercel.com/account/tokens)"
}

variable "vercel_team_id" {
  type        = string
  default     = ""
  description = "Optional Vercel team ID. Leave empty for personal account."
}

variable "project_name" {
  type        = string
  default     = "meetme"
  description = "Vercel project name (URL slug)."
}

variable "github_repo" {
  type        = string
  default     = "jgruszczykk/MeetMe"
  description = "GitHub repository in owner/name format."
}

variable "production_domain" {
  type        = string
  default     = ""
  description = "Optional custom production domain (e.g. meetme.example.com)."
}

variable "production_url" {
  type        = string
  description = "Public app URL for production (emails, links). e.g. https://meetme.vercel.app"
}

variable "database_url" {
  type        = string
  sensitive   = true
  description = "Neon Postgres connection string."
}

variable "admin_secret" {
  type        = string
  sensitive   = true
  description = "Admin panel password (ADMIN_SECRET)."
}

variable "admin_email" {
  type        = string
  description = "Admin notification email."
}

variable "turnstile_site_key" {
  type        = string
  description = "Cloudflare Turnstile site key (public)."
}

variable "turnstile_secret_key" {
  type        = string
  sensitive   = true
  description = "Cloudflare Turnstile secret key."
}

variable "resend_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Resend API key. Leave empty to skip email env var."
}

variable "resend_from_email" {
  type        = string
  default     = "MeetMe <onboarding@resend.dev>"
  description = "Resend sender address."
}

variable "cron_secret" {
  type        = string
  sensitive   = true
  description = "Bearer token for /api/cron/reminders."
}

variable "sentry_dsn" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Optional Sentry DSN."
}

variable "enable_preview_env" {
  type        = bool
  default     = true
  description = "Sync secrets to Vercel Preview deployments."
}

variable "enable_development_env" {
  type        = bool
  default     = false
  description = "Sync secrets to Vercel Development (local vercel env pull)."
}
