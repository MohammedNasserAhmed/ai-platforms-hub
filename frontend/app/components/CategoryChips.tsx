'use client';
export default function CategoryChips({ categories, active, onSelect }:{ categories:string[]; active?:string; onSelect:(c?:string)=>void }){
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={()=>onSelect(undefined)} className={`px-3 py-1 rounded-full text-xs border ${!active? 'bg-white/20':'bg-transparent'} border-white/20`}>All</button>
      {categories.map(c => (
        <button key={c} onClick={()=>onSelect(c)} className={`px-3 py-1 rounded-full text-xs border ${active===c? 'bg-white/20':'bg-transparent'} border-white/20`}>{c}</button>
      ))}
    </div>
  );
}
