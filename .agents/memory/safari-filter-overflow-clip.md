---
name: Safari filter+overflow clip fix
description: CSS filter on a parent defeats overflow:hidden on children in Safari and Chrome; clip-path is the Safari-proof fix.
---

## The rule
When an element has `filter: blur()` (or any CSS filter), `overflow: hidden` on that element OR its children is defeated in Safari and partially in Chrome. The browser promotes a compositing layer for the filter BEFORE evaluating overflow clipping, so oversized child content escapes.

**Fix: add `clip-path: inset(0 round Xpx)` to the element that needs clipping** (alongside or instead of `overflow-hidden`). `clip-path` clips the final post-compositing visual output and cannot be bypassed by the filter promotion bug.

**Why:** `overflow: hidden` is a paint-phase clip; `filter` promotes a compositing layer before paint, bypassing it. `clip-path` is a geometry clip applied to the element's final visual result — after compositing — so it always works.

**How to apply:**
- Any time you have `filter: blur(Xpx)` + `overflow-hidden` on the SAME element, or a filtered parent whose children have `overflow-hidden`, add `[clip-path:inset(0_round_Ypx)]` where Y matches the element's border-radius (rounded-lg = 8px, rounded-xl = 12px).
- For glowing elements where blur should spread BEYOND the element's bounds, keep the filtered element's size larger than the visible button/input, and use `clip-path: inset(-Zpx round Xpx)` with a negative inset on any outer wrapper (Z ≈ blur radius × 3).
- Do NOT use `transform: translateZ(0)` / `will-change: transform` on a child of a filtered parent — this takes the child out of the filter compositing context and renders it without the blur, creating a visible sharp box artifact.
- Keep `overflow-hidden` as belt-and-suspenders for older engines where clip-path may not be supported.

**Seen in:** HeroSearchBar glow layers (each has `blur-[Xpx]` + `overflow-hidden` + 999px `before:` pseudo-element), LiquidButton glow div (outer has `filter blur-[19px]`, inner has `overflow-hidden` + 443-756px SVG shapes).
