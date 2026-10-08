import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '掲載について | 代理店募集・加盟店募集.com',
  description: '代理店・加盟店募集を掲載しませんか？登録3ヶ月無料、デポジット型で必要な問い合わせだけにお金を払う。最短3日で掲載開始。',
};

export default function ForAdvertisersPage() {
  return (
    <div className="space-y-16">
      {/* ヒーロー */}
      <section className="animate-flow relative left-1/2 w-screen -translate-x-1/2"
        style={{
          backgroundImage: 'linear-gradient(120deg, #d1fae5 0%, #a7f3d0 25%, #bfdbfe 50%, #c7d2fe 75%, #d1fae5 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-emerald-900 sm:py-28">
          <p className="mb-3 text-sm font-bold tracking-wide text-emerald-700">
            業界最速！最短3日で募集スタート
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            代理店募集を、もっと簡単に。
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-emerald-800 sm:text-base">
            初期費用0円・月額費用0円。応募1件につき2,500円のデポジット型。
            必要な問い合わせにだけ、お金を払う。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                無料で掲載を始める
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="w-full border-emerald-600 bg-white text-emerald-800 hover:bg-emerald-50 sm:w-auto">
                料金を見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* お悩み */}
      <section className="mx-auto max-w-4xl px-4">
        <h2 className="mb-6 text-center text-2xl font-bold">
          代理店募集で、こんなお悩みありませんか？
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            '代理店募集を始めたいが、何から手をつけていいか分からない',
            '時間と費用をかけて募集しているが、反響が少ない',
            '資料請求は来るが、契約に繋がらない',
          ].map((text) => (
            <div key={text} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 解決策（特徴） */}
      <section className="mx-auto max-w-4xl px-4">
        <h2 className="mb-2 text-center text-2xl font-bold">
          が解決します！
        </h2>
        <div className="mt-8 space-y-6">
          {/* 特徴1 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-emerald-700">
              1. 初期費用・月額費用0円
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              掲載料金は成果報酬のみ。かかる費用は応募1件につき2,500円だけ。
              ご予算に応じて上限設定も可能です。
            </p>
          </div>

          {/* 特徴2 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-emerald-700">
              2. SMS認証で安心・確実な応募
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              応募者は全員SMS認証を実施。いたずらや重複応募を防ぎ、
              本当に商談したい相手からの応募だけが届きます。
            </p>
          </div>

          {/* 特徴3 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-emerald-700">
              3. 掲載は3ヶ月間無料
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              登録から3ヶ月間は掲載料が無料。
              まずは気軽に始めて、反響を見てから本格運用できます。
            </p>
          </div>

          {/* 特徴4 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-emerald-700">
              4. いつでも掲載停止可能
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              募集状況に応じて、いつでも公開・非公開を切り替えられます。
              手数料も縛りもありません。
            </p>
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section id="pricing" className="mx-auto max-w-4xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold">料金</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-xs text-gray-500">初期費用</p>
            <p className="mt-2 text-4xl font-bold text-emerald-700">0円</p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-xs text-gray-500">月額費用</p>
            <p className="mt-2 text-4xl font-bold text-emerald-700">0円</p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-2 ring-emerald-400">
            <p className="text-xs text-gray-500">応募1件あたり</p>
            <p className="mt-2 text-4xl font-bold text-emerald-700">2,500円</p>
            <p className="mt-1 text-xs text-gray-500">デポジット消費型</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          ※ 応募内容の開示（デポジット消費）は、募集者様が任意に選択できます。
        </p>
      </section>

      {/* 使い方 */}
      <section className="mx-auto max-w-4xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold">掲載までの流れ</h2>
        <ol className="space-y-4">
          {[
            { step: '1', title: '会員登録', desc: 'メールアドレスで簡単登録。SMS認証で本人確認。' },
            { step: '2', title: '案件を作成', desc: '案件タイトル・募集内容・条件などを入力。画像も最大6枚まで登録可能。' },
            { step: '3', title: '審査', desc: '管理者が内容を確認。承認されるとサイトに公開されます。' },
            { step: '4', title: '応募が届く', desc: '応募があるとメールで通知。デポジットを追加すると応募者の詳細情報が確認できます。' },
          ].map((item) => (
            <li key={item.step} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-8 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-10">
          <h2 className="text-2xl font-bold text-emerald-900">
            まずは無料で始めてみませんか？
          </h2>
          <p className="mt-3 text-sm text-emerald-800">
            初期費用0円・月額費用0円。3ヶ月間の掲載料も無料です。
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                無料で掲載を始める
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="w-full border-emerald-600 bg-white text-emerald-800 hover:bg-emerald-50 sm:w-auto">
                まずはサイトを見る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
