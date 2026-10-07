import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="flex flex-wrap gap-x-4 gap-y-1 border-b pb-3 text-sm">
        <Link href="/legal/terms" className="text-brand-700 hover:underline">
          利用規約
        </Link>
        <Link href="/legal/privacy" className="text-brand-700 hover:underline">
          プライバシーポリシー
        </Link>
        <Link href="/legal/tokushoho" className="text-brand-700 hover:underline">
          特定商取引法に基づく表記
        </Link>
      </nav>
      <article className="prose prose-sm max-w-none rounded-2xl bg-white p-8 shadow-sm">
        {children}
      </article>
    </div>
  );
}
