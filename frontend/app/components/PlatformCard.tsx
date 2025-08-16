'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PlatformCard({ p }:{ p: any }){
  const [count, setCount] = useState(p.clickCount || 0);
  const [imgSrc, setImgSrc] = useState<string>(p.imageUrl);

  async function handleClick(){
    // optimistic pop animation
  setCount((v: number) => v + 1);
    fetch(`${API}/analytics/click/${p.id}`, { method: 'POST' })
      .then(r=>r.json()).then(({ count })=> setCount(count)).catch(()=>{});
    window.open(p.url, '_blank');
  }

  return (
    <motion.div
      whileHover={{ y:-8, rotate:-0.4, scale:1.02 }}
      initial={{ opacity:0, y:10 }}
      whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:.4 }}
      transition={{ duration:.45, ease:'easeOut' }}
      className="relative rounded-2xl glass p-4 cursor-pointer overflow-hidden group">
      <motion.div layout className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.35),transparent_60%)]" />
      <div className="absolute right-3 top-3 text-[10px] tracking-wide px-2 py-1 rounded-full bg-black/60/60 border border-white/10 backdrop-blur">⬆ {count}</div>
      <div onClick={handleClick} className="flex gap-4 items-center relative z-10">
        <Image
          src={imgSrc}
          alt={p.name}
          width={64}
          height={64}
          onError={() => {
            if (imgSrc !== '/placeholder-logo.png') setImgSrc('/placeholder-logo.png');
          }}
          className="rounded-xl object-cover shadow-lg shadow-purple-500/10 bg-black/30"
        />
        <div className="space-y-1">
          <div className="font-semibold text-sm flex items-center gap-1">
            <span>{p.name}</span>
            {p.trending && <motion.span layoutId={`fire-${p.id}`} className="text-xs">🔥</motion.span>}
          </div>
          <div className="opacity-80 text-xs leading-snug line-clamp-3 max-w-xs">{p.description}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wide opacity-60">{p.category}</div>
        </div>
      </div>
    </motion.div>
  );
}

