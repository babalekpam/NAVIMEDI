const { MailService } = require('@sendgrid/mail');

let mailService = null;

// Only initialize SendGrid if we have a valid API key
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else if (process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.warn("Invalid SENDGRID_API_KEY format. API key must start with 'SG.' - Email functionality will be disabled.");
} else {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

async function sendEmail(params) {
  if (!mailService) {
    console.log('Email would be sent (SendGrid not configured):', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    return true; // Return true for development
  }

  try {
    const emailData = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    await mailService.send(emailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send welcome email with temporary password
async function sendWelcomeEmail(params) {
  const welcomeHtml = `
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
                    <h2>Hello ${params.firstName} ${params.lastName}!</h2>
                    <p>Welcome to <strong>${params.organizationName}</strong> on the NaviMED Healthcare Platform. Your account has been successfully created.</p>
                    
                    <div class="credentials">
                        <h3>🔐 Your Login Credentials:</h3>
                        <p><strong>Username:</strong> ${params.username}</p>
                        <p><strong>Email:</strong> ${params.userEmail}</p>
                        <p><strong>Temporary Password:</strong> ${params.temporaryPassword}</p>
                    </div>
                    
                    <p>⚠️ <strong>Important:</strong> Please change your password after your first login for security.</p>
                    
                    <a href="${params.loginUrl}" class="button">🚀 Login to NaviMED</a>
                    
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
  `;

  return await sendEmail({
    to: params.userEmail,
    from: 'noreply@navimed-healthcare.com',
    subject: `Welcome to NaviMED Healthcare Platform - ${params.organizationName}`,
    html: welcomeHtml,
    text: `Welcome ${params.firstName} ${params.lastName} to NaviMED Healthcare Platform!\n\nYour account for ${params.organizationName} has been created.\n\nLogin credentials:\nUsername: ${params.username}\nEmail: ${params.userEmail}\nTemporary Password: ${params.temporaryPassword}\n\nPlease login at: ${params.loginUrl}\n\nImportant: Change your password after first login.`
  });
}

function generateTemporaryPassword() {
  // Generate a secure 12-character temporary password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  generateTemporaryPassword
};