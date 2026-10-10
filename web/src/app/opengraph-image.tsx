import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '代理店・加盟店募集.com';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.7, marginBottom: 20 }}>
          代理店・加盟店・FC のマッチングサイト
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 'bold',
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          代理店・加盟店募集.com
        </div>
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.8 }}>
          いい代理店と、いい募集案件を、ここで。
        </div>
      </div>
    ),
    { ...size }
  );
}
