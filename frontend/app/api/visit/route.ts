import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function POST(_req: NextRequest) {
  try {
    const r = await fetch(`${BACKEND}/analytics/visit`, { method: 'POST' });
    const data = await r.json().catch(()=>({ ok: true }));
    return NextResponse.json(data, { status: r.status });
  } catch {
    // degrade silently
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
