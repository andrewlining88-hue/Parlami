const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

function hashPw(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h) + pw.charCodeAt(i);
    h |= 0;
  }
  return 'h' + Math.abs(h).toString(36);
}

export default async function handler(req, res) {
  const { token } = req.query;

  if (req.method === 'GET') {
    if (!token) return res.status(400).send(errorPage('Invalid reset link.'));
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Reset Password - Parlami</title>
<style>
  body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf9f7;}
  .card{background:white;border-radius:24px;padding:48px 32px;max-width:400px;width:90%;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  h1{color:#1a1a2e;font-size:22px;margin:0 0 8px;text-align:center;}
  p{color:#6b7280;text-align:center;margin:0 0 28px;font-size:14px;}
  input{width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:15px;box-sizing:border-box;outline:none;margin-bottom:12px;}
  input:focus{border-color:#1a1a2e;}
  button{width:100%;padding:14px;background:#1a1a2e;color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;}
  .err{color:#dc2626;font-size:13px;text-align:center;margin-bottom:12px;display:none;}
</style>
</head>
<body>
<div class="card">
  <div style="text-align:center;font-size:32px;margin-bottom:24px;">🇮🇹</div>
  <h1>Set new password</h1>
  <p>Choose a new password for your Parlami account.</p>
  <div class="err" id="err"></div>
  <input type="password" id="pw" placeholder="New password" minlength="4"/>
  <input type="password" id="pw2" placeholder="Confirm password" minlength="4" style="margin-bottom:20px;"/>
  <button onclick="submit()">Update password</button>
</div>
<script>
async function submit(){
  const pw=document.getElementById('pw').value;
  const pw2=document.getElementById('pw2').value;
  const err=document.getElementById('err');
  err.style.display='none';
  if(pw.length<4){err.textContent='Password must be at least 4 characters.';err.style.display='block';return;}
  if(pw!==pw2){err.textContent='Passwords do not match.';err.style.display='block';return;}
  const r=await fetch('/api/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',password:pw})});
  const d=await r.json();
  if(d.success){document.body.innerHTML='<div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#faf9f7;"><div style="background:white;border-radius:24px;padding:48px 32px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><div style="font-size:48px;margin-bottom:16px;">✅</div><h1 style="color:#1a1a2e;margin:0 0 8px;">Password updated!</h1><p style="color:#6b7280;margin:0 0 28px;">You can now log in with your new password.</p><a href="/app" style="background:#1a1a2e;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;">Go to Parlami</a></div></div>';}
  else{err.textContent=d.error||'Something went wrong.';err.style.display='block';}
}
</script>
</body>
</html>`);
  }

  if (req.method === 'POST') {
    const { token: t, password } = req.body;
    if (!t || !password) return res.status(400).json({ error: 'Missing fields' });
    if (password.length < 4) return res.status(400).json({ error: 'Password too short' });
    try {
      const rows = await fetch(`${SUPABASE_URL}/rest/v1/students?reset_token=eq.${encodeURIComponent(t)}&limit=1`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      }).then(r => r.json());
      if (!rows || rows.length === 0) return res.status(400).json({ error: 'Invalid or expired reset link.' });
      await fetch(`${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(rows[0].email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ password_hash: hashPw(password), reset_token: null }),
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function errorPage(msg) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Error - Parlami</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#faf9f7;}.card{background:white;border-radius:24px;padding:48px 32px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);}</style></head><body><div class="card"><div style="font-size:48px;margin-bottom:16px;">❌</div><h1 style="color:#1a1a2e;">Invalid link</h1><p style="color:#6b7280;">${msg}</p><a href="/app" style="background:#1a1a2e;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;">Go to Parlami</a></div></body></html>`;
}
