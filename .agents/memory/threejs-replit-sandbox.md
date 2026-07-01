---
name: Three.js in Replit Sandbox
description: WebGL context creation fails in the Replit preview iframe; how to handle gracefully.
---

The Replit preview environment does not expose a GPU. THREE.WebGLRenderer throws "Error creating WebGL context" on construction.

**Rule:** Always gate Three.js component rendering behind an isWebGLAvailable() probe, and lazy-load three via dynamic import("three") so the bundle doesn't crash if the probe fails.

**Why:** Replit sandbox has no GPU/WebGL — hard crash otherwise. The component should silently return null, not throw.

**How to apply:**
1. Call isWebGLAvailable() in a useEffect, store result in state.
2. If false, return null from the component.
3. Dynamic import("three") inside the effect, guarded by a destroyed flag for unmount safety.
4. Wrap new THREE.WebGLRenderer(...) in try/catch as a final safety net.
