import Link from 'next/link';
import { PRODUCT_LABELS, TARGET_LABELS, MODEL_LABELS, INITIAL_COST_LABELS, AREA_LABELS } from '@/lib/masterLabels';
import { COMPANY_INFO, SITE_NAME } from '@/lib/companyInfo';

export function Footer() {
  const productParents = Object.entries(PRODUCT_LABELS).filter(([slug]) =>
    !slug.match(/^product-[a-z]+-[a-z]+$/)
  );
  const targets = Object.entries(TARGET_LABELS);
  const models = Object.entries(MODEL_LABELS);
  const costs = Object.entries(INITIAL_COST_LABELS);

  const regionSlugs = ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu'];
  const regions = regionSlugs
    .map((slug) => [slug, AREA_LABELS[slug]?.label])
    .filter(([, label]) => !!label) as [string, string][];

  const mainPrefectures = ['tokyo', 'kanagawa', 'osaka', 'aichi', 'fukuoka', 'hokkaido'];
  const prefectures = mainPrefectures
    .map((slug) => [slug, AREA_LABELS[slug]?.label])
    .filter(([, label]) => !!label) as [string, string][];

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      {/* SEO リンク集 */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">商材から探す</h3>
            <ul className="space-y-2 text-xs">
              {productParents.slice(0, 8).map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/product/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">ターゲットから探す</h3>
            <ul className="space-y-2 text-xs">
              {targets.slice(0, 8).map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/target/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">探し方から探す</h3>
            <ul className="space-y-2 text-xs">
              {models.slice(0, 8).map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/model/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">初期費用から探す</h3>
            <ul className="space-y-2 text-xs">
              {costs.map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/cost/initial/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">地域から探す</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {regions.map(([slug, label]) => (
                  <li key={slug}>
                    <Link href={`/area/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-900">主要エリアから探す</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {prefectures.map(([slug, label]) => (
                  <li key={slug}>
                    <Link href={`/area/${slug}`} className="text-gray-600 transition hover:text-emerald-700 hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 会社情報 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href="/" className="font-bold text-emerald-700">
                {SITE_NAME}
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                {COMPANY_INFO.name}
                <br />
                〒{COMPANY_INFO.postalCode} {COMPANY_INFO.address}
                <br />
                {COMPANY_INFO.email}
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <Link href="/for-advertisers" className="text-gray-600 hover:text-emerald-700 hover:underline">
                掲載をご検討の方
              </Link>
              <Link href="/listings" className="text-gray-600 hover:text-emerald-700 hover:underline">
                案件を探す
              </Link>
              <Link href="/guide" className="text-gray-600 hover:text-emerald-700 hover:underline">
                ガイド
              </Link>
              <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-700 hover:underline">
                利用規約
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-700 hover:underline">
                プライバシーポリシー
              </Link>
              <Link href="/legal/tokushoho" className="text-gray-600 hover:text-emerald-700 hover:underline">
                特定商取引法
              </Link>
              <Link
                href="/admin"
                aria-label="管理"
                className="select-none text-gray-200 transition hover:text-gray-500"
              >
                ・
              </Link>
            </nav>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            © {year} {COMPANY_INFO.name} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
