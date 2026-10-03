'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useListing } from '@/hooks/useListing';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import type { ApplicationInput } from '@/types';

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const state = useListing(id);
  const inquiryId = useRef('');
  const [fields, setFields] = useState({ fullName: '', kana: '', email: '', phone: '', lineId: '', message: '' });
  const [preview, setPreview] = useState({ prefecture: '', ageRange: '', budget: '', hasExperience: false });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || sending) return;
    if (!fields.fullName.trim() || !fields.message.trim() || !(fields.email || user.email)?.trim()) {
      setError('氏名・メールアドレス・応募動機は必須です。');
      return;
    }
    setSending(true);
    setError('');
    try {
      if (!inquiryId.current) inquiryId.current = doc(collection(db, 'inquiries')).id;
      const createInquiry = httpsCallable<ApplicationInput, { inquiryId: string }>(functions, 'createInquiry');
      const result = await createInquiry({
        ...fields,
        email: fields.email || user.email || '',
        listingId: id,
        inquiryId: inquiryId.current,
        maskedPreview: preview,
      });
      router.push(`/listings/${id}/apply/complete?inquiryId=${encodeURIComponent(result.data.inquiryId)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : '応募の送信に失敗しました。');
      setSending(false);
    }
  };

  if (loading || !user || state.loading) return <p>読み込み中…</p>;
  if (state.error || !state.listing) return <p role="alert" className="text-red-600">{state.error}</p>;
  if (state.listing.status !== 'published' || state.listing.advertiserId === user.uid) {
    return <p role="alert" className="text-red-600">この案件には応募できません。</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">「{state.listing.title}」に応募</h1>
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        {([
          ['fullName', '氏名', 120],
          ['kana', 'フリガナ', 120],
          ['email', 'メールアドレス', 254],
          ['phone', '電話番号', 50],
          ['lineId', 'LINE ID', 100],
        ] as const).map(([key, label, maxLength]) => (
          <Field key={key} label={label} required={key === 'fullName' || key === 'email'}>
            <Input aria-label={label} maxLength={maxLength}
              type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
              required={key === 'fullName' || key === 'email'}
              value={key === 'email' ? fields.email || user.email || '' : fields[key]}
              onChange={(e) => setFields({ ...fields, [key]: e.target.value })} />
          </Field>
        ))}
        <Field label="応募動機" required>
          <Textarea aria-label="応募動機" required maxLength={5000} rows={6}
            value={fields.message} onChange={(e) => setFields({ ...fields, message: e.target.value })} />
        </Field>
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">開示前に募集者が確認できる情報</legend>
          {([
            ['prefecture', '都道府県', 50],
            ['ageRange', '年代', 50],
            ['budget', '予算', 100],
          ] as const).map(([key, label, maxLength]) => (
            <Field key={key} label={label}>
              <Input aria-label={label} maxLength={maxLength} value={preview[key]}
                onChange={(e) => setPreview({ ...preview, [key]: e.target.value })} />
            </Field>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={preview.hasExperience}
              onChange={(e) => setPreview({ ...preview, hasExperience: e.target.checked })} />
            関連業務の経験あり
          </label>
          <p className="text-xs text-gray-500">個人を特定できる情報はここに入力しないでください。</p>
        </fieldset>
        <p className="text-sm text-gray-600">氏名・連絡先・応募動機は、募集者のデポジット消費後に開示されます。</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={sending}>応募を送信</Button>
      </form>
    </div>
  );
}
