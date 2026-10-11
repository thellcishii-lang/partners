'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';

type RefundRequest = {
  id: string;
  advertiserId: string;
  amountYen: number;
  feeYen: number;
  netAmountYen: number;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'completed';
  requestedAt?: { seconds: number };
  completedAt?: { seconds: number } | null;
  operatorId?: string | null;
  note?: string | null;
};

type AdminAdvertiser = {
  companyName?: string;
  email?: string;
  depositBalance?: number;
};

export default function AdminRefundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<RefundRequest | null>(null);
  const [adv, setAdv] = useState<AdminAdvertiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const reqSnap = await getDoc(doc(db, 'refundRequests', id));
      if (!reqSnap.exists()) {
        setError('返金申請が見つかりません。');
        return;
      }
      const data = { ...reqSnap.data(), id: reqSnap.id } as RefundRequest;
      setReq(data);

      const advSnap = await getDoc(doc(db, 'advertisers', data.advertiserId));
      if (advSnap.exists()) {
        setAdv(advSnap.data() as AdminAdvertiser);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const complete = async () => {
    if (!req || busy) return;
    const note = window.prompt('メモ（任意）') ?? '';
    if (!window.confirm(
      '銀行振込を実行済みですか？\n\n「OK」を押すと、残高を0にし、募集者へ完了メールを送信します。'
    )) return;
    setBusy(true);
    setError('');
    try {
      const fn = httpsCallable<{ requestId: string; note?: string }, { completed: boolean }>(
        functions, 'completeRefund'
      );
      await fn({ requestId: req.id, note });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました。');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!req) return null;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/refunds" className="text-xs text-gray-500 hover:underline">
          ← 返金申請一覧
        </Link>
        <h2 className="mt-1 text-lg font-bold">返金申請の詳細</h2>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold">申請内容</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <Row label="ステータス" value={req.status === 'completed' ? '完了' : '申請中'} />
            <Row label="返金総額" value={`${req.amountYen.toLocaleString('ja-JP')}円`} />
            <Row label="返金手数料" value={`${req.feeYen.toLocaleString('ja-JP')}円`} />
            <Row label="実振込額" value={`${req.netAmountYen.toLocaleString('ja-JP')}円`} />
            <Row
              label="申請日"
              value={req.requestedAt?.seconds
                ? new Date(req.requestedAt.seconds * 1000).toLocaleString('ja-JP')
                : ''}
            />
            {req.completedAt?.seconds && (
              <Row
                label="完了日"
                value={new Date(req.completedAt.seconds * 1000).toLocaleString('ja-JP')}
              />
            )}
            {req.note && <Row label="メモ" value={req.note} />}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold">振込先</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <Row label="銀行名" value={req.bankInfo.bankName} />
            <Row label="支店名" value={req.bankInfo.branchName} />
            <Row label="口座種別" value={req.bankInfo.accountType} />
            <Row label="口座番号" value={req.bankInfo.accountNumber} />
            <Row label="口座名義" value={req.bankInfo.accountHolder} />
          </tbody>
        </table>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold">募集者</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <Row label="会社名" value={adv?.companyName ?? '（不明）'} />
            <Row label="メール" value={adv?.email ?? ''} />
            <Row label="現在の残高" value={`${adv?.depositBalance ?? 0}件`} />
            <tr className="border-b border-gray-100">
              <th className="w-32 py-2 text-left align-top text-xs font-bold text-gray-500">
                管理画面
              </th>
              <td className="py-2">
                <Link
                  href={`/admin/advertisers/${req.advertiserId}`}
                  className="text-xs text-brand-700 underline"
                >
                  掲載主の詳細へ →
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {req.status === 'pending' && (
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
          <p className="mb-3 text-xs text-orange-800">
            銀行振込を実行した後、「振込完了」を押してください。残高が0になり、募集者へ完了メールが送信されます。
          </p>
          <Button onClick={complete} loading={busy} variant="danger">
            振込完了
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <tr className="border-b border-gray-100">
      <th className="w-32 py-2 text-left align-top text-xs font-bold text-gray-500">{label}</th>
      <td className="py-2 text-sm text-gray-900">{value}</td>
    </tr>
  );
}
