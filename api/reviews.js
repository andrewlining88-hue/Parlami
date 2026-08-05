const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const sb = async (path, method = 'GET', body = null) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: body ? JSON.stringify(body) : null,
  };
  if (method === 'POST' || method === 'PATCH') {
    opts.headers['Prefer'] = 'return=representation';
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { action, data } = req.body;
  try {
    if (action === 'submit') {
      const { email, name, level, rating, text } = data;
      if (!email || !rating || !text) return res.status(400).json({ error: 'Missing fields' });
      const existing = await sb(`reviews?email=eq.${encodeURIComponent(email)}`);
      if (existing && existing.length > 0) {
        await sb(`reviews?email=eq.${encodeURIComponent(email)}`, 'PATCH', { rating, text, level, approved: false });
        return res.status(200).json({ success: true, updated: true });
      }
      await sb('reviews', 'POST', { email, name, level, rating, text, approved: false });
      return res.status(200).json({ success: true });
    }
    if (action === 'list') {
      const rows = await sb('reviews?order=created_at.desc');
      return res.status(200).json({ reviews: rows || [] });
    }
    if (action === 'approved') {
      const rows = await sb('reviews?approved=eq.true&order=created_at.desc');
      return res.status(200).json({ reviews: rows || [] });
    }
    if (action === 'approve') {
      await sb(`reviews?id=eq.${data.id}`, 'PATCH', { approved: true });
      return res.status(200).json({ success: true });
    }
    if (action === 'reject') {
      await sb(`reviews?id=eq.${data.id}`, 'DELETE');
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Reviews error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
