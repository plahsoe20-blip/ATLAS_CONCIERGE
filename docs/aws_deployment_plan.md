# AWS Deployment Plan for ATLAS Concierge Platform

## Overview
This document outlines the complete AWS deployment strategy for the ATLAS platform, ensuring scalability, security, and high availability.

## Architecture Diagram
```
                    ┌─────────────────────────┐
                    │   Route 53 (DNS)        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   CloudFront (CDN)      │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                  │
     ┌──────────▼──────────┐          ┌──────────▼──────────┐
     │  S3 (Static Site)   │          │  API Gateway        │
     │  React Frontend     │          │  REST + WebSocket   │
     └─────────────────────┘          └──────────┬──────────┘
                                                  │
                                      ┌───────────┴───────────┐
                                      │   Lambda Functions    │
                                      │   (Node.js Runtime)   │
                                      └───────────┬───────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
         ┌──────────▼──────────┐     ┌──────────▼──────────┐     ┌───────────▼──────────┐
         │  DynamoDB Tables    │     │  Cognito User Pool  │     │  S3 (File Storage)   │
         │  (Data Storage)     │     │  (Authentication)   │     │  (Images, Documents) │
         └─────────────────────┘     └─────────────────────┘     └──────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  CloudWatch Logs    │
         │  (Monitoring)       │
         └─────────────────────┘
```

## Phase 1: Frontend Deployment

### S3 + CloudFront Setup

**Step 1: Create S3 Bucket**
```bash
aws s3 mb s3://atlas-concierge-frontend --region us-east-1
```

**Step 2: Configure Bucket for Static Website**
```bash
aws s3 website s3://atlas-concierge-frontend \
  --index-document index.html \
  --error-document index.html
```

