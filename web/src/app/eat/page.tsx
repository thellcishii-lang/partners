import Link from 'next/link';
import { ListingsSearch } from '@/components/listings/ListingsSearch';
import { Button } from '@/components/ui/Button';

export default function EatHomePage() {
  return (
    <div className="space-y-8">
      {/* 飲食店専用ヒーロー */}
      <section className="relative overflow-hidden bg-orange-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold text-orange-700">
            飲食店専門の代理店・加盟店募集
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-orange-950 sm:text-5xl">
            飲食店の独立・開業を、
            <br />
            <span className="text-orange-600">もっと確実に。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-orange-800/80">
            カフェ、居酒屋、ラーメン店から、POSレジ・食材仕入れの商材まで。
            飲食店ビジネスに特化した募集案件が見つかります。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* メインサイトへの相互リンク */}
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full border-orange-600 text-orange-700 hover:bg-orange-50 sm:w-auto">
                全業種の代理店募集はこちら
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 飲食店専用の検索・一覧 */}
      <div className="mx-auto max-w-6xl px-4">
        <ListingsSearch industry="eat" />
      </div>
    </div>
  );
}
