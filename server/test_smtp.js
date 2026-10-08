import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('SMTP Host:', process.env.SMTP_HOST);
console.log('SMTP User:', process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function run() {
  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');

    console.log(`Sending test email to ${process.env.SMTP_USER}...`);
    const info = await transporter.sendMail({
      from: `"RupeeTrack Support" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'RupeeTrack Live Gmail SMTP Verification 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #059669;">RupeeTrack Email System Active!</h2>
          <p>Your Gmail SMTP credentials (<strong>${process.env.SMTP_USER}</strong>) have been verified successfully.</p>
          <p>Welcome emails and Forgot Password reset links will now be delivered live to users' inboxes via your Gmail account.</p>
        </div>
      `
    });
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Verification Error:', err.message);
  }
}

run();
