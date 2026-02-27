import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, taskContext } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured: missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Build the system prompt from task context
    const systemPrompt = `你是 ${taskContext.publisherName} 的智能助理「${taskContext.agentName}」，正在代理回答关于以下招募任务的问题。

【任务标题】：${taskContext.title}
【任务描述】：${taskContext.description}
【任务类别】：${taskContext.category}
【所需技能】：${taskContext.requiredSkills || '无特殊要求'}
【预算范围】：${taskContext.budget || '面议'}
【截止时间】：${taskContext.deadline || '待定'}

你的职责：
1. 用专业、友好的语气解答来访者关于任务的任何问题；
2. 根据来访者描述的能力，判断其是否适合接单（若不合适可委婉说明）；
3. 若来访者表达接单意向，引导其点击页面上的「立即接单」按钮；
4. 不得捏造任务信息；若遇到你无法确定的问题，告知「需要我向发布方确认后回复」；
5. 回答尽量简洁（3–5 句话为宜），避免冗长。

请始终以「${taskContext.agentName}」的身份进行回复，不要自称为 AI 或 GPT。`;

    const forwardMessages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(messages) ? messages : []),
    ];

    const resp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: forwardMessages,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text }, { status: resp.status });
    }

    // Stream back to client
    return new Response(resp.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[negotiate] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
