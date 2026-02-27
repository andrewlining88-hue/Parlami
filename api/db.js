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
  saved_words: d.savedWords || [],
  message_count: d.messageCount || 0,
  progress: d.progress || 0,
  badge_count: d.badgeCount || 0,
  last_monthly_clean: d.lastMonthlyClean || '',
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
  savedWords: d.saved_words || [],
  messageCount: d.message_count || 0,
  progress: d.progress || 0,
  badgeCount: d.badge_count || 0,
  lastMonthlyClean: d.last_monthly_clean || '',
});

export default async function handler(req, res) {
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
