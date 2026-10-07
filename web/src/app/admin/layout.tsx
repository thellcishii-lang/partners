'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useRequireAdmin();
  const pathname = usePathname();

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

  const nav = [
    { href: '/admin', label: 'ダッシュボード' },
    { href: '/admin/listings', label: '案件審査' },
    { href: '/admin/advertisers', label: '掲載主' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <h1 className="text-lg font-bold">管理画面</h1>
        <nav className="flex gap-4 text-sm">
          {nav.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'font-bold text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-700'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
