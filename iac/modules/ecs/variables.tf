variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "acm_certificate" {
  type        = string
  description = "ACM certificate ARN for HTTPS listener"
}

variable "api_domain" {
  type = string
}

variable "newsletter_api_image" {
  type = string
}

variable "portfolio_api_image" {
  type = string
}

variable "db_endpoint" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_password" {
  type        = string
  description = "Secrets Manager ARN for DB password"
}

variable "jwt_secret" {
  type        = string
  description = "Secrets Manager ARN for JWT secret"
}

variable "s3_bucket_name" {
  type = string
}
