'use client';
import AdminGuard from '../../../components/AdminGuard';
import PlatformForm from '../../components/PlatformForm';

export default function NewPlatformPage(){
  return (
    <AdminGuard>
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Add New Platform</h1>
        <PlatformForm redirectOnSuccess="/admin/platforms" />
        <a href="/admin/platforms" className="inline-block mt-6 text-sm underline">Back to list</a>
      </main>
    </AdminGuard>
  );
}
