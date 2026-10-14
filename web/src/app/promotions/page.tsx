'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useRequireAdvertiser } from '@/hooks/useRequireAdvertiser';
import { Button } from '@/components/ui/Button';

export default function PromotionsPage() {
  return <Suspense fallback={<p>読み込み中…</p>}><Content /></Suspense>;
}

function Content() {
  const { user, loading } = useRequireAdvertiser();
  const canceled = useSearchParams().get('canceled') === '1';

  if (loading || !user) return <p className="p-4 text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">
          ← マイページ
        </Link>
        <h1 className="mt-1 text-xl font-bold">おすすめ表示プラン</h1>
        <p className="mt-2 text-sm text-gray-600">
          有料オプションで、貴社の案件をより多くの応募者に届けます。
        </p>
      </div>

      {canceled && (
        <p role="status" className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm">
          決済はキャンセルされました。料金は請求されていません。
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {/* 上部表示 */}
        <div className="flex flex-col rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
          <span className="inline-block self-start rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            上部表示
          </span>
          <h2 className="mt-3 text-2xl font-bold">トップページのヒーロー</h2>
          <p className="mt-3 text-sm text-gray-700">
            トップページの最上部に、5秒ごとに切り替わる自動スライドで表示されます。
            最も目立つ位置で、貴社の案件をアピールできます。
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>月額：<strong className="text-lg">60,500円</strong>（税込）</p>
            <p className="text-xs text-gray-500">税抜 55,000円</p>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
            <li>✓ 5枠限定</li>
            <li>✓ 5秒ごとに自動スライド</li>
            <li>✓ 30日間 or 月額サブスク</li>
            <li>✓ 開始日を指定可能</li>
          </ul>
          <Link href="/promotions/new?plan=top" className="mt-auto pt-5">
            <Button className="w-full" size="lg">申し込む</Button>
          </Link>
        </div>

        {/* おすすめ表示 */}
        <div className="flex flex-col rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
          <span className="inline-block self-start rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            おすすめ表示
          </span>
          <h2 className="mt-3 text-2xl font-bold">検索結果の上位挿入</h2>
          <p className="mt-3 text-sm text-gray-700">
            案件一覧・検索結果の中で、5件に1回のペースで挿入されます。
            検索条件に合致する応募者に、優先的に表示されます。
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>月額：<strong className="text-lg">36,300円</strong>（税込）</p>
            <p className="text-xs text-gray-500">税抜 33,000円</p>
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
            <li>✓ 10枠限定</li>
            <li>✓ 案件一覧・検索結果に挿入</li>
            <li>✓ 30日間 or 月額サブスク</li>
            <li>✓ 開始日を指定可能</li>
          </ul>
          <Link href="/promotions/new?plan=recommend" className="mt-auto pt-5">
            <Button className="w-full" size="lg">申し込む</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="font-bold">ご契約中のプラン</h3>
        <p className="mt-2 text-sm text-gray-600">
          契約中・過去の契約は
          <Link href="/dashboard/promotions" className="ml-1 text-brand-700 underline">
            契約一覧
          </Link>
          からご確認いただけます。
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-600">
        <p className="font-bold">ご注意</p>
        <ul className="mt-2 space-y-1">
          <li>・本プランは返金対象外です</li>
          <li>・公開中の案件のみお申し込みいただけます</li>
          <li>・枠が満杯の場合はお申し込みできません</li>
          <li>・消費税率の変更があった場合、変更後の税率が適用されます</li>
        </ul>
      </div>
    </div>
  );
}
