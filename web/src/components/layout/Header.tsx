'use client';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, profile, loading } = useAuth();

  const role = profile?.role;
  const mypageHref =
    role === 'admin' ? '/admin'
      : role === 'applicant' ? '/applicant'
        : '/dashboard';

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-emerald-700">
            代理店・加盟店募集.com
          </Link>
          <Link
            href="/guide"
            className="hidden text-sm text-gray-600 hover:text-emerald-700 sm:inline"
          >
            ガイド
          </Link>
          <Link
            href="/listings"
            className="hidden text-sm text-gray-600 hover:text-emerald-700 sm:inline"
          >
            案件を探す
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <Link href={mypageHref} className="hover:text-emerald-700">
                マイページ
              </Link>
              <span className="hidden text-gray-400 sm:inline">
                {profile?.displayName ?? user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-emerald-700">ログイン</Link>
              <Link
                href="/for-advertisers"
                className="rounded-lg border border-emerald-600 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
              >
                掲載についてはこちら
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
