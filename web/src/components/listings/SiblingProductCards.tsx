function BarsMark({ bg }: { bg: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={`sb-${bg}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffa41f" />
          <stop offset="1" stopColor="#ff6a00" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={bg} />
      <g fill={`url(#sb-${bg})`}>
        <rect x="8.5" y="39" width="8" height="13" rx="2.5" />
        <rect x="21.5" y="30" width="8" height="22" rx="2.5" />
        <rect x="34.5" y="21" width="8" height="31" rx="2.5" />
        <rect x="47.5" y="12" width="8" height="40" rx="2.5" />
      </g>
    </svg>
  );
}

const PRODUCTS = [
  {
    name: '代理店管理システム',
    copy: '代理店の募集・管理・報酬計算をひとつに',
    price: '月額39,800円（税別）',
    href: 'https://xn--xcke3b8fv95ofytnj8aba636o.com',
    bg: '#0f2740',
  },
  {
    name: '見積・請求書システム',
    copy: '見積から請求・入金管理まで、帳票はすべて無制限',
    price: '月額2,500円（税別）',
    href: 'https://xn--xcke3b8fvf4865a1zhxj3amx2arvc.com/',
    bg: '#374151',
  },
  {
    name: '見積・請求書システム 建築版',
    copy: '表紙・内訳書・明細の建築様式で見積印刷',
    price: '月額2,500円（税別）',
    href: 'https://xn--xcke3b8fvf4865a1zhxj3amx2arvc.com/construction/',
    bg: '#7c4a1e',
  },
  {
    name: 'HTMLメール',
    copy: '選べる様式で、きれいなビジネスメールを送信',
    price: '月額2,500円（税別）',
    href: 'https://xn--xcke3b8fvf4865a1zhxj3amx2arvc.com/html-mail/',
    bg: '#9f1239',
  },
];

export function SiblingProductCards() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-bold text-gray-700">運営サービス</p>
      <div className="space-y-3">
        {PRODUCTS.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener"
            className="flex items-start gap-3 rounded-lg border border-gray-100 p-2 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <BarsMark bg={p.bg} />
            <span className="min-w-0">
              <span className="block text-xs font-bold leading-snug text-gray-900">{p.name}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{p.copy}</span>
              <span className="mt-0.5 block text-[11px] font-medium text-emerald-700">{p.price}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
