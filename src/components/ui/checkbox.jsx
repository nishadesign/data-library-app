import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onChange, onCheckedChange, ...props }, ref) => {
  function handleClick(e) {
    e.stopPropagation()
    const next = !checked
    onCheckedChange?.(next)
    onChange?.(next)
  }

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={!!checked}
      onClick={handleClick}
      className={cn(
        "h-4 w-4 shrink-0 rounded-[3px] border cursor-pointer inline-flex items-center justify-center transition-colors",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background border-input hover:border-ring",
        className
      )}
      {...props}
    >
      {checked && <Check size={10} strokeWidth={3} />}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
