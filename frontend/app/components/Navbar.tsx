'use client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">AI Platforms Radar</Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm hover:underline">Admin</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}