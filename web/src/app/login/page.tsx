'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo('パスワードリセット用のメールを送信しました。メールをご確認ください。');
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-lg font-bold">ログイン</h1>

      <Field label="メールアドレス" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>

      <Field label="パスワード" required>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <div className="text-right">
        <button
          type="button"
          onClick={resetPassword}
          disabled={resetLoading}
          className="text-xs text-brand-600 hover:underline disabled:opacity-50"
        >
          {resetLoading ? '送信中…' : 'パスワードをお忘れですか？'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {info && <p className="text-sm text-emerald-700">{info}</p>}

      <Button className="w-full" size="lg" loading={loading} onClick={submit}>
        ログイン
      </Button>

      <Button variant="outline" className="w-full" onClick={google}>
        Google でログイン
      </Button>
    </div>
  );
}
