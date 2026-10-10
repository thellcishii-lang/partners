import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Wallet, Users, ShieldCheck, CalendarCheck, TrendingUp, CheckCircle2,
  ArrowRight, Sparkles, Zap, HeartHandshake,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '掲載について | 代理店・加盟店募集.com',
  description: '代理店・加盟店募集を掲載しませんか？初期費用0円・月額0円、応募1件2,500円のデポジット型。最短3日で掲載開始。',
};

export default function ForAdvertisersPage() {
  return (
    <div className="bg-gradient-to-b from-emerald-50/40 to-white">
      {/* ============================================================
          ヒーロー
      ============================================================ */}
      <section className="relative overflow-hidden">
        <div
          className="animate-flow absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(120deg, #d1fae5 0%, #a7f3d0 25%, #bfdbfe 50%, #c7d2fe 75%, #d1fae5 100%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                最短3日で募集スタート
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-[3.5rem]">
                代理店募集を、
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  もっと自由に。
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-emerald-900/80">
                初期費用0円・月額0円。
                <br />
                応募1件につき2,500円のデポジット型だから、
                <br className="hidden sm:block" />
                本当に必要な出会いだけにお金を払う。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30"
                >
                  無料で掲載を始める
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-600/30 bg-white/80 px-8 py-4 text-base font-bold text-emerald-800 backdrop-blur transition hover:border-emerald-600 hover:bg-white"
                >
                  料金を見る
                </Link>
              </div>

              {/* 数字で見る */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-emerald-900/10 pt-6">
                <div>
                  <p className="text-2xl font-bold text-emerald-900">0円</p>
                  <p className="mt-0.5 text-xs text-emerald-800/70">初期費用</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">0円</p>
                  <p className="mt-0.5 text-xs text-emerald-800/70">月額費用</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">2,500円</p>
                  <p className="mt-0.5 text-xs text-emerald-800/70">応募1件〜</p>
                </div>
              </div>
            </div>

            {/* 右側のイラスト的カード */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-emerald-900/10">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">本日の応募</p>
                    <p className="text-lg font-bold">3件</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl bg-emerald-50/60 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-xs font-bold text-emerald-900">新しい応募が届きました</p>
                      </div>
                      <p className="mt-1 pl-4 text-[11px] text-emerald-800/60">東京都・30代・経験あり</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-full bg-emerald-300/40 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          課題
      ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-emerald-600">PROBLEM</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            代理店募集で、こんなお悩みありませんか？
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Wallet, text: '月額費用がかかるだけで、応募が来ない' },
            { icon: Users, text: '資料請求は来るが、契約に繋がらない' },
            { icon: ShieldCheck, text: 'いたずら応募が多く、時間が無駄になる' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          解決策
      ============================================================ */}
      <section className="bg-gradient-to-b from-white to-emerald-50/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-emerald-600">SOLUTION</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              が、すべて解決します
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* 特徴カード */}
            {[
              {
                icon: Wallet,
                title: '初期費用0円・月額費用0円',
                desc: '掲載料は成果報酬のみ。かかる費用は応募1件につき2,500円だけ。予算上限の設定も可能です。',
              },
              {
                icon: ShieldCheck,
                title: 'SMS認証で、いたずら応募ゼロ',
                desc: '応募者は全員SMS認証を実施。本当に商談したい相手からの応募だけが届きます。',
              },
              {
                icon: CalendarCheck,
                title: '登録から3ヶ月間、掲載無料',
                desc: 'まずは気軽に始めて、反響を見てから本格運用。縛りも手数料もありません。',
              },
              {
                icon: Zap,
                title: '最短3日で掲載スタート',
                desc: '登録・案件作成・審査を経て、最短3日で公開。スピード感のある募集を実現します。',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 transition group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{desc}</p>
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-emerald-50 opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          料金
      ============================================================ */}
      <section id="pricing" className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-emerald-600">PRICING</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">料金プラン</h2>
            <p className="mt-3 text-sm text-gray-600">
              シンプルな成果報酬型。必要な時だけ、必要な分だけ。
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <div className="p-6 text-center">
                <p className="text-xs font-bold tracking-wide text-gray-500">初期費用</p>
                <p className="mt-3 text-3xl font-bold text-emerald-700">0<span className="text-base">円</span></p>
              </div>
              <div className="p-6 text-center">
                <p className="text-xs font-bold tracking-wide text-gray-500">月額費用</p>
                <p className="mt-3 text-3xl font-bold text-emerald-700">0<span className="text-base">円</span></p>
              </div>
              <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/60 p-6 text-center">
                <p className="text-xs font-bold tracking-wide text-emerald-700">応募1件あたり</p>
                <p className="mt-3 text-3xl font-bold text-emerald-700">2,500<span className="text-base">円</span></p>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 p-5 text-center">
              <p className="text-xs text-gray-500">
                ※ 応募内容の開示（デポジット消費）は、募集者様が任意に選択できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          使い方
      ============================================================ */}
      <section className="bg-gray-50/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-emerald-600">FLOW</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">掲載までの流れ</h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: '会員登録', desc: 'メールアドレスで簡単登録。SMS認証で本人確認。' },
              { step: '02', title: '案件を作成', desc: '画像も最大6枚まで登録可能。プレビューで確認。' },
              { step: '03', title: '審査', desc: '管理者が内容を確認。承認されると公開。' },
              { step: '04', title: '応募が届く', desc: '応募があるとメール通知。詳細を確認できます。' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold tracking-widest text-emerald-600">
                    STEP {item.step}
                  </p>
                  <h3 className="mt-3 text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-10 text-center text-white shadow-2xl shadow-emerald-600/20 sm:p-14">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <HeartHandshake className="mx-auto h-10 w-10 text-emerald-100" />
              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                まずは無料で始めてみませんか？
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-emerald-50">
                初期費用0円・月額費用0円。3ヶ月間の掲載料も無料です。
                <br />
                貴社にぴったりの代理店と出会いましょう。
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50 sm:w-auto"
                >
                  無料で掲載を始める
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10 sm:w-auto"
                >
                  まずはサイトを見る
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-emerald-50/80">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  クレジットカード登録不要
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  いつでも解約可能
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
