import Anthropic from '@anthropic-ai/sdk';

// Vercel Edge runtime — streams natively, no response buffering
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // ── Method guard ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let messages, systemPrompt;
  try {
    ({ messages, systemPrompt } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!messages || !systemPrompt) {
    return new Response(JSON.stringify({ error: 'Missing messages or systemPrompt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── API key guard ─────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Stream Claude → SSE → client ──────────────────────────────────────────
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({ apiKey });

        const stream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: [
            { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
          ],
          messages,
        });

        // Forward each text delta as an SSE event
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta'
          ) {
            const data = JSON.stringify({ delta: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        console.error('Companion stream error:', err);
        const data = JSON.stringify({ error: err.message ?? 'Unknown error' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // disable nginx buffering if proxied
    },
  });
}
