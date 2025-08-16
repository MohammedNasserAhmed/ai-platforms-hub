"use client";
import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import { useToast } from '../../components/ToastProvider';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface Subscriber { id:number; email:string; createdAt:string; confirmed?:boolean; }

export default function SubscribersPage(){
  const [items, setItems] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const auth = { Authorization:`Bearer ${token}` } as any;

  async function load(){
    setLoading(true);
    try {
      const [listRes, statRes] = await Promise.all([
        fetch(`${API}/api/admin/subscribers`, { headers: auth }),
        fetch(`${API}/api/admin/subscribers/stats`, { headers: auth })
      ]);
      if(listRes.ok) setItems(await listRes.json());
      if(statRes.ok) setStats(await statRes.json());
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function resend(id:number){
    const r = await fetch(`${API}/api/admin/subscribers/${id}/resend`, { method:'POST', headers: auth });
    if(r.ok){ push({ message:'Confirmation email resent', type:'success'}); load(); }
  }
  async function remove(id:number){
    if(!confirm('Delete subscriber?')) return;
    const r = await fetch(`${API}/api/admin/subscribers/${id}`, { method:'DELETE', headers: auth });
    if(r.ok){ push({ message:'Subscriber removed', type:'info'}); setItems(items=>items.filter(i=>i.id!==id)); load(); }
  }

  return <AdminGuard>
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <button onClick={load} className="text-sm underline">Refresh</button>
      </div>
      {stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 p-4">Total<br/><span className="text-lg font-semibold">{stats.total}</span></div>
        <div className="rounded-xl border border-white/10 p-4">Confirmed<br/><span className="text-lg font-semibold">{stats.confirmed}</span></div>
        <div className="rounded-xl border border-white/10 p-4">Pending<br/><span className="text-lg font-semibold">{stats.pending}</span></div>
        <div className="rounded-xl border border-white/10 p-4">Rate<br/><span className="text-lg font-semibold">{(stats.confirmationRate*100).toFixed(1)}%</span></div>
      </div>}
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-white/5">
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
              <th className="p-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s=> <tr key={s.id} className="border-t border-white/10">
              <td className="p-2 font-medium">{s.email}</td>
              <td className="p-2">{s.confirmed ? <span className="text-green-400">Confirmed</span> : <span className="text-yellow-300">Pending</span>}</td>
              <td className="p-2 opacity-70">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                {!s.confirmed && <button onClick={()=>resend(s.id)} className="underline text-xs">Resend</button>}
                <button onClick={()=>remove(s.id)} className="underline text-xs text-red-300">Delete</button>
              </td>
            </tr>)}
            {items.length===0 && !loading && <tr><td colSpan={4} className="p-4 text-center opacity-60">No subscribers</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  </AdminGuard>;
}
