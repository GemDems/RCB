import { cn } from "@/lib/utils";
import React, {
  useState, useRef, useEffect, forwardRef, useImperativeHandle,
  useMemo, useCallback, createContext, Children,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, MapPin, Home, ArrowLeft, X, AlertCircle, PartyPopper, Loader, Mail } from "lucide-react";
import { AnimatePresence, motion, useInView, type Variants, type Transition } from "motion/react";
import { useLocation } from "wouter";
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";

// ── Confetti ──────────────────────────────────────────────────────────────────
type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;
const ConfettiContext = createContext<Api>({} as Api);

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean;
}>((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) { instanceRef.current.reset(); instanceRef.current = null; }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// ── TextLoop ─────────────────────────────────────────────────────────────────
type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (i: number) => void; stopOnEnd?: boolean; };
function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const ms = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((cur) => {
        if (stopOnEnd && cur === items.length - 1) { clearInterval(timer); return cur; }
        const next = (cur + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, ms);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const mv: Variants = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } };
  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={currentIndex} initial="initial" animate="animate" exit="exit" transition={transition} variants={variants || mv}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── BlurFade ──────────────────────────────────────────────────────────────────
interface BlurFadeProps { children: React.ReactNode; className?: string; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: string; blur?: string; }
function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
  const ref = useRef(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={defaultVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// ── GlassButton ───────────────────────────────────────────────────────────────
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", {
  variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } },
  defaultVariants: { size: "default" },
});
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", {
  variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } },
  defaultVariants: { size: "default" },
});
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      if (button && e.target !== button) button.click();
    };
    return (
      <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none" />
      </div>
    );
  },
);
GlassButton.displayName = "GlassButton";

// ── Background ────────────────────────────────────────────────────────────────
const DemoBackground = () => (
  <>
    <style>{`@keyframes dfloat1{0%{transform:translate(0,0)}50%{transform:translate(-10px,10px)}100%{transform:translate(0,0)}}@keyframes dfloat2{0%{transform:translate(0,0)}50%{transform:translate(10px,-10px)}100%{transform:translate(0,0)}}`}</style>
    <div className="absolute inset-0 bg-[#030303]" />
    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-purple-600/15 blur-[120px]" style={{ animation: "dfloat1 20s ease-in-out infinite" }} />
    <div className="absolute right-0 bottom-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" style={{ animation: "dfloat2 25s ease-in-out infinite" }} />
    <div className="absolute left-0 top-3/4 w-[300px] h-[300px] rounded-full bg-violet-500/8 blur-[80px]" style={{ animation: "dfloat1 18s ease-in-out infinite" }} />
  </>
);

// ── Modal steps ───────────────────────────────────────────────────────────────
const modalSteps = [
  { message: "Logging your details...",     icon: <Loader className="w-12 h-12 text-purple-400 animate-spin" /> },
  { message: "Reserving your demo slot...", icon: <Loader className="w-12 h-12 text-purple-400 animate-spin" /> },
  { message: "Finalising...",               icon: <Loader className="w-12 h-12 text-purple-400 animate-spin" /> },
  { message: "You're in!",                  icon: <PartyPopper className="w-12 h-12 text-emerald-400" /> },
];
const TEXT_LOOP_INTERVAL = 1.5;

const PROPERTY_TYPES = ["Airbnb / Short-let", "Estate agent listing", "Holiday let", "Property developer", "Other"];

