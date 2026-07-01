import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PromptInputBox } from "./ui/ai-prompt-box"
import { SiriWave } from "./ui/siri-wave"
import { LoadingBreadcrumb } from "./ui/loading-breadcrumb"
import { AgentThinkingBadge } from "./ui/grok-agent-thinking-indicator"

/* ─────────────────────────────────────────────
   ColorOrb — CSS-only, styles live in index.css
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
   KeyHint kbd element
───────────────────────────────────────────── */
function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cx(
        "text-foreground flex h-6 w-fit items-center justify-center rounded-sm border px-[6px] font-sans text-xs",
        className,
      )}
    >
      {children}
    </kbd>
  )
}

/* ─────────────────────────────────────────────
   Thinking phase labels — rotates to signal depth
───────────────────────────────────────────── */
const THINKING_PHASES = [
  "Analysing your question…",
  "Cross-checking facts…",
  "Stress-testing the answer…",
  "Verifying every claim…",
  "Optimising for clarity…",
  "Double-checking logic…",
  "Building the perfect response…",
  "Almost ready…",
]

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const FORM_WIDTH = 360
const FORM_HEIGHT = 500
const SPEED = 1
const MIN_THINK_MS = 5000

const ORB_TONES = { base: "oklch(22.64% 0 0)" }

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
   Stacked Thinking Indicator
───────────────────────────────────────────── */
function ThinkingIndicator({ phaseIndex }: { phaseIndex: number }) {
  const label = THINKING_PHASES[phaseIndex % THINKING_PHASES.length]

  return (
    <div className="flex flex-col items-start gap-2.5 pl-1 py-1">
      {/* 1. Siri Wave */}
      <SiriWave variant="wave" size={72} renderScale={0.85} className="rounded-lg" />

      {/* 2. Cooking animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
        >
          <LoadingBreadcrumb text={label} />
        </motion.div>
      </AnimatePresence>

      {/* 3. Grok pixel orbs */}
      <AgentThinkingBadge label="Deep thinking…" />
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
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="blank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-5 w-5"
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={ORB_TONES} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
  thinkPhase,
  bottomRef,
  onSend,
}: {
  messages: Msg[]
  streaming: boolean
  thinking: boolean
  thinkPhase: number
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
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between py-1">
              <p className="text-foreground z-2 ml-[38px] flex items-center gap-[6px] select-none text-sm">
                Ask Agent
              </p>
              <KeyHint className="mt-1 mr-1 -translate-y-[3px]">Esc</KeyHint>
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

              {/* Stacked thinking indicator */}
              {thinking && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ThinkingIndicator phaseIndex={thinkPhase} />
                  </motion.div>
                </AnimatePresence>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="mt-1 shrink-0 [&_.rounded-3xl]:rounded-xl [&_.p-2]:p-1.5">
              <PromptInputBox
                onSend={(text) => onSend(text)}
                isLoading={streaming}
                placeholder="Ask me anything…"
                className="!bg-background !border-border"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ColorOrb top-left */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3 pointer-events-none"
          >
            <ColorOrb dimension="24px" tones={ORB_TONES} />
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

  const [showForm, setShowForm] = React.useState(false)
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: WELCOME },
  ])
  const [streaming, setStreaming] = React.useState(false)
  const [thinking, setThinking] = React.useState(false)
  const [thinkPhase, setThinkPhase] = React.useState(0)

  /* Scroll to latest */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

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

  /* Phase rotation — cycles thinking label every 1.2 s */
  React.useEffect(() => {
    if (thinking) {
      setThinkPhase(0)
      phaseTimerRef.current = setInterval(() => {
        setThinkPhase((p) => p + 1)
      }, 1200)
    } else {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
    }
    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
    }
  }, [thinking])

  const triggerClose = React.useCallback(() => setShowForm(false), [])
  const triggerOpen  = React.useCallback(() => setShowForm(true),  [])

  /* Send message — enforces MIN_THINK_MS before revealing response */
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

        /* ── Minimum thinking window ── */
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
          /* Still enforce minimum delay even on error */
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
        className={cx(
          "bg-background relative flex flex-col items-center overflow-hidden border",
        )}
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
            thinkPhase={thinkPhase}
            bottomRef={bottomRef}
            onSend={handleSend}
          />
        </FormCtx.Provider>
      </motion.div>
    </div>
  )
}
