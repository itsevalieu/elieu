project     = "evalieu"
environment = "dev"
aws_region  = "us-east-1"

domain     = "evalieu.com"
api_domain = "api-dev.evalieu.com"
cdn_domain = "cdn-dev.evalieu.com"

db_instance_class = "db.t4g.micro"

newsletter_api_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-newsletter-api:latest"
portfolio_api_image  = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-portfolio-api:latest"

acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"
