"use client";
import { useEffect, useState } from 'react';

// Simple admin auth guard: checks localStorage token presence optionally ping /admin/me
export default function AdminGuard({ children }: { children?: React.ReactNode }) {
	const [ok, setOk] = useState(false);
	const [loading, setLoading] = useState(true);
	const API = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) { setLoading(false); return; }
		fetch(`${API}/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => { if (r.ok) setOk(true); })
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [API]);

	if (loading) return <div className="p-6 text-sm opacity-70">Checking auth…</div>;
	if (!ok) return <div className="p-6 text-sm opacity-70">Not authorized.</div>;
	return <>{children}</>;
}
