# Plesk SSL Certificate Installation Guide
## Complete Certificate Chain Setup for NaviMED

### **🎯 Objective:**
Install complete SSL certificate chain to fix "Intermediate CA Not Included" critical vulnerability.

---

## **📋 Pre-Installation Checklist:**

### **Required Files:**
- [ ] **Domain Certificate** (navimedi.org.crt) - Your site's certificate
- [ ] **Intermediate Certificate** (intermediate.crt) - **MISSING - CRITICAL**
- [ ] **Private Key** (navimedi.org.key) - Your site's private key
- [ ] **Root Certificate** (optional - usually auto-included)

### **File Formats:**
All certificates must be in **PEM format** (Base64 encoded, starts with `-----BEGIN CERTIFICATE-----`)

---

## **🔧 Installation Steps in Plesk:**

### **Step 1: Access SSL Certificate Manager**
1. **Log into Plesk control panel**
2. **Navigate to:** Websites & Domains
3. **Select:** navimedi.org domain
4. **Click:** SSL/TLS Certificates

### **Step 2: Current Certificate Status**
You should see your current certificate listed. Note:
- **Status:** May show as "Invalid" or "Incomplete"
- **Issue:** Certificate chain incomplete

### **Step 3: Upload Intermediate Certificate**

#### **Option A: Separate Upload (Recommended)**
1. **Click:** "Add SSL Certificate" or "Upload Certificate"
2. **Select:** "Intermediate Certificate" or "CA Certificate"
3. **Upload:** Your intermediate.crt file
4. **Name:** "NaviMED Intermediate CA"
5. **Click:** "Upload"

#### **Option B: Certificate Bundle**
If Plesk doesn't have separate intermediate option:
1. **Create bundle file** on your computer:
   ```
   Content of navimedi.org.crt
   Content of intermediate.crt
   Content of root.crt (if you have it)
   ```
2. **Save as:** navimedi_bundle.crt
3. **Upload as:** Domain certificate

### **Step 4: Configure Certificate Assignment**
1. **Go to:** Hosting & DNS → Apache & nginx Settings (or similar)
2. **Find:** SSL Certificate section
3. **Select:** Your domain certificate
4. **Select:** Intermediate certificate (if uploaded separately)
5. **Ensure:** Certificate and private key match
6. **Click:** Apply or Save

### **Step 5: Enable SSL/TLS**
1. **Check:** "SSL/TLS support"
2. **Check:** "Permanent SEO-safe 301 redirect from HTTP to HTTPS"
3. **Select:** "Certificate issued by a trusted certificate authority"
4. **Apply changes**

---

## **🔍 Verification Steps:**

### **Immediate Checks in Plesk:**
1. **Certificate Status:** Should show "Valid" and "Trusted"
2. **Certificate Details:** Click "View" to see certificate chain
3. **Expiration Date:** Should show correct expiration
4. **Browser Test:** Visit https://navimedi.org

### **External Verification:**
1. **SSL Labs Test:** https://www.ssllabs.com/ssltest/analyze.html?d=navimedi.org
2. **Expected Results:**
   - Grade: A or A+
   - Certificate chain: Complete (3 certificates)
   - No warnings about missing intermediate certificate

---

## **⚠️ Common Issues & Solutions:**

### **"Certificate and private key do not match"**
- **Solution:** Ensure you have the correct private key for your certificate
- **Check:** Both files should be from the same SSL certificate order

### **"Intermediate certificate not found"**
- **Solution:** Download from your SSL provider or CA
- **Common locations:**
  - SSL provider account dashboard
  - Email from SSL provider
  - CA's official website

### **"PEM format error"**
- **Solution:** Convert certificate to PEM format:
  ```bash
  openssl x509 -in certificate.der -inform DER -out certificate.pem -outform PEM
  ```

### **"Certificate chain incomplete"**
- **Solution:** Create proper certificate bundle:
  ```bash
  cat domain.crt intermediate.crt root.crt > full_chain.crt
  ```

---

## **🚨 If You Can't Find Intermediate Certificate:**

### **Let's Encrypt Users:**
Download from: https://letsencrypt.org/certificates/
- File: "Let's Encrypt R3" or "ISRG Root X1"

### **Other CAs:**
1. **Contact your SSL provider**
2. **Request:** Certificate bundle or intermediate certificate
3. **Specify:** navimedi.org SSL certificate order
4. **Emergency:** Use CA's published intermediate certificates

---

## **✅ Post-Installation Checklist:**
- [ ] https://navimedi.org loads without warnings
- [ ] Green lock icon appears in browsers
- [ ] SSL Labs test shows A+ grade
- [ ] Certificate chain shows 3 certificates
- [ ] All browsers accept the certificate
- [ ] No "intermediate CA not included" errors

**This fix will immediately resolve the CRITICAL SSL vulnerability!**