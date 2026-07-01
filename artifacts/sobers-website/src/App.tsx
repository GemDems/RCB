import { HeroSection } from "@/components/HeroSection"
import { CinematicFooter } from "@/components/CinematicFooter"
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader"

export default function App() {
  return (
    <div className="relative w-full bg-background text-foreground overflow-x-hidden font-sans dark">
      <HeroSection
        title="Property Marketing Reimagined"
        subtitle={{
          regular: "Your property, ",
          gradient: "sold before they visit.",
        }}
        description="Hyper-realistic 3D walkthroughs and virtual tours that give buyers and guests the confidence to book — before ever stepping inside. Interactive digital twins, photorealistic renders, and marketing assets all from a single model."
        ctaText="Book a Free Demo"
        ctaHref="#"
        gridOptions={{
          angle: 65,
          opacity: 0.4,
          cellSize: 50,
          lightLineColor: "#4a4a4a",
          darkLineColor: "#2a2a2a",
        }}
      />

      {/* ── ROI Pull Quote ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-6xl text-purple-400/30 font-serif leading-none mb-6 select-none">"</div>
          <p className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            If it even gets you{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
              one extra booking
            </span>
            , it pays for itself{" "}
            <span className="relative inline-block">
              10x over.
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-purple-400 to-orange-300 rounded-full" />
            </span>
          </p>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-8">
            One night's revenue from a property typically covers the entire cost of a professional 3D tour — and that tour keeps working for you every single day it's live.
          </p>
          <div className="mt-10 flex justify-center">
            <a href="#" className="shiny-cta !py-3 !px-8 !text-base">
              <span>Book a Free Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Max Conversion to ∞ ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/6 blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* eyebrow */}
          {/* The loader — looping, property-conversion phases */}
          <ProgressiveFluxLoader
            duration={8}
            loop
            phases={[
              { at: 0,   label: "visitor lands" },
              { at: 18,  label: "exploring the space" },
              { at: 40,  label: "virtually touring" },
              { at: 65,  label: "enquiry sent" },
              { at: 82,  label: "offer submitted" },
              { at: 100, label: "deal closed ✓" },
            ]}
            gradient="linear-gradient(90deg, #1d6ffb 0%, color-mix(in oklab, #1d6ffb, #74e1ff) 35%, #74e1ff 55%, color-mix(in oklab, #74e1ff, #a78bfa) 78%, #a78bfa 100%)"
            textClassName="text-white/80"
            className="max-w-lg mx-auto"
          />

          {/* stat strip below the bar */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "3.4×", label: "more enquiries" },
              { value: "68%", label: "faster to offer" },
              { value: "∞", label: "conversion ceiling" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CinematicFooter />
    </div>
  )
}
