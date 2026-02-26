import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[72px] w-full rounded border border-input bg-background px-3 py-2.5 text-sm text-foreground font-sans",
        "placeholder:text-muted-foreground",
        "focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
