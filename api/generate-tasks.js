// Generates 1 personalised Islamic task via Claude.
// Uses onboarding context + recent AI conversations for deep personalisation.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { onboardingContext, recentConversations = '' } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[generate-tasks] ANTHROPIC_API_KEY not set');
    return res.status(200).json({ tasks: [] });
  }

  const contextBlock = [
    onboardingContext ? `Onboarding answers: ${onboardingContext}` : '',
    recentConversations ? `Recent AI conversations (most relevant): ${recentConversations}` : '',
  ].filter(Boolean).join('\n\n');

  const prompt = `You are generating ONE specific, actionable Islamic self-improvement task for a Muslim based on their personal context.

${contextBlock ? `USER CONTEXT:\n${contextBlock}\n` : ''}

RULES FOR THE TASK:
- It must target their ACTUAL struggle, not a generic Islamic practice they already do consistently
- It must be something they can physically complete and tick off — not vague like "work on your prayers"
- It must be SPECIFIC: "Set an alarm tonight for 30 minutes before Fajr and place your phone across the room" not "improve your Fajr"
- Do NOT assign a prayer task if their onboarding says they already pray all 5 consistently — target their real weak point instead
- The task should be completable in one day (today or tomorrow)
- It should feel like it came from someone who knows them personally

Return ONLY a valid JSON array with exactly 1 task object:
- task_title: string (6-10 words, specific and actionable)
- task_description: string (20-35 words, practical, warm, no em dashes, no asterisks)
- task_type: exactly one of "prayer", "quran", "dhikr", "character", "relationship"

Example of a GOOD specific task:
[{"task_title":"Set your Fajr alarm before sleeping tonight","task_description":"Put your phone on the other side of the room tonight so you have to get up to turn off your alarm. Make wudu immediately when it goes off.","task_type":"prayer"}]

Example of a BAD vague task (never do this):
[{"task_title":"Work on improving your prayer habits","task_description":"Try to be more consistent with your prayers this week and focus on building better habits.","task_type":"prayer"}]

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
        max_tokens: 300,
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

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('[generate-tasks] No JSON found:', text);
      return res.status(200).json({ tasks: [] });
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log('[generate-tasks] Generated task:', tasks[0]?.task_title);
    return res.status(200).json({ tasks });
  } catch (e) {
    console.error('[generate-tasks] Error:', e.message);
    return res.status(200).json({ tasks: [] });
  }
}
