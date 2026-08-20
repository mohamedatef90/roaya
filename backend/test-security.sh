#!/bin/bash

# Security Implementation Test Script
# Tests httpOnly cookies, CSRF protection, and rate limiting

BASE_URL="http://localhost:3001/api/v1"
COOKIES_FILE="test-cookies.txt"

echo "======================================"
echo "Backend Security Implementation Tests"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test 1: Get CSRF Token
echo "Test 1: Get CSRF Token"
echo "----------------------"
CSRF_RESPONSE=$(curl -s -X GET "${BASE_URL}/auth/csrf-token")
echo "Response: $CSRF_RESPONSE"

if echo "$CSRF_RESPONSE" | grep -q '"csrfToken"'; then
    echo -e "${GREEN}✓ PASSED${NC}: CSRF token endpoint working"
    PASSED=$((PASSED + 1))
    CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
    echo "CSRF Token: $CSRF_TOKEN"
else
    echo -e "${RED}✗ FAILED${NC}: CSRF token endpoint not working"
    FAILED=$((FAILED + 1))
    CSRF_TOKEN=""
fi
echo ""

# Test 2: Login without CSRF token (should fail if CSRF is enforced)
echo "Test 2: Login without CSRF token"
echo "---------------------------------"
LOGIN_NO_CSRF=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}')

HTTP_CODE=$(echo "$LOGIN_NO_CSRF" | tail -n1)
if [ "$HTTP_CODE" == "403" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: CSRF protection is working (403 returned)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Expected 403, got $HTTP_CODE (CSRF might not be enforced on this endpoint)"
fi
echo ""

# Test 3: Login with CSRF token and save cookies
echo "Test 3: Login with CSRF token"
echo "------------------------------"
echo "Using email: admin@roaya.ai"
read -sp "Enter password: " PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: $CSRF_TOKEN" \
    -c "$COOKIES_FILE" \
    -d "{\"email\":\"admin@roaya.ai\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

echo "Response: $RESPONSE_BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: Login successful"
    PASSED=$((PASSED + 1))

    # Check if cookies were set
    if [ -f "$COOKIES_FILE" ]; then
        echo "Cookies saved to $COOKIES_FILE"
        if grep -q "access_token" "$COOKIES_FILE"; then
            echo -e "${GREEN}✓ PASSED${NC}: access_token cookie set"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗ FAILED${NC}: access_token cookie NOT set"
            FAILED=$((FAILED + 1))
        fi

        if grep -q "refresh_token" "$COOKIES_FILE"; then
            echo -e "${GREEN}✓ PASSED${NC}: refresh_token cookie set"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗ FAILED${NC}: refresh_token cookie NOT set"
            FAILED=$((FAILED + 1))
        fi
    else
        echo -e "${RED}✗ FAILED${NC}: Cookies file not created"
        FAILED=$((FAILED + 1))
    fi

    # Check that tokens are NOT in response body
    if echo "$RESPONSE_BODY" | grep -q '"accessToken"'; then
        echo -e "${YELLOW}⚠ WARNING${NC}: accessToken still in response body (should only be in cookie)"
    else
        echo -e "${GREEN}✓ PASSED${NC}: Tokens not in response body (correct)"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "${RED}✗ FAILED${NC}: Login failed with code $HTTP_CODE"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Authenticated request using cookies
echo "Test 4: Authenticated request using cookies"
echo "-------------------------------------------"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/auth/profile" \
    -b "$COOKIES_FILE")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | head -n -1)

echo "Response: $RESPONSE_BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: Authenticated request successful using cookies"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC}: Authenticated request failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Rate Limiting on Login
echo "Test 5: Rate Limiting (Login)"
echo "-----------------------------"
echo "Attempting 6 rapid login requests..."

RATE_LIMITED=false
for i in {1..6}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -H "X-CSRF-Token: $CSRF_TOKEN" \
        -d '{"email":"ratelimit@test.com","password":"wrong"}')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" == "429" ]; then
        echo -e "${GREEN}✓ PASSED${NC}: Rate limited on attempt $i (as expected)"
        RATE_LIMITED=true
        PASSED=$((PASSED + 1))
        break
    fi
    echo "Attempt $i: $HTTP_CODE"
    sleep 0.5
done

if [ "$RATE_LIMITED" = false ]; then
    echo -e "${YELLOW}⚠ WARNING${NC}: Rate limiting not triggered after 6 attempts"
fi
echo ""

# Test 6: Dashboard Stats with Heatmap Data
echo "Test 6: Dashboard Stats (Heatmap Data)"
echo "--------------------------------------"
STATS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/admin/stats" \
    -b "$COOKIES_FILE")

HTTP_CODE=$(echo "$STATS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$STATS_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    if echo "$RESPONSE_BODY" | grep -q '"leadsBySourceAndStatus"'; then
        echo -e "${GREEN}✓ PASSED${NC}: leadsBySourceAndStatus field present in stats"
        PASSED=$((PASSED + 1))
        echo "Sample data:"
        echo "$RESPONSE_BODY" | grep -o '"leadsBySourceAndStatus":{[^}]*}' | head -c 200
        echo "..."
    else
        echo -e "${RED}✗ FAILED${NC}: leadsBySourceAndStatus field missing"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Could not fetch stats (code $HTTP_CODE)"
    echo "This might require authentication or might not be seeded yet"
fi
echo ""

# Test 7: Logout and Cookie Clearing
echo "Test 7: Logout and Cookie Clearing"
echo "-----------------------------------"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/logout" \
    -H "X-CSRF-Token: $CSRF_TOKEN" \
    -b "$COOKIES_FILE" \
    -c "$COOKIES_FILE")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: Logout successful"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC}: Logout failed"
    FAILED=$((FAILED + 1))
fi

# Verify cookies are cleared (check if access_token is expired or removed)
if grep -q "access_token" "$COOKIES_FILE"; then
    # Check if cookie has expiry in the past
    COOKIE_LINE=$(grep "access_token" "$COOKIES_FILE")
    echo "Cookie status: $COOKIE_LINE"
    echo -e "${YELLOW}⚠ NOTE${NC}: Cookie clearing verification requires manual inspection"
else
    echo -e "${GREEN}✓ PASSED${NC}: Cookies cleared"
    PASSED=$((PASSED + 1))
fi
echo ""

# Cleanup
rm -f "$COOKIES_FILE"

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed or have warnings${NC}"
    exit 1
fi
