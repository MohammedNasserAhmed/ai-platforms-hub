'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Toast { id: number; message: string; type?: 'success'|'error'|'info'; }
interface ToastContextValue { push: (t: Omit<Toast,'id'>) => void; }
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(){
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast outside provider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }){
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = Date.now() + Math.random();
    setItems(list => [...list, { id, ...t }]);
    setTimeout(()=> setItems(list => list.filter(i=> i.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {items.map(i => (
          <div key={i.id} className={`px-4 py-2 rounded-lg shadow text-sm text-white backdrop-blur border border-white/10 ${i.type==='error'?'bg-red-600/80': i.type==='success' ? 'bg-green-600/80' : 'bg-black/70'}`}>{i.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
