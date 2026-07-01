import { useEffect, useRef, useState } from "react"

/** Same probe used by InteractiveNebulaShader — renders nothing when WebGL is unavailable. */
function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement("canvas")
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    )
  } catch {
    return false
  }
}

export function LiquidEffectAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglOk, setWebglOk] = useState<boolean | null>(null)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  useEffect(() => {
    if (!webglOk) return
    if (!canvasRef.current) return

    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      try {
        const LiquidBackground = (await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js')).default;
        const canvas = document.getElementById('liquid-canvas');
        if (canvas) {
          const app = LiquidBackground(canvas);
          app.loadImage('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/enhanced_8bfe61b0-d431-433a-8acb-49d508bf88b4-image-vWzKFKS7vQy7s8wfQYzEpaoiYaVMkr.png');
          app.liquidPlane.material.metalness = 0.75;
          app.liquidPlane.material.roughness = 0.25;
          app.liquidPlane.uniforms.displacementScale.value = 5;
          app.setRain(false);
          window.__liquidApp = app;
        }
      } catch (e) {
        // WebGL unavailable or CDN load failed — degrade silently
      }
    `
    document.body.appendChild(script)

    return () => {
      if (window.__liquidApp?.dispose) {
        window.__liquidApp.dispose()
        window.__liquidApp = undefined
      }
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [webglOk])

  if (!webglOk) return null

  return (
    <canvas
      ref={canvasRef}
      id="liquid-canvas"
      className="absolute inset-0 w-full h-full"
    />
  )
}

declare global {
  interface Window {
    __liquidApp?: any
  }
}
