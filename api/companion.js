// Node.js runtime — most reliable for streaming on Vercel
// Uses raw fetch() to Anthropic API instead of the SDK to avoid edge-compat issues

export default async function handler(req, res) {
  console.log('[companion] ▶ request received, method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  const { messages, staticPrompt, personalContext } = req.body || {};

  console.log('[companion] messages count:', messages?.length ?? 'missing');
  console.log('[companion] staticPrompt chars:', staticPrompt?.length ?? 'missing');
  console.log('[companion] personalContext chars:', personalContext?.length ?? 'missing');

  if (!Array.isArray(messages) || !staticPrompt || !personalContext) {
    console.error('[companion] ✗ missing messages, staticPrompt, or personalContext');
    return res.status(400).json({ error: 'Missing messages, staticPrompt, or personalContext' });
  }

  // ── API key check ─────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('[companion] API key present:', !!apiKey, '| prefix:', apiKey?.slice(0, 10));

  if (!apiKey) {
    console.error('[companion] ✗ ANTHROPIC_API_KEY is not set in environment');
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured on the server. Add it in Vercel → Settings → Environment Variables.',
    });
  }

  // ── Stream headers ────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // send headers immediately so the client starts reading

  try {
    console.log('[companion] → calling Anthropic API (claude-sonnet-4-6, stream:true)');

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        stream: true,
        system: [
          // Static instructions — cached for 5 min across all users (saves ~90% of prompt tokens)
          { type: 'text', text: staticPrompt, cache_control: { type: 'ephemeral' } },
          // Personal context — changes per user/day, never cached
          { type: 'text', text: personalContext },
        ],
        messages,
      }),
    });

    console.log('[companion] ← Anthropic HTTP status:', anthropicRes.status);

    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text();
      console.error('[companion] ✗ Anthropic error body:', errorText);
      res.write(`data: ${JSON.stringify({ error: `Anthropic API error (${anthropicRes.status}): ${errorText}` })}\n\n`);
      return res.end();
    }

    // ── Re-stream Anthropic's SSE → client ───────────────────────────────
    const reader = anthropicRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let deltaCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();

        if (raw === '[DONE]') {
          console.log('[companion] ✓ stream complete, deltas sent:', deltaCount);
          res.write('data: [DONE]\n\n');
          break;
        }

        try {
          const event = JSON.parse(raw);
          if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta'
          ) {
            deltaCount++;
            res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`);
          }
        } catch {
          // skip ping / non-JSON lines silently
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('[companion] ✗ fetch/stream error:', err.message, err.stack);
    res.write(`data: ${JSON.stringify({ error: `Server error: ${err.message}` })}\n\n`);
    res.end();
  }
}
