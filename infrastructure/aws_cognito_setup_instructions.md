# AWS Cognito Setup Instructions

## Overview
This guide walks through setting up AWS Cognito for ATLAS Concierge Platform authentication.

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- Admin access to AWS Console

## Step 1: Create User Pool

### Via AWS Console
1. Navigate to AWS Cognito → User Pools
2. Click "Create user pool"
3. Configure sign-in experience:
   - Provider types: Cognito user pool
   - Cognito user pool sign-in options: Email
4. Configure security requirements:
   - Password policy: Custom
   - Minimum length: 8 characters
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
   - Require special characters: Yes
   - MFA: Optional (recommended for production)
5. Configure sign-up experience:
   - Self-registration: Enabled
   - Cognito-assisted verification: Email
   - Required attributes: name, email, phone_number
6. Configure message delivery:
   - Email provider: Send email with Cognito
7. Integrate your app:
   - User pool name: `atlas-user-pool`
   - App client name: `atlas-web-client`
   - Client secret: Don't generate
8. Review and create

### Via AWS CLI
```bash
aws cognito-idp create-user-pool \
  --pool-name atlas-user-pool \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": false
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "phone_number",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    }
  ]' \
  --user-pool-add-ons '{"AdvancedSecurityMode": "ENFORCED"}' \
  --region us-east-1
```

**Save the User Pool ID** from the output: `us-east-1_XXXXXXXXX`

## Step 2: Create App Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-name atlas-web-client \
  --no-generate-secret \
  --refresh-token-validity 30 \
  --access-token-validity 60 \
  --id-token-validity 60 \
  --token-validity-units '{
    "RefreshToken": "days",
    "AccessToken": "minutes",
    "IdToken": "minutes"
  }' \
  --read-attributes '["email","name","phone_number"]' \
  --write-attributes '["email","name","phone_number"]' \
  --explicit-auth-flows \
    ALLOW_USER_PASSWORD_AUTH \
    ALLOW_REFRESH_TOKEN_AUTH \
    ALLOW_USER_SRP_AUTH \
  --prevent-user-existence-errors ENABLED \
  --region us-east-1
```

**Save the Client ID** from the output: `abcdefghijklmnopqrstuvwxyz`

## Step 3: Create User Groups

```bash
# CONCIERGE Group
aws cognito-idp create-group \
  --group-name CONCIERGE \
  --user-pool-id us-east-1_XXXXXXXXX \
  --description "Premium concierge clients" \
  --precedence 1 \
  --region us-east-1

# OPERATOR Group
aws cognito-idp create-group \
  --group-name OPERATOR \
  --user-pool-id us-east-1_XXXXXXXXX \
  --description "Fleet operators" \
  --precedence 2 \
  --region us-east-1

# DRIVER Group
aws cognito-idp create-group \
  --group-name DRIVER \
  --user-pool-id us-east-1_XXXXXXXXX \
  --description "Professional drivers" \
  --precedence 3 \
  --region us-east-1

# ADMIN Group
aws cognito-idp create-group \
  --group-name ADMIN \
  --user-pool-id us-east-1_XXXXXXXXX \
  --description "Platform administrators" \
  --precedence 0 \
  --region us-east-1
```

## Step 4: Configure Domain

### Custom Domain (Recommended for Production)
```bash
aws cognito-idp create-user-pool-domain \
  --domain auth.atlas-concierge \
  --user-pool-id us-east-1_XXXXXXXXX \
  --custom-domain-config '{
    "CertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
  }' \
  --region us-east-1
```

### Cognito Domain (For Testing)
```bash
aws cognito-idp create-user-pool-domain \
  --domain atlas-concierge \
  --user-pool-id us-east-1_XXXXXXXXX \
  --region us-east-1
```

## Step 5: Create Test Users

```bash
# Create Concierge User
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username test-concierge@atlas.com \
  --user-attributes \
    Name=email,Value=test-concierge@atlas.com \
    Name=name,Value="Test Concierge" \
    Name=phone_number,Value="+15551234567" \
    Name=email_verified,Value=true \
  --temporary-password TempPassword123! \
  --region us-east-1

# Add to CONCIERGE group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username test-concierge@atlas.com \
  --group-name CONCIERGE \
  --region us-east-1

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username test-concierge@atlas.com \
  --password SecurePassword123! \
  --permanent \
  --region us-east-1
