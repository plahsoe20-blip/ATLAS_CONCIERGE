#!/bin/bash

# ============================================================================
# ATLAS Concierge - Smoke Test Script
# ============================================================================

set -e

API_URL="${API_URL:-http://localhost:4000}"

echo "🧪 ATLAS Concierge - Smoke Tests"
echo "================================="
echo "Testing: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

# Test 2: API Documentation
echo "2️⃣  Testing API documentation..."
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api)
if [ "$DOCS_RESPONSE" = "200" ] || [ "$DOCS_RESPONSE" = "301" ]; then
    echo "   ✅ API docs accessible"
else
    echo "   ❌ API docs not accessible (HTTP $DOCS_RESPONSE)"
    exit 1
fi

# Test 3: Auth Login Endpoint
echo "3️⃣  Testing auth login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@acmeconcierge.com","password":"Password123!"}' \
    $API_URL/api/v1/auth/login)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "   ✅ Login endpoint works"
    
    # Extract token
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | sed '$d' | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
    
    if [ -n "$ACCESS_TOKEN" ]; then
        echo "   ✅ JWT token received"
    else
        echo "   ⚠️  Warning: No JWT token in response"
    fi
else
    echo "   ❌ Login endpoint failed (HTTP $HTTP_CODE)"
    exit 1
fi

# Test 4: Protected Endpoint (if token available)
if [ -n "$ACCESS_TOKEN" ]; then
    echo "4️⃣  Testing protected endpoint..."
    PROTECTED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        $API_URL/api/v1/users/me)
    
    if [ "$PROTECTED_RESPONSE" = "200" ]; then
        echo "   ✅ Protected endpoint accessible"
    else
        echo "   ⚠️  Warning: Protected endpoint returned HTTP $PROTECTED_RESPONSE"
    fi
fi

echo ""
echo "✅ All smoke tests passed!"
echo ""
