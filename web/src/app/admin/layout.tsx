'use client';

import Link from 'next/link';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useRequireAdmin();

  if (loading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (!isAdmin) {
    return (
      <p role="alert" className="text-center text-sm text-red-600">
        管理者権限が必要です。
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-bold">管理画面</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/listings" className="text-brand-700 hover:underline">
            案件審査
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
