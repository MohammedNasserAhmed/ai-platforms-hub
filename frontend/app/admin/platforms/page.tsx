'use client';
import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PlatformsAdmin(){
  const [items, setItems] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const auth = { Authorization: `Bearer ${token}` } as any;

  async function load(){ const r = await fetch(`${API}/api/admin/platforms`, { headers: auth }); if(r.ok) setItems(await r.json()); }
  useEffect(()=>{ load(); }, []);

  async function remove(id:number){
  const res = await fetch(`${API}/api/admin/platforms/${id}`, { method:'DELETE', headers: auth });
    if (res.ok) load();
  }

  return (
    <AdminGuard>
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Platforms</h1>
        <a href="/admin/platforms/new" className="text-sm underline">Add New (separate page)</a>
      </div>
  <p className="text-sm opacity-70 mb-4">Use the separate Add New page to create platforms. You can still delete existing ones here.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.id} className="rounded-xl border border-white/10 p-4">
            <div className="font-semibold">{it.name}</div>
            <div className="text-xs opacity-70">{it.url}</div>
            <div className="mt-3 flex gap-3 text-xs">
              <a href={`/admin/platforms/${it.id}/edit`} className="underline">Edit</a>
              <button onClick={()=>remove(it.id)} className="underline text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
    </AdminGuard>
  );
}