'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types';

const MAX = 5;
const INTERVAL_MS = 5000;

export function FeaturedHero() {
  const [items, setItems] = useState<Listing[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
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
        // promotedTopUntil が未来のもののみ
        const valid = snap.docs
          .map((d) => ({ ...d.data(), id: d.id } as Listing))
          .filter((l) => {
            const until = l.promotedTopUntil;
            if (!until) return false;
            return until.seconds * 1000 > now.getTime();
          })
          // ランダム
          .sort(() => Math.random() - 0.5)
          .slice(0, MAX);
        setItems(valid);
      } catch {
        // 静かに失敗
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
      <Link href={`/listings/${current.id}`} className="block">
        {current.images?.[0] ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 sm:aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.images[0]}
              alt={current.title}
              className="h-full w-full object-cover transition-opacity duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-emerald-50 to-emerald-100 sm:aspect-[21/9]" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 text-white">
          <span className="inline-block self-start rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold">
            ★ おすすめ
          </span>
          <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug sm:text-2xl">
            {current.title}
          </h2>
          <p className="mt-1 text-xs text-white/80">{current.companyName}</p>
        </div>
      </Link>

      {/* ドット */}
      {items.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`スライド ${i + 1}`}
              onClick={(e) => { e.preventDefault(); setIndex(i); }}
              className={
                'h-2 w-2 rounded-full transition ' +
                (i === index ? 'bg-white' : 'bg-white/40')
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
