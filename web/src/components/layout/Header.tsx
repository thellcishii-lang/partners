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
        <Link href="/" className="font-bold text-emerald-700">
          代理店募集・加盟店募集.com
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <Link href={mypageHref} className="hover:text-emerald-700">
                マイページ
              </Link>
              {role !== 'applicant' && (
                <Link href="/applicant" className="hidden text-gray-500 hover:text-emerald-700 sm:inline">
                  応募履歴
                </Link>
              )}
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
                href="/signup"
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
