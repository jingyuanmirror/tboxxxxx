export const runtime = 'edge';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL;

  // Test upstream connectivity
  let upstreamStatus: string;
  try {
    const resp = await fetch(`${baseUrl ?? 'https://api.openai.com/v1'}/models`, {
      headers: { Authorization: `Bearer ${key ?? ''}` },
    });
    const text = await resp.text();
    upstreamStatus = `HTTP ${resp.status}: ${text.slice(0, 200)}`;
  } catch (e: any) {
    upstreamStatus = `fetch error: ${e?.message}`;
  }

  return Response.json({
    hasKey: !!key,
    keyPrefix: key ? key.slice(0, 12) + '...' : null,
    baseUrl,
    model,
    upstreamStatus,
  });
}
