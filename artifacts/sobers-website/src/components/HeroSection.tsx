import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { ActiveUsersWidget } from "@/components/ActiveUsersWidget"
import { ShinyButton } from "@/components/ui/ShinyButton"
import { LiquidButton } from "@/components/ui/button-1"
import { HeroSearchBar } from "@/components/ui/HeroSearchBar"
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery"
import img1 from "@assets/8B754FA9-B539-4EDE-A384-3B5B16B5EEFA_1_102_o_1782968356121.jpeg"
import img2 from "@assets/F71337D6-6D79-4E12-A266-5B02EDDCB6E7_1_102_o_1782968356123.jpeg"
import img3 from "@assets/DE8299A5-8F9C-4E2B-94C9-C0CD35770D9B_1_102_o_1782968356124.jpeg"
import img4 from "@assets/3483E819-621E-4386-B88F-8AB5DF60225B_1_102_o_1782968356124.jpeg"
import img5 from "@assets/BA8EA8ED-B6CF-425C-B3D6-C1602E194F69_1_102_o_1782968356125.jpeg"
import img6 from "@assets/BE49C9CB-A303-458C-A523-095C9267C7FA_1_102_o_1782968356125.jpeg"

const galleryItems: GalleryItem[] = [
  { image: img1, text: "Luxury Penthouse" },
  { image: img2, text: "Country Retreat" },
  { image: img3, text: "Modern Villa" },
  { image: img4, text: "City Residence" },
  { image: img5, text: "Grand Estate" },
  { image: img6, text: "Designer Apartment" },
]

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  onSearch?: (query: string) => void
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn("pointer-events-none absolute size-full overflow-hidden [perspective:200px]", `opacity-[var(--opacity)]`)}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium.",
      ctaText = "Browse courses",
      ctaHref = "#",
      onSearch,
      gridOptions,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Track global window scroll — bidirectional: gallery appears on scroll down, disappears on scroll back up
    const { scrollY } = useScroll()
    const galleryOpacity = useTransform(scrollY, [0, 120], [0, 1])
    const galleryY      = useTransform(scrollY, [0, 120], [50, 0])
    const galleryFilter = useTransform(scrollY, [0, 120], ["blur(20px)", "blur(0px)"])

    // Bg gradient fades out as you scroll
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end start"],
    })
    const bgOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
    const bgScale   = useTransform(scrollYProgress, [0, 0.45], [1, 1.06])

    return (
      <div className={cn("relative", className)} ref={(node) => {
        containerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }} {...props}>

        {/* ── Layer 0: CircularGallery — invisible at rest, reveals on scroll, fades when back at top ── */}
        <motion.div
          style={{ opacity: galleryOpacity, y: galleryY, filter: galleryFilter }}
          className="absolute inset-0 z-[0] pointer-events-none"
        >
          <CircularGallery items={galleryItems} bend={3} borderRadius={0.05} scrollEase={0.02} />
        </motion.div>

        {/* ── Layer 1: Radial gradient overlay ── */}
        <motion.div
          style={{ opacity: bgOpacity, scale: bgScale }}
          className="absolute top-0 z-[1] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none"
        />

        {/* ── Layer 2: All hero content ── */}
        <section className="relative max-w-full mx-auto z-[2]">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 pt-10 pb-14 md:pt-14 md:pb-28 gap-12 md:px-8">
            <div className="space-y-5 max-w-3xl mx-auto text-center">

              <div className="flex justify-center mb-12">
                <HeroSearchBar onSearch={onSearch} />
              </div>

              <div className="flex justify-center">
                <LiquidButton href="#">
                  {title}
                </LiquidButton>
              </div>

              <h2 className="text-3xl tracking-tighter mx-auto md:text-6xl text-white font-black">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
                  {subtitle.gradient}
                </span>
              </h2>

              <p className="max-w-2xl mx-auto text-gray-300">
                {description}
              </p>

              <div className="flex items-center justify-center pt-2">
                <ShinyButton href={ctaHref}>
                  {ctaText}
                </ShinyButton>
              </div>
            </div>

            <ActiveUsersWidget />
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
