import { cn } from "@/lib/utils"
import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outlined"; // Define variants
  size?: "sm" | "md" | "lg"; // Define sizes
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", className, ...props }, ref) => {
    const variantClass = variant === "outlined" ? "border border-purple-600 text-purple-600 bg-transparent" : "bg-purple-600 hover:bg-purple-700 text-white";
    const sizeClass = size === "sm" ? "px-3 py-2 text-sm" : size === "lg" ? "px-6 py-3 text-lg" : "px-4 py-2";

    return (
      <button
        className={cn(
          "font-medium rounded transition", 
          variantClass, 
          sizeClass, 
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"


