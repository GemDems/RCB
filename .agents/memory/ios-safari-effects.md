---
name: iOS Safari heavy visual effects
description: Blur + mix-blend + WebGL/scroll patterns that work on desktop but glitch on iPhone Safari, and the gating approach that fixes them.
---

# iOS Safari heavy visual effects

Some rich desktop hero effects render as **glitchy hard boxes** or freeze on iPhone Safari even though desktop Chrome/Safari is perfect.

## Known failure modes
- A decorative layer that extends **beyond its parent bounds** (e.g. `w-[112%] h-[128%]`) with a **large `blur()`** radius AND `mix-blend-difference`/`mix-blend-hard-light` inside it paints as a visible rectangular box on iOS instead of a soft glow. (This is what the `LiquidButton` outer glow did.)
- `overflow-hidden` + `border-radius` does **not** reliably clip transformed/blended children on iOS — they can spill as a box.
- A carousel/animation driven **only by `wheel` events** is frozen on touch devices — iOS fires no `wheel`, only `scroll`/touch.

## Fix approach that worked
- **Gate heavy effects behind a breakpoint**, don't try to "fix" the blur/blend for iOS. Render the fancy version with `hidden sm:block` and a clean static approximation (e.g. a gradient-ring pill: outer gradient span + inset dark span + text) with `sm:hidden`. Desktop stays byte-for-byte identical.
- For scroll-linked motion, add a **`(pointer: coarse)`-gated `window` `scroll` listener** that drives the animation from vertical scroll delta, mirroring the desktop wheel handler. Register in setup, remove in teardown.

**Why:** these are iOS compositor bugs, not logic bugs — trying to patch the effect itself is fragile; swapping to a lighter mobile variant is reliable and keeps desktop untouched.

**How to apply:** when a user reports a hero element is "glitchy/boxed/frozen on iPhone but fine on desktop", suspect blur+mix-blend layers or wheel-only input first, and reach for breakpoint/coarse-pointer gating rather than device sniffing.
