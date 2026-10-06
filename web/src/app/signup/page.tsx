'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // アカウント作成は Step2 完了時に実行
  const createAccount = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      // users/{uid}
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
      });

      // advertisers/{uid} — 課金フィールドはクライアントから書けないので
      // ここでは触らない。Functions（次フェーズ）で初期残高を付与する。
      await setDoc(doc(db, 'advertisers', cred.user.uid), {
        email: cred.user.email,
        companyName,
        industry: industry || null,
        phone: phone || null,
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStep(3);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登録に失敗しました';
      setError(msg.includes('email-already-in-use') ? 'このメールは既に登録済みです' : msg);
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;

      await setDoc(
        doc(db, 'users', uid),
        {
          email: cred.user.email,
          displayName: cred.user.displayName ?? '',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      await setDoc(
        doc(db, 'advertisers', uid),
        {
          email: cred.user.email,
          companyName: '',
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Stepper step={step} />

      {step === 1 && (
        <div className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">まずはアカウントを作成</h2>
          <Field label="メールアドレス" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="パスワード" required hint="8文字以上">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="お名前" required>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="山田 太郎" />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            className="w-full"
            size="lg"
            disabled={!email || password.length < 8 || !displayName}
            onClick={() => setStep(2)}
          >
            次へ
          </Button>
          <div className="relative text-center text-xs text-gray-400">
            <span className="bg-white px-2 relative z-10">または</span>
            <div className="absolute left-0 right-0 top-1/2 border-t" />
          </div>
          <Button variant="outline" className="w-full" onClick={googleSignup} loading={loading}>
            Google で登録
          </Button>
          <p className="text-center text-sm text-gray-500">
            既にアカウントをお持ちの方は <Link href="/login" className="text-brand-600 hover:underline">ログイン</Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">会社・屋号について</h2>
          <Field label="会社名 / 屋号" required>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>
          <Field label="業種">
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="例：美容、飲食、IT" />
          </Field>
          <Field label="電話番号" hint="応募者に開示されます。あとから設定できます">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03-0000-0000" />
          </Field>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span>
              <Link href="/legal/terms" className="text-brand-600 hover:underline">利用規約</Link>
              ・
              <Link href="/legal/privacy" className="text-brand-600 hover:underline">プライバシーポリシー</Link>
              に同意します
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">戻る</Button>
            <Button
              className="flex-1"
              disabled={!companyName || !agree}
              loading={loading}
              onClick={createAccount}
            >
              登録する
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-lg font-bold">登録が完了しました</h2>
          <p className="text-sm text-gray-600">
            3ヶ月間、掲載料は完全無料です。<br />
            さっそく最初の案件を登録しましょう。
          </p>
          <Button className="w-full" size="lg" onClick={() => router.push('/onboarding')}>
            次へ進む
          </Button>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-3 text-xs">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-3">
          <div
            className={
              'flex h-7 w-7 items-center justify-center rounded-full font-bold ' +
              (n <= step ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500')
            }
          >
            {n}
          </div>
          {n < 3 && <div className={'h-0.5 w-8 ' + (n < step ? 'bg-brand-600' : 'bg-gray-200')} />}
        </div>
      ))}
    </div>
  );
}
