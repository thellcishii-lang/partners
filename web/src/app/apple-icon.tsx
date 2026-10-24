import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 }; // iOS推奨サイズ
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 12,
          // ★重要：iOSは透過を嫌うため、必ず不透明な背景色を指定する
          background: '#1e293b', 
          padding: 36,
        }}
      >
        {/* icon.tsx と同じ図形（サイズを180に合わせて拡大） */}
        <div style={{ width: 24, height: 40, background: '#38bdf8', borderRadius: 4 }} />
        <div style={{ width: 24, height: 72, background: '#38bdf8', borderRadius: 4 }} />
        <div style={{ width: 24, height: 104, background: '#38bdf8', borderRadius: 4 }} />
      </div>
    ),
    { ...size }
  );
}
