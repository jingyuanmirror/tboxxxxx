export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { messages } = body;

    // Parse metadata prefix in incoming user messages. Expected prefix format:
    // 【tool_mode:xxx sub_tool:yyy】 <rest of message>
    const metaRe = /^【\s*tool_mode:([^\s】]+)\s+sub_tool:([^\s】]*)】\s*/;
    let parsedMetadata: { tool_mode?: string; sub_tool?: string } | null = null;
    if (Array.isArray(messages) && messages.length > 0) {
      messages = messages.map((m: any) => ({ ...m }));
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (m?.role === 'user' && typeof m.content === 'string') {
          const match = m.content.match(metaRe);
          if (match) {
            const tool_mode = match[1] || undefined;
            const sub_tool = match[2] || undefined;
            parsedMetadata = { tool_mode, sub_tool };
            // strip prefix from content
            m.content = m.content.replace(metaRe, '');
            break;
          }
        }
      }
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfigured: missing OPENAI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages for the upstream API
    const forwardMessages = Array.isArray(messages) ? [...messages] : [];
    if (parsedMetadata) {
      forwardMessages.unshift({ role: 'system', content: `METADATA: ${JSON.stringify(parsedMetadata)}` });
    }

    const upstreamResp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: forwardMessages,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!upstreamResp.ok) {
      const text = await upstreamResp.text();
      return new Response(JSON.stringify({ error: text }), {
        status: upstreamResp.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pipe the SSE stream from upstream directly to the client
    const upstreamBody = upstreamResp.body;
    if (!upstreamBody) {
      return new Response(JSON.stringify({ error: 'Empty upstream response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(upstreamBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
