'use client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  useEffect(()=>{ if(typeof window!== 'undefined'){ setAuthed(!!localStorage.getItem('token')); } }, []);
  function logout(){ localStorage.removeItem('token'); setAuthed(false); }
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">AI Platforms Radar</Link>
        <div className="flex items-center gap-4">
          {authed && <>
            <Link href="/admin/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/admin/platforms" className="text-sm hover:underline">Platforms</Link>
            <Link href="/admin/subscribers" className="text-sm hover:underline">Subscribers</Link>
            <button onClick={logout} className="text-sm hover:underline opacity-70">Logout</button>
          </>}
          <Link href="/admin" className="text-sm hover:underline">Admin</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}