import { ImageResponse } from 'next/og'

export const contentType = 'image/png'

export function generateImageMetadata() {
  return [
    { contentType: 'image/png', size: { width: 192, height: 192 }, id: '192' },
    { contentType: 'image/png', size: { width: 512, height: 512 }, id: '512' },
  ]
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = await id
  const size = iconId === '512' ? 512 : 192

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#3B6FF6',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none">
          <path d="M 157 138 A 154 154 0 0 1 355 138" stroke="#fff" strokeWidth="54" strokeLinecap="round" fill="none" />
          <circle cx="256" cy="190" r="40" fill="#fff" />
          <path d="M 407.7 229.3 A 154 154 0 0 1 308.7 400.7" stroke="#A9C0FB" strokeWidth="54" strokeLinecap="round" fill="none" />
          <circle cx="313.2" cy="289" r="40" fill="#A9C0FB" />
          <path d="M 203.3 400.7 A 154 154 0 0 1 104.3 229.3" stroke="#20242E" strokeWidth="54" strokeLinecap="round" fill="none" />
          <circle cx="198.8" cy="289" r="40" fill="#20242E" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
