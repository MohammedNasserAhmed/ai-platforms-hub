'use client';
import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Dashboard(){
  const [summary, setSummary] = useState<any>(null);

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await fetch(`${API}/analytics/summary`);
    const data = await res.json();
    setSummary(data);
  }

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
    </main>
    </AdminGuard>
  );
}
