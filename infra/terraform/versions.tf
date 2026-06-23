terraform {
  required_version = ">= 1.5.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.14"
    }
  }

  # Uncomment after creating the S3/GCS bucket for remote state.
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "meetme/terraform.tfstate"
  #   region = "eu-central-1"
  # }
}
