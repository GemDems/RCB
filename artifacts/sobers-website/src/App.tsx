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
      <CinematicFooter />
    </div>
  )
}
