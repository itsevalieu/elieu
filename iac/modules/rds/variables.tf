variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_security_group" {
  type        = string
  description = "Security group ID of ECS tasks, allowed to connect to RDS"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_password_secret" {
  type        = string
  description = "ARN of Secrets Manager secret containing the DB password"
}
