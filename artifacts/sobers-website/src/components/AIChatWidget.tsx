import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, Send, Sparkles } from "lucide-react";
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

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = useCallback(async (text: string) => {
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
  }, [messages, streaming]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl
              bg-gradient-to-br from-violet-600 to-indigo-600
              shadow-[0_4px_32px_rgba(139,92,246,0.45)]
              hover:shadow-[0_4px_48px_rgba(139,92,246,0.65)]
              hover:scale-[1.04] active:scale-[0.97]
              transition-all duration-200 cursor-pointer border border-violet-400/30"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white tracking-wide">Ask AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] flex flex-col
              rounded-2xl overflow-hidden
              bg-[#0d0d12] border border-white/10
              shadow-[0_8px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(139,92,246,0.15)]"
            style={{ height: "min(580px, calc(100vh - 80px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-none">Sobers AI</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
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

              {/* Thinking state */}
              {thinking && (
                <div className="flex justify-start flex-col gap-2 pl-1">
                  <AgentThinkingBadge label="Thinking…" />
                  <LoadingBreadcrumb label="Cooking up a response…" />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions (only when no user messages yet) */}
            {messages.filter((m) => m.role === "user").length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-white/12
                      bg-white/5 text-white/60 hover:text-white/90 hover:border-violet-500/40 hover:bg-violet-500/10
                      transition-all duration-150 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-1 border-t border-white/8 bg-white/[0.02]">
              <div className="flex items-end gap-2 bg-white/6 rounded-xl border border-white/10 px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything about Sobers…"
                  rows={1}
                  disabled={streaming}
                  className="flex-1 bg-transparent text-sm text-white/85 placeholder-white/25
                    resize-none outline-none leading-relaxed max-h-28 overflow-y-auto
                    disabled:opacity-50"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || streaming}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                    bg-gradient-to-br from-violet-600 to-indigo-600
                    disabled:opacity-30 disabled:cursor-not-allowed
                    hover:opacity-90 active:scale-95 transition-all duration-150"
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
    </>
  );
}
