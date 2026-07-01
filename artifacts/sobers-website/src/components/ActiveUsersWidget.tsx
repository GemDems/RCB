import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/ui/NumberTicker";

export function ActiveUsersWidget() {
  const [value, setValue] = useState(1847);

  useEffect(() => {
    const id = setInterval(
      () => setValue((v) => v + Math.floor(Math.random() * 3)),
      2500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-20 flex flex-col items-center gap-6">
      {/* card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-16 py-10 flex flex-col items-center gap-3 shadow-2xl shadow-black/40">
        {/* subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(167,139,250,0.12),transparent)] pointer-events-none" />

        <p className="relative text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
          Properties Toured This Month
        </p>

        <NumberTicker
          value={value}
          blur
          startOnView
          suffix="+"
          className="relative text-6xl font-black tracking-tight text-white tabular-nums"
          format={(n) => n.toLocaleString()}
        />

        <div className="relative flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live · new tours going live daily
        </div>
      </div>

      {/* mini stat row */}
      <div className="flex gap-8 text-center">
        {[
          { label: "More Engagement", value: "40%" },
          { label: "Faster Bookings", value: "31%" },
          { label: "Avg. Client Rating", value: "4.9★" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
