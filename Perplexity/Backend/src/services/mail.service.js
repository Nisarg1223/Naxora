import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

// Step 1: Setup OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Step 2: Create transporter dynamically (fresh access token every time)
const createTransporter = async () => {
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,  // ✅ Fresh token every call
    },
  });
};

// Step 3: Send email using fresh transporter
export const Sendemail = async (to, subject, text, html) => {
  try {
    const transporter = await createTransporter(); // ✅ Fresh each time

    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};