output "domain_identity" {
  value = aws_sesv2_email_identity.domain.email_identity
}

output "dkim_tokens" {
  value = aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens
}

output "sns_topic_arn" {
  value = aws_sns_topic.ses_notifications.arn
}
