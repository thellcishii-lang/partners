'use client';

import { useState } from 'react';
import Link from 'next/link';

export function SpecialtyBanners() {
  // ★デフォルトは閉じた状態（false）に変更
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-5 text-left transition hover:bg-gray-50 focus:outline-none"
        >
          <div>
            <p className="text-xs font-bold text-emerald-600">業種を絞って探す</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
              専門サイトから案件を探す
            </h2>
          </div>
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            ▼
          </div>
        </button>

        {/* アニメーション用のラッパー */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            {/* ★グリッドを sm:grid-cols-2 lg:grid-cols-4 に変更して4つ並べる */}
            <div className="grid gap-3 px-4 pb-5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/eat"
                className="block rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-md"
              >
                <p className="text-xs font-bold text-orange-600">🍽 飲食店専門</p>
                <p className="mt-1 font-bold">飲食店の代理店・加盟店募集</p>
                <p className="mt-1 text-xs text-orange-700/80">
                  カフェ、居酒屋、POSレジ、食材仕入れ
                </p>
              </Link>

              <Link
                href="/beauty"
                className="block rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md"
              >
                <p className="text-xs font-bold text-rose-600">💅 美容・エステ専門</p>
                <p className="mt-1 font-bold">美容サロンの代理店・加盟店募集</p>
                <p className="mt-1 text-xs text-rose-700/80">
                  美容室、エステ、ネイル、予約システム
                </p>
              </Link>

              <Link
                href="/it"
                className="block rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
              >
                <p className="text-xs font-bold text-indigo-600">💻 IT・AI専門</p>
                <p className="mt-1 font-bold">ITツールの代理店募集</p>
                <p className="mt-1 text-xs text-indigo-700/80">
                  SaaS、生成AI、DX、システム開発
                </p>
              </Link>

              {/* ★追加：教室・スクール専門 */}
              <Link
                href="/school"
                className="block rounded-xl border border-teal-200 bg-teal-50 p-5 text-teal-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-100 hover:shadow-md"
              >
                <p className="text-xs font-bold text-teal-600">🎓 教室・スクール専門</p>
                <p className="mt-1 font-bold">教室・スクールの代理店・加盟店募集</p>
                <p className="mt-1 text-xs text-teal-700/80">
                  学習塾、英会話、プログラミング、教材
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
