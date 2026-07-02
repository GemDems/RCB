// 1:1 structural replica of the AuthComponent — adapted for 3D demo lead capture
import { cn } from "@/lib/utils";
import React, {
  useState, useRef, useEffect, forwardRef, useImperativeHandle,
  useMemo, useCallback, createContext, Children,
} from "react";
import { InteractiveNebulaShader } from "@/components/ui/InteractiveNebulaShader";
import ClassicLoader from "@/components/ui/loader";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowRight, ArrowLeft, X, AlertCircle, PartyPopper,
  Link, Phone, User,
} from "lucide-react";
import {
  AnimatePresence, motion, useInView,
  type Variants, type Transition,
} from "motion/react";
import { useLocation } from "wouter";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

// ─── Confetti ────────────────────────────────────────────────────────────────
type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;
const ConfettiContext = createContext<Api>({} as Api);

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions;
    globalOptions?: ConfettiGlobalOptions;
    manualstart?: boolean;
  }
>((props, ref) => {
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

// ─── TextLoop ────────────────────────────────────────────────────────────────
type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  stopOnEnd?: boolean;
};
export function TextLoop({
  children, className, interval = 2, transition = { duration: 0.3 },
  variants, onIndexChange, stopOnEnd = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) { clearInterval(timer); return current; }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={currentIndex} initial="initial" animate="animate" exit="exit" transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── BlurFade ─────────────────────────────────────────────────────────────────
interface BlurFadeProps {
  children: React.ReactNode; className?: string;
  variant?: { hidden: { y: number }; visible: { y: number } };
  duration?: number; delay?: number; yOffset?: number;
  inView?: boolean; inViewMargin?: string; blur?: string;
}
function BlurFade({
  children, className, variant, duration = 0.4, delay = 0,
  yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px",
}: BlurFadeProps) {
  const ref = useRef(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden"
      variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── GlassButton (exact replica) ─────────────────────────────────────────────
const glassButtonVariants = cva(
  "relative isolate all-unset cursor-pointer rounded-full transition-all",
  { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } },
);
const glassButtonTextVariants = cva(
  "glass-button-text relative block select-none tracking-tighter",
  { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } },
);
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      // Only proxy when the click landed outside the button element itself
      if (button && !button.contains(e.target as Node)) button.click();
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

// ─── GradientBackground — pure purple, conversion-maximised ──────────────────
const GradientBackground = () => (
  <>
    <style>{`
      @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-12px, 14px); } 100% { transform: translate(0, 0); } }
      @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(14px, -12px); } 100% { transform: translate(0, 0); } }
      @keyframes pulse-glow { 0%,100% { opacity: 0.55; } 50% { opacity: 0.75; } }
    `}</style>
    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
      <defs>
        {/* pure violet/purple — no indigo */}
        <radialGradient id="pg_center" cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.55" />
          <stop offset="60%"  stopColor="#5b21b6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0d0117"  stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pg_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#9333ea" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="pg_grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#a855f7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="pg_grad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c084fc" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
        </radialGradient>
        <filter id="pg_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
        <filter id="pg_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28" /></filter>
        <filter id="pg_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55" /></filter>
        <filter id="pg_blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70" /></filter>
      </defs>

      {/* solid deep-purple base */}
      <rect width="800" height="600" fill="#0d0117" />

      {/* strong central form-focus glow — draws the eye to the CTA */}
      <ellipse cx="400" cy="300" rx="360" ry="280" fill="url(#pg_center)" filter="url(#pg_blur4)"
        style={{ animation: "pulse-glow 6s ease-in-out infinite" }} />

      {/* floating ambient blobs — pure purple palette */}
      <g style={{ animation: "float1 22s ease-in-out infinite" }}>
        <ellipse cx="160" cy="520" rx="270" ry="200" fill="url(#pg_grad1)" filter="url(#pg_blur1)" transform="rotate(-25 160 520)" />
        <rect x="530" y="80" width="310" height="260" rx="90" fill="url(#pg_grad2)" filter="url(#pg_blur2)" transform="rotate(18 685 210)" />
      </g>
      <g style={{ animation: "float2 28s ease-in-out infinite" }}>
        <circle cx="670" cy="460" r="170" fill="url(#pg_grad3)" filter="url(#pg_blur3)" opacity="0.7" />
        <ellipse cx="40" cy="140" rx="190" ry="130" fill="#6b21a8" filter="url(#pg_blur2)" opacity="0.55" />
      </g>
    </svg>
  </>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
const SiteLogo = () => (
  <div className="bg-violet-600 text-white rounded-md p-1.5">
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </div>
);

// ─── Modal steps (exact replica) ─────────────────────────────────────────────
const modalSteps = [
  { message: "Sending your request...",   icon: null },
  { message: "Notifying our team...",     icon: null },
  { message: "Finalising...",             icon: null },
  { message: "You're all booked in!",     icon: <PartyPopper className="w-12 h-12 text-emerald-400" /> },
];
const TEXT_LOOP_INTERVAL = 1.5;

// ─── API base (dev vs deployed) ───────────────────────────────────────────────
const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

// ─── URL domain allowlist check ───────────────────────────────────────────────
function isDomainAllowed(url: string, allowedDomains: string[]): boolean {
  if (!url || url.trim().length < 5) return false;
  if (allowedDomains.length === 0) return true; // permissive until list loads
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "");
    return allowedDomains.some((d) => {
      const domain = d.toLowerCase().replace(/^www\./, "");
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

// ─── Animated typewriter placeholder ─────────────────────────────────────────
const LISTING_EXAMPLES = [
  "zillow.com/homedetails/95-Oak-St-Denver-CO/12345678_zpid",
  "airbnb.com/rooms/48291023",
  "rightmove.co.uk/property-for-sale/118456789.html",
  "booking.com/hotel/gb/the-grand-lodge.html",
  "zoopla.co.uk/for-sale/details/56789012",
  "vrbo.com/vacation-rentals/p1234567vr",
  "onthemarket.com/details/property/98765432",
];

function useTypewriter(examples: string[], active: boolean): string {
  const [display, setDisplay] = useState("");
  const stateRef = useRef({ idx: 0, char: 0, phase: "typing" as "typing" | "pause" | "deleting" });

  useEffect(() => {
    if (!active) { setDisplay(""); return; }
    const s = stateRef.current;
    let tid: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = `https://${examples[s.idx]}`;
      if (s.phase === "typing") {
        if (s.char < full.length) {
          s.char++;
          setDisplay(full.slice(0, s.char));
          tid = setTimeout(tick, 42 + Math.random() * 30);
        } else {
          s.phase = "pause";
          tid = setTimeout(tick, 1900);
        }
      } else if (s.phase === "pause") {
        s.phase = "deleting";
        tid = setTimeout(tick, 300);
      } else {
        if (s.char > 0) {
          s.char--;
          setDisplay(full.slice(0, s.char));
          tid = setTimeout(tick, 16);
        } else {
          s.idx = (s.idx + 1) % examples.length;
          s.phase = "typing";
          tid = setTimeout(tick, 250);
        }
      }
    };
    tid = setTimeout(tick, 400);
    return () => clearTimeout(tid);
  }, [active, examples]);

  return display;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GetDemoPage() {
  const [, navigate] = useLocation();

  // field state
  const [listingUrl, setListingUrl] = useState("");
  const [listingFocused, setListingFocused] = useState(false);
  const [contact, setContact]       = useState("");
  const [name, setName]             = useState("");

  // step state — mirrors original: "email" | "password" | "confirmPassword"
  const [authStep, setAuthStep] = useState<"listing" | "contact" | "name">("listing");

  // modal state — exact replica
  const [modalStatus, setModalStatus]         = useState<"closed" | "loading" | "error" | "success">("closed");
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  // only show listing domain error after the user attempts to continue
  const [listingSubmitAttempted, setListingSubmitAttempted] = useState(false);

  const confettiRef  = useRef<ConfettiRef>(null);
  const contactRef   = useRef<HTMLInputElement>(null);
  const nameRef      = useRef<HTMLInputElement>(null);

  // allowed domains — fetched once on mount
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/allowed-domains`)
      .then((r) => r.json())
      .then((data: { domains: string[] }) => setAllowedDomains(data.domains))
      .catch(() => {}); // silent — stays permissive if fetch fails
  }, []);

  // validation
  const isDomainOk      = isDomainAllowed(listingUrl, allowedDomains);
  const isListingValid  = listingUrl.trim().length >= 5 && isDomainOk;
  const isContactValid  = contact.trim().length >= 6;
  const isNameValid     = name.trim().length >= 2;

  // Typewriter placeholder — active only when input is empty & unfocused
  const typedPlaceholder = useTypewriter(
    LISTING_EXAMPLES,
    listingUrl === "" && !listingFocused && authStep === "listing",
  );

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (!fire) return;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const particleCount = 50;
    fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
    fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== "closed" || authStep !== "name" || !isNameValid) return;

    setModalStatus("loading");
    const loadingDuration = (modalSteps.length - 1) * TEXT_LOOP_INTERVAL * 1000;

    // Fire API call in the background; show optimistic success after animation
    fetch(`${API_BASE}/api/submit-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingUrl, contact, name }),
    }).catch(() => {/* silent — UX already succeeded */});

    setTimeout(() => {
      fireSideCanons();
      setModalStatus("success");
    }, loadingDuration);
  };

  const handleProgressStep = () => {
    if (authStep === "listing") {
      if (isListingValid) setAuthStep("contact");
      else setListingSubmitAttempted(true);
    } else if (authStep === "contact" && isContactValid) {
      setAuthStep("name");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleProgressStep(); }
  };

  const handleGoBack = () => {
    if (authStep === "name")    { setAuthStep("contact"); setName(""); }
    else if (authStep === "contact") { setAuthStep("listing"); setContact(""); }
  };

  const closeModal = () => { setModalStatus("closed"); setModalErrorMessage(""); };

  // auto-focus next field — exact replica pattern
  useEffect(() => {
    if (authStep === "contact") setTimeout(() => contactRef.current?.focus(), 500);
    else if (authStep === "name") setTimeout(() => nameRef.current?.focus(), 500);
  }, [authStep]);

  // ─── Modal (exact replica) ────────────────────────────────────────────────
  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-card/80 border-4 border-border rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2">
            {(modalStatus === "error" || modalStatus === "success") && (
              <button onClick={closeModal} aria-label="Close"
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
            {modalStatus === "error" && (
              <>
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-medium text-foreground">{modalErrorMessage}</p>
                <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
              </>
            )}
            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd>
                {modalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <ClassicLoader />
                    <p className="text-lg font-medium text-foreground">{step.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-4 text-center">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-medium text-foreground">{modalSteps[modalSteps.length - 1].message}</p>
                <p className="text-sm text-muted-foreground">
                  We'll review your listing and reach out to <span className="text-violet-400 font-medium">{contact}</span> shortly.
                </p>
                <button onClick={() => navigate("/")}
                  className="mt-2 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to site
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── Render (exact structural replica) ───────────────────────────────────
  return (
    <div className="dark min-h-screen w-screen flex flex-col" style={{ background: "#0d0117" }}>
      <style>{`
        input[type="password"]::-ms-reveal,input[type="password"]::-ms-clear{display:none!important}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active{-webkit-box-shadow:0 0 0 30px transparent inset!important;-webkit-text-fill-color:var(--foreground)!important;background-color:transparent!important;background-clip:content-box!important;transition:background-color 5000s ease-in-out 0s!important;color:var(--foreground)!important;caret-color:var(--foreground)!important}
        input:autofill{background-color:transparent!important;background-clip:content-box!important;-webkit-text-fill-color:var(--foreground)!important;color:var(--foreground)!important}
        input:-internal-autofill-selected{background-color:transparent!important;background-image:none!important;color:var(--foreground)!important;-webkit-text-fill-color:var(--foreground)!important}
        input:-webkit-autofill::first-line{color:var(--foreground)!important;-webkit-text-fill-color:var(--foreground)!important}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @property --angle-1{syntax:"<angle>";inherits:false;initial-value:-75deg}
        @property --angle-2{syntax:"<angle>";inherits:false;initial-value:-45deg}
        .glass-button-wrap{--anim-time:400ms;--anim-ease:cubic-bezier(.25,1,.5,1);--border-width:clamp(1px,.0625em,4px);position:relative;z-index:2;transform-style:preserve-3d;transition:transform var(--anim-time) var(--anim-ease)}.glass-button-wrap:has(.glass-button:active){transform:rotateX(25deg)}.glass-button-shadow{--shadow-cutoff-fix:2em;position:absolute;width:calc(100% + var(--shadow-cutoff-fix));height:calc(100% + var(--shadow-cutoff-fix));top:calc(0% - var(--shadow-cutoff-fix)/2);left:calc(0% - var(--shadow-cutoff-fix)/2);filter:blur(clamp(2px,.125em,12px));transition:filter var(--anim-time) var(--anim-ease);pointer-events:none;z-index:0}.glass-button-shadow::after{content:"";position:absolute;inset:0;border-radius:9999px;background:linear-gradient(180deg,oklch(from var(--foreground) l c h/20%),oklch(from var(--foreground) l c h/10%));width:calc(100% - var(--shadow-cutoff-fix) - .25em);height:calc(100% - var(--shadow-cutoff-fix) - .25em);top:calc(var(--shadow-cutoff-fix) - .5em);left:calc(var(--shadow-cutoff-fix) - .875em);padding:.125em;box-sizing:border-box;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim-time) var(--anim-ease);opacity:1}.glass-button{-webkit-tap-highlight-color:transparent;backdrop-filter:blur(clamp(1px,.125em,4px));transition:all var(--anim-time) var(--anim-ease);background:linear-gradient(-75deg,oklch(from var(--background) l c h/5%),oklch(from var(--background) l c h/20%),oklch(from var(--background) l c h/5%));box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .25em .125em -.125em oklch(from var(--foreground) l c h/20%),0 0 .1em .25em inset oklch(from var(--background) l c h/20%),0 0 0 0 oklch(from var(--background) l c h)}.glass-button:hover{transform:scale(.975);backdrop-filter:blur(.01em);box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .15em .05em -.1em oklch(from var(--foreground) l c h/25%),0 0 .05em .1em inset oklch(from var(--background) l c h/50%),0 0 0 0 oklch(from var(--background) l c h)}.glass-button-text{color:oklch(from var(--foreground) l c h/90%);text-shadow:0em .25em .05em oklch(from var(--foreground) l c h/10%);transition:all var(--anim-time) var(--anim-ease)}.glass-button:hover .glass-button-text{text-shadow:.025em .025em .025em oklch(from var(--foreground) l c h/12%)}.glass-button-text::after{content:"";display:block;position:absolute;width:calc(100% - var(--border-width));height:calc(100% - var(--border-width));top:calc(0% + var(--border-width)/2);left:calc(0% + var(--border-width)/2);box-sizing:border-box;border-radius:9999px;overflow:clip;background:linear-gradient(var(--angle-2),transparent 0%,oklch(from var(--background) l c h/50%) 40% 50%,transparent 55%);z-index:3;mix-blend-mode:screen;pointer-events:none;background-size:200% 200%;background-position:0% 50%;transition:background-position calc(var(--anim-time)*1.25) var(--anim-ease),--angle-2 calc(var(--anim-time)*1.25) var(--anim-ease)}.glass-button:hover .glass-button-text::after{background-position:25% 50%}.glass-button:active .glass-button-text::after{background-position:50% 15%;--angle-2:-15deg}.glass-button::after{content:"";position:absolute;z-index:1;inset:0;border-radius:9999px;width:calc(100% + var(--border-width));height:calc(100% + var(--border-width));top:calc(0% - var(--border-width)/2);left:calc(0% - var(--border-width)/2);padding:var(--border-width);box-sizing:border-box;background:conic-gradient(from var(--angle-1) at 50% 50%,oklch(from var(--foreground) l c h/50%) 0%,transparent 5% 40%,oklch(from var(--foreground) l c h/50%) 50%,transparent 60% 95%,oklch(from var(--foreground) l c h/50%) 100%),linear-gradient(180deg,oklch(from var(--background) l c h/50%),oklch(from var(--background) l c h/50%));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim-time) var(--anim-ease),--angle-1 500ms ease;box-shadow:inset 0 0 0 calc(var(--border-width)/2) oklch(from var(--background) l c h/50%);pointer-events:none}.glass-button:hover::after{--angle-1:-125deg}.glass-button:active::after{--angle-1:-75deg}.glass-button-wrap:has(.glass-button:hover) .glass-button-shadow{filter:blur(clamp(2px,.0625em,6px))}.glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after{top:calc(var(--shadow-cutoff-fix) - .875em);opacity:1}.glass-button-wrap:has(.glass-button:active) .glass-button-shadow{filter:blur(clamp(2px,.125em,12px))}.glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after{top:calc(var(--shadow-cutoff-fix) - .5em);opacity:.75}.glass-button-wrap:has(.glass-button:active) .glass-button-text{text-shadow:.025em .25em .05em oklch(from var(--foreground) l c h/12%)}.glass-button-wrap:has(.glass-button:active) .glass-button{box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .125em .125em -.125em oklch(from var(--foreground) l c h/20%),0 0 .1em .25em inset oklch(from var(--background) l c h/20%),0 .225em .05em 0 oklch(from var(--foreground) l c h/5%),0 .25em 0 0 oklch(from var(--background) l c h/75%),inset 0 .25em .05em 0 oklch(from var(--foreground) l c h/15%)}@media(hover:none) and (pointer:coarse){.glass-button::after,.glass-button:hover::after,.glass-button:active::after{--angle-1:-75deg}.glass-button .glass-button-text::after,.glass-button:active .glass-button-text::after{--angle-2:-45deg}}
        .glass-input-wrap{position:relative;z-index:2;transform-style:preserve-3d;border-radius:9999px}.glass-input{display:flex;position:relative;width:100%;align-items:center;gap:.5rem;border-radius:9999px;padding:.25rem;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(clamp(1px,.125em,4px));transition:all 400ms cubic-bezier(.25,1,.5,1);background:linear-gradient(-75deg,oklch(from var(--background) l c h/5%),oklch(from var(--background) l c h/20%),oklch(from var(--background) l c h/5%));box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .25em .125em -.125em oklch(from var(--foreground) l c h/20%),0 0 .1em .25em inset oklch(from var(--background) l c h/20%),0 0 0 0 oklch(from var(--background) l c h)}.glass-input-wrap:focus-within .glass-input{backdrop-filter:blur(.01em);box-shadow:inset 0 .125em .125em oklch(from var(--foreground) l c h/5%),inset 0 -.125em .125em oklch(from var(--background) l c h/50%),0 .15em .05em -.1em oklch(from var(--foreground) l c h/25%),0 0 .05em .1em inset oklch(from var(--background) l c h/50%),0 0 0 0 oklch(from var(--background) l c h)}.glass-input::after{content:"";position:absolute;z-index:1;inset:0;border-radius:9999px;width:calc(100% + clamp(1px,.0625em,4px));height:calc(100% + clamp(1px,.0625em,4px));top:calc(0% - clamp(1px,.0625em,4px)/2);left:calc(0% - clamp(1px,.0625em,4px)/2);padding:clamp(1px,.0625em,4px);box-sizing:border-box;background:conic-gradient(from var(--angle-1) at 50% 50%,oklch(from var(--foreground) l c h/50%) 0%,transparent 5% 40%,oklch(from var(--foreground) l c h/50%) 50%,transparent 60% 95%,oklch(from var(--foreground) l c h/50%) 100%),linear-gradient(180deg,oklch(from var(--background) l c h/50%),oklch(from var(--background) l c h/50%));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all 400ms cubic-bezier(.25,1,.5,1),--angle-1 500ms ease;box-shadow:inset 0 0 0 calc(clamp(1px,.0625em,4px)/2) oklch(from var(--background) l c h/50%);pointer-events:none}.glass-input-wrap:focus-within .glass-input::after{--angle-1:-125deg}.glass-input-text-area{position:absolute;inset:0;border-radius:9999px;pointer-events:none}.glass-input-text-area::after{content:"";display:block;position:absolute;width:calc(100% - clamp(1px,.0625em,4px));height:calc(100% - clamp(1px,.0625em,4px));top:calc(0% + clamp(1px,.0625em,4px)/2);left:calc(0% + clamp(1px,.0625em,4px)/2);box-sizing:border-box;border-radius:9999px;overflow:clip;background:linear-gradient(var(--angle-2),transparent 0%,oklch(from var(--background) l c h/50%) 40% 50%,transparent 55%);z-index:3;mix-blend-mode:screen;pointer-events:none;background-size:200% 200%;background-position:0% 50%;transition:background-position calc(400ms*1.25) cubic-bezier(.25,1,.5,1),--angle-2 calc(400ms*1.25) cubic-bezier(.25,1,.5,1)}.glass-input-wrap:focus-within .glass-input-text-area::after{background-position:25% 50%}
      `}</style>

      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      {/* ── Top bar — exact replica position ── */}
      {/* ── Top bar ── */}
      <div className={cn("fixed top-4 left-4 z-20 flex items-center gap-2", "md:left-1/2 md:-translate-x-1/2")}>
        <h1 className="text-base font-bold text-foreground">3D Property Demo</h1>
      </div>

      {/* ── Back button top-left on mobile, doesn't conflict with centered logo ── */}
      <div className="fixed top-4 right-4 z-20">
        <button onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* ── Main area — exact replica structure ── */}
      <div className={cn("flex w-full flex-1 h-full items-center justify-center", "relative overflow-hidden")} style={{ background: "#0d0117" }}>
        <div className="absolute inset-0 z-0"><GradientBackground /></div>
        {/* Nebula shader — screen-blended on top of SVG gradient at low opacity */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ opacity: 0.45, mixBlendMode: "screen" }}>
          <InteractiveNebulaShader />
        </div>

        <fieldset disabled={modalStatus !== "closed"}
          className="relative z-10 flex flex-col items-center gap-8 w-[280px] mx-auto p-4">

          {/* ── Step headings — exact AnimatePresence/motion replica ── */}
          <AnimatePresence mode="wait">
            {authStep === "listing" && (
              <motion.div key="listing-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
                <BlurFade delay={0.25 * 1} className="w-full">
                  <div className="text-center">
                    <p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground whitespace-nowrap">
                      Claim your
                    </p>
                    <p className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground whitespace-nowrap">
                      free 3D demo
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 2}>
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    Paste your listing link below
                  </p>
                </BlurFade>
                <BlurFade delay={0.25 * 3} className="w-[300px]">
                  <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground/60">
                    <span>Airbnb</span><span>·</span><span>Rightmove</span><span>·</span><span>Zoopla</span><span>·</span><span>Any URL</span>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 4} className="w-[300px]">
                  <div className="flex items-center w-full gap-2 py-2">
                    <hr className="w-full border-border" />
                    <span className="text-xs font-semibold text-muted-foreground">OR</span>
                    <hr className="w-full border-border" />
                  </div>
                </BlurFade>
              </motion.div>
            )}
            {authStep === "contact" && (
              <motion.div key="contact-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                <BlurFade delay={0} className="w-full">
                  <div className="text-center">
                    <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground whitespace-nowrap">
                      How to reach you
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 1}>
                  <p className="text-sm font-medium text-muted-foreground">Your email or phone number.</p>
                </BlurFade>
              </motion.div>
            )}
            {authStep === "name" && (
              <motion.div key="name-title" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center text-center gap-4">
                <BlurFade delay={0} className="w-full">
                  <div className="text-center">
                    <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground whitespace-nowrap">
                      One Last Step
                    </p>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 1}>
                  <p className="text-sm font-medium text-muted-foreground">
                    Your name so we know who we're speaking to.
                  </p>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form inputs — exact structural replica ── */}
          <form onSubmit={handleFinalSubmit} className="w-[300px] space-y-6">
            <AnimatePresence>
              {authStep !== "name" && (
                <motion.div key="listing-contact-fields" exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeOut" }} className="w-full space-y-6">

                  {/* ── Listing URL field — only shown on the listing step ── */}
                  {authStep === "listing" && (
                  <BlurFade delay={0.25 * 5} inView className="w-full">
                    <div className="relative w-full">
                      <div className="glass-input-wrap w-full">
                        <div className="glass-input">
                          <span className="glass-input-text-area" />
                          <div className={cn(
                            "relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out",
                            listingUrl.length > 20 && authStep === "listing" ? "w-0 px-0" : "w-10 pl-2",
                          )}>
                            <Link className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                          </div>
                          <label htmlFor="demo-listing" className="sr-only">Property listing URL</label>
                          {/* Animated typewriter overlay — only visible when empty & unfocused */}
                          <div className="relative z-10 flex-grow min-w-0 flex items-center">
                            {listingUrl === "" && !listingFocused && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center pointer-events-none overflow-hidden whitespace-nowrap text-foreground/45 text-sm"
                              >
                                {typedPlaceholder}
                                <span className="ml-px animate-[blink_1s_step-end_infinite] text-foreground/60">|</span>
                              </span>
                            )}
                            <input id="demo-listing" type="url" placeholder=""
                              value={listingUrl}
                              onChange={(e) => setListingUrl(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onFocus={() => setListingFocused(true)}
                              onBlur={() => setListingFocused(false)}
                              className={cn(
                                "relative z-10 h-full w-full bg-transparent text-foreground focus:outline-none transition-[padding-right] duration-300 ease-in-out delay-300",
                                isListingValid && authStep === "listing" ? "pr-2" : "pr-0",
                              )}
                            />
                          </div>
                          <div className={cn(
                            "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                            isListingValid && authStep === "listing" ? "w-10 pr-1" : "w-0",
                          )}>
                            <GlassButton type="button" onClick={handleProgressStep} size="icon"
                              aria-label="Continue with listing URL" contentClassName="text-foreground/80 hover:text-foreground">
                              <ArrowRight className="w-5 h-5" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                      {/* Domain validation error */}
                      <AnimatePresence>
                        {listingSubmitAttempted && listingUrl.trim().length >= 5 && !isDomainOk && (
                          <motion.p
                            key="domain-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 px-4 text-xs text-red-400"
                          >
                            Please paste a link from a property listing site (e.g. Airbnb, Zillow, Rightmove).
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </BlurFade>
                  )}

                  {/* ── Contact field (mirrors password field exactly) ── */}
                  <AnimatePresence>
                    {authStep === "contact" && (
                      <BlurFade key="contact-field" className="w-full">
                        <div className="relative w-full">
                          <AnimatePresence>
                            {contact.length > 0 && (
                              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10">
                                <label className="text-xs text-muted-foreground font-semibold">Email or phone</label>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="glass-input-wrap w-full">
                            <div className="glass-input">
                              <span className="glass-input-text-area" />
                              <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                <Phone className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                              </div>
                              <label htmlFor="demo-contact" className="sr-only">Email or phone number</label>
                              <input id="demo-contact" ref={contactRef} type="text" placeholder="Email or phone number"
                                value={contact} onChange={(e) => setContact(e.target.value)} onKeyDown={handleKeyDown}
                                className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                              />
                              <div className={cn(
                                "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                                isContactValid ? "w-10 pr-1" : "w-0",
                              )}>
                                <GlassButton type="button" onClick={handleProgressStep} size="icon"
                                  aria-label="Continue with contact" contentClassName="text-foreground/80 hover:text-foreground">
                                  <ArrowRight className="w-5 h-5" />
                                </GlassButton>
                              </div>
                            </div>
                          </div>
                          <BlurFade inView delay={0.2}>
                            <button type="button" onClick={handleGoBack}
                              className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors">
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

            {/* ── Name / submit field (mirrors confirmPassword field exactly) ── */}
            <AnimatePresence>
              {authStep === "name" && (
                <BlurFade key="name-field" className="w-full">
                  <div className="relative w-full">
                    <AnimatePresence>
                      {name.length > 0 && (
                        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }} className="absolute -top-6 left-4 z-10">
                          <label className="text-xs text-muted-foreground font-semibold">Your name</label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="glass-input-wrap w-[300px]">
                      <div className="glass-input">
                        <span className="glass-input-text-area" />
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                          <User className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                        </div>
                        <label htmlFor="demo-name" className="sr-only">Your name</label>
                        <input id="demo-name" ref={nameRef} type="text" placeholder="Your name"
                          value={name} onChange={(e) => setName(e.target.value)}
                          className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                        />
                        <div className={cn(
                          "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                          isNameValid ? "w-10 pr-1" : "w-0",
                        )}>
                          <GlassButton type="submit" size="icon"
                            aria-label="Submit demo request" contentClassName="text-foreground/80 hover:text-foreground">
                            <ArrowRight className="w-5 h-5" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  <BlurFade inView delay={0.2}>
                    <button type="button" onClick={handleGoBack}
                      className="mt-4 flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                  </BlurFade>
                </BlurFade>
              )}
            </AnimatePresence>
          </form>
        </fieldset>
      </div>
    </div>
  );
}
