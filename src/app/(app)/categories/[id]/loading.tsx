import { Sk } from '@/components/Skeleton'

export default function CategoryLoading() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
        <div className="flex items-center gap-2.5">
          <Sk className="rounded-[9px]" style={{ width: 30, height: 30 }} />
          <Sk style={{ width: 80, height: 17 }} />
        </div>
        <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
      </div>

      {/* Ring chart placeholder */}
      <div className="flex justify-center pt-6 pb-2">
        <Sk className="rounded-full" style={{ width: 172, height: 172 }} />
      </div>

      {/* Stat cards */}
      <div className="mx-5 mt-3.5 flex gap-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 rounded-2xl p-3.5 flex flex-col items-center gap-2" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <Sk style={{ width: '60%', height: 11 }} />
            <Sk style={{ width: '70%', height: 17 }} />
          </div>
        ))}
      </div>

      {/* Transactions label */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Sk style={{ width: 90, height: 16 }} />
        <Sk style={{ width: 70, height: 13 }} />
      </div>

      {/* Transaction rows */}
      <div className="mx-5 rounded-[20px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 3 ? '1px solid #F4F0E9' : 'none' }}>
            <Sk className="rounded-full flex-shrink-0" style={{ width: 36, height: 36 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: '55%', height: 14 }} />
              <Sk style={{ width: '40%', height: 11 }} />
            </div>
            <Sk style={{ width: 48, height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
