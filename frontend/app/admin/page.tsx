'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function AdminLogin(){
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function login(e: React.FormEvent){
    e.preventDefault();
    setError('');
    const res = await fetch(`${API}/admin/login`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password })});
    if (!res.ok) { setError('Invalid'); return; }
    const { token } = await res.json();
    localStorage.setItem('token', token);
    window.location.href = '/admin/dashboard';
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={login} className="flex flex-col gap-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} className="rounded-xl px-4 py-3 text-black" placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded-xl px-4 py-3 text-black" placeholder="Password" />
        <button className="rounded-xl px-4 py-3 border border-white/20 hover:bg-white/10">Login</button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </form>
    </main>
  );
}
