import type { MetadataRoute } from 'next';

const SITE_URL = 'https://partners-tau-kohl.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/login', '/signup', '/onboarding'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
