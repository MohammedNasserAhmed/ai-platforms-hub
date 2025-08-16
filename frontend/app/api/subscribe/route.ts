import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest){
  try {
    const body = await req.json();
    const r = await fetch(`${BACKEND}/api/subscribe`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    const data = await r.json().catch(()=>({}));
    return NextResponse.json(data, { status: r.status });
  } catch (e:any){
    return NextResponse.json({ error: 'Subscription failed' }, { status:500 });
  }
}
