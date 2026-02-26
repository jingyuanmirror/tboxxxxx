import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured: missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Forward conversation to OpenAI Chat Completions API
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_MODEL, messages, max_tokens: 800 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
