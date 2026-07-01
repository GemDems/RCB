---
name: Typewriter animation hook pattern
description: Correct pattern for a React typewriter hook that types/deletes text without re-render cascades.
---

**Rule:** Use a mutable ref (useRef) to hold the animation state machine (idx, char, phase) and recursive setTimeout inside a single useEffect. Do NOT use useState for char position.

**Why:** Using useState for char position causes each character to trigger a re-render + new useEffect run, creating complex dependency arrays and potential leaks.

**How to apply:**
- stateRef.current holds { idx, char, phase }
- tick() reads/writes stateRef.current and schedules itself via setTimeout
- useEffect cleanup cancels the latest setTimeout via clearTimeout
- active flag gates the animation; when false, display resets immediately
