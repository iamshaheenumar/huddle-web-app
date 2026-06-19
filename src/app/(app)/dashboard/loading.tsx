import { Sk } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col">
      {/* Greeting + avatar */}
      <div className="flex items-center justify-between px-5 pt-12">
        <div className="flex flex-col gap-2">
          <Sk style={{ width: 130, height: 13 }} />
          <Sk style={{ width: 100, height: 20 }} />
        </div>
        <Sk className="rounded-full" style={{ width: 44, height: 44 }} />
      </div>

      {/* Hero budget card */}
      <div
        className="mx-5 mt-4 rounded-3xl p-5"
        style={{
          background: "linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)",
        }}
      >
        <div className="flex justify-between items-center">
          <Sk
            style={{
              width: 90,
              height: 13,
              background: "rgba(255,255,255,.25)",
            }}
          />
          <Sk
            className="rounded-full"
            style={{
              width: 60,
              height: 24,
              background: "rgba(255,255,255,.2)",
            }}
          />
        </div>
        <Sk
          style={{
            width: 160,
            height: 36,
            marginTop: 12,
            background: "rgba(255,255,255,.25)",
          }}
        />
        <Sk
          style={{
            width: 140,
            height: 13,
            marginTop: 6,
            background: "rgba(255,255,255,.2)",
          }}
        />
        <div
          className="h-2.5 rounded-full mt-4"
          style={{ background: "rgba(255,255,255,.2)" }}
        />
        <div className="flex justify-between mt-3">
          <Sk
            style={{
              width: 80,
              height: 12,
              background: "rgba(255,255,255,.2)",
            }}
          />
          <Sk
            style={{
              width: 80,
              height: 12,
              background: "rgba(255,255,255,.2)",
            }}
          />
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between px-5 pt-5">
        <Sk style={{ width: 70, height: 16 }} />
        <Sk style={{ width: 45, height: 13 }} />
      </div>
      <div className="flex gap-2.5 px-5 mt-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-[18px] p-3 flex flex-col items-center gap-2"
            style={{ background: "#fff", border: "1px solid #F0ECE4" }}
          >
            <Sk className="rounded-full" style={{ width: 38, height: 38 }} />
            <Sk style={{ width: "60%", height: 12 }} />
            <Sk style={{ width: "50%", height: 13 }} />
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between px-5 pt-5">
        <Sk style={{ width: 80, height: 16 }} />
        <Sk style={{ width: 70, height: 13 }} />
      </div>
      <div
        className="mx-5 mt-3 rounded-[22px] py-1.5 px-4"
        style={{ background: "#fff", border: "1px solid #F0ECE4" }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < 3 ? "1px solid #F4F0E9" : "none" }}
          >
            <Sk
              className="rounded-[11px] flex-shrink-0"
              style={{ width: 36, height: 36 }}
            />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between">
                <Sk style={{ width: 80, height: 14 }} />
                <Sk style={{ width: 60, height: 14 }} />
              </div>
              <Sk
                className="rounded-full"
                style={{ width: "100%", height: 6 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="px-5 pt-5">
        <Sk style={{ width: 110, height: 16 }} />
      </div>
      <div className="mx-5 mt-3 flex flex-col gap-2.5 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl p-3"
            style={{ background: "#fff", border: "1px solid #F0ECE4" }}
          >
            <Sk
              className="rounded-full flex-shrink-0"
              style={{ width: 34, height: 34 }}
            />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: "55%", height: 13 }} />
              <Sk style={{ width: "40%", height: 11 }} />
            </div>
            <Sk style={{ width: 48, height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
