import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronDown, Database, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const retrieverPillVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-normal",
  {
    variants: {
      variant: {
        default:
          "bg-secondary border border-border text-foreground pl-1 pr-1.5 py-0.5",
        placeholder:
          "border border-dashed border-input text-muted-foreground pl-1 pr-1.5 py-0.5 cursor-pointer hover:border-primary hover:bg-primary/5 active:scale-[0.96]",
        indexing:
          "bg-secondary border border-primary/50 text-muted-foreground pl-1 pr-1.5 py-0.5 relative overflow-hidden",
        ready:
          "bg-[var(--status-ready-bg)] border border-[var(--status-ready-text)]/30 text-[var(--status-ready-text)] pl-1 pr-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function RetrieverPill({
  className,
  variant = "default",
  label,
  icon: IconProp,
  showChevron = true,
  onClick,
  ...props
}) {
  const Icon = IconProp || (variant === "ready" ? Database : FileText)

  return (
    <span
      className={cn(retrieverPillVariants({ variant }), className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      style={{
        transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease, border-color 200ms ease',
      }}
      {...props}
    >
      {variant === "indexing" && (
        <span 
          className="absolute inset-0 bg-[length:200%_100%] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, color-mix(in oklch, var(--primary) 15%, transparent) 50%, transparent 100%)'
          }}
        />
      )}
      <span className="relative flex items-center justify-center w-3.5 h-3.5 shrink-0">
        {variant === "indexing" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        ) : (
          <Icon className="w-3.5 h-3.5" />
        )}
      </span>
      <span className="relative leading-[17px] whitespace-nowrap">{label}</span>
      {showChevron && variant !== "indexing" && (
        <ChevronDown className="relative w-3 h-3 opacity-60 shrink-0" />
      )}
    </span>
  )
}

export { RetrieverPill, retrieverPillVariants }
