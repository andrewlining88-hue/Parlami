const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).send(errorPage('Invalid verification link.'));

  try {
    // Find student with this token
    const findRes = await fetch(`${SUPABASE_URL}/rest/v1/students?verification_token=eq.${encodeURIComponent(token)}&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await findRes.json();
    if (!rows || rows.length === 0) return res.status(400).send(errorPage('This verification link is invalid or already used.'));

    const student = rows[0];

    // Mark as verified and clear token
    await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(student.email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email_verified: true, verification_token: null }),
    });

    return res.status(200).send(successPage(student.name?.split(' ')[0] || 'there'));
  } catch (error) {
    console.error('verify-email error:', error);
    return res.status(500).send(errorPage('Something went wrong. Please try again.'));
  }
}

function successPage(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Email Verified – Parlami</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;}
.card{background:white;border-radius:24px;padding:48px 32px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
.icon{font-size:56px;margin-bottom:16px;}
h1{color:#1a1a2e;font-size:24px;margin:0 0 8px;}
p{color:#6b7280;line-height:1.6;margin:0 0 32px;}
a{background:#1a1a2e;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;}
</style></head>
<body><div class="card">
<div class="icon">✅</div>
<h1>Email verified!</h1>
<p>Ciao ${firstName}! Your email has been verified. You can now use Parlami.</p>
<a href="https://parlami.chat">Open Parlami →</a>
</div></body></html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Error – Parlami</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;}
.card{background:white;border-radius:24px;padding:48px 32px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
.icon{font-size:56px;margin-bottom:16px;}
h1{color:#1a1a2e;font-size:24px;margin:0 0 8px;}
p{color:#6b7280;line-height:1.6;margin:0 0 32px;}
a{background:#1a1a2e;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;}
</style></head>
<body><div class="card">
<div class="icon">❌</div>
<h1>Verification failed</h1>
<p>${msg}</p>
<a href="https://parlami.chat">Go to Parlami →</a>
</div></body></html>`;
}
