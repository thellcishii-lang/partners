'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import type { Advertiser } from '@/types';

type AdminAdvertiser = Advertiser & { email?: string };

export default function AdminAdvertiserEditPage() {
  const { uid } = useParams<{ uid: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!uid) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'advertisers', uid));
        if (!snap.exists()) {
          setError('掲載主が見つかりません。');
          return;
        }
        const d = snap.data() as AdminAdvertiser;
        if (!active) return;
        setCompanyName(d.companyName ?? '');
        setIndustry(d.industry ?? '');
        setPostalCode(d.postalCode ?? '');
        setPrefecture(d.prefecture ?? '');
        setCity(d.city ?? '');
        setAddress(d.address ?? '');
        setBuilding(d.building ?? '');
        setRepresentativeName(d.representativeName ?? '');
        setPhone(d.phone ?? '');
        setWebsite(d.website ?? '');
        setDescription(d.description ?? '');
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '取得に失敗しました。');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [uid]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid || saving) return;
    if (!companyName.trim()) {
      setError('会社名 / 屋号は必須です。');
      return;
    }
    if (companyName.trim().length > 100) {
      setError('会社名は100文字以内で入力してください。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'advertisers', uid), {
        companyName: companyName.trim(),
        industry: industry.trim() || null,
        postalCode: postalCode.trim() || null,
        prefecture: prefecture.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,
        building: building.trim() || null,
        representativeName: representativeName.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        updatedAt: serverTimestamp(),
      });
      router.push(`/admin/advertisers/${uid}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。');
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/advertisers/${uid}`} className="text-xs text-gray-500 hover:underline">
          ← 掲載主の詳細
        </Link>
        <h2 className="mt-2 text-lg font-bold">プロフィールを編集</h2>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-800">
        <strong>管理者モード</strong>：プロフィールを代理編集しています。
        保存すると即座に募集者の画面へ反映されます。
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-bold">基本情報</h3>
          <Field label="会社名 / 屋号" required>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={100}
              required
            />
          </Field>
          <Field label="業種">
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例：美容、飲食、IT"
            />
          </Field>
          <Field label="代表者名">
            <Input
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
            />
          </Field>
          <Field label="電話番号">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03-0000-0000"
            />
          </Field>
          <Field label="Webサイト">
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="事業内容">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="応募者に見える短い紹介文"
            />
          </Field>
        </section>

        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-bold">所在地</h3>
          <Field label="郵便番号">
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="100-0001"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="都道府県">
              <Input
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                placeholder="東京都"
              />
            </Field>
            <Field label="市区町村">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="千代田区"
              />
            </Field>
          </div>
          <Field label="番地">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="1-1-1"
            />
          </Field>
          <Field label="建物名・部屋番号">
            <Input
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="◯◯ビル 5F"
            />
          </Field>
        </section>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href={`/admin/advertisers/${uid}`}>
            <Button type="button" variant="outline" disabled={saving}>
              キャンセル
            </Button>
          </Link>
          <Button type="submit" loading={saving}>
            保存する
          </Button>
        </div>
      </form>
    </div>
  );
}
