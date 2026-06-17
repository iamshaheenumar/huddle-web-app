import { Sk } from '@/components/Skeleton'

export default function MembersLoading() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <div className="flex flex-col gap-2">
          <Sk style={{ width: 40, height: 13 }} />
          <Sk style={{ width: 130, height: 22 }} />
        </div>
        <Sk className="rounded-full" style={{ width: 72, height: 34 }} />
      </div>

      {/* Group total card */}
      <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: '#20242E' }}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Sk style={{ width: 60, height: 12, background: 'rgba(255,255,255,.2)' }} />
            <Sk style={{ width: 110, height: 28, background: 'rgba(255,255,255,.25)' }} />
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Sk style={{ width: 70, height: 12, background: 'rgba(255,255,255,.2)' }} />
            <Sk style={{ width: 80, height: 20, background: 'rgba(255,255,255,.25)' }} />
          </div>
        </div>
        <div className="h-2 rounded-full mt-4" style={{ background: 'rgba(255,255,255,.18)' }} />
        <Sk style={{ width: 180, height: 12, marginTop: 10, background: 'rgba(255,255,255,.15)' }} />
      </div>

      {/* Spending by member label */}
      <div className="px-5 pt-5 pb-3">
        <Sk style={{ width: 140, height: 16 }} />
      </div>

      {/* Member cards */}
      <div className="mx-5 flex flex-col gap-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-[18px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <div className="flex items-center gap-3">
              <Sk className="rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
              <div className="flex-1 flex flex-col gap-2">
                <Sk style={{ width: '50%', height: 14 }} />
                <Sk style={{ width: '30%', height: 11 }} />
              </div>
              <Sk style={{ width: 48, height: 16 }} />
            </div>
            <Sk className="rounded-full mt-3" style={{ width: '100%', height: 6 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
