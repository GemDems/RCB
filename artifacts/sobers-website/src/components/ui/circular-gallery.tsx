import { cn } from "@/lib/utils"

export interface GalleryItem {
  image: string
  text: string
}

interface CircularGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: GalleryItem[]
  bend?: number
  borderRadius?: number
  scrollSpeed?: number
  scrollEase?: number
  fontClassName?: string
}

const rowOne: GalleryItem[] = [
  { image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop", text: "Modern Villa" },
  { image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop", text: "Luxury Home" },
  { image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop", text: "Beach House" },
  { image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop", text: "Country Estate" },
  { image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=900&auto=format&fit=crop", text: "Penthouse" },
  { image: "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=900&auto=format&fit=crop", text: "City Loft" },
  { image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop", text: "Contemporary" },
  { image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop", text: "Seaside Villa" },
]

const rowTwo: GalleryItem[] = [
  { image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&auto=format&fit=crop", text: "Garden Home" },
  { image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop", text: "Family House" },
  { image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=900&auto=format&fit=crop", text: "Coastal Retreat" },
  { image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop", text: "Suburban Home" },
  { image: "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=900&auto=format&fit=crop", text: "Modern Apartment" },
  { image: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=900&auto=format&fit=crop", text: "Lake House" },
  { image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&auto=format&fit=crop", text: "Townhouse" },
  { image: "https://images.unsplash.com/photo-1559767949-0faa5c7e9992?w=900&auto=format&fit=crop", text: "Eco Villa" },
]

const marqueeStyles = `
  @keyframes marquee-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marquee-right {
    0%   { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .gallery-row-left  { animation: marquee-left  32s linear infinite; }
  .gallery-row-right { animation: marquee-right 26s linear infinite; }
`

function GalleryRow({
  items,
  direction,
}: {
  items: GalleryItem[]
  direction: "left" | "right"
}) {
  const looped = [...items, ...items]

  return (
    <div className="overflow-hidden w-full">
      <div
        className={direction === "left" ? "gallery-row-left" : "gallery-row-right"}
        style={{
          display: "flex",
          gap: "16px",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {looped.map((item, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: "340px",
              height: "220px",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src={item.image}
              alt={item.text}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: "12px",
                left: "16px",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const CircularGallery = ({
  items,
  className,
  // consumed but not forwarded to DOM
  bend: _bend,
  borderRadius: _borderRadius,
  scrollSpeed: _scrollSpeed,
  scrollEase: _scrollEase,
  fontClassName: _fontClassName,
  ...props
}: CircularGalleryProps) => {
  const galleryItems = items && items.length > 0 ? items : rowOne

  return (
    <div
      className={cn("w-full h-full flex flex-col justify-center gap-5 py-6 overflow-hidden relative", className)}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: marqueeStyles }} />

      {/* Side fade masks */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background:
            "linear-gradient(to right, #000 0%, transparent 14%, transparent 86%, #000 100%)",
        }}
      />

      <GalleryRow items={galleryItems} direction="left" />
      <GalleryRow items={rowTwo} direction="right" />
    </div>
  )
}

export { CircularGallery }
