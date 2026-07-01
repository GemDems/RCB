import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const PHRASES = [
  "Type your property listing...",
  "How many rooms do you have?",
  "Airbnb or long-term let?",
  "Studio flat or family home?",
  "What's your biggest marketing challenge?",
  "Tell me about your property...",
  "Holiday let or estate agent?",
  "How many properties do you manage?",
]

const TYPE_SPEED = 48
const DELETE_SPEED = 28
const PAUSE_AFTER_TYPE = 2200
const PAUSE_AFTER_DELETE = 420

interface HeroSearchBarProps {
  onSearch?: (query: string) => void
  className?: string
}

export function HeroSearchBar({ onSearch, className }: HeroSearchBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const phraseIndex = useRef(0)
  const charIndex = useRef(0)
  const isDeleting = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function tick() {
      const currentPhrase = PHRASES[phraseIndex.current % PHRASES.length]

      if (!isDeleting.current) {
        charIndex.current += 1
        setPlaceholder(currentPhrase.slice(0, charIndex.current))
        if (charIndex.current === currentPhrase.length) {
          isDeleting.current = true
          timeoutRef.current = setTimeout(tick, PAUSE_AFTER_TYPE)
          return
        }
        timeoutRef.current = setTimeout(tick, TYPE_SPEED)
      } else {
        charIndex.current -= 1
        setPlaceholder(currentPhrase.slice(0, charIndex.current))
        if (charIndex.current === 0) {
          isDeleting.current = false
          phraseIndex.current += 1
          timeoutRef.current = setTimeout(tick, PAUSE_AFTER_DELETE)
          return
        }
        timeoutRef.current = setTimeout(tick, DELETE_SPEED)
      }
    }

    timeoutRef.current = setTimeout(tick, 600)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSearch?.(trimmed)
    setInputValue("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        id="poda"
        className="relative flex items-center justify-center group"
      >
        {/* Outer glow layers */}
        <div
          className="absolute z-[-1] overflow-hidden h-full w-full max-h-[76px] max-w-[560px] rounded-xl blur-[3px]
                      before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60
                      before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] before:transition-all before:duration-2000
                      group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]"
        />
        <div
          className="absolute z-[-1] overflow-hidden h-full w-full max-h-[70px] max-w-[556px] rounded-xl blur-[3px]
                      before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]
                      before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000
                      group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]"
        />
        <div
          className="absolute z-[-1] overflow-hidden h-full w-full max-h-[68px] max-w-[550px] rounded-lg blur-[2px]
                      before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg]
                      before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)] before:brightness-140
                      before:transition-all before:duration-2000 group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]"
        />
        <div
          className="absolute z-[-1] overflow-hidden h-full w-full max-h-[64px] max-w-[545px] rounded-xl blur-[0.5px]
                      before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-70
                      before:bg-[conic-gradient(#1c191c,#402fb5_5%,#1c191c_14%,#1c191c_50%,#cf30aa_60%,#1c191c_64%)] before:brightness-130
                      before:transition-all before:duration-2000 group-hover:before:rotate-[-110deg] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms]"
        />

        {/* Inner input wrapper */}
        <div className="relative group">
          {/* Pink ambient mask */}
          <div className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-2000 group-hover:opacity-0" />

          {/* Spinning button bg */}
          <div
            className="absolute h-[44px] w-[44px] overflow-hidden top-[8px] right-[8px] rounded-lg
                        before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90
                        before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)]
                        before:brightness-135 before:animate-spin-slow"
          />

          {/* Submit arrow button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            aria-label="Ask agent"
            className="absolute top-[8px] right-[8px] z-[2] flex items-center justify-center h-[44px] w-[44px] [isolation:isolate] overflow-hidden rounded-lg bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

          {/* Search icon */}
          <div className="absolute left-5 top-[50%] -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="20" fill="none">
              <circle stroke="url(#hero-search)" r="8" cy="11" cx="11" />
              <line stroke="url(#hero-searchl)" y2="16.65" y1="22" x2="16.65" x1="22" />
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="hero-search">
                  <stop stopColor="#f8e7f8" offset="0%" />
                  <stop stopColor="#b6a9b7" offset="50%" />
                </linearGradient>
                <linearGradient id="hero-searchl">
                  <stop stopColor="#b6a9b7" offset="0%" />
                  <stop stopColor="#837484" offset="50%" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? "Ask me anything about your property..." : placeholder}
              className="bg-[#010201] border-none w-[540px] max-w-[90vw] h-[60px] rounded-lg text-white pl-[52px] pr-[68px] text-base focus:outline-none placeholder-gray-500 transition-all"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
