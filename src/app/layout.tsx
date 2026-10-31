import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/features/common/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Huddle — Budget Together',
  description: 'Shared budgets for Home & Office — track expenses together with your group',
  appleWebApp: {
    capable: true,
    title: 'Huddle',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays on (WCAG 1.4.4); text inputs are 16px so iOS doesn't
  // auto-zoom when one is focused.
  viewportFit: 'cover',
  themeColor: '#3B6FF6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
