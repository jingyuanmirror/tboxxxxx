import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spaceName, spaceGoal, milestone, manifesto } = body ?? {};

    if (!spaceName || !spaceGoal || !milestone?.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    const fallbackSummary = `阶段「${milestone.title}」已完成：已绑定 ${Array.isArray(milestone.deliverables) ? milestone.deliverables.length : 0} 个交付物，并确认其结论可复用于下一阶段执行。`;
    const fallbackNextContext = `请在后续阶段严格遵循项目意图与约束，优先沿用已完成阶段「${milestone.title}」的结论，避免重复定义问题。`;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        stageSummary: fallbackSummary,
        nextPhaseContext: fallbackNextContext,
        usedFallback: true,
      });
    }

    const systemPrompt = `你是项目管理助手。请基于输入，生成两段中文内容：
1) stageSummary：一句到两句，概括当前里程碑已完成的核心结论。
2) nextPhaseContext：一句到两句，说明下一阶段应继承的背景与边界。
要求：
- 简洁、可执行，不要空话；
- 不要捏造未提供事实；
- 必须体现“目标、标准、约束”的延续；
- 输出 JSON，字段为 stageSummary 和 nextPhaseContext。`;

    const userPrompt = JSON.stringify(
      {
        project: {
          name: spaceName,
          goal: spaceGoal,
          manifesto,
        },
        milestone,
      },
      null,
      2
    );

    const resp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 350,
        response_format: {
          type: 'json_object',
        },
      }),
    });

    if (!resp.ok) {
      return NextResponse.json({
        stageSummary: fallbackSummary,
        nextPhaseContext: fallbackNextContext,
        usedFallback: true,
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        stageSummary: fallbackSummary,
        nextPhaseContext: fallbackNextContext,
        usedFallback: true,
      });
    }

    let parsed: { stageSummary?: string; nextPhaseContext?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      stageSummary: parsed.stageSummary?.trim() || fallbackSummary,
      nextPhaseContext: parsed.nextPhaseContext?.trim() || fallbackNextContext,
      usedFallback: !parsed.stageSummary || !parsed.nextPhaseContext,
    });
  } catch (error) {
    console.error('[milestone-summary] error:', error);
    return NextResponse.json(
      {
        stageSummary: '阶段已完成，建议在进入下一阶段前确认交付物结论与边界是否一致。',
        nextPhaseContext: '下一阶段将默认继承项目宪法中的意图、标准与约束，请避免重复定义。',
        usedFallback: true,
      },
      { status: 200 }
    );
  }
}
