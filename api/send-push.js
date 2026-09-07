import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:hello@parlami.chat',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { subscription, title, body, url, tag } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing subscription' });
  }
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: title || 'Parlami', body: body || '', url: url || '/app', tag: tag || 'parlami-reminder' })
    );
    return res.status(200).json({ sent: true });
  } catch (error) {
    // 410/404 means the subscription is dead (user uninstalled, cleared permissions, etc.)
    const expired = error.statusCode === 410 || error.statusCode === 404;
    console.error('Push send error:', error.statusCode, error.message);
    return res.status(expired ? 410 : 500).json({ error: error.message, expired });
  }
}
