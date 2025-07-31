import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent (SENDGRID_API_KEY not configured):', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    return true; // Return true for development
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

interface WelcomeEmailParams {
  userEmail: string;
  firstName: string;
  lastName: string;
  username: string;
  temporaryPassword: string;
  organizationName: string;
  loginUrl: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NaviMed Healthcare Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .credentials { background-color: #e5f7f0; border: 1px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fef3cd; border: 1px solid #f6d55c; padding: 15px; margin: 20px 0; border-radius: 5px; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to NaviMed</h1>
                <p>Healthcare Management Platform</p>
            </div>
            
            <div class="content">
                <h2>Hello ${params.firstName} ${params.lastName},</h2>
                
                <p>Welcome to the NaviMed Healthcare Management Platform! Your account has been successfully created for <strong>${params.organizationName}</strong>.</p>
                
                <div class="credentials">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Username:</strong> ${params.username}</p>
                    <p><strong>Email:</strong> ${params.userEmail}</p>
                    <p><strong>Temporary Password:</strong> ${params.temporaryPassword}</p>
                </div>
                
                <div class="warning">
                    <h4>⚠️ Important Security Notice</h4>
                    <p>This is a <strong>temporary password</strong>. For your security, you will be required to change this password when you first log in to the system.</p>
                </div>
                
                <p>To get started:</p>
                <ol>
                    <li>Click the login button below</li>
                    <li>Enter your username and temporary password</li>
                    <li>Create a new secure password when prompted</li>
                    <li>Begin using the NaviMed platform</li>
                </ol>
                
                <div style="text-align: center;">
                    <a href="${params.loginUrl}" class="button">Login to NaviMed</a>
                </div>
                
                <h3>What you can do with NaviMed:</h3>
                <ul>
                    <li>Manage patient records and appointments</li>
                    <li>Process prescriptions and lab orders</li>
                    <li>Handle billing and insurance claims</li>
                    <li>Secure medical communications</li>
                    <li>Generate comprehensive reports</li>
                </ul>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>
                The NaviMed Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from info@navimedi.com</p>
                <p>© 2025 NaviMed Healthcare Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to NaviMed Healthcare Platform!

Hello ${params.firstName} ${params.lastName},

Your account has been successfully created for ${params.organizationName}.

LOGIN CREDENTIALS:
Username: ${params.username}
Email: ${params.userEmail}
Temporary Password: ${params.temporaryPassword}

IMPORTANT SECURITY NOTICE:
This is a temporary password. You will be required to change this password when you first log in.

To get started:
1. Visit: ${params.loginUrl}
2. Enter your username and temporary password
3. Create a new secure password when prompted
4. Begin using the NaviMed platform

If you have any questions, please contact our support team.

Best regards,
The NaviMed Team

This email was sent from info@navimedi.com
© 2025 NaviMed Healthcare Platform. All rights reserved.
  `;

  return await sendEmail({
    to: params.userEmail,
    from: 'info@navimedi.com',
    subject: `Welcome to NaviMed - Your Account Details for ${params.organizationName}`,
    text: textContent,
    html: htmlContent
  });
}

// Generate a secure temporary password
export function generateTemporaryPassword(): string {
  const length = 12;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)];
  password += '23456789'[Math.floor(Math.random() * 8)];
  password += '!@#$%&*'[Math.floor(Math.random() * 7)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}