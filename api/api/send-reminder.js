export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Missing email or name' });

  const firstName = name.split(' ')[0];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Parlami <noreply@parlami.chat>',
        to: email,
        subject: `Ciao ${firstName}! Ti aspettiamo su Parlami 🇮🇹`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://parlami.chat/icons/web-app-manifest-192x192.png" width="64" height="64" style="border-radius: 16px;" />
            </div>
            <h2 style="color: #1a1a2e; text-align: center; margin-bottom: 8px;">Ciao ${firstName}! 👋</h2>
            <p style="color: #4b5563; text-align: center; line-height: 1.6;">
              Non ti vediamo da un po' su Parlami. Anche solo 5 minuti di pratica oggi fanno la differenza!
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://parlami.chat" style="background: #1a1a2e; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Torna a praticare →
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
    console.error('send-reminder error:', error);
    return res.status(500).json({ error: error.message });
  }
}
