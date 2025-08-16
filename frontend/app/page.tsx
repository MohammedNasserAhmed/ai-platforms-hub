'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubscribeForm from './components/SubscribeForm';
import PlatformCard from './components/PlatformCard';
import CategoryChips from './components/CategoryChips';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type Platform = { id:number; name:string; url:string; imageUrl:string; description:string; category:string; clickCount:number };

export default function Page(){
  const [items, setItems] = useState<Platform[]>([]);
  const [category, setCategory] = useState<string|undefined>(undefined);
  const [q, setQ] = useState('');

  useEffect(()=>{ fetch(`${API}/analytics/visit`, { method: 'POST' }); }, []);

  useEffect(()=>{ load(); }, [category, q]);
  async function load(){
    const url = new URL(`${API}/platforms`);
    if (category) url.searchParams.set('category', category);
    if (q) url.searchParams.set('q', q);
    const res = await fetch(url.toString());
    const data = await res.json();
    // add trending based on last 7 days (rough approximation client-side optional)
    setItems(data.map((d:any)=> ({...d, trending: d.clickCount >= 10 })));
  }

  const categories = useMemo(()=> Array.from(new Set(items.map(i=>i.category))), [items]);

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-14">
      <div className="particle-layer" id="particles" />
      <header className="text-center space-y-4 fade-in">
        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.9, ease:'easeOut' }} className="text-5xl md:text-6xl font-black gradient-text leading-tight">
          Discover <span className="whitespace-nowrap">AI Platforms</span>
        </motion.h1>
        <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2, duration:.8 }} className="opacity-80 max-w-2xl mx-auto text-sm md:text-base">
          Curated tools for research, creativity, productivity and more—updated continuously.
        </motion.p>
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.35, duration:.7 }} className="pt-2">
          <SubscribeForm />
        </motion.div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.5 }} className="mt-6 flex items-center justify-center gap-2">
          <input placeholder="Search platforms…" value={q} onChange={e=>setQ(e.target.value)} className="rounded-2xl px-5 py-3 text-black w-80 shadow-lg" />
        </motion.div>
      </header>

      <section className="mt-14">
        <CategoryChips categories={categories} active={category} onSelect={setCategory} />
        <motion.div layout className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence initial={false}>
            {items.map(p=> (
              <motion.div key={p.id} layout initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.9 }} transition={{ duration:.35 }}>
                <PlatformCard p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </main>
  );
}
