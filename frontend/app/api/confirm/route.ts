import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  if(!token || !email) return NextResponse.json({ error: 'Missing parameters' }, { status:400 });
  try {
    const r = await fetch(`${BACKEND}/api/confirm?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
    const data = await r.json().catch(()=>({}));
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: 'Confirmation failed' }, { status:500 });
  }
}
