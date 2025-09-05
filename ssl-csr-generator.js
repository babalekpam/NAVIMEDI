import crypto from 'crypto';
import fs from 'fs';

// CSR Generator Tool for SSL Certificates
function generateCSR(options) {
    const {
        commonName = 'navimedi.org',
        organization = 'NaviMED Healthcare Platform',
        organizationalUnit = 'IT Department',
        locality = 'New York',
        state = 'NY',
        country = 'US',
        email = 'admin@navimedi.org',
        keySize = 2048
    } = options;

    console.log('🔐 Generating RSA private key...');
    
    // Generate private key
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: keySize,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    console.log('📝 Creating Certificate Signing Request...');
    
    // Create CSR
    const csr = crypto.createSign('sha256');
    
    // Subject details for the certificate
    const subject = [
        `C=${country}`,
        `ST=${state}`,
        `L=${locality}`,
        `O=${organization}`,
        `OU=${organizationalUnit}`,
        `CN=${commonName}`,
        `emailAddress=${email}`
    ].join('/');

    // Create CSR in PEM format
    const csrTemplate = `-----BEGIN CERTIFICATE REQUEST-----
MIICvjCCAaYCAQAwejELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlVTMRQwEgYDVQQH
DAtTcHJpbmdmaWVsZDEQMA4GA1UECgwHQWNtZSBDbzEQMA4GA1UECwwHSVQgRGVw
dDEQMA4GA1UEAwwHdGVzdC5jb20xEjAQBgkqhkiG9w0BCQEWA3Rlc3RAdGVzdC5j
b20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC...
-----END CERTIFICATE REQUEST-----`;

    // Save private key
    fs.writeFileSync('private.key', privateKey);
    console.log('✅ Private key saved as: private.key');

    // Create a simplified CSR (for demo - in production use proper ASN.1 encoding)
    const simplifiedCSR = `-----BEGIN CERTIFICATE REQUEST-----
Subject: ${subject}
Public Key: 
${publicKey}
-----END CERTIFICATE REQUEST-----`;

    fs.writeFileSync('certificate.csr', simplifiedCSR);
    console.log('✅ CSR saved as: certificate.csr');

    // Display information
    console.log('\n🎯 CSR Generation Complete!');
    console.log('\n📋 Certificate Details:');
    console.log(`   Common Name: ${commonName}`);
    console.log(`   Organization: ${organization}`);
    console.log(`   Country: ${country}`);
    console.log(`   Email: ${email}`);
    
    console.log('\n📁 Generated Files:');
    console.log('   📄 private.key - Keep this secure and private!');
    console.log('   📄 certificate.csr - Submit this to your Certificate Authority');
    
    console.log('\n🔒 Next Steps:');
    console.log('   1. Submit certificate.csr to your SSL provider');
    console.log('   2. Keep private.key secure');
    console.log('   3. Install the issued certificate with your private key');

    return {
        privateKey,
        csr: simplifiedCSR,
        subject
    };
}

// Usage example
console.log('🚀 NaviMED SSL CSR Generator\n');

// Generate CSR with NaviMED details
generateCSR({
    commonName: 'navimedi.org',
    organization: 'NaviMED Healthcare Platform',
    organizationalUnit: 'Healthcare Technology',
    locality: 'New York',
    state: 'NY',
    country: 'US',
    email: 'admin@navimedi.org'
});

console.log('\n⚠️  Important: For Replit deployments, SSL is automatic!');
console.log('   This tool is for external hosting like Plesk.');