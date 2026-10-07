'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Listing } from '@/types';
import { LISTING_STATUS_LABELS } from '@/types';

type Props = {
  listing: Listing;
  // プレビュー時は apply ボタンを無効化するなど
  mode?: 'public' | 'preview';
  // 右側に出すか、通常ページか（レイアウト差）
  preview?: boolean;
  onApplyHref?: string;
  onEditHref?: string;
};

export function ListingDetail({ listing, preview = false, onApplyHref, onEditHref }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  // 既存の /listings/[id]/page.tsx の中身をここに移動
  // 「apply の Link」は onApplyHref に置き換え
  // 「編集の Link」は onEditHref に置き換え
  // preview=true なら枠に「プレビュー」バッジを出す
  return ( /* 既存の JSX をほぼそのまま */ );
}
