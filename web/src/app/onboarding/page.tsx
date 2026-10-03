'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

// 案件公開に必要な最低項目だけここで揃える。残りは案件作成時に吸収。
export default function OnboardingPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'advertisers', user.uid)).then((s) => {
      const d = s.data();
      if (!d) return;
      setPrefecture(d.prefecture ?? '');
      setCity(d.city ?? '');
      setRepresentativeName(d.representativeName ?? '');
      setDescription(d.description ?? '');
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'advertisers', user.uid), {
        prefecture,
        city,
        representativeName,
        description,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">あと少しで案件を掲載できます</h1>
        <p className="mt-1 text-sm text-gray-600">
          掲載に必要な最低限の情報だけ入力してください。残りは案件作成時に追加できます。
        </p>
      </div>
      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="都道府県" required>
            <Input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} placeholder="東京都" />
          </Field>
          <Field label="市区町村" required>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="渋谷区" />
          </Field>
        </div>
        <Field label="代表者名" required>
          <Input value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} />
        </Field>
        <Field label="事業内容" required hint="応募者に見える短い紹介文">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </Field>
        <Button
          className="w-full"
          size="lg"
          loading={saving}
          disabled={!prefecture || !city || !representativeName || !description}
          onClick={save}
        >
          保存してダッシュボードへ
        </Button>
      </div>
    </div>
  );
}
