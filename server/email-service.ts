import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let mailTransporter: Transporter | null = null;

// Initialize SMTP transporter with IONOS settings
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
    
    // Verify connection
    mailTransporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
        mailTransporter = null;
      } else {
        console.log('✅ SMTP server ready to send emails');
      }
    });
  } catch (error) {
    console.error('Error initializing SMTP transporter:', error);
    mailTransporter = null;
  }
} else {
  console.warn("SMTP environment variables not set. Email functionality will be disabled.");
  console.warn("Required: SMTP_HOST, SMTP_USER, SMTP_PASS");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailTransporter) {
    console.log('Email would be sent (SMTP not configured):', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    return true; // Return true for development
  }

  try {
    const mailOptions = {
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    };
    
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('SMTP email error:', error);
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

// Send confirmation email for new registrations
export async function sendRegistrationConfirmationEmail(
  userEmail: string, 
  userName: string, 
  organizationName: string,
  loginUrl: string = 'https://navimedi.org/login'
): Promise<boolean> {
  
  const confirmationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NaviMED Healthcare Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .welcome-message { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb; }
            .features { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
            .feature-item { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .feature-item:last-child { border-bottom: none; }
            .feature-icon { color: #10b981; font-weight: bold; margin-right: 10px; }
            .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 NAVIMED</div>
                <h1 style="margin: 0;">Welcome to NaviMED Healthcare Platform!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your registration was successful</p>
            </div>
            
            <div class="content">
                <div class="welcome-message">
                    <h2 style="color: #2563eb; margin-top: 0;">Hello ${userName}!</h2>
                    <p>Thank you for registering with NaviMED Healthcare Platform. Your account for <strong>${organizationName}</strong> has been successfully created and is ready to use.</p>
                    <p>You now have access to our comprehensive suite of healthcare management tools designed to streamline your operations and improve patient care.</p>
                </div>

                <div class="features">
                    <h3 style="color: #2563eb; margin-top: 0;">What you can do with NaviMED:</h3>
                    
                    <div class="feature-item">
                        <span class="feature-icon">📅</span>
                        <strong>Appointment Management:</strong> Schedule, track, and manage patient appointments
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">👨‍⚕️</span>
                        <strong>Patient Records:</strong> Secure electronic health records with comprehensive patient data
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">💊</span>
                        <strong>Prescription Management:</strong> Digital prescriptions with pharmacy integration
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">🧪</span>
                        <strong>Laboratory Integration:</strong> Lab order management and results tracking
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">💰</span>
                        <strong>Billing & Insurance:</strong> Automated insurance claims and billing management
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">🛒</span>
                        <strong>Medical Marketplace:</strong> Access to medical supplies and equipment vendors
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="margin-bottom: 20px;">Ready to get started? Access your dashboard:</p>
                    <a href="${loginUrl}" class="button">Login to Your Dashboard</a>
                </div>

                <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid #0288d1;">
                    <h4 style="color: #0288d1; margin-top: 0;">Need Help?</h4>
                    <p style="margin-bottom: 0;">Our support team is here to help you get the most out of NaviMED. Contact us anytime for assistance with setup, training, or technical support.</p>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for choosing NaviMED Healthcare Platform</p>
                <p style="font-size: 12px; color: #9ca3af;">This email was sent to ${userEmail} because you registered for a NaviMED account.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const confirmationText = `
Welcome to NaviMED Healthcare Platform!

Hello ${userName},

Thank you for registering with NaviMED Healthcare Platform. Your account for ${organizationName} has been successfully created and is ready to use.

You now have access to our comprehensive healthcare management tools:

• Appointment Management - Schedule and track patient appointments
• Patient Records - Secure electronic health records  
• Prescription Management - Digital prescriptions with pharmacy integration
• Laboratory Integration - Lab order management and results tracking
• Billing & Insurance - Automated insurance claims and billing
• Medical Marketplace - Access to medical supplies and equipment

Ready to get started? Log in to your dashboard at: ${loginUrl}

Need help? Our support team is here to assist you with setup, training, and technical support.

Thank you for choosing NaviMED Healthcare Platform!
  `;

  return await sendEmail({
    to: userEmail,
    from: 'no-reply@navimedi.org',
    subject: 'Welcome to NaviMED - Registration Confirmed',
    text: confirmationText,
    html: confirmationHtml
  });
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
                <p>This email was sent from no-reply@navimedi.org</p>
                <p>© 2025 NaviMed by ARGILETTE Lab. All rights reserved.</p>
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

This email was sent from no-reply@navimedi.org
© 2025 NaviMed by ARGILETTE Lab. All rights reserved.
  `;

  return await sendEmail({
    to: params.userEmail,
    from: 'no-reply@navimedi.org',
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
