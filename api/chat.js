export default async function handler(req, res) {
  const { messages, system } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: system || 'You are a helpful assistant.',
        messages: messages || [],
      }),
    });
    const text = await response.text();
    console.log('Anthropic raw response:', text);
    const data = JSON.parse(text);
    return res.status(200).json({ text: data.content?.[0]?.text || 'error' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({ text: error.message });
  }
}
