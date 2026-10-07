import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-gray-500">
        <p>© 2026 代理店募集・加盟店募集.com</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/legal/terms" className="hover:underline">利用規約</Link>
          <Link href="/legal/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/legal/tokushoho" className="hover:underline">特定商取引法</Link>
          <Link
            href="/admin"
            aria-label="管理"
            className="select-none text-gray-200 transition hover:text-gray-500"
          >
            ・
          </Link>
        </div>
      </div>
    </footer>
  );
}
