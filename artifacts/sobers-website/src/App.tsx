import { HeroSection } from "@/components/HeroSection"
import { CinematicFooter } from "@/components/CinematicFooter"

export default function App() {
  return (
    <div className="relative w-full bg-background text-foreground overflow-x-hidden font-sans dark">
      <HeroSection
        title="Recovery Redefined"
        subtitle={{
          regular: "Stay accountable, stay connected, ",
          gradient: "stay sober.",
        }}
        description="A private, elegant companion for your recovery journey — tracking your 12 steps, connecting you with your sponsor, and celebrating every single day."
        ctaText="Download Free"
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
