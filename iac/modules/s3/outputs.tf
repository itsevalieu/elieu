output "media_bucket_name" {
  value = aws_s3_bucket.media.bucket
}

output "media_bucket_arn" {
  value = aws_s3_bucket.media.arn
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.media.domain_name
}

output "games_bucket_name" {
  value = aws_s3_bucket.games.bucket
}

output "games_cloudfront_domain" {
  value = aws_cloudfront_distribution.games.domain_name
}