// ── Main component ─────────────────────────────────────────────────────────────
export default function GetDemoPage() {
  const [, navigate] = useLocation();

  const [email, setEmail]               = useState("");
  const [address, setAddress]           = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [step, setStep]                 = useState<"email" | "address" | "type">("email");
  const [modalStatus, setModalStatus]   = useState<"closed" | "loading" | "error" | "success">("closed");
  const [modalError, setModalError]     = useState("");
  const confettiRef = useRef<ConfettiRef>(null);
  const addressRef  = useRef<HTMLInputElement>(null);

  const isEmailValid   = /\S+@\S+\.\S+/.test(email);
  const isAddressValid = address.trim().length >= 3;

  const fireCelebration = () => {
    const fire = confettiRef.current?.fire;
    if (!fire) return;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    fire({ ...defaults, particleCount: 60, origin: { x: 0, y: 1 }, angle: 60 });
    fire({ ...defaults, particleCount: 60, origin: { x: 1, y: 1 }, angle: 120 });
  };

  const handleProgressStep = () => {
    if (step === "email" && isEmailValid) setStep("address");
    else if (step === "address" && isAddressValid) setStep("type");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleProgressStep(); }
  };

  const handleGoBack = () => {
    if (step === "type") { setStep("address"); setPropertyType(""); }
    else if (step === "address") setStep("email");
  };

  const handleSelectType = (type: string) => {
    setPropertyType(type);
    setModalStatus("loading");
    const totalDuration = (modalSteps.length - 1) * TEXT_LOOP_INTERVAL * 1000;
    setTimeout(() => {
      fireCelebration();
      setModalStatus("success");
    }, totalDuration);
  };

  const closeModal = () => { setModalStatus("closed"); setModalError(""); };

  useEffect(() => {
    if (step === "address") setTimeout(() => addressRef.current?.focus(), 500);
  }, [step]);

  // Confetti is fired once in handleSelectType after the loading delay — no extra effect needed.

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900/90 border border-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-4 shadow-2xl">
            {(modalStatus === "error" || modalStatus === "success") && (
              <button onClick={closeModal} aria-label="Close" className="absolute top-3 right-3 p-1 text-white/40 hover:text-white/80 transition-colors"><X className="w-5 h-5" /></button>
            )}
            {modalStatus === "error" && (
              <>
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-lg font-medium text-white">{modalError}</p>
                <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
              </>
            )}
            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd>
                {modalSteps.slice(0, -1).map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    {s.icon}
                    <p className="text-lg font-medium text-white">{s.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-4 text-center">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-2xl font-black text-white">You're in!</p>
                <p className="text-sm text-white/60">We'll have your free 3D walkthrough demo ready within 48 hours. Check your inbox at <span className="text-purple-300">{email}</span>.</p>
                <button onClick={() => navigate("/")} className="mt-2 flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to site
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="dark min-h-screen w-screen flex flex-col relative overflow-hidden bg-[#030303] text-foreground font-sans">
      <style>{`
        input[type="password"]::-ms-reveal,input[type="password"]::-ms-clear{display:none!important}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active{-webkit-box-shadow:0 0 0 30px transparent inset!important;-webkit-text-fill-color:#fff!important;background-color:transparent!important;transition:background-color 5000s ease-in-out 0s!important;color:#fff!important;caret-color:#fff!important}
        @property --angle-1{syntax:"<angle>";inherits:false;initial-value:-75deg}@property --angle-2{syntax:"<angle>";inherits:false;initial-value:-45deg}
        .glass-button-wrap{--anim-time:400ms;--anim-ease:cubic-bezier(.25,1,.5,1);--border-width:clamp(1px,.0625em,4px);position:relative;z-index:2;transform-style:preserve-3d;transition:transform var(--anim-time) var(--anim-ease)}.glass-button-wrap:has(.glass-button:active){transform:rotateX(25deg)}.glass-button-shadow{--shadow-cutoff-fix:2em;position:absolute;width:calc(100% + var(--shadow-cutoff-fix));height:calc(100% + var(--shadow-cutoff-fix));top:calc(0% - var(--shadow-cutoff-fix)/2);left:calc(0% - var(--shadow-cutoff-fix)/2);filter:blur(clamp(2px,.125em,12px));transition:filter var(--anim-time) var(--anim-ease);pointer-events:none;z-index:0}.glass-button-shadow::after{content:"";position:absolute;inset:0;border-radius:9999px;background:linear-gradient(180deg,oklch(from var(--foreground) l c h/20%),oklch(from var(--foreground) l c h/10%));width:calc(100% - var(--shadow-cutoff-fix) - .25em);height:calc(100% - var(--shadow-cutoff-fix) - .25em);top:calc(var(--shadow-cutoff-fix) - .5em);left:calc(var(--shadow-cutoff-fix) - .875em);padding:.125em;box-sizing:border-box;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim-time) var(--anim-ease);opacity:1}
        .glass-button{-webkit-tap-highlight-color:transparent;backdrop-filter:blur(clamp(1px,.125em,4px));transition:all var(--anim-time) var(--anim-ease);background:linear-gradient(-75deg,oklch(from var(--background) l c h/5%),oklch(from var(--background) l c h/20%),oklch(from var(--background) l c h/5%));box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .25em .125em -.125em oklch(from var(--foreground) l c h/20%),0 0 .1em .25em inset oklch(from var(--background) l c h/20%),0 0 0 0 oklch(from var(--background) l c h)}.glass-button:hover{transform:scale(.975)}.glass-button-text{color:oklch(from var(--foreground) l c h/90%);text-shadow:0em .25em .05em oklch(from var(--foreground) l c h/10%);transition:all var(--anim-time) var(--anim-ease)}.glass-button-text::after{content:"";display:block;position:absolute;width:calc(100% - var(--border-width));height:calc(100% - var(--border-width));top:calc(0% + var(--border-width)/2);left:calc(0% + var(--border-width)/2);box-sizing:border-box;border-radius:9999px;overflow:clip;background:linear-gradient(var(--angle-2),transparent 0%,oklch(from var(--background) l c h/50%) 40% 50%,transparent 55%);z-index:3;mix-blend-mode:screen;pointer-events:none;background-size:200% 200%;background-position:0% 50%;transition:background-position calc(var(--anim-time)*1.25) var(--anim-ease),--angle-2 calc(var(--anim-time)*1.25) var(--anim-ease)}.glass-button::after{content:"";position:absolute;z-index:1;inset:0;border-radius:9999px;width:calc(100% + var(--border-width));height:calc(100% + var(--border-width));top:calc(0% - var(--border-width)/2);left:calc(0% - var(--border-width)/2);padding:var(--border-width);box-sizing:border-box;background:conic-gradient(from var(--angle-1) at 50% 50%,oklch(from var(--foreground) l c h/50%) 0%,transparent 5% 40%,oklch(from var(--foreground) l c h/50%) 50%,transparent 60% 95%,oklch(from var(--foreground) l c h/50%) 100%),linear-gradient(180deg,oklch(from var(--background) l c h/50%),oklch(from var(--background) l c h/50%));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim-time) var(--anim-ease),--angle-1 500ms ease;box-shadow:inset 0 0 0 calc(var(--border-width)/2) oklch(from var(--background) l c h/50%);pointer-events:none}.glass-button:hover::after{--angle-1:-125deg}.glass-button:active::after{--angle-1:-75deg}
        .glass-input-wrap{position:relative;z-index:2;transform-style:preserve-3d;border-radius:9999px}.glass-input{display:flex;position:relative;width:100%;align-items:center;gap:.5rem;border-radius:9999px;padding:.25rem;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(clamp(1px,.125em,4px));transition:all 400ms cubic-bezier(.25,1,.5,1);background:linear-gradient(-75deg,oklch(from var(--background) l c h/5%),oklch(from var(--background) l c h/20%),oklch(from var(--background) l c h/5%));box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .25em .125em -.125em oklch(from var(--foreground) l c h/20%),0 0 .1em .25em inset oklch(from var(--background) l c h/20%)}.glass-input::after{content:"";position:absolute;z-index:1;inset:0;border-radius:9999px;width:calc(100% + clamp(1px,.0625em,4px));height:calc(100% + clamp(1px,.0625em,4px));top:calc(0% - clamp(1px,.0625em,4px)/2);left:calc(0% - clamp(1px,.0625em,4px)/2);padding:clamp(1px,.0625em,4px);box-sizing:border-box;background:conic-gradient(from var(--angle-1) at 50% 50%,oklch(from var(--foreground) l c h/50%) 0%,transparent 5% 40%,oklch(from var(--foreground) l c h/50%) 50%,transparent 60% 95%,oklch(from var(--foreground) l c h/50%) 100%),linear-gradient(180deg,oklch(from var(--background) l c h/50%),oklch(from var(--background) l c h/50%));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all 400ms cubic-bezier(.25,1,.5,1),--angle-1 500ms ease;pointer-events:none}.glass-input-wrap:focus-within .glass-input::after{--angle-1:-125deg}.glass-input-text-area{position:absolute;inset:0;border-radius:9999px;pointer-events:none}.glass-input-text-area::after{content:"";display:block;position:absolute;width:calc(100% - clamp(1px,.0625em,4px));height:calc(100% - clamp(1px,.0625em,4px));top:calc(0% + clamp(1px,.0625em,4px)/2);left:calc(0% + clamp(1px,.0625em,4px)/2);box-sizing:border-box;border-radius:9999px;overflow:clip;background:linear-gradient(var(--angle-2),transparent 0%,oklch(from var(--background) l c h/50%) 40% 50%,transparent 55%);z-index:3;mix-blend-mode:screen;pointer-events:none;background-size:200% 200%;background-position:0% 50%;transition:background-position calc(400ms*1.25) cubic-bezier(.25,1,.5,1),--angle-2 calc(400ms*1.25) cubic-bezier(.25,1,.5,1)}.glass-input-wrap:focus-within .glass-input-text-area::after{background-position:25% 50%}
      `}</style>

      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      {/* Background */}
      <div className="absolute inset-0 z-0"><DemoBackground /></div>

      {/* Go Back button */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </button>
      </div>

      {/* Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <fieldset disabled={modalStatus !== "closed"} className="flex flex-col items-center gap-8 w-[300px]">

          <AnimatePresence mode="wait">
            {/* ── Step headings ── */}
            {step === "email" && (
              <motion.div key="email-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center gap-3 text-center">
                <BlurFade delay={0.1}>
                  <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-white">Your free 3D demo</p>
                </BlurFade>
                <BlurFade delay={0.2}>
                  <p className="text-sm text-white/50">Drop your email and we'll scan your property and send you a hyper-realistic 3D walkthrough — completely free.</p>
                </BlurFade>
              </motion.div>
            )}
            {step === "address" && (
              <motion.div key="address-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center gap-3 text-center">
                <BlurFade delay={0}>
                  <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-white">Where's the property?</p>
                </BlurFade>
                <BlurFade delay={0.1}>
                  <p className="text-sm text-white/50">We'll use this to assign the right team and schedule your free demo scan.</p>
                </BlurFade>
              </motion.div>
            )}
            {step === "type" && (
              <motion.div key="type-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center gap-3 text-center">
                <BlurFade delay={0}>
                  <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-white">One last thing</p>
                </BlurFade>
                <BlurFade delay={0.1}>
                  <p className="text-sm text-white/50">What best describes your property? We'll tailor the demo to your audience.</p>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Inputs / selectors ── */}
          <div className="w-full space-y-6">
            <AnimatePresence>
              {step !== "type" && (
                <motion.div key="text-fields" exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.3 }} className="w-full space-y-6">

                  {/* Email field */}
                  <BlurFade delay={step === "email" ? 0.3 : 0} className="w-full">
                    <div className="relative w-full">
                      <AnimatePresence>
                        {step === "address" && (
                          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.4 }} className="absolute -top-6 left-4 z-10">
                            <label className="text-xs text-white/40 font-semibold">Email</label>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="glass-input-wrap w-full">
                        <div className="glass-input">
                          <span className="glass-input-text-area" />
                          <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300", email.length > 20 && step === "email" ? "w-0 px-0" : "w-10 pl-2")}>
                            <Mail className="h-5 w-5 text-white/60 flex-shrink-0" />
                          </div>
                          <label htmlFor="demo-email" className="sr-only">Email address</label>
                          <input
                            id="demo-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={cn("relative z-10 h-full w-0 flex-grow bg-transparent text-white placeholder:text-white/30 focus:outline-none transition-[padding-right] duration-300 delay-300", isEmailValid && step === "email" ? "pr-2" : "pr-0")}
                          />
                          <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300", isEmailValid && step === "email" ? "w-10 pr-1" : "w-0")}>
                            <GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue with email" contentClassName="text-white/70 hover:text-white">
                              <ArrowRight className="w-5 h-5" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  {/* Address field */}
                  <AnimatePresence>
                    {step === "address" && (
                      <BlurFade key="address-field" className="w-full">
                        <div className="relative w-full">
                          <AnimatePresence>
                            {address.length > 0 && (
                              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10">
                                <label className="text-xs text-white/40 font-semibold">Property address</label>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                              <span className="glass-input-text-area" />
                              <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                <MapPin className="h-5 w-5 text-white/60 flex-shrink-0" />
                              </div>
                              <label htmlFor="demo-address" className="sr-only">Property address</label>
                              <input
                                id="demo-address"
                                ref={addressRef}
                                type="text"
                                placeholder="Property address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="relative z-10 h-full w-0 flex-grow bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                              />
                              <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300", isAddressValid ? "w-10 pr-1" : "w-0")}>
                                <GlassButton type="button" onClick={handleProgressStep} size="icon" aria-label="Continue with address" contentClassName="text-white/70 hover:text-white">
                                  <ArrowRight className="w-5 h-5" />
                                </GlassButton>
                              </div>
                            </div>
                          </div>
                          <BlurFade inView delay={0.2}>
                            <button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
                              <ArrowLeft className="w-4 h-4" /> Go back
                            </button>
                          </BlurFade>
                        </div>
                      </BlurFade>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Property type selector */}
            <AnimatePresence>
              {step === "type" && (
                <BlurFade key="type-selector" className="w-full">
                  <div className="flex flex-col gap-3 w-full">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSelectType(type)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
                      >
                        <Home className="w-4 h-4 flex-shrink-0 text-purple-400" />
                        {type}
                      </button>
                    ))}
                  </div>
                  <BlurFade inView delay={0.2}>
                    <button type="button" onClick={handleGoBack} className="mt-4 flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                  </BlurFade>
                </BlurFade>
              )}
            </AnimatePresence>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
