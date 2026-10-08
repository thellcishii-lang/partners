'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GUIDE_ARTICLES,
  CATEGORY_LABELS,
  type GuideCategory,
  type GuideArticle,
} from '@/lib/guideArticles';
import './guide.css';

type Filter = GuideCategory | 'all';

function useScrollReveal() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.guide-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function GuideClient() {
  useScrollReveal();
  const [filter, setFilter] = useState<Filter>('all');

  const categories: Filter[] = ['all', ...Object.keys(CATEGORY_LABELS) as GuideCategory[]];

  const filtered = filter === 'all'
    ? GUIDE_ARTICLES
    : GUIDE_ARTICLES.filter((a) => a.category === filter);

  const countByCategory = (cat: Filter) =>
    cat === 'all' ? GUIDE_ARTICLES.length : GUIDE_ARTICLES.filter((a) => a.category === cat).length;

  return (
    <div className="guide-page">
      {/* ヒーロー */}
      <section className="guide-hero">
        <div className="guide-hero-inner">
          <div>
            <span className="guide-hero-badge">
              📖 Guide
            </span>
            <h1>
              代理店で起業する、<br />
              <span className="accent">実践ガイド。</span>
            </h1>
            <p>
              1から全てを作り上げるのは、費用も時間もかかる。
              既存のプラットフォームに乗ることで、
              少ないリスクで、確実に事業を始められます。
            </p>
            <div className="guide-hero-stats">
              <div>
                <div className="guide-hero-stat-num">
                  {GUIDE_ARTICLES.length}<small>本</small>
                </div>
                <div className="guide-hero-stat-label">公開中の記事</div>
              </div>
              <div>
                <div className="guide-hero-stat-num">
                  6<small>カテゴリ</small>
                </div>
                <div className="guide-hero-stat-label">起業・比較・業種別</div>
              </div>
            </div>
          </div>

          <div className="guide-hero-art">
            <div className="guide-hero-card is-1">
              <div className="guide-hero-card-icon">🚀</div>
              <div className="guide-hero-card-title">起業・独立</div>
              <div className="guide-hero-card-text">1から始めない選択</div>
            </div>
            <div className="guide-hero-card is-2">
              <div className="guide-hero-card-icon">📊</div>
              <div className="guide-hero-card-title">比較で見極める</div>
              <div className="guide-hero-card-text">複数を並べて、納得してから決める</div>
            </div>
            <div className="guide-hero-card is-3">
              <div className="guide-hero-card-icon">🌱</div>
              <div className="guide-hero-card-title">スモールスタート</div>
              <div className="guide-hero-card-text">初期費用0円から始める</div>
            </div>
          </div>
        </div>
      </section>

      {/* フィルタタブ */}
      <div className="guide-filters">
        <div className="guide-filters-inner">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={'guide-filter-btn' + (filter === cat ? ' is-active' : '')}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'すべて' : CATEGORY_LABELS[cat]}
              <span className="guide-filter-count">{countByCategory(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 記事グリッド */}
      <section className="guide-section">
        <div className="guide-container">
          <div className="guide-section-head">
            <h2>
              {filter === 'all' ? 'すべての記事' : CATEGORY_LABELS[filter]}
            </h2>
            <p>{filtered.length}件の記事</p>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">このカテゴリの記事は、まだ準備中です。</p>
            </div>
          )}

          <div className="guide-grid">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>

          {/* CTA */}
          <div className="guide-cta guide-reveal">
            <div className="guide-cta-inner">
              <h2>あなたに合った代理店を、探してみませんか？</h2>
              <p>
                まずは案件を眺めてみるだけでも、見えてくるものがあります。<br />
                複数を比較して、納得してから始めましょう。
              </p>
              <Link href="/listings" className="guide-cta-btn">
                案件を探す
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: GuideArticle }) {
  const badgeClass = `guide-card-badge is-${article.category}`;
  return (
    <Link
      href={`/guide/${article.slug}`}
      className={'guide-card guide-reveal' + (article.featured ? ' is-featured' : '')}
    >
      <span className={badgeClass}>
        {CATEGORY_LABELS[article.category]}
      </span>
      <h3 className="guide-card-title">{article.title}</h3>
      <p className="guide-card-desc">{article.description}</p>
      <div className="guide-card-meta">
        <span className="guide-card-meta-item">
          📅 {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
        </span>
        <span className="guide-card-meta-item">
          ⏱ 約{article.readingMinutes}分
        </span>
        <span className="guide-card-arrow">→</span>
      </div>
    </Link>
  );
}
