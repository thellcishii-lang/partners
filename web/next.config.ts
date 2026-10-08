import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['firebase-admin'],
  outputFileTracingIncludes: {
    '/guide/[slug]': ['./src/content/guide/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async rewrites() {
    if (process.env.CODESPACES !== 'true' || process.env.NEXT_PUBLIC_USE_EMULATOR !== 'true') {
      return [];
    }
    return [
      {
        source: '/identitytoolkit.googleapis.com/:path*',
        destination: 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/:path*',
      },
      {
        source: '/securetoken.googleapis.com/:path*',
        destination: 'http://127.0.0.1:9099/securetoken.googleapis.com/:path*',
      },
      {
        source: '/emulator/auth/:path*',
        destination: 'http://127.0.0.1:9099/emulator/auth/:path*',
      },
      {
        source: '/__firebase/functions/:path*',
        destination: 'http://127.0.0.1:5001/:path*',
      },
      {
        source: '/google.firestore.v1.Firestore/:path*',
        destination: 'http://127.0.0.1:8080/google.firestore.v1.Firestore/:path*',
      },
      {
        source: '/v1/:path*',
        destination: 'http://127.0.0.1:8080/v1/:path*',
      },
      {
        source: '/v0/:path*',
        destination: 'http://127.0.0.1:9199/v0/:path*',
      },
    ];
  },
};

export default config;
