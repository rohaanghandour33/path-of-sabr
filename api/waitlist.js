import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    await resend.emails.send({
      from: 'Path of Sabr <onboarding@resend.dev>',
      to: 'rohaanghandour33@gmail.com',
      subject: '🌿 New Waitlist Signup — Path of Sabr',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #051a10; color: #ffffff; padding: 32px; border-radius: 16px;">
          <h2 style="color: #1D9E75; margin-top: 0;">New Waitlist Signup</h2>
          <p style="color: #ffffff99; margin-bottom: 8px;">Someone just joined the Path of Sabr waitlist:</p>
          <p style="font-size: 20px; font-weight: bold; color: #C9952A; background: rgba(201,149,42,0.1); padding: 12px 16px; border-radius: 8px; border-left: 3px solid #C9952A;">
            ${email}
          </p>
          <p style="color: #ffffff50; font-size: 13px; margin-top: 24px;">Path of Sabr — Built for the Muslim who is genuinely trying.</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
