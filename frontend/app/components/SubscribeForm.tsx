'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API}/subscribers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setLoading(false);
    if (res.ok) { setOk(true); setEmail(''); confetti(); }
  }

  function confetti() {
    // minimal confetti (emoji)
    const el = document.createElement('div');
    el.textContent = '🎉';
    el.style.position = 'fixed'; el.style.left = '50%'; el.style.top = '20%'; el.style.fontSize = '3rem';
    el.style.transition = 'all 1s ease';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translate(-50%, -30px)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 1000);
  }

  return (
    <form onSubmit={submit} className="mt-6 flex gap-2">
      <input type="email" required placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)}
        className="rounded-2xl px-4 py-3 w-72 text-black"/>
      <button disabled={loading} className="rounded-2xl px-5 py-3 border border-white/20 bg-white/10 hover:bg-white/20 transition animate-pulse disabled:opacity-50">
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
      {ok && <span className="text-sm opacity-80 self-center">Thanks! Check your inbox.</span>}
    </form>
  );
}
