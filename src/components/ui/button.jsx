import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        brand:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active rounded-full",
        neutral:
          "bg-background text-foreground border border-input hover:bg-secondary rounded-full",
        outlineBrand:
          "bg-background text-primary border border-input hover:bg-secondary rounded-full",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        icon:
          "bg-transparent text-muted-foreground border border-input hover:bg-secondary rounded-full",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-background text-destructive border border-destructive hover:bg-destructive/5 rounded-full",
      },
      size: {
        default: "h-8 px-4",
        sm: "h-7 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
