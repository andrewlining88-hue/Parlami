import webpush from 'web-push';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

webpush.setVapidDetails(
  'mailto:hello@parlami.chat',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sb = async (path, method = 'GET', body = null) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: body ? JSON.stringify(body) : null,
  };
  if (method === 'PATCH') opts.headers['Prefer'] = 'return=representation';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
};

// Dante-voiced message templates, varied so daily reminders don't feel identical/robotic
const streakMessages = (name, streak) => [
  { title: 'Il tuo streak ti aspetta! 🔥', body: `${name}, hai una serie di ${streak} giorni — non perderla oggi!` },
  { title: 'Dante here! 👋', body: `${streak} giorni di fila, ${name}! Bastano pochi minuti per continuare.` },
  { title: 'Non fermarti ora! 🇮🇹', body: `${name}, il tuo streak di ${streak} giorni ti aspetta. Facciamo due chiacchiere?` },
];
const checkinMessages = (name) => [
  { title: 'Ciao! Mi sei mancato 💬', body: `${name}, è un po' che non ci sentiamo — come va l'italiano?` },
  { title: 'Dante here! 🇮🇹', body: `Ciao ${name}! Hai qualche minuto per fare due chiacchiere in italiano?` },
  { title: 'Bentornato/a? 😊', body: `${name}, quando vuoi riprendere, sono qui — anche solo per 5 minuti!` },
];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const students = await sb('students?select=email,name,streak,last_date,push_subscription,last_reminder_date');
    const today = new Date().toISOString().slice(0, 10);
    const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

    let sent = 0, expired = 0, skipped = 0;

    for (const s of students || []) {
      if (!s.push_subscription || !s.push_subscription.endpoint) { skipped++; continue; }
      if (s.last_date === today) { skipped++; continue; } // already practiced today
      if (s.last_reminder_date === today) { skipped++; continue; } // already reminded today (safety against double cron runs)

      const daysSince = s.last_date ? daysBetween(s.last_date, today) : null;
      let msg = null;

      if (s.streak >= 2 && daysSince === 1) {
        msg = pick(streakMessages(s.name ? s.name.split(' ')[0] : 'Ciao', s.streak));
      } else if (daysSince === 2 || daysSince === 3) {
        msg = pick(checkinMessages(s.name ? s.name.split(' ')[0] : 'Ciao'));
      }

      if (!msg) { skipped++; continue; }

      try {
        await webpush.sendNotification(
          s.push_subscription,
          JSON.stringify({ title: msg.title, body: msg.body, url: '/app', tag: 'parlami-reminder' })
        );
        sent++;
        await sb(`students?email=eq.${encodeURIComponent(s.email)}`, 'PATCH', { last_reminder_date: today });
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired++;
          await sb(`students?email=eq.${encodeURIComponent(s.email)}`, 'PATCH', { push_subscription: null });
        }
      }
    }

    return res.status(200).json({ sent, expired, skipped, total: (students || []).length });
  } catch (error) {
    console.error('Cron reminders error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
