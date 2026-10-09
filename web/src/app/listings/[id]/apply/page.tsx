'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '@/lib/firebase';
import { useListing } from '@/hooks/useListing';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { SmsVerificationBlock } from '@/components/auth/SmsVerificationBlock';
import type { ApplicationInput } from '@/types';

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useListing(id);
  const inquiryId = useRef('');
  const [fields, setFields] = useState({
    fullName: '',
    kana: '',
    email: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    message: '',
  });
  const [preview, setPreview] = useState({
    prefecture: '',
    ageRange: '',
    budget: '',
    hasExperience: false,
  });
  const [smsVerified, setSmsVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!smsVerified) {
      setError('SMS認証を完了してください。');
      return;
    }
    if (!auth.currentUser) {
      setError('SMS認証が完了していません。もう一度お試しください。');
      return;
    }
    if (
      !fields.fullName.trim() ||
      !fields.email.trim() ||
      !fields.phone.trim() ||
      !fields.prefecture.trim() ||
      !fields.city.trim() ||
      !fields.address.trim() ||
      !fields.message.trim()
    ) {
      setError('氏名・メール・電話・住所・応募動機は必須です。');
      return;
    }
    setSending(true);
    setError('');
    try {
      if (!inquiryId.current) inquiryId.current = doc(collection(db, 'inquiries')).id;
      const createInquiry = httpsCallable<ApplicationInput, { inquiryId: string }>(
        functions,
        'createInquiry',
      );
      const result = await createInquiry({
        ...fields,
        listingId: id,
        inquiryId: inquiryId.current,
        maskedPreview: preview,
      });
      router.push(
        `/listings/${id}/apply/complete?inquiryId=${encodeURIComponent(result.data.inquiryId)}`,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : '応募の送信に失敗しました。');
      setSending(false);
    }
  };

  if (state.loading) {
    return <p className="py-12 text-center text-sm text-gray-500">読み込み中…</p>;
  }
  if (state.error || !state.listing) {
    return (
      <p role="alert" className="py-12 text-center text-sm text-red-600">
        {state.error}
      </p>
    );
  }
  if (state.listing.status !== 'published') {
    return (
      <p role="alert" className="py-12 text-center text-sm text-red-600">
        この案件には応募できません。
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">「{state.listing.title}」に応募</h1>
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        {/* 基本情報 */}
        <Field label="氏名" required>
          <Input
            aria-label="氏名"
            required
            maxLength={120}
            value={fields.fullName}
            onChange={(e) => setFields({ ...fields, fullName: e.target.value })}
          />
        </Field>
        <Field label="フリガナ">
          <Input
            aria-label="フリガナ"
            maxLength={120}
            value={fields.kana}
            onChange={(e) => setFields({ ...fields, kana: e.target.value })}
          />
        </Field>
        <Field label="メールアドレス" required>
          <Input
            aria-label="メールアドレス"
            type="email"
            required
            maxLength={254}
            value={fields.email}
            onChange={(e) => setFields({ ...fields, email: e.target.value })}
          />
        </Field>
        <Field label="電話番号" required hint="SMS認証に使用した番号を入力してください">
          <Input
            aria-label="電話番号"
            type="tel"
            required
            maxLength={50}
            value={fields.phone}
            onChange={(e) => setFields({ ...fields, phone: e.target.value })}
          />
        </Field>

        {/* 住所 */}
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">住所</legend>
          <Field label="郵便番号">
            <Input
              aria-label="郵便番号"
              maxLength={10}
              value={fields.postalCode}
              onChange={(e) => setFields({ ...fields, postalCode: e.target.value })}
              placeholder="100-0001"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="都道府県" required>
              <Input
                aria-label="都道府県"
                required
                maxLength={20}
                value={fields.prefecture}
                onChange={(e) => setFields({ ...fields, prefecture: e.target.value })}
                placeholder="東京都"
              />
            </Field>
            <Field label="市区町村" required>
              <Input
                aria-label="市区町村"
                required
                maxLength={50}
                value={fields.city}
                onChange={(e) => setFields({ ...fields, city: e.target.value })}
                placeholder="千代田区"
              />
            </Field>
          </div>
          <Field label="番地" required>
            <Input
              aria-label="番地"
              required
              maxLength={100}
              value={fields.address}
              onChange={(e) => setFields({ ...fields, address: e.target.value })}
              placeholder="1-1-1"
            />
          </Field>
          <Field label="建物名・部屋番号">
            <Input
              aria-label="建物名・部屋番号"
              maxLength={100}
              value={fields.building}
              onChange={(e) => setFields({ ...fields, building: e.target.value })}
              placeholder="〇〇ビル 5F"
            />
          </Field>
        </fieldset>

        <Field label="応募動機" required>
          <Textarea
            aria-label="応募動機"
            required
            maxLength={5000}
            rows={6}
            value={fields.message}
            onChange={(e) => setFields({ ...fields, message: e.target.value })}
          />
        </Field>

        {/* 事前開示情報 */}
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">開示前に募集者が確認できる情報</legend>
          {([
            ['prefecture', '都道府県', 50],
            ['ageRange', '年代', 50],
            ['budget', '予算', 100],
          ] as const).map(([key, label, maxLength]) => (
            <Field key={key} label={label}>
              <Input
                aria-label={label}
                maxLength={maxLength}
                value={preview[key]}
                onChange={(e) => setPreview({ ...preview, [key]: e.target.value })}
              />
            </Field>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preview.hasExperience}
              onChange={(e) => setPreview({ ...preview, hasExperience: e.target.checked })}
            />
            関連業務の経験あり
          </label>
          <p className="text-xs text-gray-500">
            個人を特定できる情報はここに入力しないでください。
          </p>
        </fieldset>

        {!smsVerified && (
          <SmsVerificationBlock
            description="資料請求にはSMS認証が必要です。"
            onVerified={() => setSmsVerified(true)}
          />
        )}
        {smsVerified && (
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            ✓ SMS認証が完了しました
          </div>
        )}

        <p className="text-sm text-gray-600">
          氏名・連絡先・住所・応募動機は、募集者のデポジット消費後に開示されます。
        </p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={sending} disabled={!smsVerified}>
          {smsVerified ? '応募を送信' : 'SMS認証を完了してください'}
        </Button>
      </form>
    </div>
  );
}
