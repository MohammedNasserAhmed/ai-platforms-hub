'use client';
import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Dashboard(){
  const [summary, setSummary] = useState<any>(null);
  const [subs, setSubs] = useState<any>(null);

  useEffect(()=>{ load(); }, []);
  async function load(){
    const [aRes, sRes] = await Promise.all([
      fetch(`${API}/analytics/summary`),
      fetch(`${API}/api/admin/subscribers/stats`, { headers: authHeaders() })
    ]);
    if(aRes.ok) setSummary(await aRes.json());
    if(sRes.ok) setSubs(await sRes.json());
  }

  function authHeaders(){ const t = typeof window !== 'undefined' ? localStorage.getItem('token') : ''; return { Authorization:`Bearer ${t}` }; }

  return (
    <AdminGuard>
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Analytics</h1>
      {summary && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 p-4">Total Visitors: {summary.totalVisitors}</div>
          <div className="rounded-xl border border-white/10 p-4 col-span-2">
            <h2 className="font-semibold mb-2">Clicks by Platform</h2>
            <ul className="space-y-1">
              {summary.clicks.map((c:any)=> (
                <li key={c.platformId} className="text-sm opacity-90">Platform #{c.platformId}: {c._count.platformId}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {subs && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 p-4">Subscribers: {subs.total}</div>
          <div className="rounded-xl border border-white/10 p-4">Confirmed: {subs.confirmed}</div>
          <div className="rounded-xl border border-white/10 p-4">Pending: {subs.pending}</div>
          <div className="md:col-span-3 rounded-xl border border-white/10 p-4">Confirmation Rate: {(subs.confirmationRate*100).toFixed(1)}%</div>
        </div>
      )}
    </main>
    </AdminGuard>
  );
}
