import { useEffect, useRef } from "react";

export function LoadingBreadcrumb({ label = "Cooking up a response…" }: { label?: string }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    let start: number | null = null;
    const duration = 1600;
    let raf: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const progress = ((ts - start) % (duration * 2)) / duration;
      const phase = progress < 1 ? progress : 2 - progress;
      if (path) path.style.strokeDashoffset = `${len * (1 - phase)}`;
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="28" height="16" viewBox="0 0 28 16" fill="none" className="flex-shrink-0">
        <path
          ref={pathRef}
          d="M2 8 C5 2, 9 14, 14 8 C19 2, 23 14, 26 8"
          stroke="url(#grad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="28" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[11px] text-white/40 font-medium tracking-wide animate-pulse">
        {label}
      </span>
    </div>
  );
}
