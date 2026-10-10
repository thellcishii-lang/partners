import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 6,
          background: '#1e293b',
          padding: 12,
        }}
      >
        <div style={{ width: 10, height: 16, background: '#38bdf8', borderRadius: 2 }} />
        <div style={{ width: 10, height: 28, background: '#38bdf8', borderRadius: 2 }} />
        <div style={{ width: 10, height: 40, background: '#38bdf8', borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
