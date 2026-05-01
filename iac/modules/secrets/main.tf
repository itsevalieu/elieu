resource "aws_secretsmanager_secret" "db_password" {
  name        = "${var.project}/${var.environment}/db-password"
  description = "PostgreSQL password for ${var.project} ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = "CHANGE_ME_AFTER_FIRST_APPLY"

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${var.project}/${var.environment}/jwt-secret"
  description = "JWT signing secret for ${var.project} ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = "CHANGE_ME_AFTER_FIRST_APPLY"

  lifecycle {
    ignore_changes = [secret_string]
  }
}
