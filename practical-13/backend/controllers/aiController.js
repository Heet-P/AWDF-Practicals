const OpenAI = require('openai');

// The key lives only here on the server (.env). The browser never sees it:
// React calls our own /api/ai endpoint, and this file calls OpenAI.
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 10_000, maxRetries: 1 })
  : null;

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const PRIORITIES = ['low', 'medium', 'high'];

// Graceful degradation: when the AI is unavailable, answer 200 with fallback: true
// so the task form keeps working and the UI can show a friendly message.
const fallback = (res, reason) => {
  console.warn(`[AI] fallback: ${reason}`);
  res.status(200).json({ description: '', priority: null, fallback: true });
};

// POST /api/ai/suggest  { title } -> { description, priority, fallback }
exports.suggest = async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (title.length > 120) return res.status(400).json({ error: 'title must be 120 characters or fewer' });

  if (!client) return fallback(res, 'OPENAI_API_KEY is not set');

  try {
    // Privacy: only the task title is sent — never the user's email, id or other tasks
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content:
            'You help students plan tasks. Reply with JSON only: ' +
            '{"description": "1-2 short, practical sentences describing how to do the task", ' +
            '"priority": "low" | "medium" | "high"}.',
        },
        { role: 'user', content: `Task title: ${title}` },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const description = typeof parsed.description === 'string' ? parsed.description.trim().slice(0, 500) : '';
    const priority = PRIORITIES.includes(parsed.priority) ? parsed.priority : null;
    if (!description) return fallback(res, 'empty response from model');

    res.status(200).json({ description, priority, fallback: false });
  } catch (err) {
    // Invalid key (401), quota (429), timeout, network or bad JSON all end up here
    fallback(res, err.status ? `OpenAI responded ${err.status}` : err.message);
  }
};
