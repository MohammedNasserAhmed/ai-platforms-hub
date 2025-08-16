'use client';
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastProvider';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface PlatformFormValues { name: string; url: string; imageUrl: string; description: string; category: string; }
interface Props { onSuccess?: (created: any) => void; redirectOnSuccess?: string; showHeading?: boolean; id?: number; }

export default function PlatformForm({ onSuccess, redirectOnSuccess, showHeading = false, id }: Props){
  const [form, setForm] = useState<PlatformFormValues>({ name:'', url:'', imageUrl:'', description:'', category:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();
  const { push } = useToast();

  useEffect(()=>{ (async()=>{ try { const res = await fetch(`${API}/platforms`); if(res.ok){ const data: Array<{category:string}> = await res.json(); const cats = Array.from(new Set(data.map(d=> d.category))).sort(); setCategories(cats); } } catch{} })(); }, []);
  // edit mode load
  useEffect(()=>{ if(!id) return; (async()=>{ try { const r = await fetch(`${API}/platforms/${id}`); if(r.ok){ const data = await r.json(); setForm({ name:data.name, url:data.url, imageUrl:data.imageUrl, description:data.description, category:data.category }); } } catch{} })(); }, [id]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  function update<K extends keyof PlatformFormValues>(k:K, v:string){ setForm(f=> ({ ...f, [k]: v })); }
  function normalize(values: PlatformFormValues): PlatformFormValues { return { ...values, url: values.url && !/^https?:\/\//i.test(values.url) ? `https://${values.url}` : values.url, imageUrl: values.imageUrl && !/^https?:\/\//i.test(values.imageUrl) ? `https://${values.imageUrl}` : values.imageUrl }; }

  async function uploadFile(file: File){
  if(!/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name)) throw new Error('Invalid file type');
  if(file.size > 2 * 1024 * 1024) throw new Error('File too large (>2MB)');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload/logo`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: formData });
    if(!res.ok) throw new Error('Upload failed');
    const j = await res.json();
    update('imageUrl', j.url.startsWith('http') ? j.url : (location.origin + j.url));
    push({ message: 'Logo uploaded', type:'success' });
  }

  async function submit(e: React.FormEvent){
    e.preventDefault(); setError(''); setSaving(true); setDone(false);
    const body = normalize(form);
    if (body.name.trim().length < 2) { setSaving(false); setError('Name too short'); return; }
    try {
  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `${API}/platforms/${id}` : `${API}/platforms`;
  const res = await fetch(endpoint, { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      if(!res.ok){ const j = await res.json().catch(()=>({})); throw new Error(j.error || `Failed (${res.status})`); }
  const created = await res.json(); setDone(true); push({ message: id ? 'Platform updated' : 'Platform created', type:'success' });
  // trigger ISR revalidation API route if available
  try { fetch('/api/revalidate', { method:'POST' }); } catch {}
  if(!id) setForm({ name:'', url:'', imageUrl:'', description:'', category:'' }); onSuccess?.(created); if (redirectOnSuccess){ setTimeout(()=> router.push(redirectOnSuccess), 900); }
    } catch(err:any){ setError(err.message || 'Failed'); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {showHeading && <h2 className="text-xl font-semibold">Add Platform</h2>}
      <input required placeholder="Name" value={form.name} onChange={e=>update('name', e.target.value)} className="rounded-xl px-4 py-3 text-black" />
      <input required placeholder="Official URL (https://...)" value={form.url} onChange={e=>update('url', e.target.value)} className="rounded-xl px-4 py-3 text-black" />
      <div className="flex gap-2">
        <input required placeholder="Logo/Image URL" value={form.imageUrl} onChange={e=>update('imageUrl', e.target.value)} className="rounded-xl px-4 py-3 text-black flex-1" />
        <label className="text-xs cursor-pointer px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10">Upload
          <input type="file" accept="image/*" className="hidden" onChange={async e=> { const f = e.target.files?.[0]; if(f){ try { await uploadFile(f); } catch(err:any){ push({ message: err.message || 'Upload failed', type:'error' }); } } }} />
        </label>
  {form.imageUrl && <button type="button" onClick={()=> { update('imageUrl',''); push({ message:'Logo cleared', type:'info'}); }} className="text-xs px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10">Remove</button>}
      </div>
      <div onDragOver={e=> e.preventDefault()} onDrop={async e=> { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if(f){ try { await uploadFile(f); } catch(err:any){ push({ message: err.message || 'Upload failed', type:'error' }); } } }} className="rounded-xl border border-dashed border-white/30 p-3 text-xs text-center opacity-80">
        Drag & Drop logo here (optional)
      </div>
      <textarea required placeholder="Short description" value={form.description} onChange={e=>update('description', e.target.value)} className="rounded-xl px-4 py-3 text-black min-h-[90px]" />
      <div className="flex gap-2">
        <input required placeholder="Category" value={form.category} onChange={e=>update('category', e.target.value)} list="platform-categories" className="rounded-xl px-4 py-3 text-black flex-1" />
        <datalist id="platform-categories">{categories.map(c=> <option key={c} value={c} />)}</datalist>
      </div>
  <button disabled={saving} className="rounded-xl px-4 py-3 border border-white/20 hover:bg-white/10 disabled:opacity-50">{saving ? 'Saving…' : (id ? 'Update Platform' : 'Create Platform')}</button>
  {error && <div className="text-sm text-red-400">{error}</div>}
    </form>
  );
}
