import { NextResponse } from 'next/server';

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
            // only parse first found metadata (stop after first)
            break;
          }
        }
      }
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured: missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Forward conversation to OpenAI-compatible Chat Completions API (supports ZenMux)
    // If metadata was parsed, inject it as a system message so the model gets structured context
    const forwardMessages = Array.isArray(messages) ? [...messages] : [];
    if (parsedMetadata) {
      forwardMessages.unshift({ role: 'system', content: `METADATA: ${JSON.stringify(parsedMetadata)}` });
    }

    const resp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: forwardMessages, max_tokens: 800 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    // return parsed metadata to caller for optional client-side handling
    return NextResponse.json({ reply, metadata: parsedMetadata });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