```

## Step 6: Frontend Integration

### Install AWS Amplify
```bash
npm install aws-amplify @aws-amplify/auth
```

### Configure Amplify (src/app/index.tsx)
```javascript
import { Amplify } from 'aws-amplify';
import { Auth } from '@aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX',
      userPoolClientId: 'abcdefghijklmnopqrstuvwxyz',
      region: 'us-east-1',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  }
});
```

### Authentication Functions
```javascript
// Sign Up
export async function signUp(email, password, name, phone) {
  try {
    const { user } = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name,
        phone_number: phone
      }
    });
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign Out
export async function signOut() {
  try {
    await Auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    return null;
  }
}

// Get User Groups (Roles)
export async function getUserGroups() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const groups = user.signInUserSession.accessToken.payload['cognito:groups'] || [];
    return groups;
  } catch (error) {
    return [];
  }
}
```

## Step 7: Backend Integration

### Verify Cognito JWT in Lambda
```javascript
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

const COGNITO_ISSUER = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX`;
let cachedKeys;

async function getPublicKeys() {
  if (!cachedKeys) {
    const response = await axios.get(`${COGNITO_ISSUER}/.well-known/jwks.json`);
    cachedKeys = response.data.keys;
  }
  return cachedKeys;
}

async function verifyCognitoToken(token) {
  const keys = await getPublicKeys();
  const decodedToken = jwt.decode(token, { complete: true });
  
  if (!decodedToken) {
    throw new Error('Invalid token');
  }
  
  const key = keys.find(k => k.kid === decodedToken.header.kid);
  if (!key) {
    throw new Error('Public key not found');
  }
  
  const pem = jwkToPem(key);
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, pem, { issuer: COGNITO_ISSUER }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

// Use in middleware
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = await verifyCognitoToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      groups: decoded['cognito:groups'] || []
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## Step 8: IAM Policies

### Lambda Execution Role Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:ListUsers",
        "cognito-idp:ListUsersInGroup"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_XXXXXXXXX"
    }
  ]
}
```

## Step 9: Testing

### Test Authentication Flow
```bash
# Install AWS Cognito CLI tool
npm install -g amazon-cognito-identity-js

# Test sign in
aws cognito-idp admin-initiate-auth \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-id abcdefghijklmnopqrstuvwxyz \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters \
    USERNAME=test-concierge@atlas.com,PASSWORD=SecurePassword123! \
  --region us-east-1
```

## Security Best Practices

1. **Enable MFA**: Require multi-factor authentication for all users
2. **Advanced Security**: Enable Advanced Security features (adaptive authentication)
3. **Account Recovery**: Configure email-based account recovery
4. **Token Rotation**: Implement refresh token rotation
5. **Session Management**: Set appropriate token expiration times
6. **Rate Limiting**: Use Cognito's built-in rate limiting
7. **Monitoring**: Enable CloudWatch logs for Cognito events
8. **Compliance**: Review compliance certifications (HIPAA, SOC, etc.)

## Troubleshooting

### Common Issues

**Invalid Grant Error**
- Check client ID and user pool ID
- Verify auth flow is enabled in app client settings

**User Not Confirmed**
- Manually confirm user: `aws cognito-idp admin-confirm-sign-up`

**Token Expired**
- Implement refresh token logic
- Check token expiration settings

**User Not in Group**
- Verify group assignment: `aws cognito-idp admin-list-groups-for-user`

## Monitoring

### CloudWatch Logs
```bash
aws logs create-log-group \
  --log-group-name /aws/cognito/userpools/us-east-1_XXXXXXXXX \
  --region us-east-1

aws logs put-retention-policy \
  --log-group-name /aws/cognito/userpools/us-east-1_XXXXXXXXX \
  --retention-in-days 30 \
  --region us-east-1
```

### CloudWatch Alarms
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name cognito-failed-sign-ins \
  --metric-name SignInFailures \
  --namespace AWS/Cognito \
  --statistic Sum \
  --period 300 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --region us-east-1
```

## Cost Estimation

Cognito Pricing (as of 2025):
- First 50,000 MAUs: Free
- 50,001-100,000 MAUs: $0.0055 per MAU
- 100,001+ MAUs: $0.0046 per MAU
- Advanced Security: $0.05 per MAU

## Support

For Cognito-related issues:
- AWS Support: https://console.aws.amazon.com/support
- Documentation: https://docs.aws.amazon.com/cognito
- Developer Forums: https://forums.aws.amazon.com/forum.jspa?forumID=173
