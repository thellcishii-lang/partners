'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export default function ApplicationCompletePage() {
  return <Suspense fallback={<p>読み込み中…</p>}><ApplicationStatus /></Suspense>;
}

function ApplicationStatus() {
  const inquiryId = useSearchParams().get('inquiryId');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // 応募者はログイン不要。来たら即サインアウト。
  useEffect(() => {
    if (auth.currentUser) {
      signOut(auth).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setStatus('');
    setError('');
    if (!inquiryId || !/^[a-zA-Z0-9]{20}$/.test(inquiryId)) {
      setError('応募IDが正しくありません。');
      return;
    }
    return onSnapshot(doc(db, 'inquiries', inquiryId), (snap) => {
      if (!snap.exists()) {
        setStatus('');
        setError('応募が見つかりません。');
        return;
      }
      setError('');
      setStatus(snap.get('status'));
    }, (e) => { setStatus(''); setError(e.message); });
  }, [inquiryId]);

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">
        {error ? '応募状況を確認できません'
          : status === 'delivered' || status === 'won' || status === 'lost'
            ? '資料請求ありがとうございます'
            : status === 'pending'
              ? '受け付けました（開示は保留中）'
              : '応募状況を確認中…'}
      </h1>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {status === 'pending' && (
        <p className="text-sm text-gray-700">
          現在、募集者のデポジット残高が不足しているため、資料の開示は保留状態です。
          募集者がデポジットを追加すると、自動的に資料が送付されます。
        </p>
      )}
      {(status === 'delivered' || status === 'won' || status === 'lost') && (
        <p className="text-sm text-gray-700">
          資料を記載のメールアドレス宛にお送りしました。ご確認ください。
        </p>
      )}
      <Link href="/listings" className="text-brand-700 underline">案件一覧に戻る</Link>
    </div>
  );
}
