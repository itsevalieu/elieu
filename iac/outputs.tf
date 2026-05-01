output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.db_endpoint
}

output "media_bucket_name" {
  description = "S3 bucket for media uploads"
  value       = module.s3.media_bucket_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for media CDN"
  value       = module.s3.cloudfront_domain
}

output "ses_domain_identity" {
  description = "SES verified domain identity"
  value       = module.ses.domain_identity
}
