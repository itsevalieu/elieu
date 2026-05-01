resource "aws_sesv2_email_identity" "domain" {
  email_identity = var.domain
}

resource "aws_sesv2_configuration_set" "main" {
  configuration_set_name = "${var.project}-${var.environment}"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }
}

resource "aws_sns_topic" "ses_notifications" {
  name = "${var.project}-${var.environment}-ses-notifications"
}
