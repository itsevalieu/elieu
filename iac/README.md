# Infrastructure as Code

Terraform modules for the evalieu AWS production environment.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.7
- AWS CLI configured with appropriate credentials
- S3 bucket `evalieu-terraform-state` and DynamoDB table `evalieu-terraform-locks` for state backend

## First-time setup

1. Create the state backend resources manually (or use a bootstrap script):

```bash
aws s3 mb s3://evalieu-terraform-state --region us-east-1
aws dynamodb create-table \
  --table-name evalieu-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

2. Create ECR repositories:

```bash
aws ecr create-repository --repository-name evalieu-newsletter-api --region us-east-1
aws ecr create-repository --repository-name evalieu-portfolio-api --region us-east-1
```

3. Request an ACM certificate for `*.evalieu.com` and `evalieu.com`.

4. Update `environments/prod.tfvars` with your AWS account ID and certificate ARN.

## Usage

```bash
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## Modules

| Module | Resources |
|--------|-----------|
| `networking` | VPC, 2 public + 2 private subnets, NAT gateway, route tables |
| `ecs` | Fargate cluster, ALB, task definitions, services, auto-scaling |
| `rds` | PostgreSQL 16 instance, subnet group, security group |
| `s3` | Media bucket + games bucket, CloudFront distributions, OAC |
| `ses` | Domain verification, configuration set, SNS topic |
| `secrets` | DB password and JWT secret in Secrets Manager |

## After first apply

Update the secret values in Secrets Manager (the defaults are placeholders):

```bash
aws secretsmanager update-secret --secret-id evalieu/prod/db-password --secret-string "YOUR_SECURE_PASSWORD"
aws secretsmanager update-secret --secret-id evalieu/prod/jwt-secret --secret-string "YOUR_SECURE_JWT_SECRET"
```
