'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <button onClick={() => setDark(!dark)} className="rounded-2xl px-3 py-1 text-xs border border-white/20 hover:bg-white/10 transition">
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
