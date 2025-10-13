#!/bin/bash

# Navigate to project directory
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed/server/

# Create the corrected email-service.ts with ES6 imports
cat > email-service.ts << 'EOF'
import nodemailer from 'nodemailer';

let transporter = null;

// Initialize SMTP transporter
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ SMTP email service initialized successfully');
} else {
  console.warn("⚠️ SMTP configuration incomplete. Email functionality will be disabled.");
  console.warn("Required: SMTP_HOST, SMTP_USER, SMTP_PASS");
}

async function sendEmail(params: any) {
  if (!transporter) {
    console.log('Email would be sent (SMTP not configured):', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    return true;
  }

  try {
    const emailData: any = {
      from: params.from,
      to: params.to,
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    await transporter.sendMail(emailData);
    console.log(\`✅ Email sent successfully to \${params.to}\`);
    return true;
  } catch (error) {
    console.error('❌ SMTP email error:', error);
    return false;
  }
}

async function sendWelcomeEmail(params: any) {
  const welcomeHtml = \`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NaviMED Healthcare Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .welcome-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .credentials { background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196F3; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Welcome to NaviMED</h1>
                <p>Your Healthcare Management Platform</p>
            </div>
            <div class="content">
                <div class="welcome-box">
                    <h2>Hello \${params.firstName} \${params.lastName}!</h2>
                    <p>Welcome to <strong>\${params.organizationName}</strong> on the NaviMED Healthcare Platform. Your account has been successfully created.</p>
                    
                    <div class="credentials">
                        <h3>🔐 Your Login Credentials:</h3>
                        <p><strong>Username:</strong> \${params.username}</p>
                        <p><strong>Email:</strong> \${params.userEmail}</p>
                        <p><strong>Temporary Password:</strong> \${params.temporaryPassword}</p>
                    </div>
                    
                    <p>⚠️ <strong>Important:</strong> Please change your password after your first login for security.</p>
                    
                    <a href="\${params.loginUrl}" class="button">🚀 Login to NaviMED</a>
                    
                    <h3>🌟 What's Available:</h3>
                    <ul>
                        <li>📊 Complete patient management system</li>
                        <li>📋 Digital prescriptions and lab orders</li>
                        <li>💊 Pharmacy integration and inventory</li>
                        <li>🔬 Laboratory results management</li>
                        <li>💰 Insurance claims and billing</li>
                        <li>📱 Multi-language support</li>
                        <li>☁️ Secure cloud-based platform</li>
                    </ul>
                    
                    <p>If you have any questions or need assistance, please contact your system administrator.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  \`;

  return await sendEmail({
    to: params.userEmail,
    from: params.from || 'no-reply@navimedi.org',
    subject: \`Welcome to NaviMED Healthcare Platform - \${params.organizationName}\`,
    html: welcomeHtml,
    text: \`Welcome \${params.firstName} \${params.lastName} to NaviMED Healthcare Platform!\n\nYour account for \${params.organizationName} has been created.\n\nLogin credentials:\nUsername: \${params.username}\nEmail: \${params.userEmail}\nTemporary Password: \${params.temporaryPassword}\n\nPlease login at: \${params.loginUrl}\n\nImportant: Change your password after first login.\`
  });
}

async function sendRegistrationConfirmationEmail(params: any) {
  const confirmationHtml = \`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Registration Confirmed - NaviMED</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to NaviMED!</h1>
            </div>
            <div class="content">
                <p>Dear \${params.firstName} \${params.lastName},</p>
                <p>Your organization <strong>\${params.organizationName}</strong> has been successfully registered on NaviMED Healthcare Platform.</p>
                <p>Your login credentials:</p>
                <ul>
                    <li><strong>Email:</strong> \${params.userEmail}</li>
                    <li><strong>Username:</strong> \${params.username}</li>
                </ul>
                <p>You can now login and start using the platform.</p>
            </div>
        </div>
    </body>
    </html>
  \`;

  return await sendEmail({
    to: params.userEmail,
    from: params.from || 'no-reply@navimedi.org',
    subject: \`Registration Confirmed - \${params.organizationName}\`,
    html: confirmationHtml,
    text: \`Welcome \${params.firstName} \${params.lastName}! Your organization \${params.organizationName} has been registered on NaviMED.\`
  });
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export {
  sendEmail,
  sendWelcomeEmail,
  sendRegistrationConfirmationEmail,
  generateTemporaryPassword
};
EOF

echo "✅ Email service file updated with ES6 syntax"

# Go back to project root
cd ..

# Clean rebuild
echo "🗑️ Cleaning old build..."
rm -rf dist/

echo "🔨 Building project..."
npm run build

echo "🔄 Restarting application..."
pm2 restart navimed

echo "📋 Showing logs..."
pm2 logs navimed --lines 30
