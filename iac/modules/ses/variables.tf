variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain" {
  type        = string
  description = "Domain to verify with SES"
}
