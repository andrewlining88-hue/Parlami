export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = process.env.STRIPE_PRICE_ID;

  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // Create or find Stripe customer
    const custSearch = await fetch('https://api.stripe.com/v1/customers/search?query=email%3A%27' + encodeURIComponent(email) + '%27', {
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET },
    });
    const custData = await custSearch.json();
    
    let customerId;
    if (custData.data && custData.data.length > 0) {
      customerId = custData.data[0].id;
    } else {
      const newCust = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + STRIPE_SECRET,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(name || ''),
      });
      const newCustData = await newCust.json();
      customerId = newCustData.id;
    }

    // Create checkout session with 7-day free trial
    const params = new URLSearchParams();
    params.append('customer', customerId);
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', PRICE_ID);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', 'https://parlami.chat/app?payment=success');
    params.append('cancel_url', 'https://parlami.chat/app?payment=cancel');
    params.append('metadata[email]', email);

    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_SECRET,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const sessionData = await session.json();

    if (sessionData.error) throw new Error(sessionData.error.message);

    // Save Stripe customer ID to Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        stripe_customer_id: customerId,
        subscription_status: 'trial',
        trial_start: new Date().toISOString().slice(0, 10),
      }),
    });

    return res.status(200).json({ url: sessionData.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
