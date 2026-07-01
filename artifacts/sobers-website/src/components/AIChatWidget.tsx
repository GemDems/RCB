import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PromptInputBox } from "./ui/ai-prompt-box"
import { SiriWave } from "./ui/siri-wave"
import { LoadingBreadcrumb } from "./ui/loading-breadcrumb"
import { AgentsThinkingBadge, PALETTES, PixelOrb } from "./ui/grok-agent-thinking-indicator"
import { TextShimmer } from "./ui/shimmer-text"

/* ─────────────────────────────────────────────
   ColorOrb — CSS-only
───────────────────────────────────────────── */
interface OrbProps {
  dimension?: string
  className?: string
  tones?: { base?: string; accent1?: string; accent2?: string; accent3?: string }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
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
   Constants
───────────────────────────────────────────── */
const FORM_WIDTH = 390
const FORM_HEIGHT = 540
const SPEED = 1
const MIN_THINK_MS = 5000
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

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
interface CtxShape {
  showForm: boolean
  triggerOpen: () => void
  triggerClose: () => void
}
const FormCtx = React.createContext({} as CtxShape)
const useFormCtx = () => React.useContext(FormCtx)

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Msg { role: "user" | "assistant"; content: string }

const WELCOME = "Hi! I'm the Sobers AI — ask me anything about 3D walkthroughs, virtual tours, or how we help estate agents and Airbnb hosts book more. What would you like to know?"

/* ─────────────────────────────────────────────
   Full Grok Panel — exact AgentsThinkingBadge replica at full scale
   drops down when expanded
───────────────────────────────────────────── */
function FullGrokPanel() {
  const safeCount = 4
  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Exact replica of AgentsThinkingBadge — at full size */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Agents thinking"
        className="inline-flex h-[41px] items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 pr-3 text-foreground shadow-sm"
      >
        <div className="flex h-[29px] items-center">
          {Array.from({ length: safeCount }).map((_, i) => (
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

      {/* Single agent badges */}
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

      {/* TextShimmer at bottom */}
      <TextShimmer as="span" className="font-light text-md tracking-tight ml-0.5">
        Agent is thinking ...
      </TextShimmer>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Thinking Area — orchestrated reveal
   1. SiriWave (immediate, transparent)
   2. LoadingBreadcrumb (blur-in after 1.8s)
   3. AgentsThinkingBadge pill (click to expand full Grok panel)
───────────────────────────────────────────── */
function ThinkingArea({
  cookingVisible,
  phaseIndex,
  grokExpanded,
  onToggleGrok,
}: {
  cookingVisible: boolean
  phaseIndex: number
  grokExpanded: boolean
  onToggleGrok: () => void
}) {
  const cookingLabel = COOKING_PHASES[phaseIndex % COOKING_PHASES.length]

  return (
    <div className="flex flex-col items-start gap-2 py-1 pl-1">

      {/* 1 ── Siri Wave — transparent (screen blend, no black bg) */}
      <SiriWave
        variant="wave"
        size={80}
        renderScale={0.85}
        className="rounded-lg !bg-transparent"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 2 ── Cooking breadcrumb — blurs in after 1.8s */}
      <AnimatePresence>
        {cookingVisible && (
          <motion.div
            key="cooking"
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

      {/* 3 ── Grok section — pill that drops to full panel on click */}
      <AnimatePresence>
        {cookingVisible && (
          <motion.div
            key="grok-section"
            initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {!grokExpanded ? (
              /* Collapsed: clickable AgentsThinkingBadge pill */
              <button
                type="button"
                onClick={onToggleGrok}
                className="cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                aria-label="Expand agent thinking panel"
              >
                <AgentsThinkingBadge label="Agents thinking" count={4} />
              </button>
            ) : (
              /* Expanded: full Grok panel drops down */
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  {/* Collapse button */}
                  <button
                    type="button"
                    onClick={onToggleGrok}
                    className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <span>▲ collapse</span>
                  </button>
                  <FullGrokPanel />
                </div>
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
  bottomRef,
  onSend,
}: {
  messages: Msg[]
  streaming: boolean
  thinking: boolean
  cookingVisible: boolean
  phaseIndex: number
  grokExpanded: boolean
  onToggleGrok: () => void
  bottomRef: React.RefObject<HTMLDivElement | null>
  onSend: (text: string) => void
}) {
  const { triggerClose, showForm } = useFormCtx()

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
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "all" : "none" }}
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
            {/* Header — go back button */}
            <div className="flex shrink-0 items-center justify-between py-1 px-1">
              <button
                type="button"
                onClick={triggerClose}
                className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close chat"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <p className="flex items-center gap-[6px] select-none text-sm text-foreground/70">
                <ColorOrb dimension="14px" tones={ORB_TONES} />
                Ask Agent
              </p>
              <div className="w-[54px]" />
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto space-y-2.5 px-1 py-2 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
              ))}

              {/* Thinking area — orchestrated reveal */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <ThinkingArea
                      cookingVisible={cookingVisible}
                      phaseIndex={phaseIndex}
                      grokExpanded={grokExpanded}
                      onToggleGrok={onToggleGrok}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input row — with Grok toggle chip when thinking */}
            <div className="shrink-0">
              {/* Thinking chip above the input — only shown when thinking, toggles Grok panel */}
              <AnimatePresence>
                {thinking && (
                  <motion.div
                    key="thinking-chip"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 px-2 pb-1.5"
                  >
                    <button
                      type="button"
                      onClick={onToggleGrok}
                      className={cx(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all",
                        grokExpanded
                          ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-border/80"
                      )}
                    >
                      <Sparkles size={10} />
                      <span>{grokExpanded ? "collapse thinking" : "see thinking"}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-0.5 [&_.rounded-3xl]:rounded-xl [&_.p-2]:p-1.5">
                <PromptInputBox
                  onSend={(text) => onSend(text)}
                  isLoading={streaming}
                  placeholder="Ask me anything…"
                  className="!bg-background !border-border"
                />
              </div>
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
export function AIChatWidget() {
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

  /* Scroll to latest */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking, grokExpanded])

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
      setGrokExpanded(false)

      /* Cooking blurs in after 1.8s */
      cookingTimerRef.current = setTimeout(() => {
        setCookingVisible(true)
      }, 1800)

      /* Phase label cycles every 1.4s */
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

        /* Enforce minimum thinking window */
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
    () => ({ showForm, triggerOpen, triggerClose }),
    [showForm, triggerOpen, triggerClose],
  )

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx("bg-background relative flex flex-col items-center overflow-hidden border")}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : "auto",
          height: showForm ? FORM_HEIGHT : 44,
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
            bottomRef={bottomRef}
            onSend={handleSend}
          />
        </FormCtx.Provider>
      </motion.div>
    </div>
  )
}
