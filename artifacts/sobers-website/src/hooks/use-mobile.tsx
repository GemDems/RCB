import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Returns true only on actual phones — combines a small viewport with a
 * coarse pointer (touch) so that a narrowed desktop browser window does NOT
 * trigger the flag.
 */
export function useIsPhone() {
  const [isPhone, setIsPhone] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const narrow  = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const coarse  = window.matchMedia("(pointer: coarse)")
    const check   = () => setIsPhone(narrow.matches && coarse.matches)
    narrow.addEventListener("change", check)
    coarse.addEventListener("change", check)
    check()
    return () => {
      narrow.removeEventListener("change", check)
      coarse.removeEventListener("change", check)
    }
  }, [])

  return !!isPhone
}
