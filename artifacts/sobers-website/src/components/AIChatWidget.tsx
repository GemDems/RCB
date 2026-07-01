import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowLeft, Send } from "lucide-react";
import { ColorOrb } from "./ui/color-orb";
import { AgentThinkingBadge } from "./ui/grok-agent-thinking-indicator";
import { LoadingBreadcrumb } from "./ui/loading-breadcrumb";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = "Hi! I'm the Sobers AI agent. Whether you're an estate agent, developer, or Airbnb host — I can show you exactly how a 3D walkthrough pays for itself. What would you like to know?";

const SUGGESTIONS = [
  "How much does it cost?",
  "What's the ROI for estate agents?",
  "How does the scanning process work?",
  "Can I book a free demo?",
];

const FORM_WIDTH = 360;
const FORM_HEIGHT = 480;
const SPEED_FACTOR = 1;

export function AIChatWidget() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* Scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  /* Focus textarea on open */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [open]);

  /* Click-outside to close */
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && open) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [open]);

  const triggerOpen = useCallback(() => setOpen(true), []);
  const triggerClose = useCallback(() => {
    setOpen(false);
    textareaRef.current?.blur();
  }, []);

  /* Send message + SSE stream */
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setThinking(true);
      setStreaming(true);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const allMessages = [...messages, userMsg];
      let assistantContent = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("API error");

        setThinking(false);
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.done) break;
              if (parsed.content) {
                assistantContent += parsed.content;
                const snap = assistantContent;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: snap };
                  return next;
                });
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setThinking(false);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong. Please try again." },
          ]);
        }
      } finally {
        setThinking(false);
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
    if (e.key === "Escape") triggerClose();
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      send(input);
    }
  };

  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ width: FORM_WIDTH }}>
      <motion.div
        ref={wrapperRef}
        className="relative overflow-hidden border border-white/10 shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.12)]"
        style={{ background: "#0b0b10" }}
        initial={false}
        animate={{
          width: open ? FORM_WIDTH : 152,
          height: open ? FORM_HEIGHT : 44,
          borderRadius: open ? 14 : 22,
          x: open ? 0 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: open ? 0 : 0.08,
        }}
      >
        {/* ── Collapsed Dock ── */}
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="dock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={triggerOpen}
              className="absolute inset-0 flex items-center gap-2.5 px-3 cursor-pointer select-none"
            >
              <ColorOrb
                dimension="20px"
                tones={{ base: "oklch(22% 0 0)", accent1: "oklch(65% 0.22 300)", accent2: "oklch(60% 0.2 220)", accent3: "oklch(70% 0.18 280)" }}
                spinDuration={12}
              />
              <span className="text-sm font-semibold text-white/80 tracking-wide">Ask AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Expanded Chat ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/8 bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={triggerClose}
                    className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <ColorOrb
                    dimension="22px"
                    tones={{ base: "oklch(22% 0 0)", accent1: "oklch(65% 0.22 300)", accent2: "oklch(60% 0.2 220)", accent3: "oklch(70% 0.18 280)" }}
                    spinDuration={10}
                  />
                  <div>
                    <p className="text-xs font-semibold text-white leading-none">Sobers AI</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Online</p>
                  </div>
                </div>
                <button
                  onClick={triggerClose}
                  className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
                          : "bg-white/8 text-white/85 rounded-bl-sm border border-white/8"
                      }`}
                    >
                      {msg.content || (
                        <span className="text-white/30 italic text-xs">Typing…</span>
                      )}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex justify-start flex-col gap-2 pl-1">
                    <AgentThinkingBadge label="Thinking…" />
                    <LoadingBreadcrumb label="Cooking up a response…" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {userCount === 0 && (
                <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-white/12 bg-white/5 text-white/60 hover:text-white/90 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all duration-150 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-2.5 pb-2.5 pt-1 border-t border-white/8 bg-white/[0.02]">
                <div className="flex items-end gap-2 bg-white/6 rounded-xl border border-white/10 px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask anything about Sobers…"
                    rows={1}
                    disabled={streaming}
                    className="flex-1 bg-transparent text-[13px] text-white/85 placeholder-white/25 resize-none outline-none leading-relaxed max-h-28 overflow-y-auto disabled:opacity-50"
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || streaming}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-white/20 mt-1.5">
                  Powered by Sobers AI · Book a free demo
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
