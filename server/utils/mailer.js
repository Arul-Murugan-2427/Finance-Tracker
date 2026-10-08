import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using environment variables or test fallback
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Console Fallback Transporter for development
  return {
    sendMail: async (options) => {
      console.log('\n=================== 📧 EMAIL SENT (DEV LOG) ===================');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--------------------------------------------------------------');
      console.log(options.text || options.html);
      console.log('==============================================================\n');
      return { messageId: 'dev-simulated-' + Date.now() };
    }
  };
};

const transporter = createTransporter();
const getSenderAddress = () => {
  if (process.env.FROM_EMAIL && process.env.FROM_EMAIL.includes('@')) {
    return process.env.FROM_EMAIL;
  }
  if (process.env.SMTP_USER) {
    return `"RupeeTrack Support" <${process.env.SMTP_USER}>`;
  }
  return '"RupeeTrack Personal Finance" <no-reply@rupeetrack.com>';
};

/**
 * Send Welcome Email upon Sign Up
 */
export async function sendWelcomeEmail({ email, name, username, dob, password }) {
  const subject = 'Welcome to RupeeTrack Personal Finance Tracker! 🚀';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #059669; text-align: center;">Welcome to RupeeTrack! 🎉</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for signing up on the <strong>Personal Finance Tracker</strong> website. Here are your account registration details for your reference:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
        <p style="margin: 6px 0;"><strong>Registered Gmail/Email:</strong> ${email}</p>
        <p style="margin: 6px 0;"><strong>Username:</strong> ${username}</p>
        <p style="margin: 6px 0;"><strong>Date of Birth (DOB):</strong> ${dob || 'Not specified'}</p>
        <p style="margin: 6px 0;"><strong>Password:</strong> ${password}</p>
      </div>
      <p>You can now log in to track your income, expenses, budgets, and investments securely!</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated email from RupeeTrack Personal Finance Tracker.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: getSenderAddress(),
      to: email,
      subject,
      html,
      text: `Welcome to RupeeTrack!\n\nName: ${name}\nEmail: ${email}\nUsername: ${username}\nDOB: ${dob}\nPassword: ${password}`
    });
    console.log(`✅ Welcome email sent to ${email} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error('❌ Failed to send welcome email:', err.message);
  }
}

/**
 * Send Reset Password Email
 */
export async function sendResetPasswordEmail({ email, name, resetLink }) {
  const subject = 'Reset Your Password - RupeeTrack Personal Finance Tracker';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #059669; text-align: center;">Password Reset Request</h2>
      <p>Hello <strong>${name || 'User'}</strong>,</p>
      <p>We received a request to reset your password for your <strong>RupeeTrack Personal Finance Tracker</strong> account.</p>
      <p>Please click the button below or open the link to set a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Reset Password Now</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;"><a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">If you did not request a password reset, you can safely ignore this email. Link expires in 1 hour.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: getSenderAddress(),
      to: email,
      subject,
      html,
      text: `Reset your RupeeTrack password using this link: ${resetLink}`
    });
    console.log(`✅ Reset password email sent to ${email} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error('❌ Failed to send reset password email:', err.message);
  }
}
