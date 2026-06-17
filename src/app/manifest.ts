import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Huddle — Budget Together',
    short_name: 'Huddle',
    description: 'Shared budgets for Home & Office — track expenses together with your group',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F6F3EE',
    theme_color: '#3B6FF6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
