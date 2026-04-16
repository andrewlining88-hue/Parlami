const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    // Check student exists
    const rows = await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}&limit=1`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    }).then(r => r.json());

    if (!rows || rows.length === 0) {
      // Don't reveal if email exists or not
      return res.status(200).json({ success: true });
    }

    const token = generateToken();
    const firstName = rows[0].name?.split(' ')[0] || 'there';

    // Save token to Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ reset_token: token }),
    });

    const resetUrl = `https://parlami.chat/api/reset-password?token=${token}`;

    // Send email
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Parlami <noreply@parlami.chat>',
        to: email,
        subject: 'Reset your Parlami password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://parlami.chat/icons/web-app-manifest-192x192.png" width="64" height="64" style="border-radius: 16px;" />
            </div>
            <h2 style="color: #1a1a2e; text-align: center; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #4b5563; text-align: center; line-height: 1.6;">
              Ciao ${firstName}! Click the button below to set a new password for your Parlami account.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: #1a1a2e; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Reset password →
              </a>
            </div>
            <p style="color: #9ca3af; text-align: center; font-size: 13px;">
              If you didn't request this, you can ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('send-reset error:', error);
    return res.status(500).json({ error: error.message });
  }
}
