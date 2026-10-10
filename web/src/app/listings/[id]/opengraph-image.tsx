import { ImageResponse } from 'next/og';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const alt = '案件詳細';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { id: string };
}) {
  let title = '案件';
  let companyName = '';

  try {
    const db = getAdminDb();
    const snap = await db.collection('listings').doc(params.id).get();
    if (snap.exists) {
      const data = snap.data()!;
      title = ((data.title as string) ?? '案件').slice(0, 60);
      companyName = (data.companyName as string) ?? '';
    }
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
          color: '#064e3b',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 28, color: '#059669', fontWeight: 'bold' }}>
          代理店・加盟店募集.com
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: '#64748b' }}>
          {companyName}
        </div>
      </div>
    ),
    { ...size }
  );
}
