// Generates 2 personalised Islamic tasks via Claude.
// All Supabase operations (fetching templates, inserting tasks) are handled client-side.
// This function only calls the Anthropic API and returns the personalised task objects.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { onboardingContext } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[generate-tasks] ANTHROPIC_API_KEY not set');
    return res.status(200).json({ tasks: [] }); // graceful fallback
  }

  const prompt = `Generate 2 personalised Islamic self-improvement tasks for a Muslim.${onboardingContext ? ` User context: ${onboardingContext}` : ''}

Return ONLY a valid JSON array with exactly 2 task objects. Each object must have:
- task_title: string (5-8 words, specific and actionable)
- task_description: string (15-25 words, practical and encouraging, no em dashes)
- task_type: exactly one of "prayer", "quran", "dhikr", "character", "relationship"

Example:
[{"task_title":"Complete tasbeeh after every prayer","task_description":"Say Subhanallah, Alhamdulillah, and Allahu Akbar 33 times each after every salah today.","task_type":"dhikr"},{"task_title":"Call a parent this evening","task_description":"Spend 10 minutes speaking with a parent or elder relative to strengthen your family bonds this week.","task_type":"relationship"}]

Return only the JSON array. No explanation, no markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[generate-tasks] Anthropic error:', response.status, errText);
      return res.status(200).json({ tasks: [] });
    }

    const data = await response.json();
    const text = (data.content?.[0]?.text || '').trim();

    // Extract JSON array even if Claude adds any surrounding text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('[generate-tasks] No JSON array found in response:', text);
      return res.status(200).json({ tasks: [] });
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log('[generate-tasks] Generated', tasks.length, 'personalised tasks');
    return res.status(200).json({ tasks });
  } catch (e) {
    console.error('[generate-tasks] Error:', e.message);
    return res.status(200).json({ tasks: [] }); // always return 200 so client degrades gracefully
  }
}
