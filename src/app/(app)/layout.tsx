import BottomNav from '@/features/common/BottomNav'
import QueryProvider from '@/features/common/QueryProvider'

// Reads nothing on the server so pages can be static shells: the proxy guards
// auth and data comes from the client query cache.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col items-center min-h-screen" style={{ background: '#ECEAE4' }}>
        <div
          className="relative flex flex-col w-full"
          style={{ maxWidth: 430, minHeight: '100svh', background: '#F6F3EE', overflow: 'hidden' }}
        >
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80, paddingTop: 'env(safe-area-inset-top)' }}>
            {children}
          </div>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full" style={{ maxWidth: 430 }}>
            <BottomNav />
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}
