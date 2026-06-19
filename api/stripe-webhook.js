export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  const buf = await buffer(req);
  let event;
  try {
    event = JSON.parse(buf.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const updateStudent = async (email, data) => {
    await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
  };

  const getCustomerEmail = async (customerId) => {
    const r = await fetch('https://api.stripe.com/v1/customers/' + customerId, {
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET },
    });
    const d = await r.json();
    return d.email;
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.metadata?.email || session.customer_email;
        if (email) {
          await updateStudent(email, {
            subscription_status: 'active',
            stripe_customer_id: session.customer,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const email = await getCustomerEmail(sub.customer);
        if (email) {
          const status = sub.status === 'active' ? 'active'
            : sub.status === 'trialing' ? 'trial'
            : sub.status === 'past_due' ? 'past_due'
            : 'expired';
          await updateStudent(email, { subscription_status: status });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const email = await getCustomerEmail(sub.customer);
        if (email) {
          await updateStudent(email, { subscription_status: 'expired' });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = await getCustomerEmail(invoice.customer);
        if (email) {
          await updateStudent(email, { subscription_status: 'past_due' });
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
