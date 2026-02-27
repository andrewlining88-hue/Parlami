const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const sb = async (path, method = 'GET', body = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, data } = req.body;

  try {
    // Get student by email
    if (action === 'get') {
      const rows = await sb(`students?email=eq.${encodeURIComponent(data.email)}&limit=1`);
      return res.status(200).json({ student: rows?.[0] || null });
    }

    // Save/upsert student
    if (action === 'save') {
      const rows = await sb(`students?email=eq.${encodeURIComponent(data.email)}`);
      if (rows && rows.length > 0) {
        const updated = await sb(
          `students?email=eq.${encodeURIComponent(data.email)}`,
          'PATCH',
          data
        );
        return res.status(200).json({ student: updated?.[0] || data });
      } else {
        const created = await sb('students', 'POST', data);
        return res.status(200).json({ student: created?.[0] || data });
      }
    }

    // Delete student
    if (action === 'delete') {
      await sb(`students?email=eq.${encodeURIComponent(data.email)}`, 'DELETE');
      return res.status(200).json({ success: true });
    }

    // Get all students
    if (action === 'list') {
      const rows = await sb('students?order=created_at.asc');
      return res.status(200).json({ students: rows || [] });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('DB error:', error);
    return res.status(500).json({ error: error.message });
  }
}
