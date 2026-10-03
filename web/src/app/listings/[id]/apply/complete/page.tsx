'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ApplicationCompletePage() {
  return <Suspense fallback={<p>読み込み中…</p>}><ApplicationStatus /></Suspense>;
}

function ApplicationStatus() {
  const { user, loading } = useRequireAuth();
  const inquiryId = useSearchParams().get('inquiryId');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setStatus('');
    setError('');
    if (!user) return;
    if (!inquiryId || !/^[a-zA-Z0-9]{20}$/.test(inquiryId)) {
      setError('応募IDが正しくありません。');
      return;
    }
    return onSnapshot(doc(db, 'inquiries', inquiryId), (snap) => {
      if (!snap.exists() || snap.get('applicantId') !== user.uid) {
        setStatus('');
        setError('応募が見つかりません。');
        return;
      }
      setError('');
      setStatus(snap.get('status'));
    }, (error) => { setStatus(''); setError(error.message); });
  }, [user, inquiryId]);

  if (loading || !user) return <p>読み込み中…</p>;
  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">{error ? '応募状況を確認できません' : status ? '応募を受け付けました' : '応募状況を確認中…'}</h1>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {status && <p>{status === 'pending'
        ? '現在、開示処理中またはデポジット不足による保留中です。追加後に自動で開示されます。'
        : ['delivered', 'won', 'lost'].includes(status)
          ? '応募情報が募集者に開示されました。'
          : `応募状態：${status}`}</p>}
      <Link href="/listings" className="text-brand-700 underline">案件一覧に戻る</Link>
    </div>
  );
}
