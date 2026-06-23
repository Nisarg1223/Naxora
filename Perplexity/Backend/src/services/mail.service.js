import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || 'resend'; // 'resend' or 'nodemailer'
const FROM_EMAIL = process.env.FROM_EMAIL || 'Darjini Sarg <darjinisarg@gmail.com>';

const resend = new Resend(process.env.RESEND_API_KEY);

const createSmtpTransport = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP credentials (SMTP_USER and SMTP_PASS) are required for nodemailer provider');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export const Sendemail = async (to, subject, text, html) => {
  try {
    if (MAIL_PROVIDER === 'nodemailer') {
      const transporter = createSmtpTransport();
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html,
      });

      console.log('[Mail Service] ✅ Nodemailer sent! MessageId:', info.messageId);
      return info;
    }

    // default: Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL, // default to your email or override with FROM_EMAIL env var
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error('[Mail Service] ❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log('[Mail Service] ✅ Resend email sent! ID:', data.id);
    return data;
  } catch (err) {
    console.error('[Mail Service] ❌ Failed to send email:', err.message);
    throw err;
  }
};