project     = "evalieu"
environment = "prod"
aws_region  = "us-east-1"

domain     = "evalieu.com"
api_domain = "api.evalieu.com"
cdn_domain = "cdn.evalieu.com"

db_instance_class = "db.t4g.micro"

# These are updated by CI/CD after each docker build+push
newsletter_api_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-newsletter-api:latest"
portfolio_api_image  = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-portfolio-api:latest"

acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"
