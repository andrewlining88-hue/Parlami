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

  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Missing email or name' });

  const firstName = name.split(' ')[0];
  const token = generateToken();

  try {
    // Save token to Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ verification_token: token, email_verified: false }),
    });

    const verifyUrl = `https://parlami.chat/api/verify-email?token=${token}`;

    // Send welcome email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Parlami <noreply@parlami.chat>',
        to: email,
        subject: `Benvenuto su Parlami, ${firstName}! 🇮🇹`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://parlami.chat/icons/web-app-manifest-192x192.png" width="64" height="64" style="border-radius: 16px;" />
            </div>
            <h2 style="color: #1a1a2e; text-align: center; margin-bottom: 8px;">Benvenuto, ${firstName}! 🎉</h2>
            <p style="color: #4b5563; text-align: center; line-height: 1.6;">
              Il tuo account Parlami è pronto. Pratica l'italiano con Dante ogni giorno e vedrai i tuoi progressi!
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="background: #1a1a2e; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                ✅ Verifica la tua email
              </a>
            </div>
            <p style="color: #9ca3af; text-align: center; font-size: 13px;">
              Il tuo insegnante Andrei ti aspetta! 🇮🇹
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'Email failed', detail: data });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('send-welcome error:', error);
    return res.status(500).json({ error: error.message });
  }
}
