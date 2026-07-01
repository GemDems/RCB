import { useEffect, useRef } from "react";

function PixelOrb({ size = 8, color = "#a78bfa" }: { size?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    const pixels = Array.from({ length: size * size }, () => Math.random());

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = y * size + x;
          const alpha = Math.abs(Math.sin((pixels[idx] * Math.PI * 2) + frame * 0.05));
          const dist = Math.sqrt(Math.pow(x - size / 2, 2) + Math.pow(y - size / 2, 2));
          const falloff = Math.max(0, 1 - dist / (size / 2));
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha * falloff * 0.9;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
      frame++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}

export function AgentThinkingBadge({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm w-fit">
      <PixelOrb size={10} color="#a78bfa" />
      <PixelOrb size={8} color="#818cf8" />
      <PixelOrb size={10} color="#c084fc" />
      <span className="text-[10px] font-medium text-white/60 tracking-wide ml-0.5">{label}</span>
    </div>
  );
}
