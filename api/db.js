import webpush from 'web-push';

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

const toDb = (d) => ({
  email: d.email,
  name: d.name,
  password_hash: d.passwordHash,
  level: d.level,
  messages: d.messages || [],
  badges: d.badges || [],
  streak: d.streak || 0,
  last_date: d.lastDate || null,
  tests_passed: d.testsPassed || [],
  test_failed_at: d.testFailedAt || {},
  vocab_count: d.vocabCount || 0,
  lesson_note: d.lessonNote || '',
  lesson_note_date: d.lessonNoteDate || '',
  note_history: d.noteHistory || [],
  lesson_vocab: d.lessonVocab || '',
  vocab_history: d.vocabHistory || [],
  recurring_mistakes: d.recurringMistakes || [],
  tip_log: d.tipLog || [],
  daily_goal: d.dailyGoal || 10,
  total_msg_count: d.totalMsgCount || 0,
  lifetime_msg_count: d.lifetimeMsgCount || 0,
  saved_words: d.savedWords || [],
  message_count: d.messageCount || 0,
  progress: d.progress || 0,
  badge_count: d.badgeCount || 0,
  last_monthly_clean: d.lastMonthlyClean || '',
  todays_words: d.todaysWords || [],
  student_report: d.studentReport || null,
  categorized_vocab: d.categorizedVocab || {},
  has_reviewed: d.hasReviewed || false,
  push_subscription: d.pushSubscription || null,
  ...(d.subscriptionStatus !== undefined ? { subscription_status: d.subscriptionStatus } : {}),
  ...(d.stripeCustomerId !== undefined ? { stripe_customer_id: d.stripeCustomerId } : {}),
  ...(d.isPreplyStudent !== undefined ? { is_preply_student: d.isPreplyStudent } : {}),
  ...(d.trialStart !== undefined ? { trial_start: d.trialStart } : {}),
});

const fromDb = (d) => ({
  email: d.email,
  name: d.name,
  passwordHash: d.password_hash,
  level: d.level,
  messages: d.messages || [],
  badges: d.badges || [],
  streak: d.streak || 0,
  lastDate: d.last_date,
  testsPassed: d.tests_passed || [],
  testFailedAt: d.test_failed_at || {},
  vocabCount: d.vocab_count || 0,
  lessonNote: d.lesson_note || '',
  lessonNoteDate: d.lesson_note_date || '',
  noteHistory: d.note_history || [],
  lessonVocab: d.lesson_vocab || '',
  vocabHistory: d.vocab_history || [],
  recurringMistakes: d.recurring_mistakes || [],
  tipLog: d.tip_log || [],
  dailyGoal: d.daily_goal || 10,
  totalMsgCount: d.total_msg_count || 0,
  lifetimeMsgCount: d.lifetime_msg_count != null ? d.lifetime_msg_count : (d.total_msg_count || 0),
  savedWords: d.saved_words || [],
  messageCount: d.message_count || 0,
  progress: d.progress || 0,
  badgeCount: d.badge_count || 0,
  lastMonthlyClean: d.last_monthly_clean || '',
  emailVerified: d.email_verified || false,
  verificationToken: d.verification_token || null,
  todaysWords: d.todays_words || [],
  studentReport: d.student_report || null,
  categorizedVocab: d.categorized_vocab || {},
  hasReviewed: d.has_reviewed || false,
  pushSubscription: d.push_subscription || null,
  subscriptionStatus: d.subscription_status || 'free',
  stripeCustomerId: d.stripe_customer_id || null,
  isPreplyStudent: d.is_preply_student || false,
  trialStart: d.trial_start || null,
});

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

async function runCronReminders(res) {
  webpush.setVapidDetails('mailto:hello@parlami.chat', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  try {
    const students = await sb('students?select=email,name,streak,last_date,push_subscription,last_reminder_date');
    const today = new Date().toISOString().slice(0, 10);
    const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
    let sent = 0, expired = 0, skipped = 0;
    for (const s of students || []) {
      if (!s.push_subscription || !s.push_subscription.endpoint) { skipped++; continue; }
      if (s.last_date === today) { skipped++; continue; }
      if (s.last_reminder_date === today) { skipped++; continue; }
      const daysSince = s.last_date ? daysBetween(s.last_date, today) : null;
      let msg = null;
      if (s.streak >= 2 && daysSince === 1) msg = pick(streakMessages(s.name ? s.name.split(' ')[0] : 'Ciao', s.streak));
      else if (daysSince === 2 || daysSince === 3) msg = pick(checkinMessages(s.name ? s.name.split(' ')[0] : 'Ciao'));
      if (!msg) { skipped++; continue; }
      try {
        await webpush.sendNotification(s.push_subscription, JSON.stringify({ title: msg.title, body: msg.body, url: '/app', tag: 'parlami-reminder' }));
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

export default async function handler(req, res) {
  // Vercel's cron scheduler is the only caller that sends this exact header — safe to branch on it
  if (req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`) {
    return runCronReminders(res);
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { action, data } = req.body;
  try {
    if (action === 'get') {
      const rows = await sb(`students?email=eq.${encodeURIComponent(data.email)}&limit=1`);
      return res.status(200).json({ student: rows?.[0] ? fromDb(rows[0]) : null });
    }
    if (action === 'save') {
      const dbData = toDb(data);
      const rows = await sb(`students?email=eq.${encodeURIComponent(data.email)}`);
      if (rows && rows.length > 0) {
        const updated = await sb(`students?email=eq.${encodeURIComponent(data.email)}`, 'PATCH', dbData);
        return res.status(200).json({ student: updated?.[0] ? fromDb(updated[0]) : data });
      } else {
        const created = await sb('students', 'POST', dbData);
        return res.status(200).json({ student: created?.[0] ? fromDb(created[0]) : data });
      }
    }
    if (action === 'delete') {
      await sb(`students?email=eq.${encodeURIComponent(data.email)}`, 'DELETE');
      return res.status(200).json({ success: true });
    }
    if (action === 'list') {
      const rows = await sb('students?order=created_at.asc');
      return res.status(200).json({ students: (rows || []).map(fromDb) });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('DB error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
