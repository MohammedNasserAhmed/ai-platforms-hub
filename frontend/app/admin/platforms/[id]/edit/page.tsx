'use client';
import AdminGuard from '../../../../components/AdminGuard';
import PlatformForm from '../../../components/PlatformForm';
import { useParams } from 'next/navigation';

export default function EditPlatformPage(){
  const params = useParams();
  const id = Number((params as any)?.id);
  return (
    <AdminGuard>
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Edit Platform</h1>
        {Number.isFinite(id) ? <PlatformForm id={id} redirectOnSuccess="/admin/platforms" /> : <div>Invalid id</div>}
        <a href="/admin/platforms" className="inline-block mt-6 text-sm underline">Back to list</a>
      </main>
    </AdminGuard>
  );
}
