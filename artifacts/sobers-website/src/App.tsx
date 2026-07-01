import { HeroSection } from "@/components/HeroSection"
import { CinematicFooter } from "@/components/CinematicFooter"

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

      <CinematicFooter />
    </div>
  )
}
