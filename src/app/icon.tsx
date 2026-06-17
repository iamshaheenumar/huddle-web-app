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
  const fontSize = size === 512 ? 300 : 108

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
        <span
          style={{
            color: 'white',
            fontSize,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-6px',
          }}
        >
          H
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
