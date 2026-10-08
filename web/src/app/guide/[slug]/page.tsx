import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import {
  GUIDE_ARTICLES,
  CATEGORY_LABELS,
  getArticleBySlug,
  getArticlesByCategory,
} from '@/lib/guideArticles';
import './article.css';

const SITE_URL = 'https://partners-tau-kohl.vercel.app';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: '記事が見つかりません' };
  return {
    title: `${article.title} | 代理店募集・加盟店募集.com`,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: `/guide/${slug}` },
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      title: article.title,
      description: article.description,
      url: `/guide/${slug}`,
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

async function loadArticleBody(slug: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'guide', `${slug}.md`);
    const raw = await readFile(filePath, 'utf8');
    const html = await marked.parse(raw);
    // 「[ 案件を探す ]」という文字列を CTA ボタンに置換
    return html.replace(
      /<p>\s*\[\s*案件を探す\s*\]\s*<\/p>/g,
      `<div style="text-align:center;margin:40px 0;">
         <a href="/listings" style="display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:linear-gradient(135deg,#059669,#14b8a6);color:#fff;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 8px 24px -8px rgba(5,150,105,0.4);">
           案件を探す →
         </a>
       </div>`
    );
  } catch {
    return '<p>この記事の本文は準備中です。</p>';
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const bodyHtml = await loadArticleBody(slug);
  const related = getArticlesByCategory(article.category)
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: 'ja-JP',
    url: `${SITE_URL}/guide/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: '代理店募集・加盟店募集.com',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'ガイド', item: `${SITE_URL}/guide` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/guide/${slug}` },
    ],
  };

  return (
    <>
      <div className="article-page">
        <div className="article-container">
          <nav className="article-breadcrumb">
            <Link href="/">ホーム</Link>
            <span className="sep">/</span>
            <Link href="/guide">ガイド</Link>
            <span className="sep">/</span>
            <span className="current">{article.title}</span>
          </nav>

          <header className="article-header">
            <span className={`article-header-badge is-${article.category}`}>
              {CATEGORY_LABELS[article.category]}
            </span>
            <h1>{article.title}</h1>
            <p className="article-header-desc">{article.description}</p>
            <div className="article-header-meta">
              <span>
                📅 {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
              </span>
              <span>⏱ 約{article.readingMinutes}分で読めます</span>
            </div>
          </header>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* 記事末尾 CTA */}
          <div className="article-cta">
            <div className="article-cta-inner">
              <h3>あなたに合った代理店を、探してみませんか？</h3>
              <p>
                まずは案件を眺めてみるだけでも、見えてくるものがあります。<br />
                複数を比較して、納得してから始めましょう。
              </p>
              <Link href="/listings" className="article-cta-btn">
                案件を探す
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 関連記事 */}
          {related.length > 0 && (
            <section className="article-related">
              <h3>関連記事</h3>
              <div className="article-related-grid">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/guide/${r.slug}`}
                    className="article-related-card"
                  >
                    <p className="article-related-title">{r.title}</p>
                    <p className="article-related-desc">{r.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
