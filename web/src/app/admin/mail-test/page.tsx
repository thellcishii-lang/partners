'use client';

import { useState, type FormEvent } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useEffect } from 'react';

const TEMPLATES = [
  { value: 'WELCOME_ADVERTISER', label: '登録完了（募集者）' },
  { value: 'INQUIRY_DELIVERED', label: '応募開示（募集者）' },
  { value: 'INQUIRY_HELD_NO_DEPOSIT', label: '応募保留（募集者）' },
  { value: 'INQUIRY_REPEAT', label: '2回目の応募（募集者）' },
  { value: 'DEPOSIT_LOW', label: 'デポジット残少（募集者）' },
  { value: 'DEPOSIT_ZERO', label: 'デポジット0（募集者）' },
  { value: 'DEPOSIT_PURCHASED', label: '購入完了（募集者）' },
  { value: 'PENDING_RELEASED', label: '保留解放（募集者）' },
  { value: 'FREE_TRIAL_ENDING', label: '無料期間終了（募集者）' },
  { value: 'FREE_TRIAL_ENDING_2MONTH', label: '無料期間2ヶ月（募集者）' },
  { value: 'FREE_TRIAL_ENDING_10DAYS', label: '無料期間10日前（募集者）' },
  { value: 'FREE_TRIAL_ENDING_TOMORROW', label: '無料期間前日（募集者）' },
  { value: 'FREE_TRIAL_ENDED', label: '無料期間終了・停止（募集者）' },
  { value: 'APPLICATION_RECEIVED', label: '応募受付（応募者）' },
  { value: 'APPLICATION_EXPIRED', label: '応募期限切れ（応募者）' },
  { value: 'LISTING_APPROVED', label: '案件承認（募集者）' },
  { value: 'LISTING_REJECTED', label: '案件却下（募集者）' },
  { value: 'LISTING_EDIT_APPROVED', label: '編集承認（募集者）' },
  { value: 'LISTING_EDIT_REJECTED', label: '編集却下（募集者）' },
  { value: 'APPLICANT_RESOURCES', label: '資料送付（応募者）' },
];

type MailLog = {
  id: string;
  template: string;
  to: string;
  status: string;
  error: string | null;
  attachmentCount?: number;
  createdAt?: { seconds: number };
};

export default function MailTestPage() {
  const [template, setTemplate] = useState(TEMPLATES[0].value);
  const [to, setTo] = useState('');
  const [advertiserName, setAdvertiserName] = useState('山田建設株式会社');
  const [listingTitle, setListingTitle] = useState('AI SaaSの代理店募集');
  const [applicantName, setApplicantName] = useState('田中 太郎');
  const [balance, setBalance] = useState('3');
  const [credits, setCredits] = useState('4');
  const [reason, setReason] = useState('テスト理由');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<MailLog[]>([]);

  // 直近のテスト送信ログを監視
  useEffect(() => {
    const q = query(
      collection(db, 'mailLogs'),
      where('to', '==', to || '__none__'),
      orderBy('createdAt', 'desc'),
      limit(5),
    );
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MailLog)));
    });
    return () => unsub();
  }, [to]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    try {
      const fn = httpsCallable<
        Record<string, unknown>,
        { ok: boolean; template: string; to: string }
      >(functions, 'sendTestMail');
      await fn({
        template,
        to,
        params: {
          advertiserName,
          listingTitle,
          applicantName,
          balance: Number(balance) || 0,
          credits: Number(credits) || 0,
          releasedCount: 0,
          remainingPending: 0,
          reason,
          freeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました。');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">メールテスト送信</h2>
        <p className="mt-1 text-xs text-gray-500">
          テンプレートを選んで、送信先とパラメータを入力して送信します。
        </p>
      </div>

      <form onSubmit={send} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <Field label="テンプレート" required>
          <select
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {TEMPLATES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="送信先メールアドレス" required>
          <Input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="募集者名（advertiserName）">
            <Input value={advertiserName} onChange={(e) => setAdvertiserName(e.target.value)} />
          </Field>
          <Field label="案件タイトル（listingTitle）">
            <Input value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} />
          </Field>
          <Field label="応募者名（applicantName）">
            <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} />
          </Field>
          <Field label="残高（balance）">
            <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </Field>
          <Field label="クレジット数（credits）">
            <Input type="number" value={credits} onChange={(e) => setCredits(e.target.value)} />
          </Field>
          <Field label="理由（reason）">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={sending} disabled={!to}>
          送信する
        </Button>
      </form>

      {to && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold">直近の送信ログ（{to}）</h3>
          <p className="mt-1 text-xs text-gray-500">
            数秒で `status` が `sent` または `failed` に変わります。
          </p>
          <div className="mt-4 space-y-2">
            {logs.length === 0 && (
              <p className="text-xs text-gray-400">まだログがありません。</p>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className={
                  'rounded-lg border p-3 text-xs ' +
                  (log.status === 'sent'
                    ? 'border-emerald-200 bg-emerald-50'
                    : log.status === 'failed'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50')
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{log.template}</span>
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-[10px] font-bold ' +
                      (log.status === 'sent'
                        ? 'bg-emerald-600 text-white'
                        : log.status === 'failed'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-400 text-white')
                    }
                  >
                    {log.status}
                  </span>
                </div>
                {log.error && (
                  <p className="mt-1 break-all text-red-700">{log.error}</p>
                )}
                {log.attachmentCount !== undefined && (
                  <p className="mt-1 text-gray-500">添付: {log.attachmentCount}件</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
