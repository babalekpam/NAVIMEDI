# Plesk SSL/TLS Security Configuration
## Fixing Lucky 13 and CBC Cipher Vulnerabilities

### Step 1: Access Plesk SSL Settings
1. Log into your Plesk control panel
2. Navigate to: **Tools & Settings** → **SSL/TLS Settings**
3. Or go to: **Websites & Domains** → **navimedi.org** → **SSL/TLS Certificates**

### Step 2: Protocol Configuration
In the SSL/TLS settings, configure:

**Enabled Protocols:**
- ✅ TLS 1.2
- ✅ TLS 1.3

**Disabled Protocols:**
- ❌ SSL 3.0
- ❌ TLS 1.0  
- ❌ TLS 1.1

### Step 3: Cipher Suite Configuration
Replace the default cipher suites with these secure ones:

```
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-CHACHA20-POLY1305
ECDHE-RSA-CHACHA20-POLY1305
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
DHE-RSA-AES256-GCM-SHA384
DHE-RSA-AES128-GCM-SHA256
```

### Step 4: Additional Security Settings
- **Honor Cipher Order:** Enable
- **SSL Compression:** Disable
- **OCSP Stapling:** Enable (if available)

### Step 5: Apply Configuration
1. Save the settings
2. Restart the web server service
3. Test the configuration

### Step 6: Verification
Test your configuration at: https://www.ssllabs.com/ssltest/analyze.html?d=navimedi.org

**Expected Results:**
- Grade: A or A+
- Protocols: TLS 1.2, TLS 1.3 only
- No CBC ciphers listed
- No Lucky 13 vulnerability warnings