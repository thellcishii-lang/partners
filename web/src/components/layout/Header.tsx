'use client';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, profile, loading } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-bold text-brand-700">
          代理店募集・加盟店募集.com
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="hover:text-brand-700">マイページ</Link>
              <span className="hidden text-gray-400 sm:inline">
                {profile?.displayName ?? user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-700">ログイン</Link>
              <Link
                href="/signup"
                className="rounded-lg border border-brand-600 px-3 py-1.5 text-brand-700 hover:bg-brand-50"
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
