terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "evalieu-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "evalieu-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "evalieu"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source = "./modules/networking"

  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region
}

module "secrets" {
  source = "./modules/secrets"

  project     = var.project
  environment = var.environment
}

module "rds" {
  source = "./modules/rds"

  project            = var.project
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  ecs_security_group = module.ecs.ecs_security_group_id
  db_instance_class  = var.db_instance_class
  db_password_secret = module.secrets.db_password_arn
}

module "s3" {
  source = "./modules/s3"

  project     = var.project
  environment = var.environment
  domain_name = var.cdn_domain
}

module "ecs" {
  source = "./modules/ecs"

  project            = var.project
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  acm_certificate    = var.acm_certificate_arn
  api_domain         = var.api_domain

  newsletter_api_image = var.newsletter_api_image
  portfolio_api_image  = var.portfolio_api_image

  db_endpoint    = module.rds.db_endpoint
  db_name        = module.rds.db_name
  db_password    = module.secrets.db_password_arn
  jwt_secret     = module.secrets.jwt_secret_arn
  s3_bucket_name = module.s3.media_bucket_name
}

module "ses" {
  source = "./modules/ses"

  project     = var.project
  environment = var.environment
  domain      = var.domain
}
