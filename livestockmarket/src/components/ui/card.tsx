import { cn } from "@/lib/utils"
import React from "react"

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("bg-white shadow-md rounded-lg p-6", className)}>
      {children}
    </div>
  )
}

