'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  INQUIRY_STATUS_LABELS,
  type Advertiser,
  type Inquiry,
  type InquiryDetail,
  type Listing,
} from '@/types';

type AdminAdvertiser = Advertiser & { email?: string };

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [advertiser, setAdvertiser] = useState<AdminAdvertiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const inqSnap = await getDoc(doc(db, 'inquiries', id));
        if (!inqSnap.exists()) {
          if (active) setError('応募が見つかりません。');
          return;
        }
        const inq = { ...inqSnap.data(), id: inqSnap.id } as Inquiry;

        const [detSnap, listSnap, advSnap] = await Promise.all([
          getDoc(doc(db, 'inquiryDetails', id)),
          getDoc(doc(db, 'listings', inq.listingId)),
          getDoc(doc(db, 'advertisers', inq.advertiserId)),
        ]);

        if (!active) return;
        setInquiry(inq);
        setDetail(detSnap.exists() ? ({ ...detSnap.data(), inquiryId: detSnap.id } as InquiryDetail) : null);
        setListing(listSnap.exists() ? ({ ...listSnap.data(), id: listSnap.id } as Listing) : null);
        setAdvertiser(advSnap.exists() ? ({ ...advSnap.data(), uid: advSnap.id } as AdminAdvertiser) : null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!inquiry) return null;

  const statusLabel = INQUIRY_STATUS_LABELS[inquiry.status];

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/inquiries" className="text-xs text-gray-500 hover:underline">
          ← 応募一覧
        </Link>
        <h2 className="mt-2 text-lg font-bold">応募の詳細</h2>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
        この画面には応募者の個人情報が含まれます。取扱いに注意してください。
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">応募情報</h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <Row label="応募ID" value={inquiry.id} mono />
              <Row label="ステータス" value={statusLabel} />
              <Row
                label="応募日時"
                value={
                  inquiry.createdAt?.seconds
                    ? new Date(inquiry.createdAt.seconds * 1000).toLocaleString('ja-JP')
                    : ''
                }
              />
              {inquiry.deliveredAt?.seconds && (
                <Row
                  label="開示日時"
                  value={new Date(inquiry.deliveredAt.seconds * 1000).toLocaleString('ja-JP')}
                />
              )}
              {inquiry.depositTransactionId && (
                <Row label="取引ID" value={inquiry.depositTransactionId} mono />
              )}
              {inquiry.memo && <Row label="メモ" value={inquiry.memo} />}
            </tbody>
          </table>
        </section>

        <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">マスク情報（開示前の公開情報）</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {inquiry.maskedPreview?.prefecture && (
              <span className="rounded-full bg-gray-100 px-3 py-1">{inquiry.maskedPreview.prefecture}</span>
            )}
            {inquiry.maskedPreview?.ageRange && (
              <span className="rounded-full bg-gray-100 px-3 py-1">{inquiry.maskedPreview.ageRange}</span>
            )}
            {inquiry.maskedPreview?.budget && (
              <span className="rounded-full bg-gray-100 px-3 py-1">{inquiry.maskedPreview.budget}</span>
            )}
            <span className="rounded-full bg-gray-100 px-3 py-1">
              経験 {inquiry.maskedPreview?.hasExperience ? 'あり' : 'なし'}
            </span>
          </div>
        </section>
      </div>

      <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold">応募者の個人情報</h3>
        {detail ? (
          <>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <Row label="氏名" value={detail.fullName} />
                <Row label="フリガナ" value={detail.kana} />
                <Row label="メール" value={detail.email} />
                <Row label="電話" value={detail.phone} />
                <Row label="LINE ID" value={detail.lineId} />
                {detail.snapshot?.displayName && (
                  <Row label="登録名" value={detail.snapshot.displayName} />
                )}
              </tbody>
            </table>
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">応募動機</p>
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                {detail.message}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            個人情報がまだ作成されていません（応募フロー未完了の可能性）。
          </p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">案件</h3>
          {listing ? (
            <table className="w-full border-collapse text-sm">
              <tbody>
                <Row label="タイトル" value={listing.title} />
                <Row label="掲載主" value={listing.companyName} />
                <Row label="ステータス" value={listing.status} />
                <tr className="border-b border-gray-100">
                  <th className="w-24 py-2 text-left align-top text-xs font-bold text-gray-500">案件ページ</th>
                  <td className="py-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-700 underline"
                    >
                      開く ↗
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">案件が見つかりません（削除済みの可能性）。</p>
          )}
        </section>

        <section className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">募集者</h3>
          {advertiser ? (
            <>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <Row label="会社名" value={advertiser.companyName} />
                  <Row label="メール" value={advertiser.email ?? ''} />
                  <Row
                    label="残高"
                    value={`${advertiser.depositBalance ?? 0}件`}
                  />
                  <tr className="border-b border-gray-100">
                    <th className="w-24 py-2 text-left align-top text-xs font-bold text-gray-500">管理</th>
                    <td className="py-2">
                      <Link
                        href={`/admin/advertisers/${advertiser.uid}`}
                        className="text-xs text-brand-700 underline"
                      >
                        掲載主の詳細へ →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-sm text-gray-500">募集者が見つかりません。</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <tr className="border-b border-gray-100">
      <th className="w-24 py-2 text-left align-top text-xs font-bold text-gray-500">{label}</th>
      <td className={'py-2 text-sm text-gray-900 ' + (mono ? 'break-all font-mono text-xs' : '')}>
        {value}
      </td>
    </tr>
  );
}
