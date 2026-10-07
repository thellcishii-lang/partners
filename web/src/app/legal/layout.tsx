import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="border-b pb-3 text-sm">
        <Link href="/legal/terms" className="mr-4 text-brand-700 hover:underline">
          利用規約
        </Link>
        <Link href="/legal/privacy" className="text-brand-700 hover:underline">
          プライバシーポリシー
        </Link>
      </nav>
      <article className="prose prose-sm max-w-none rounded-2xl bg-white p-8 shadow-sm">
        {children}
      </article>
    </div>
  );
}
