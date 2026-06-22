import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const Sendemail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Nexora AI <onboarding@resend.dev>', // free default — works without domain setup
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error('[Mail Service] ❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log('[Mail Service] ✅ Email sent! ID:', data.id);
  } catch (err) {
    console.error('[Mail Service] ❌ Failed to send email:', err.message);
    throw err;
  }
};