export async function POST(req: Request){
	try {
		const body = await req.json().catch(()=> ({}));
		// forward to backend central endpoint if env configured
		const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
		const token = (body && (body as any).token) || undefined; // optional pass-through
		try {
			await fetch(`${backend}/revalidate`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ paths: body.paths||['/'] }) });
		} catch {}
		return Response.json({ revalidated: true, paths: body.paths||['/'] });
	} catch {
		return Response.json({ revalidated: false }, { status: 500 });
	}
}