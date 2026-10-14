'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types';

const MAX = 5;
const INTERVAL_MS = 5000;
const SHOW_DELAY_MS = 5000;   // 数秒後に出現
const HIDE_AFTER_MS = 25000;  // 25秒で消える

export function PromotionToast() {
  const [items, setItems] = useState<Listing[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('promotionToastShown') === '1') return;

    let active = true;
    const now = new Date();

    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'listings'),
            where('isPromotedTop', '==', true),
            where('status', '==', 'published'),
            limit(50)
          )
        );
        if (!active) return;
        const valid = snap.docs
          .map((d) => ({ ...d.data(), id: d.id } as Listing))
          .filter((l) => {
            const until = l.promotedTopUntil;
            if (!until) return true;
            return until.seconds * 1000 > now.getTime();
          })
          .sort(() => Math.random() - 0.5)
          .slice(0, MAX);

        if (valid.length === 0) return;

        // 数秒後に表示
        setTimeout(() => {
          if (!active) return;
          setItems(valid);
          setVisible(true);
          sessionStorage.setItem('promotionToastShown', '1');

          // 25秒後に自動で消える
          setTimeout(() => {
            if (active) setVisible(false);
          }, HIDE_AFTER_MS);
        }, SHOW_DELAY_MS);
      } catch {
        // 静かに失敗
      }
    })();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (items.length <= 1 || !visible) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [items.length, visible]);

  if (!visible || items.length === 0) return null;

  const current = items[index];

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          aria-label="閉じる"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          ×
        </button>
        <Link href={`/listings/${current.id}`} className="block">
          {current.images?.[0] ? (
            <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.images[0]}
                alt={current.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] w-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
          )}
          <div className="p-4">
            <span className="inline-block rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              ★ おすすめ
            </span>
            <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900">
              {current.title}
            </p>
            <p className="mt-1 text-xs text-gray-500">{current.companyName}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
