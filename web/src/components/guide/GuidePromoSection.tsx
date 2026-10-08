import Link from 'next/link';
import { GUIDE_ARTICLES, CATEGORY_LABELS } from '@/lib/guideArticles';

export function GuidePromoSection() {
  // 注目記事を4本
  const featured = GUIDE_ARTICLES
    .filter((a) => a.featured)
    .slice(0, 2);
  const others = GUIDE_ARTICLES
    .filter((a) => !a.featured)
    .slice(0, 2);
  const topArticles = [...featured, ...others].slice(0, 4);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-b from-emerald-50/60 to-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* 見出し */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-bold text-emerald-700">
              📖 起業・独立ガイド
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950">
              はじめての起業に、<br className="sm:hidden" />
              役立つ知識。
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
              1から始めない選択、失敗しない準備、ストックビジネスの基礎——
              起業を考えたときに読んでおきたい記事をまとめました。
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
          >
            すべての記事を見る
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* 記事カードグリッド */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/guide/${article.slug}`}
              className="group relative flex flex-col rounded-2xl border-2 border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              {/* 上部のアクセントライン */}
              <span className="absolute inset-x-5 top-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-transform group-hover:scale-x-100" />

              <span className="mb-3 inline-block self-start rounded-md bg-emerald-50 px-2 py-1 text-[10.5px] font-bold tracking-wide text-emerald-700">
                {CATEGORY_LABELS[article.category]}
              </span>
              <h3 className="mb-2 text-base font-bold leading-snug text-emerald-950">
                {article.title}
              </h3>
              <p className="mb-4 line-clamp-3 flex-grow text-xs leading-relaxed text-gray-600">
                {article.description}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                <span>約{article.readingMinutes}分</span>
                <span className="font-bold text-emerald-600 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 下部の一言 */}
        <p className="mt-10 text-center text-xs text-gray-500">
          起業・独立・副業に役立つ記事を、随時追加しています。
        </p>
      </div>
    </section>
  );
}
