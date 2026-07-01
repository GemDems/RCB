import { CinematicFooter } from "@/components/CinematicFooter";

const features = [
  {
    icon: "🛡️",
    title: "Absolute Privacy",
    desc: "Your journey stays yours. End-to-end encrypted with zero data sharing.",
  },
  {
    icon: "📋",
    title: "12-Step Tracking",
    desc: "Work through every step at your own pace with guided check-ins and milestones.",
  },
  {
    icon: "🤝",
    title: "Sponsor Connection",
    desc: "Find and stay connected with your sponsor — always available when you need them.",
  },
  {
    icon: "📊",
    title: "Transparent Progress",
    desc: "Day counters, milestone badges, and streak charts that keep you motivated.",
  },
  {
    icon: "🔔",
    title: "Daily Reminders",
    desc: "Gentle, customizable nudges that keep your recovery on track every single day.",
  },
  {
    icon: "🌐",
    title: "Community Support",
    desc: "A safe, moderated space to share, listen, and grow alongside others.",
  },
];

const stats = [
  { value: "50K+", label: "Active Members" },
  { value: "98%", label: "Reporting Progress" },
  { value: "4.9★", label: "App Store Rating" },
  { value: "2M+", label: "Days Counted" },
];

export default function App() {
  return (
    <div className="relative w-full bg-background text-foreground overflow-x-hidden font-sans">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-foreground">SOBERS</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Impact</a>
            <a href="#download" className="hover:text-foreground transition-colors">Download</a>
          </div>
          <a
            href="#download"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Get the App
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-secondary/10 blur-[100px]" />
        </div>
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundSize: "50px 50px",
            backgroundImage:
              "linear-gradient(to right,hsl(var(--border)) 1px,transparent 1px),linear-gradient(to bottom,hsl(var(--border)) 1px,transparent 1px)",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Recovery Redefined
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-8">
            <span
              style={{
                background: "linear-gradient(180deg, hsl(var(--foreground)) 0%, color-mix(in oklch, hsl(var(--foreground)) 40%, transparent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0px 0px 30px color-mix(in oklch, hsl(var(--primary)) 30%, transparent))",
              }}
            >
              Stay Sober.
            </span>
            <br />
            <span className="text-muted-foreground/40">Stay Strong.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            A private, elegant companion for your recovery journey — tracking your 12 steps,
            connecting you with your sponsor, and celebrating every single day.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#download"
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Download Free
            </a>
            <a
              href="#features"
              className="px-8 py-4 rounded-full border border-border text-foreground font-bold text-base hover:bg-muted/30 transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-24 px-6 border-y border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-foreground mb-2">{s.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              Built for your journey
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every feature was designed with one goal: to keep you accountable, supported, and moving forward.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur hover:border-primary/40 hover:bg-card/60 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-24 px-6 border-y border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-6xl text-primary/30 font-serif leading-none mb-6">"</div>
          <blockquote className="text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-8">
            Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.
          </blockquote>
          <cite className="text-sm text-muted-foreground font-semibold tracking-wider uppercase not-italic">
            — Anonymous
          </cite>
        </div>
      </section>

      {/* ── DOWNLOAD SECTION ── */}
      <section id="download" className="min-h-[60vh] flex items-center justify-center py-32 px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Start today.
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Free forever. No subscriptions. No ads. Just your recovery.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.87.67 3.55 1.76-3.13 1.77-2.62 5.92.35 7.14-.65 1.58-1.57 3.1-2.57 4.03zm-3.21-14.7c-.55 1.4-1.89 2.37-3.25 2.28.09-1.5 1.05-2.82 2.38-3.4 1.25-.57 2.66-.41 3.25.04-.15.35-.26.72-.38 1.08z" />
              </svg>
              App Store
            </a>
            <a href="#" className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-border bg-card/30 text-foreground font-bold hover:border-primary/40 hover:bg-card/60 transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0222 3.503C15.5902 8.242 13.8533 7.85 12 7.85c-1.8533 0-3.5902.392-5.1369 1.1004L4.841 5.4475a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3436-4.1021-2.6893-7.5743-6.1185-9.4396" />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </section>

      {/* ── CINEMATIC FOOTER ── */}
      <CinematicFooter />
    </div>
  );
}
