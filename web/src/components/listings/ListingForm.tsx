'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { LISTING_CATEGORIES, type Advertiser, type Listing, type ListingCategory } from '@/types';

export function ListingForm({ advertiser, listing }: { advertiser: Advertiser; listing?: Listing }) {
  const router = useRouter();
  const [title, setTitle] = useState(listing?.title ?? '');
  const [category, setCategory] = useState<ListingCategory>(listing?.category ?? '代理店');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [fields, setFields] = useState({
    requirements: listing?.requirements ?? '',
    reward: listing?.reward ?? '',
    initialCost: listing?.initialCost ?? '',
    royalty: listing?.royalty ?? '',
    area: listing?.area ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const status = submitter instanceof HTMLButtonElement && submitter.value === 'reviewing'
      ? 'reviewing' : 'draft';
    if (!title.trim() || title.trim().length > 120 || !description.trim()) {
      setError('タイトルは1〜120字、募集内容は必須です。');
      return;
    }
    if (!advertiser.companyName?.trim()) {
      setError('募集者プロフィールに会社名を登録してから案件を保存してください。');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        title: title.trim(),
        category,
        description: description.trim(),
        ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()])),
        companyName: advertiser.companyName,
        status,
        updatedAt: serverTimestamp(),
      };
      if (listing) {
        await updateDoc(doc(db, 'listings', listing.id), data);
      } else {
        await addDoc(collection(db, 'listings'), {
          ...data,
          advertiserId: advertiser.uid,
          images: [],
          publishedAt: null,
          createdAt: serverTimestamp(),
        });
      }
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : '案件の保存に失敗しました。');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="案件タイトル" required>
        <Input aria-label="案件タイトル" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="種別" required>
        <select aria-label="種別" className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
          value={category} onChange={(e) => {
            const value = LISTING_CATEGORIES.find((item) => item === e.target.value);
            if (value) setCategory(value);
          }}>
          {LISTING_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <Field label="募集内容" required>
        <Textarea aria-label="募集内容" required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      {([
        ['requirements', '応募条件'],
        ['reward', '報酬体系'],
        ['initialCost', '初期費用'],
        ['royalty', 'ロイヤリティ'],
        ['area', '募集エリア'],
      ] as const).map(([key, label]) => (
        <Field key={key} label={label}>
          <Textarea aria-label={label} rows={2} value={fields[key]}
            onChange={(e) => setFields({ ...fields, [key]: e.target.value })} />
        </Field>
      ))}
      <p className="text-sm text-gray-500">画像アップロードは今後対応予定です。</p>
      {listing && <p className="text-sm text-gray-600">保存すると下書き、または審査中になります。再公開には審査が必要です。</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" value="draft" variant="outline" disabled={saving}>下書き保存</Button>
        <Button type="submit" value="reviewing" loading={saving}>審査申請</Button>
      </div>
    </form>
  );
}
