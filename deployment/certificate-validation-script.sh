#!/bin/bash

# SSL Certificate Chain Validation Script for NaviMED
# This script checks if the SSL certificate chain is properly configured

echo "🔍 SSL Certificate Chain Validation for navimedi.org"
echo "=================================================="

# Test 1: Check if site is accessible via HTTPS
echo "1. Testing HTTPS connectivity..."
if curl -s -I https://navimedi.org > /dev/null 2>&1; then
    echo "✅ HTTPS connection successful"
else
    echo "❌ HTTPS connection failed - check certificate installation"
fi

# Test 2: Check certificate chain
echo ""
echo "2. Checking certificate chain..."
echo "Getting certificate information..."

# Get certificate details
openssl s_client -connect navimedi.org:443 -servername navimedi.org -showcerts </dev/null 2>/dev/null | \
openssl x509 -noout -subject -issuer -dates 2>/dev/null

# Test 3: Verify certificate chain completeness
echo ""
echo "3. Testing certificate chain completeness..."
chain_test=$(openssl s_client -connect navimedi.org:443 -servername navimedi.org -verify_return_error </dev/null 2>&1)

if echo "$chain_test" | grep -q "Verify return code: 0"; then
    echo "✅ Certificate chain is complete and valid"
elif echo "$chain_test" | grep -q "unable to get local issuer certificate"; then
    echo "❌ CRITICAL: Intermediate certificate missing!"
    echo "   Action required: Install intermediate CA certificate"
elif echo "$chain_test" | grep -q "certificate verify failed"; then
    echo "❌ Certificate validation failed"
    echo "   Check certificate installation and chain order"
else
    echo "⚠️  Certificate validation inconclusive"
fi

# Test 4: Check for specific vulnerabilities
echo ""
echo "4. Checking for resolved vulnerabilities..."

# Check if only TLS 1.2+ is supported
echo "Testing TLS versions..."
if openssl s_client -connect navimedi.org:443 -tls1 </dev/null 2>&1 | grep -q "handshake failure"; then
    echo "✅ TLS 1.0 properly disabled"
else
    echo "❌ TLS 1.0 still enabled - Lucky 13 vulnerability risk"
fi

if openssl s_client -connect navimedi.org:443 -tls1_1 </dev/null 2>&1 | grep -q "handshake failure"; then
    echo "✅ TLS 1.1 properly disabled"
else
    echo "❌ TLS 1.1 still enabled - Lucky 13 vulnerability risk"
fi

if openssl s_client -connect navimedi.org:443 -tls1_2 </dev/null 2>&1 | grep -q "New, "; then
    echo "✅ TLS 1.2 properly enabled"
else
    echo "❌ TLS 1.2 connection failed"
fi

# Test 5: Check cipher suites
echo ""
echo "5. Checking cipher suites..."
ciphers=$(openssl s_client -connect navimedi.org:443 -cipher 'AES128-CBC-SHA' </dev/null 2>&1)
if echo "$ciphers" | grep -q "handshake failure"; then
    echo "✅ CBC ciphers properly disabled"
else
    echo "❌ CBC ciphers still enabled - vulnerability risk"
fi

# Test 6: SSL Labs API check (if available)
echo ""
echo "6. Recommendation for comprehensive testing:"
echo "   Visit: https://www.ssllabs.com/ssltest/analyze.html?d=navimedi.org"
echo "   Expected grade: A or A+"

echo ""
echo "=================================================="
echo "Certificate validation complete."
echo ""
echo "🚨 CRITICAL: If intermediate certificate is missing,"
echo "   follow deployment/ssl-certificate-chain-fix.md immediately!"