import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skill, model } = body || {};

    // TODO: integrate with real skill runners. For now return a mock response.
    const result = `已调用智能体：${skill}，使用模型：${model}。（模拟结果）`;

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
}

export const runtime = 'nodejs';
