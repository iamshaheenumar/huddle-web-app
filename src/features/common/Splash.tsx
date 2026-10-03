import HuddleMark from '@/features/common/HuddleMark'

export default function Splash({ markSize = 88, showLoader = true }: { markSize?: number; showLoader?: boolean }) {
  return (
    <div className="flex justify-center min-h-svh" style={{ background: '#ECEAE4' }}>
      <div className="flex flex-col items-center w-full min-h-svh" style={{ maxWidth: 430, background: '#F6F3EE' }}>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-5.5">
          <HuddleMark size={markSize} shadow />
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-[32px] font-extrabold leading-none tracking-[-0.02em]" style={{ color: '#20242E' }}>Huddle</div>
            <div className="text-[14px] font-semibold" style={{ color: '#9A9FA8' }}>Budgets you share</div>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center" style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
          {showLoader && (
            <div className="flex gap-1.5" role="status" aria-label="Loading">
              {[0, 1, 2].map(i => (
                <span key={i} className="splash-dot block w-[7px] h-[7px] rounded-full" style={{ background: '#3B6FF6', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
