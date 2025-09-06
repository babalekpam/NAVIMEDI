# SSL/TLS Deployment Checklist for NaviMED
## Fixing Critical Security Vulnerabilities

### 🔴 Critical Vulnerabilities to Fix:
- [ ] Lucky 13 (CVE-2013-0169) - TLS timing attack
- [ ] Obsoleted CBC Ciphers - Padding oracle attacks
- [ ] SSL Protocol Error - Certificate/configuration issues

### 📋 Pre-Deployment Checklist:

#### 1. Certificate Verification
- [ ] SSL certificate properly installed in Plesk
- [ ] Private key matches certificate
- [ ] Intermediate certificate chain complete
- [ ] Certificate valid for navimedi.org and www.navimedi.org

#### 2. Protocol Configuration
- [ ] TLS 1.0 disabled
- [ ] TLS 1.1 disabled  
- [ ] TLS 1.2 enabled
- [ ] TLS 1.3 enabled
- [ ] SSL 3.0 disabled

#### 3. Cipher Suite Configuration
- [ ] CBC ciphers disabled
- [ ] GCM ciphers enabled
- [ ] ChaCha20-Poly1305 enabled
- [ ] Weak ciphers removed
- [ ] Perfect Forward Secrecy enabled

#### 4. Security Headers
- [ ] HSTS header configured
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured

### 🚀 Deployment Steps:

#### Option A: Plesk Interface (Recommended)
1. [ ] Upload configuration files to server
2. [ ] Access Plesk → SSL/TLS Settings
3. [ ] Apply protocol restrictions (TLS 1.2+ only)
4. [ ] Configure secure cipher suites
5. [ ] Enable security headers
6. [ ] Restart web server services
7. [ ] Test configuration

#### Option B: Manual Configuration
1. [ ] Upload apache-ssl.conf or nginx-ssl.conf
2. [ ] Upload .htaccess file
3. [ ] Configure web server
4. [ ] Restart services
5. [ ] Test configuration

### 🔍 Post-Deployment Verification:

#### Automated Testing
- [ ] SSL Labs Test: https://www.ssllabs.com/ssltest/analyze.html?d=navimedi.org
- [ ] Expected Grade: A or A+
- [ ] Protocols: Only TLS 1.2 and 1.3 showing
- [ ] No CBC ciphers in supported list

#### Manual Testing
- [ ] Website loads over HTTPS
- [ ] No SSL certificate warnings
- [ ] Security headers present
- [ ] No Lucky 13 vulnerability detected
- [ ] No CBC cipher vulnerability detected

### 📞 Support Options:
If you encounter issues:
1. Contact Plesk hosting provider with specific requirements
2. Reference CVE-2013-0169 and CBC cipher vulnerabilities  
3. Request TLS 1.0/1.1 disable and GCM cipher enablement

### 🎯 Success Criteria:
- [ ] SSL Labs grade A or A+
- [ ] Zero medium/high SSL vulnerabilities
- [ ] NaviMED platform accessible via HTTPS
- [ ] All security headers functional
- [ ] Performance maintained