import React, { useEffect, useRef, useState } from "react";

export interface InteractiveNebulaShaderProps {
  className?: string;
}

/** Check if a WebGL2 (or WebGL1) context can be created before importing Three. */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/**
 * Ray-marched nebula shader — purple/violet palette, transparent background.
 * Layered over the existing SVG gradient with mix-blend-mode: screen.
 * Renders nothing if WebGL is unavailable (sandbox/headless environments).
 */
export function InteractiveNebulaShader({ className = "" }: InteractiveNebulaShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  // Probe WebGL on first mount
  useEffect(() => {
    setWebglOk(isWebGLAvailable());
  }, []);

  // Three.js setup — only runs when WebGL is confirmed available
  useEffect(() => {
    if (!webglOk) return;
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (destroyed) return; // unmounted before the dynamic import resolved

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // WebGL creation failed — bail silently
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const startTime = Date.now();

      const vertexShader = `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `;

      // Purple/violet ray-march nebula
      const fragmentShader = `
        precision mediump float;
        uniform vec2  iResolution;
        uniform float iTime;
        uniform vec2  iMouse;
        varying vec2 vUv;

        #define t iTime
        mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

        float map(vec3 p){
          p.xz *= rot(t*0.35);
          p.xy *= rot(t*0.25);
          vec3 q = p*2.0 + t;
          return length(p + vec3(sin(t*0.65))) * log(length(p)+1.0)
               + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
        }

        void main() {
          vec2 uv = vUv * iResolution / min(iResolution.x, iResolution.y)
                  - vec2(0.9, 0.5);
          uv.x += 0.4;

          vec3 col = vec3(0.0);
          float d   = 2.5;

          for (int i = 0; i <= 5; i++) {
            vec3 p   = vec3(0.0, 0.0, 5.0) + normalize(vec3(uv, -1.0)) * d;
            float rz = map(p);
            float f  = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);

            // Purple/violet palette
            vec3 base = vec3(0.25, 0.02, 0.55) + vec3(1.2, 0.2, 3.5) * f;
            col = col * base + smoothstep(2.5, 0.0, rz) * 0.65 * base;
            d += min(rz, 1.0);
          }

          float brightness = dot(col, vec3(0.299, 0.587, 0.114));
          float a = clamp(brightness * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(col, a);
        }
      `;

      const uniforms = {
        iTime:       { value: 0 },
        iResolution: { value: new THREE.Vector2() },
        iMouse:      { value: new THREE.Vector2() },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, uniforms,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        uniforms.iResolution.value.set(w, h);
      };
      const onMouseMove = (e: MouseEvent) => {
        uniforms.iMouse.value.set(e.clientX, window.innerHeight - e.clientY);
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMouseMove);
      onResize();

      renderer.setAnimationLoop(() => {
        uniforms.iTime.value = (Date.now() - startTime) / 1000;
        renderer.render(scene, camera);
      });

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        renderer.setAnimationLoop(null);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        material.dispose();
        mesh.geometry.dispose();
        renderer.dispose();
      };
    });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [webglOk]);

  // Don't render anything if WebGL is definitively unavailable
  if (webglOk === false) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
