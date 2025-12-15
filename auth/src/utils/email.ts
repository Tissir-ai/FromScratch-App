import nodemailer from 'nodemailer';

export interface PasswordResetEmailData {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  console.log('Sending email with Gmail user:', gmailUser); // Debug log

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: data.to,
    subject: '🔐 Secure Password Reset - FromScratch.ai',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - FromScratch.ai</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1000px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #ff6b35;
            padding: 5px 0;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 0 15px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            text-align: center;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin-bottom: 15px;
            text-align: center;
            line-height: 1.5;
        }
        .button-container {
            text-align: center;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            background-color: #ff6b35;
            color: white !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #e55a2b;
        }
        .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
        }
        .security-title {
            font-size: 16px;
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
        }
        .security-text {
            color: #856404;
            font-size: 14px;
            margin: 0;
        }
        .fallback-section {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
        .fallback-title {
            font-size: 14px;
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .fallback-link {
            color: #ff6b35;
            word-break: break-all;
            font-family: monospace;
            font-size: 13px;
            text-decoration: none;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 15px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        .footer-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .footer-text {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .footer-link {
            color: #ff6b35;
            text-decoration: none;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        .footer-links {
            margin: 10px 0;
        }
        .copyright {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 10px;
            }
            .header, .content, .footer {
                padding-left: 15px;
                padding-right: 15px;
            }
            .title {
                font-size: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">FromScratch.ai</div>
            <p class="tagline">Professional Project Planning & Development</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="title">Secure Password Reset</h1>

            <p class="message">
                Hello,
                We received a request to reset the password for your FromScratch.ai account.
                For your security, we've generated a secure link that will allow you to create a new password.
            </p>

            <div class="button-container">
                <a href="${data.resetUrl}" class="button">
                    Reset My Password Securely
                </a>
            </div>

            <div class="fallback-section">
                <h3 class="fallback-title">Security Notice</h3>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">
                    This password reset link is valid for <strong>15 minutes</strong> and can only be used once.
                    If you did not request this password reset, please disregard this email and ensure your account is secure.
                </p>
                <p class="fallback-title">Having trouble with the button above?</p>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">
                    Copy and paste this secure link into your browser:
                </p>
                <a href="${data.resetUrl}" class="fallback-link">${data.resetUrl}</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Our support team is here to help you with any account-related questions.
            </p>
            <p class="footer-text">
                Contact us at <a href="mailto:support@fromscratch.ai" class="footer-link">support@fromscratch.ai</a>
            </p>

            <div class="footer-links">
                <a href="${process.env.CORS_ORIGIN}/privacy-policy" class="footer-link">Privacy Policy</a>
                <a href="${process.env.CORS_ORIGIN}/terms-of-service" class="footer-link">Terms of Service</a>
            </div>

            <p class="copyright">
                © 2025 FromScratch.ai. All rights reserved.<br>
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
}