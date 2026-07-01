import type React from "react"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  as?: "button" | "a"
}

export function ShinyButton({
  children,
  onClick,
  href,
  className = "",
  as: Tag = href ? "a" : "button",
}: ShinyButtonProps) {
  const commonProps = {
    className: `shiny-cta ${className}`,
    onClick,
  }

  if (Tag === "a") {
    return (
      <a href={href} {...commonProps}>
        <span>{children}</span>
      </a>
    )
  }

  return (
    <button {...commonProps}>
      <span>{children}</span>
    </button>
  )
}
