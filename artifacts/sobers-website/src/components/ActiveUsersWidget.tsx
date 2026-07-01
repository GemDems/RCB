import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { GlowCard } from "@/components/ui/spotlight-card";

const BASE_COUNT = 1000
const DAILY_TOURS = 1800
const STORAGE_KEY_PREFIX = "sobers_toured_"
const TICK_MS = 2500

function todayKey() {
  const d = new Date()
  return `${STORAGE_KEY_PREFIX}${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`
}

function secondsSinceMidnight() {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  return (now.getTime() - midnight.getTime()) / 1000
}

function deterministicCount() {
  const progress = secondsSinceMidnight() / 86400
  return Math.floor(BASE_COUNT + DAILY_TOURS * progress)
}

function readOrSeed(): number {
  try {
    const raw = localStorage.getItem(todayKey())
    if (raw !== null) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed)) return parsed
    }
  } catch {}
  const seed = deterministicCount()
  try { localStorage.setItem(todayKey(), String(seed)) } catch {}
  return seed
}

export function ActiveUsersWidget() {
  const [value, setValue] = useState<number>(readOrSeed)

  useEffect(() => {
    const tick = setInterval(() => {
      setValue((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1
        try { localStorage.setItem(todayKey(), String(next)) } catch {}
        return next
      })
    }, TICK_MS)

    const onStorage = (e: StorageEvent) => {
      if (e.key === todayKey() && e.newValue !== null) {
        const synced = parseInt(e.newValue, 10)
        if (!isNaN(synced)) setValue(synced)
      }
    }
    window.addEventListener("storage", onStorage)

    const midnightReset = () => {
      const now = new Date()
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const msUntilMidnight = tomorrow.getTime() - now.getTime()
      return setTimeout(() => {
        const reset = BASE_COUNT
        try { localStorage.setItem(todayKey(), String(reset)) } catch {}
        setValue(reset)
      }, msUntilMidnight)
    }
    const resetTimer = midnightReset()

    return () => {
      clearInterval(tick)
      clearTimeout(resetTimer)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  return (
    <div className="mt-20 flex flex-col items-center gap-6">
      <GlowCard
        glowColor="purple"
        customSize
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-3 px-16 py-10">
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(167,139,250,0.12),transparent)] pointer-events-none" />

          <p className="relative text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">
            Properties Toured This Month
          </p>

          <NumberTicker
            value={value}
            blur
            startOnView
            suffix="+"
            className="relative text-6xl font-black tracking-tight text-white tabular-nums"
            format={(n) => n.toLocaleString()}
          />

          <div className="relative flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live · new tours going live daily
          </div>
        </div>
      </GlowCard>

      <div className="flex gap-8 text-center">
        {[
          { label: "More Engagement", value: "40%" },
          { label: "Faster Bookings",  value: "31%" },
          { label: "Avg. Client Rating", value: "4.9★" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
