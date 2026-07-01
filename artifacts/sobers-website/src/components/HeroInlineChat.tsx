import React, { useState, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const WELCOME =
  "Hi! Ask me anything about 3D walkthroughs, virtual tours, or how we help you book more — whether you're an estate agent, property developer, or host on Airbnb, Vrbo, Booking.com, or any other platform. What would you like to know?"

const AVATARS = [
  { src: "https://i.pravatar.cc/150?img=47", fallback: "AE" },
  { src: "https://i.pravatar.cc/150?img=32", fallback: "PD" },
  { src: "https://i.pravatar.cc/150?img=12", fallback: "HA" },
  { src: "https://i.pravatar.cc/150?img=68", fallback: "JS" },
]

export function HeroInlineChat() {
  const [hasSent, setHasSent] = useState(false)
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!value.trim()) return
    setHasSent(true)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-5 w-full max-w-xl mx-auto px-2">

      {/* Agent welcome message — fades + blurs away on send */}
      <AnimatePresence>
        {!hasSent && (
          <motion.div
            key="welcome-block"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)", y: -12 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-4 w-full"
          >
            {/* Agent message bubble */}
            <div className="flex items-start gap-3 text-left w-full">
              {/* Orb avatar for agent */}
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" opacity="0" />
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
                  <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9" />
                </svg>
              </div>

              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {WELCOME}
                </p>
              </div>
            </div>

            {/* Trusted by avatar pill */}
            <div className="flex items-center rounded-full px-3 py-1.5 gap-2 bg-white/5 border border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex -space-x-2">
                {AVATARS.map((av, i) => (
                  <Avatar key={i} className="size-6 border-2 border-black/60">
                    <AvatarImage src={av.src} alt={av.fallback} />
                    <AvatarFallback className="text-[9px] bg-purple-700 text-white">
                      {av.fallback}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Trusted by{" "}
                <span className="font-semibold text-white">2,000+</span>{" "}
                estate agents &amp; hosts
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input — always visible */}
      <motion.div
        layout
        className="w-full"
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md shadow-xl shadow-black/30 focus-within:border-purple-500/50 transition-colors duration-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
            }}
            onKeyDown={handleKey}
            placeholder="Ask me anything…"
            rows={1}
            className={cn(
              "flex-1 bg-transparent resize-none outline-none text-sm text-gray-100 placeholder:text-gray-500",
              "min-h-[24px] max-h-[120px] leading-6 scrollbar-thin scrollbar-thumb-white/10",
            )}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim()}
            className={cn(
              "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
              value.trim()
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/40 active:scale-95"
                : "bg-white/5 text-gray-600 cursor-not-allowed",
            )}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-600 mt-2">
          Press <kbd className="font-mono bg-white/5 px-1 rounded">Enter</kbd> to send · <kbd className="font-mono bg-white/5 px-1 rounded">Shift+Enter</kbd> for new line
        </p>
      </motion.div>
    </div>
  )
}
