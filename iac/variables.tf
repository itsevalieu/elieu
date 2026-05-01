variable "project" {
  description = "Project name used for resource naming"
  type        = string
  default     = "evalieu"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain" {
  description = "Root domain name"
  type        = string
}

variable "api_domain" {
  description = "API subdomain"
  type        = string
}

variable "cdn_domain" {
  description = "CDN subdomain for media assets"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the API domain"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "newsletter_api_image" {
  description = "ECR image URI for newsletter-api"
  type        = string
}

variable "portfolio_api_image" {
  description = "ECR image URI for portfolio-api"
  type        = string
}
