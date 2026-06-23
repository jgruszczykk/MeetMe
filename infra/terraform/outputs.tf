output "vercel_project_id" {
  value       = vercel_project.meetme.id
  description = "Vercel project ID."
}

output "vercel_project_name" {
  value       = vercel_project.meetme.name
  description = "Vercel project name."
}

output "production_url" {
  value       = "https://${vercel_project.meetme.name}.vercel.app"
  description = "Default Vercel production URL (before custom domain)."
}

output "dashboard_url" {
  value       = "https://vercel.com/${var.vercel_team_id != "" ? "${var.vercel_team_id}/" : ""}${vercel_project.meetme.name}"
  description = "Vercel project dashboard."
}

output "configured_env_keys" {
  value = sort(concat(
    keys(local.plain_env),
    keys(local.secret_env),
    ["NEXT_PUBLIC_APP_URL"],
  ))
  description = "Environment variable keys managed by Terraform."
}
