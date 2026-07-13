export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // Get stripe_customer_id from Supabase
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}&select=stripe_customer_id&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await dbRes.json();
    const customerId = rows?.[0]?.stripe_customer_id;

    if (!customerId) return res.status(400).json({ error: 'No subscription found' });

    // Create portal session
    const params = new URLSearchParams();
    params.append('customer', customerId);
    params.append('return_url', 'https://parlami.chat/app');

    const session = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_SECRET,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const sessionData = await session.json();

    if (sessionData.error) throw new Error(sessionData.error.message);

    return res.status(200).json({ url: sessionData.url });
  } catch (error) {
    console.error('Portal error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
