import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PromptInputBox } from "./ui/ai-prompt-box"
import { SiriWave } from "./ui/siri-wave"
import { LoadingBreadcrumb } from "./ui/loading-breadcrumb"
import { AgentsThinkingBadge, PALETTES, PixelOrb } from "./ui/grok-agent-thinking-indicator"
import { TextShimmer } from "./ui/shimmer-text"
import { StarButton } from "./ui/star-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedGroup } from "./ui/animated-group"
import logoAirbnb      from "@assets/airbnb-logo-0_1782897183247.webp"
import logoRightmove   from "@assets/rightmove-logo_brandlogos.net_uyygd-512x512_1782897187432.webp"
import logoBooking     from "@assets/1825430_1782897190697.webp"
import logoZoopla      from "@assets/Zoopla-Logo-2010-500x281_1782897194833.webp"
import logoKnightFrank from "@assets/knight-frank-logo-png-transparent_1782897198757.webp"
import logoSavills     from "@assets/savills_1782897202584.webp"
import logoCBRE        from "@assets/CBRE-Logo-500x281_1782897205703.webp"
import logoJLL         from "@assets/JLL-Logo-500x281_1782897214917.webp"

/* ─────────────────────────────────────────────
   ColorOrb
───────────────────────────────────────────── */
interface OrbProps {
  dimension?: string
  className?: string
  tones?: { base?: string; accent1?: string; accent2?: string; accent3?: string }
  spinDuration?: number
}
const ColorOrb: React.FC<OrbProps> = ({ dimension = "192px", className, tones, spinDuration = 20 }) => {
  const fallback = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }
  const palette = { ...fallback, ...tones }
  const dim = parseInt(dimension, 10)
  const blur = dim < 50 ? Math.max(dim * 0.008, 1) : Math.max(dim * 0.015, 4)
  const contrast = dim < 50 ? Math.max(dim * 0.004, 1.2) : Math.max(dim * 0.008, 1.5)
  const dot = dim < 50 ? Math.max(dim * 0.004, 0.05) : Math.max(dim * 0.008, 0.1)
  const shadow = dim < 50 ? Math.max(dim * 0.004, 0.5) : Math.max(dim * 0.008, 2)
  const mask = dim < 30 ? "0%" : dim < 50 ? "5%" : dim < 100 ? "15%" : "25%"
  const adj = dim < 30 ? 1.1 : dim < 50 ? Math.max(contrast * 1.2, 1.3) : contrast
  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blur}px`,
        "--contrast": adj,
        "--dot": `${dot}px`,
        "--shadow": `${shadow}px`,
        "--mask": mask,
      } as React.CSSProperties}
    />
  )
}

/* ─────────────────────────────────────────────
   Responsive dimensions hook
───────────────────────────────────────────── */
function useFormDimensions() {
  const compute = () => {
    if (typeof window === "undefined") return { w: 390, h: 540 }
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      w: Math.min(390, vw - 24),
      h: Math.min(540, vh - 90),
    }
  }
  const [dims, setDims] = React.useState(compute)
  React.useEffect(() => {
    const handler = () => setDims(compute())
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])
  return dims
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const SPEED = 1
const MIN_THINK_MS = 0
const ORB_TONES = { base: "oklch(22.64% 0 0)" }

const COOKING_PHASES = [
  "Cooking",
  "Cross-checking facts",
  "Stress-testing answer",
  "Verifying claims",
  "Optimising response",
  "Double-checking logic",
  "Almost ready",
]

type InputMode = { search: boolean; think: boolean; canvas: boolean }

/* ─────────────────────────────────────────────
   Trusted logos shown above input until first message
───────────────────────────────────────────── */
const CHAT_LOGOS = [
  { src: logoAirbnb,      alt: "Airbnb",       height: 48 },
  { src: logoRightmove,   alt: "Rightmove",    height: 52 },
  { src: logoBooking,     alt: "Booking.com",  height: 48 },
  { src: logoZoopla,      alt: "Zoopla",       height: 30 },
  { src: logoKnightFrank, alt: "Knight Frank", height: 46 },
  { src: logoSavills,     alt: "Savills",      height: 44 },
  { src: logoCBRE,        alt: "CBRE",         height: 28 },
  { src: logoJLL,         alt: "JLL",          height: 34 },
]

const chatLogoTransitionVariants = {
  item: {
    hidden:   { opacity: 0, filter: "blur(12px)", y: 12 },
    visible:  {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
}

function ChatTrustedLogos({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="trusted-logos"
          initial={{ opacity: 0, filter: "blur(12px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)",  y: 0  }}
          exit={{    opacity: 0, filter: "blur(12px)", y: -6 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 px-3 pb-3 pt-2"
        >
          {/* Label */}
          <p className="text-[9px] text-muted-foreground/50 text-center mb-3 tracking-widest uppercase font-medium">
            Trusted by leading brands
          </p>

          {/* Grid with hover overlay — mirrors CustomersSection exactly */}
          <div className="group relative">
            {/* Hover overlay: "Meet Our Customers" */}
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
              <span className="text-[11px] text-foreground/80 font-medium tracking-wide">
                Trusted by leading teams
              </span>
            </div>

            {/* Animated logo grid */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                  },
                },
                ...chatLogoTransitionVariants,
              }}
              className="grid grid-cols-4 gap-x-3 gap-y-5 transition-all duration-500 group-hover:opacity-50 group-hover:[filter:blur(2px)]"
            >
              {CHAT_LOGOS.map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="mx-auto h-auto w-fit"
                    style={{ height: logo.height, mixBlendMode: "screen", opacity: 0.75 }}
                  />
                </div>
              ))}
            </AnimatedGroup>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
interface CtxShape { showForm: boolean; triggerOpen: () => void; triggerClose: () => void; triggerReset: () => void }
const FormCtx = React.createContext({} as CtxShape)
const useFormCtx = () => React.useContext(FormCtx)

interface Msg { role: "user" | "assistant"; content: string }

const WELCOME = "Hi! Ask me anything about 3D walkthroughs, virtual tours, or how we help you book more — whether you're an estate agent, property developer, or host on Airbnb, Vrbo, Booking.com, or any other platform. What would you like to know?"

/* ─────────────────────────────────────────────
   Full Grok Panel — drops down when expanded
───────────────────────────────────────────── */
function FullGrokPanel() {
  return (
    <div className="flex flex-col gap-3 py-1">
      <div
        role="status"
        aria-live="polite"
        aria-label="Agents thinking"
        className="inline-flex h-[41px] items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 pr-3 text-foreground shadow-sm"
      >
        <div className="flex h-[29px] items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                marginLeft: i === 0 ? 0 : -12,
                zIndex: i + 1,
                animation: `orb-enter 300ms ${i * 110}ms both`,
              }}
            >
              <PixelOrb palette={PALETTES[i % PALETTES.length]} seed={i + 1} size={28} />
            </div>
          ))}
        </div>
        <span className="whitespace-nowrap font-mono text-xs font-semibold tracking-[-0.02em]">
          Agents thinking
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { label: "Drafting reply",       palette: PALETTES[1] },
          { label: "Searching knowledge",  palette: PALETTES[2] },
        ].map(({ label, palette }, i) => (
          <div
            key={label}
            role="status"
            aria-label={label}
            className="inline-flex h-[41px] items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 pr-3 text-foreground shadow-sm"
            style={{ animation: `orb-enter 300ms ${i * 100 + 200}ms both` }}
          >
            <PixelOrb palette={palette} size={28} />
            <span className="whitespace-nowrap font-mono text-xs font-semibold tracking-[-0.02em]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <TextShimmer as="span" className="font-light text-md tracking-tight ml-0.5">
        Agent is thinking ...
      </TextShimmer>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ThinkingArea — aligned vertical stack
   All indicators start at the same left edge,
   each animates in sequentially below the last.
───────────────────────────────────────────── */
function ThinkingArea({
  cookingVisible,
  phaseIndex,
  grokExpanded,
  onToggleGrok,
  mode,
}: {
  cookingVisible: boolean
  phaseIndex: number
  grokExpanded: boolean
  onToggleGrok: () => void
  mode: InputMode
}) {
  const cookingLabel = COOKING_PHASES[phaseIndex % COOKING_PHASES.length]
  const showCooking = !mode.canvas
  const showGrok = mode.think

  return (
    <div className="flex flex-col items-start gap-2 py-1 w-full">

      {/* 1 — SiriWave: restored to original size/scale */}
      <div className="w-full flex items-center">
        <SiriWave
          variant="wave"
          size={80}
          renderScale={0.85}
          className="rounded-lg"
          style={{ background: "transparent" }}
        />
      </div>

      {/* 2 — Cooking breadcrumb: indented to align with SiriWave orb */}
      <AnimatePresence>
        {showCooking && cookingVisible && (
          <motion.div
            key="cooking"
            className="w-full pl-3"
            initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={cookingLabel}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingBreadcrumb text={cookingLabel} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 — Grok section: indented to align with SiriWave orb */}
      <AnimatePresence>
        {showGrok && cookingVisible && (
          <motion.div
            key="grok-section"
            className="w-full pl-3"
            initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {!grokExpanded ? (
              <button
                type="button"
                onClick={onToggleGrok}
                className="cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                aria-label="Expand agent thinking panel"
              >
                <AgentsThinkingBadge label="Agents thinking" count={4} />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden cursor-pointer w-full"
                onClick={onToggleGrok}
                title="Click to collapse"
              >
                <FullGrokPanel />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DockBar
───────────────────────────────────────────── */
function DockBar() {
  const { showForm, triggerOpen } = useFormCtx()
  return (
    <footer className="mt-auto flex h-[44px] w-full items-center justify-center whitespace-nowrap select-none">
      <div className="flex items-center justify-center gap-2 px-3 max-sm:h-10 max-sm:px-2">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div key="blank" initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} className="h-5 w-5" />
          ) : (
            <motion.div key="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ColorOrb dimension="24px" tones={ORB_TONES} />
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          type="button"
          className="flex h-fit flex-1 justify-end rounded-full px-2 !py-0.5"
          variant="ghost"
          onClick={triggerOpen}
        >
          <span className="truncate">Ask Agent</span>
        </Button>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   InputForm
───────────────────────────────────────────── */
function InputForm({
  messages,
  streaming,
  thinking,
  cookingVisible,
  phaseIndex,
  grokExpanded,
  onToggleGrok,
  inputMode,
  onModeChange,
  bottomRef,
  onSend,
  onStop,
  formW,
  formH,
}: {
  messages: Msg[]
  streaming: boolean
  thinking: boolean
  cookingVisible: boolean
  phaseIndex: number
  grokExpanded: boolean
  onToggleGrok: () => void
  inputMode: InputMode
  onModeChange: (m: InputMode) => void
  bottomRef: React.RefObject<HTMLDivElement | null>
  onSend: (text: string) => void
  onStop: () => void
  formW: number
  formH: number
}) {
  const { triggerClose, triggerReset, showForm } = useFormCtx()

  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") triggerClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [triggerClose])

  return (
    <div
      className="absolute bottom-0"
      style={{ width: formW, height: formH, pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center py-1 px-1">
              <div className="flex-1">
                <Button variant="link" onClick={triggerClose} className="px-0 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="me-1 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                  Go back
                </Button>
              </div>
              <p className="flex shrink-0 items-center gap-[6px] select-none text-sm text-foreground/70">
                <ColorOrb dimension="14px" tones={ORB_TONES} />
                Ask Agent
              </p>
              <div className="flex-1 flex justify-end">
                <StarButton
                  onClick={triggerReset}
                  lightColor="#FAFAFA"
                  className="rounded-3xl"
                  title="Start a new conversation"
                  aria-label="New chat"
                >
                  New chat
                </StarButton>
              </div>
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto space-y-2.5 px-1 py-2 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <React.Fragment key={i}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content || <span className="opacity-40 italic text-xs">Composing…</span>}
                    </div>
                  </div>

                  {/* Avatar trust pill — shown after first assistant message, fades when user sends */}
                  {i === 0 && msg.role === "assistant" && (
                    <AnimatePresence>
                      {!messages.some((m) => m.role === "user") && (
                        <motion.div
                          key="trust-pill"
                          initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                          exit={{ opacity: 0, filter: "blur(8px)", y: -6 }}
                          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                          className="flex justify-start"
                        >
                          <div className="flex items-center rounded-full px-2 py-1 gap-1.5 bg-muted/60 border border-border/50 shadow-sm">
                            <div className="flex -space-x-1.5">
                              {[
                                { src: "/profile.jpeg", fb: "AE" },
                                { src: "/profile.jpeg", fb: "PD" },
                                { src: "/profile.jpeg", fb: "HA" },
                                { src: "/profile.jpeg", fb: "JS" },
                              ].map((av, j) => (
                                <Avatar key={j} className="size-5 border-2 border-background">
                                  <AvatarImage src={av.src} alt={av.fb} className="hover:z-10 object-cover" />
                                  <AvatarFallback className="text-[8px] bg-purple-700 text-white">{av.fb}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground pr-1">
                              Trusted by{" "}
                              <span className="font-semibold text-foreground">2,000+</span>{" "}
                              agents &amp; hosts
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </React.Fragment>
              ))}

              {/* Thinking area */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start w-full"
                  >
                    <ThinkingArea
                      cookingVisible={cookingVisible}
                      phaseIndex={phaseIndex}
                      grokExpanded={grokExpanded}
                      onToggleGrok={onToggleGrok}
                      mode={inputMode}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Trusted logos — fades out when user sends first message */}
            <ChatTrustedLogos visible={!messages.some((m) => m.role === "user")} />

            {/* Input box */}
            <div className="shrink-0 mt-4 [&_.rounded-3xl]:rounded-xl [&_.p-2]:p-1.5">
              <PromptInputBox
                onSend={(text) => onSend(text)}
                onStop={onStop}
                isLoading={streaming}
                placeholder="Ask me anything…"
                className="!bg-background !border-border"
                onModeChange={onModeChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────
   AIChatWidget — main export
───────────────────────────────────────────── */
export function AIChatWidget({ externalQuery }: { externalQuery?: string }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const thinkStartRef = React.useRef<number>(0)
  const phaseTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const cookingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: WELCOME },
  ])
  const [streaming, setStreaming] = React.useState(false)
  const [thinking, setThinking] = React.useState(false)
  const [cookingVisible, setCookingVisible] = React.useState(false)
  const [phaseIndex, setPhaseIndex] = React.useState(0)
  const [grokExpanded, setGrokExpanded] = React.useState(false)
  const [inputMode, setInputMode] = React.useState<InputMode>({ search: false, think: false, canvas: false })

  /* Scroll to latest */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking, grokExpanded])

  /* External query — open the chat and fire the message */
  React.useEffect(() => {
    if (!externalQuery) return
    const query = externalQuery.split("||")[0].trim()
    if (!query) return
    setShowForm(true)
    // Small delay so the panel has time to animate open before send
    const t = setTimeout(() => handleSend(query), 350)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery])

  /* Click outside to close */
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        setShowForm(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showForm])

  /* Orchestrate cooking + phase rotation when thinking starts/stops */
  React.useEffect(() => {
    if (thinking) {
      setPhaseIndex(0)
      setCookingVisible(false)
      if (inputMode.think) setGrokExpanded(false)

      cookingTimerRef.current = setTimeout(() => {
        setCookingVisible(true)
      }, 1800)

      phaseTimerRef.current = setInterval(() => {
        setPhaseIndex((p) => p + 1)
      }, 1400)
    } else {
      if (cookingTimerRef.current) clearTimeout(cookingTimerRef.current)
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
      setCookingVisible(false)
      setGrokExpanded(false)
    }
    return () => {
      if (cookingTimerRef.current) clearTimeout(cookingTimerRef.current)
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
    }
  }, [thinking])

  const triggerClose = React.useCallback(() => setShowForm(false), [])
  const triggerOpen  = React.useCallback(() => setShowForm(true),  [])
  const toggleGrok   = React.useCallback(() => setGrokExpanded((v) => !v), [])

  /* Reset — abort any in-flight request and wipe history */
  const triggerReset = React.useCallback(() => {
    abortRef.current?.abort()
    if (cookingTimerRef.current) clearTimeout(cookingTimerRef.current)
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
    setMessages([{ role: "assistant", content: WELCOME }])
    setStreaming(false)
    setThinking(false)
    setCookingVisible(false)
    setPhaseIndex(0)
    setGrokExpanded(false)
    setInputMode({ search: false, think: false, canvas: false })
  }, [])

  const handleModeChange = React.useCallback((m: InputMode) => {
    setInputMode(m)
    if (!m.think) setGrokExpanded(false)
  }, [])

  /* Stop — abort in-flight stream, keep any partial content already shown */
  const handleStop = React.useCallback(() => {
    abortRef.current?.abort()
    if (cookingTimerRef.current) clearTimeout(cookingTimerRef.current)
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
    setThinking(false)
    setStreaming(false)
    setCookingVisible(false)
  }, [])

  /* Send — enforces MIN_THINK_MS */
  const handleSend = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return

      const userMsg: Msg = { role: "user", content: trimmed }
      const allMsgs = [...messages, userMsg]
      setMessages(allMsgs)
      setThinking(true)
      setStreaming(true)
      thinkStartRef.current = Date.now()

      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      let assistantContent = ""

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMsgs }),
          signal: ctrl.signal,
        })
        if (!res.ok) throw new Error("API error")

        const elapsed = Date.now() - thinkStartRef.current
        const remaining = MIN_THINK_MS - elapsed
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))

        setThinking(false)
        setMessages((prev) => [...prev, { role: "assistant", content: "" }])

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No stream")
        const decoder = new TextDecoder()
        let buf = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split("\n")
          buf = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.done) break
              if (parsed.content) {
                assistantContent += parsed.content
                const snap = assistantContent
                setMessages((prev) => {
                  const next = [...prev]
                  next[next.length - 1] = { role: "assistant", content: snap }
                  return next
                })
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          const elapsed = Date.now() - thinkStartRef.current
          const remaining = MIN_THINK_MS - elapsed
          if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))
          setThinking(false)
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong. Please try again." },
          ])
        }
      } finally {
        setThinking(false)
        setStreaming(false)
      }
    },
    [messages, streaming],
  )

  const ctx = React.useMemo(
    () => ({ showForm, triggerOpen, triggerClose, triggerReset }),
    [showForm, triggerOpen, triggerClose, triggerReset],
  )

  const { w: formW, h: formH } = useFormDimensions()

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-end justify-end">
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx("bg-background relative flex flex-col items-center overflow-hidden border")}
        initial={false}
        animate={{
          width: showForm ? formW : "auto",
          height: showForm ? formH : 44,
          borderRadius: showForm ? 14 : 20,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormCtx.Provider value={ctx}>
          <DockBar />
          <InputForm
            messages={messages}
            streaming={streaming}
            thinking={thinking}
            cookingVisible={cookingVisible}
            phaseIndex={phaseIndex}
            grokExpanded={grokExpanded}
            onToggleGrok={toggleGrok}
            inputMode={inputMode}
            onModeChange={handleModeChange}
            bottomRef={bottomRef}
            onSend={handleSend}
            onStop={handleStop}
            formW={formW}
            formH={formH}
          />
        </FormCtx.Provider>
      </motion.div>
    </div>
  )
}
