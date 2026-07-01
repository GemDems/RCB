import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LOADER_KEYFRAMES = `
  @keyframes drawStroke {
    0% { stroke-dashoffset: var(--path-length); animation-timing-function: ease-in-out; }
    50% { stroke-dashoffset: 0; animation-timing-function: ease-in-out; }
    100% { stroke-dashoffset: calc(var(--path-length) * -1); }
  }
  @keyframes textShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

let stylesInjected = false;
let cachedPathLength = 0;

function CookingLoader({ size = 18 }: { size?: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(cachedPathLength);

  useEffect(() => {
    if (!stylesInjected) {
      stylesInjected = true;
      const style = document.createElement("style");
      style.innerHTML = LOADER_KEYFRAMES;
      document.head.appendChild(style);
    }
    if (!cachedPathLength && pathRef.current) {
      cachedPathLength = pathRef.current.getTotalLength();
      setPathLength(cachedPathLength);
    }
  }, []);

  const ready = pathLength > 0;

  return (
    <svg
      viewBox="0 0 19 19"
      fill="none"
      width={size}
      height={size}
      className="text-purple-400 shrink-0"
    >
      <path
        ref={pathRef}
        d="M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={
          ready
            ? ({
                strokeDasharray: pathLength,
                "--path-length": pathLength,
              } as React.CSSProperties)
            : undefined
        }
        className={cn(
          "transition-opacity duration-300",
          ready
            ? "opacity-100 animate-[drawStroke_2.5s_infinite]"
            : "opacity-0",
        )}
      />
    </svg>
  );
}

interface LoadingBreadcrumbProps {
  text?: string;
  className?: string;
}

export function LoadingBreadcrumb({
  text = "Cooking",
  className,
}: LoadingBreadcrumbProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[13px] font-medium tracking-wide select-none",
        className,
      )}
    >
      <CookingLoader size={16} />
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(161,161,170) 0%, rgb(161,161,170) 35%, rgb(255,255,255) 50%, rgb(161,161,170) 65%, rgb(161,161,170) 100%)",
          backgroundSize: "200% auto",
          animation: "textShimmer 2s ease-in-out infinite",
        }}
      >
        {text}
      </span>
    </div>
  );
}
