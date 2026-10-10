import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.代理店・加盟店募集.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/applicant',
        '/login',
        '/signup',
        '/onboarding',
        '/deposit',
        '/listings/*/apply',
        '/listings/*/edit',
        '/listings/new',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
