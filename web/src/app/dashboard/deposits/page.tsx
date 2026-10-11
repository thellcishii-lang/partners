'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  collection, doc, getDoc, getDocs, query, where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import type { Advertiser } from '@/types';

type DepositTx = {
  id: string;
  type: 'purchase' | 'consume' | 'refund';
  amount: number;
  balanceAfter: number;
  reason: string;
  orderId?: string | null;
  inquiryId?: string | null;
  note?: string | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

type RefundRequest = {
  id: string;
  amountYen: number;
  feeYen: number;
  netAmountYen: number;
  status: 'pending' | 'completed';
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  requestedAt?: { seconds: number; nanoseconds: number } | null;
  completedAt?: { seconds: number; nanoseconds: number } | null;
};

const TYPE_LABELS: Record<string, string> = {
  purchase: '購入',
  consume: '消費',
  refund: '返金',
};

const TYPE_COLORS: Record<string, string> = {
  purchase: 'bg-emerald-100 text-emerald-800',
  consume: 'bg-gray-100 text-gray-700',
  refund: 'bg-orange-100 text-orange-800',
};

const UNIT_PRICE_JPY = 2500;
const REFUND_FEE_JPY = 550;

export default function DepositHistoryPage() {
  const { user, loading } = useRequireAuth();
  const [transactions, setTransactions] = useState<DepositTx[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [adv, setAdv] = useState<Advertiser | null>(null);
  const [refundReq, setRefundReq] = useState<RefundRequest | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bankName: '',
    branchName: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadAll = async (uid: string) => {
    const [advSnap, txSnap, reqSnap] = await Promise.all([
      getDoc(doc(db, 'advertisers', uid)),
      getDocs(query(collection(db, 'depositTransactions'), where('advertiserId', '==', uid))),
      getDocs(query(collection(db, 'refundRequests'), where('advertiserId', '==', uid))),
    ]);

    const items = txSnap.docs.map((d) => ({ ...d.data(), id: d.id } as DepositTx));
    items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

    const reqs = reqSnap.docs.map((d) => ({ ...d.data(), id: d.id } as RefundRequest));
    reqs.sort((a, b) => (b.requestedAt?.seconds ?? 0) - (a.requestedAt?.seconds ?? 0));

    return {
      adv: advSnap.exists() ? ({ ...advSnap.data(), uid } as Advertiser) : null,
      transactions: items,
      refundReq: reqs[0] ?? null,
    };
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDataLoading(true);
    setError('');
    loadAll(user.uid)
      .then((r) => {
        if (!active) return;
        setAdv(r.adv);
        setTransactions(r.transactions);
        setRefundReq(r.refundReq);
        setBalance(r.adv?.depositBalance ?? 0);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const submitRefund = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !user) return;
    setFormError('');
    setSubmitting(true);
    try {
      const fn = httpsCallable<
        typeof form,
        { requestId: string }
      >(functions, 'createRefundRequest');
      await fn(form);
      const r = await loadAll(user.uid);
      setAdv(r.adv);
      setRefundReq(r.refundReq);
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '申請に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || dataLoading) {
    return <p className="text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;

  const totalPurchased = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalConsumed = transactions
    .filter((t) => t.type === 'consume')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const canRequestRefund =
    !!adv &&
    (adv.depositBalance ?? 0) > 0 &&
    !adv.refundRequestedAt &&
    !adv.refundCompletedAt;
  const refundAmountYen = (balance ?? 0) * UNIT_PRICE_JPY;
  const refundNetYen = Math.max(0, refundAmountYen - REFUND_FEE_JPY);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:underline">
            ← マイページ
          </Link>
          <h1 className="mt-1 text-xl font-bold">デポジット履歴</h1>
        </div>
        <Link href="/deposit">
          <Button>デポジットを追加</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="現在の残高" value={`${balance ?? 0}件`} />
        <Card label="累計購入" value={`${totalPurchased}件`} />
        <Card label="累計消費" value={`${totalConsumed}件`} />
      </div>

      {/* 返金申請 */}
      {canRequestRefund && !showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-900">デポジット残高の返金申請</p>
          <p className="mt-1 text-xs text-emerald-800">
            返金手数料 550円を差し引いた金額を、翌月15日までに指定口座へお振込みします。
          </p>
          <div className="mt-3 text-sm">
            <p>返金総額：{refundAmountYen.toLocaleString('ja-JP')}円</p>
            <p>返金手数料：{REFUND_FEE_JPY.toLocaleString('ja-JP')}円</p>
            <p className="font-bold">実振込額：{refundNetYen.toLocaleString('ja-JP')}円</p>
          </div>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            返金申請する
          </Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={submitRefund} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-bold">返金申請</p>
          <Field label="銀行名" required>
            <Input
              required
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="例：楽天銀行"
            />
          </Field>
          <Field label="支店名" required>
            <Input
              required
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              placeholder="例：第一営業支店"
            />
          </Field>
          <Field label="口座種別" required>
            <div className="flex gap-3">
              {['普通', '当座'].map((t) => (
                <label key={t} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="accountType"
                    value={t}
                    checked={form.accountType === t}
                    onChange={() => setForm({ ...form, accountType: t })}
                  />
                  {t}
                </label>
              ))}
            </div>
          </Field>
          <Field label="口座番号" required hint="7〜8桁の数字">
            <Input
              required
              inputMode="numeric"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="1234567"
            />
          </Field>
          <Field label="口座名義" required hint="カタカナ">
            <Input
              required
              value={form.accountHolder}
              onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
              placeholder="ヤマダ タロウ"
            />
          </Field>

          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              キャンセル
            </Button>
            <Button type="submit" loading={submitting}>
              申請する
            </Button>
          </div>
        </form>
      )}

      {refundReq && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-bold">
            返金申請 {refundReq.status === 'pending' ? '（申請中）' : '（完了）'}
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p>返金総額：{refundReq.amountYen.toLocaleString('ja-JP')}円</p>
            <p>返金手数料：{refundReq.feeYen.toLocaleString('ja-JP')}円</p>
            <p className="font-bold">実振込額：{refundReq.netAmountYen.toLocaleString('ja-JP')}円</p>
            <p className="text-xs text-gray-500">
              振込先：{refundReq.bankInfo.bankName} {refundReq.bankInfo.branchName} {refundReq.bankInfo.accountNumber}
            </p>
            {refundReq.requestedAt?.seconds && (
              <p className="text-xs text-gray-500">
                申請日：{new Date(refundReq.requestedAt.seconds * 1000).toLocaleDateString('ja-JP')}
              </p>
            )}
            {refundReq.completedAt?.seconds && (
              <p className="text-xs text-gray-500">
                完了日：{new Date(refundReq.completedAt.seconds * 1000).toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 履歴テーブル */}
      {transactions.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-600">まだ取引履歴がありません。</p>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">日時</th>
                <th className="px-4 py-3 font-medium">種別</th>
                <th className="px-4 py-3 text-right font-medium">増減</th>
                <th className="px-4 py-3 text-right font-medium">残高</th>
                <th className="px-4 py-3 font-medium">内容</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {tx.createdAt?.seconds
                      ? new Date(tx.createdAt.seconds * 1000).toLocaleString('ja-JP')
                      : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={'rounded-full px-3 py-1 text-xs ' + (TYPE_COLORS[tx.type] ?? 'bg-gray-100')}>
                      {TYPE_LABELS[tx.type] ?? tx.type}
                    </span>
                  </td>
                  <td className={'px-4 py-3 text-right font-bold ' + (tx.amount > 0 ? 'text-emerald-700' : 'text-gray-700')}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{tx.balanceAfter}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {tx.reason}
                    {tx.note && <span className="ml-1 text-gray-400">（{tx.note}）</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
