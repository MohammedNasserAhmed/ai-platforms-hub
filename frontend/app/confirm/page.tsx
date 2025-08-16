'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ConfirmPage(){
  const [status, setStatus] = useState<'loading'|'confirmed'|'already'|'expired'|'invalid'|'error'>('loading');

  useEffect(()=>{
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    if(!token || !email){ setStatus('invalid'); return; }
    (async()=>{
      try {
        const r = await fetch(`${API}/api/confirm?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await r.json();
        if (r.ok) {
          if (data.status === 'already-confirmed') setStatus('already');
          else setStatus('confirmed');
        } else {
          if (data.status === 'expired') setStatus('expired');
          else if (data.status === 'invalid') setStatus('invalid');
          else setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    })();
  },[]);

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
      <h1 className="text-4xl font-bold gradient-text">Email Confirmation</h1>
      {status === 'loading' && <p className="opacity-80 animate-pulse">Confirming…</p>}
      {status === 'confirmed' && <p className="text-green-400">Success! Your subscription is confirmed.</p>}
      {status === 'already' && <p className="text-blue-400">Already confirmed. Welcome back!</p>}
      {status === 'expired' && <p className="text-yellow-400">This confirmation link expired. Please re-subscribe.</p>}
      {status === 'invalid' && <p className="text-red-400">Invalid confirmation link.</p>}
      {status === 'error' && <p className="text-red-400">Unexpected error verifying your email.</p>}
      <a href="/" className="underline opacity-80">Return Home</a>
    </main>
  );
}
