'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  INQUIRY_STATUS_LABELS,
  type Inquiry,
  type InquiryDetail,
} from '@/types';

export default function InquiryDetailPage() {
  const { id, inquiryId } = useParams<{ id: string; inquiryId: string }>();
  const { user, loading } = useRequireAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id || !inquiryId) return;
    let active = true;
    setDataLoading(true);
    setError('');

    (async () => {
      const inqSnap = await getDoc(doc(db, 'inquiries', inquiryId));
      if (!inqSnap.exists()) {
        if (active) { setError('応募が見つかりません。'); setDataLoading(false); }
        return;
      }
      const inq = { ...inqSnap.data(), id: inqSnap.id } as Inquiry;
      if (inq.advertiserId !== user.uid || inq.listingId !== id) {
        if (active) { setError('この応募は閲覧できません。'); setDataLoading(false); }
        return;
      }

      if (inq.status !== 'pending') {
        const detSnap = await getDoc(doc(db, 'inquiryDetails', inquiryId));
        if (active && detSnap.exists()) {
          setDetail({ ...detSnap.data(), inquiryId: detSnap.id } as InquiryDetail);
        }
      }
      if (active) {
        setInquiry(inq);
        setDataLoading(false);
      }
    })().catch((e) => {
      if (active) {
        setError(e instanceof Error ? e.message : '取得に失敗しました。');
        setDataLoading(false);
      }
    });

    return () => { active = false; };
  }, [user, id, inquiryId]);

  if (loading || !user || dataLoading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (error) {
    return <p role="alert" className="text-center text-sm text-red-600">{error}</p>;
  }
  if (!inquiry) return null;

  const disclosed = inquiry.status !== 'pending';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href={`/dashboard/listings/${id}/inquiries`} className="text-xs text-gray-500 hover:underline">
          ← 応募者一覧
        </Link>
        <h1 className="mt-1 text-xl font-bold">応募の詳細</h1>
      </div>

      {!disclosed && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          この応募はまだ開示されていません。デポジットが追加されると開示されます。
        </div>
      )}

      {disclosed && detail && (
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <Row label="氏名" value={detail.fullName} />
          <Row label="フリガナ" value={detail.kana} />
          <Row label="メール" value={detail.email} />
          <Row label="電話" value={detail.phone} />
          <Row label="郵便番号" value={detail.postalCode} />
          <Row label="都道府県" value={detail.prefecture} />
          <Row label="市区町村" value={detail.city} />
          <Row label="番地" value={detail.address} />
          <Row label="建物" value={detail.building} />
          <div>
            <p className="mb-1 text-xs font-bold text-gray-500">応募動機</p>
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
              {detail.message}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">ステータス</p>
        <p className="mt-1 font-bold">{INQUIRY_STATUS_LABELS[inquiry.status]}</p>
        {inquiry.createdAt?.seconds && (
          <p className="mt-1 text-xs text-gray-500">
            {new Date(inquiry.createdAt.seconds * 1000).toLocaleString('ja-JP')}
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 border-b border-gray-100 pb-2 last:border-0">
      <p className="w-24 shrink-0 text-xs font-bold text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