**Step 3: Bucket Policy (Public Read)**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::atlas-concierge-frontend/*"
  }]
}
```

**Step 4: Build and Deploy Frontend**
```bash
# Build production bundle
cd /workspaces/ATLAS_CONCIERGE
npm run build

# Sync to S3
aws s3 sync dist/ s3://atlas-concierge-frontend --delete
```

**Step 5: Create CloudFront Distribution**
```bash
aws cloudfront create-distribution \
  --origin-domain-name atlas-concierge-frontend.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html \
  --enabled
```

**CloudFront Settings:**
- Price Class: Use All Edge Locations
- SSL Certificate: AWS Certificate Manager (ACM)
- Custom Domain: `app.atlas-concierge.com`
- HTTP → HTTPS redirect
- Compression: Enabled
- TTL: 3600 seconds

---

## Phase 2: Backend Deployment

### AWS Cognito Setup

**Step 1: Create User Pool**
```bash
aws cognito-idp create-user-pool \
  --pool-name atlas-user-pool \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true}}' \
  --auto-verified-attributes email \
  --username-attributes email
```

**Step 2: Create User Pool Client**
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name atlas-web-client \
  --no-generate-secret \
  --refresh-token-validity 30 \
  --access-token-validity 1 \
  --id-token-validity 1
```

**Step 3: Create User Groups**
```bash
# Concierge Group
aws cognito-idp create-group \
  --group-name CONCIERGE \
  --user-pool-id <USER_POOL_ID> \
  --description "Premium concierge clients"

# Operator Group
aws cognito-idp create-group \
  --group-name OPERATOR \
  --user-pool-id <USER_POOL_ID> \
  --description "Fleet operators"

# Driver Group
aws cognito-idp create-group \
  --group-name DRIVER \
  --user-pool-id <USER_POOL_ID> \
  --description "Professional drivers"
```

### DynamoDB Tables

**Create Tables Script:**
```bash
# Users Table
aws dynamodb create-table \
  --table-name atlas-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"EmailIndex","KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

# Bookings Table
aws dynamodb create-table \
  --table-name atlas-bookings \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=conciergeId,AttributeType=S \
    AttributeName=operatorId,AttributeType=S \
    AttributeName=driverId,AttributeType=S \
    AttributeName=createdAt,AttributeType=N \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {"IndexName":"ConciergeIndex","KeySchema":[{"AttributeName":"conciergeId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}},
      {"IndexName":"OperatorIndex","KeySchema":[{"AttributeName":"operatorId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}},
      {"IndexName":"DriverIndex","KeySchema":[{"AttributeName":"driverId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}
    ]' \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

# Drivers Table
aws dynamodb create-table \
  --table-name atlas-drivers \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=operatorId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"OperatorIndex","KeySchema":[{"AttributeName":"operatorId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Vehicles Table
aws dynamodb create-table \
  --table-name atlas-vehicles \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=operatorId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"OperatorIndex","KeySchema":[{"AttributeName":"operatorId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Quotes Table
aws dynamodb create-table \
  --table-name atlas-quotes \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=bookingId,AttributeType=S \
    AttributeName=createdAt,AttributeType=N \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"BookingIndex","KeySchema":[{"AttributeName":"bookingId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Transactions Table
aws dynamodb create-table \
  --table-name atlas-transactions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=bookingId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"BookingIndex","KeySchema":[{"AttributeName":"bookingId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"},"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}}]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Enable Auto Scaling (Recommended):**
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id "table/atlas-bookings" \
  --scalable-dimension "dynamodb:table:ReadCapacityUnits" \
  --min-capacity 5 \
  --max-capacity 100

aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id "table/atlas-bookings" \
  --scalable-dimension "dynamodb:table:WriteCapacityUnits" \
  --min-capacity 5 \
  --max-capacity 100
```

### Lambda Deployment

**Step 1: Package Backend Code**
```bash
cd /workspaces/ATLAS_CONCIERGE/backend
npm install --production
zip -r atlas-backend.zip . -x "*.git*" "node_modules/aws-sdk/*"
```

**Step 2: Create IAM Role for Lambda**
```bash
aws iam create-role \
  --role-name atlas-lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name atlas-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name atlas-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name atlas-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser
```

**Step 3: Create Lambda Function**
```bash
aws lambda create-function \
  --function-name atlas-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::<ACCOUNT_ID>:role/atlas-lambda-execution-role \
  --handler server.handler \
  --zip-file fileb://atlas-backend.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables='{
    "NODE_ENV":"production",
    "JWT_SECRET":"<SECURE_SECRET>",
    "AWS_REGION":"us-east-1",
    "COGNITO_USER_POOL_ID":"<USER_POOL_ID>",
    "COGNITO_CLIENT_ID":"<CLIENT_ID>",
    "SQUARE_ACCESS_TOKEN":"<SQUARE_TOKEN>",
    "SQUARE_LOCATION_ID":"<LOCATION_ID>"
  }'
```

**Step 4: Create API Gateway**
```bash
aws apigatewayv2 create-api \
  --name atlas-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:<ACCOUNT_ID>:function:atlas-api
```

**Step 5: Add Lambda Permission for API Gateway**
```bash
aws lambda add-permission \
  --function-name atlas-api \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

---

## Phase 3: Real-Time WebSocket

### Option A: Self-Hosted Socket.IO on EC2

**Create EC2 Instance:**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t3.small \
  --key-name atlas-key \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=atlas-websocket}]'
```

**Setup Script:**
```bash
#!/bin/bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd backend
npm install
pm2 start server.js --name atlas-websocket
pm2 startup
pm2 save
```

### Option B: AWS AppSync (GraphQL Subscriptions)

**Create AppSync API:**
```bash
aws appsync create-graphql-api \
  --name atlas-realtime \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config userPoolId=<USER_POOL_ID>,awsRegion=us-east-1,defaultAction=ALLOW
```

---

## Phase 4: Monitoring & Logging

### CloudWatch Setup

**Create Log Groups:**
```bash
aws logs create-log-group --log-group-name /aws/lambda/atlas-api
aws logs put-retention-policy --log-group-name /aws/lambda/atlas-api --retention-in-days 30
```

**Create Alarms:**
```bash
# Lambda Error Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name atlas-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1

# API Gateway 5xx Errors
aws cloudwatch put-metric-alarm \
  --alarm-name atlas-api-5xx-errors \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### X-Ray Tracing
```bash
aws lambda update-function-configuration \
  --function-name atlas-api \
  --tracing-config Mode=Active
```

---

## Phase 5: Security & Compliance

### SSL/TLS Certificate
```bash
aws acm request-certificate \
  --domain-name atlas-concierge.com \
  --subject-alternative-names www.atlas-concierge.com app.atlas-concierge.com api.atlas-concierge.com \
  --validation-method DNS
```

### WAF (Web Application Firewall)
```bash
aws wafv2 create-web-acl \
  --name atlas-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### Secrets Manager
```bash
aws secretsmanager create-secret \
  --name atlas/production/jwt-secret \
  --secret-string '<SECURE_JWT_SECRET>'

aws secretsmanager create-secret \
  --name atlas/production/square-token \
  --secret-string '<SQUARE_ACCESS_TOKEN>'
```

---

## Phase 6: CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy ATLAS to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://atlas-concierge-frontend --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install --production
      - run: cd backend && zip -r ../atlas-backend.zip .
      - uses: aws-actions/configure-aws-credentials@v1
      - run: aws lambda update-function-code --function-name atlas-api --zip-file fileb://atlas-backend.zip
```

---

## Estimated AWS Costs (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| S3 (Frontend) | 10GB storage, 100GB transfer | $5 |
| CloudFront | 500GB transfer | $42 |
| Lambda | 10M requests, 512MB, 2s avg | $20 |
| API Gateway | 10M requests | $35 |
| DynamoDB | 5 tables, on-demand | $25 |
| Cognito | 10,000 MAU | $0 (under free tier) |
| EC2 (WebSocket) | t3.small | $15 |
| CloudWatch | Basic monitoring | $10 |
| **Total** | | **~$152/month** |

*Costs scale with usage. Consider Reserved Instances and Savings Plans for production.*

---

## Post-Deployment Checklist

- [ ] Verify SSL certificate
- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Verify Cognito authentication
- [ ] Test booking flow end-to-end
- [ ] Check CloudWatch logs
- [ ] Set up billing alerts
- [ ] Configure backup strategy
- [ ] Document environment variables
- [ ] Update DNS records
- [ ] Enable AWS Shield (DDoS protection)
- [ ] Configure WAF rules
- [ ] Set up monitoring dashboards
- [ ] Test disaster recovery plan

---

## Rollback Strategy

**Frontend Rollback:**
```bash
aws s3 sync s3://atlas-concierge-frontend-backup/ s3://atlas-concierge-frontend/ --delete
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

**Backend Rollback:**
```bash
aws lambda update-function-code \
  --function-name atlas-api \
  --s3-bucket atlas-lambda-versions \
  --s3-key atlas-backend-v1.0.0.zip
```

---

## Support & Maintenance

- Daily automated backups
- Weekly security patches
- Monthly cost reviews
- Quarterly disaster recovery drills
- Continuous monitoring and alerting

For deployment assistance: devops@atlas-concierge.com
