---
name: iOS Safari scroll-linked motion & heavy effects
description: How to drive scroll-linked animations on touch devices (absolute position, not deltas) and cautions about swapping components across breakpoints.
---

# iOS Safari scroll-linked motion & heavy effects

## Wheel-only animations freeze on touch (verified)
A carousel/animation driven only by `wheel` events does not move on iOS — touch devices fire `scroll`/touch, never `wheel`. Add a `(pointer: coarse)`-gated `window` `scroll` listener as the touch driver (register in setup, remove in teardown). Desktop keeps its own wheel path untouched.

## Drive from ABSOLUTE scroll position, NOT accumulated deltas (key lesson)
When wiring the touch scroll driver, do **not** accumulate `target += (scrollY - lastScrollY) * k`. On iOS, `window.scrollY` is **non-monotonic**: momentum scrolling and the URL-bar show/hide report large, jumpy, sometimes-backward values. Accumulating those deltas makes the animation lurch / "go crazy."

Instead map **absolute position**: `target = scrollY * k`, then let an existing lerp/ease smooth `current → target`. This is inherently bounded and self-correcting, so momentum/URL-bar jumps can't pile up. Also skip any "snap to nearest" on release for coarse pointers — release-snap fights the absolute mapping and causes a jump.

**Why:** the first fix (delta accumulation) technically moved the carousel but the user reported it went haywire on iPhone; switching to absolute-position mapping is the reliable pattern.
**How to apply:** any time you translate page scroll into a non-scroll animation on touch, prefer absolute position mapping over delta accumulation.

## Swapping components per breakpoint — get sign-off first
I once replaced a fancy desktop button (heavy blur + `mix-blend-difference`) with a bespoke static pill on mobile, on the *assumption* it box-glitched on iOS. That glitch was inferred, never confirmed on a real device, and the user asked to **roll it back** — they preferred the same component everywhere over a mobile-only variant.

**Why:** visual inconsistency between mobile and desktop can bother a user more than a suspected rendering quirk; and "verified by construction" is not verified.
**How to apply:** don't unilaterally swap a component for a different variant at a breakpoint. If you truly see a device-specific rendering bug, confirm it on a real device (or with the user) before diverging mobile from desktop; otherwise fix in place or ask.
