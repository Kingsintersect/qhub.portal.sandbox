"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlowingButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode
  /** Tailwind gradient string for the glowing aura (e.g., "from-red-500 via-rose-500 to-orange-500") */
  glowColor?: string
  variant?: "solid" | "outline" | "glass"
  size?: "sm" | "md" | "lg"
}

export const GlowingButton = React.forwardRef<
  HTMLButtonElement,
  GlowingButtonProps
>(
  (
    {
      children,
      className,
      glowColor = "from-red-500 via-rose-500 to-amber-500",
      variant = "solid",
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-5 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
    }

    return (
      <div className="group relative inline-flex items-center justify-center">
        {/* Ambient Blur Glow (Behind Button) */}
        {!disabled && (
          <div
            className={cn(
              "absolute -inset-0.5 rounded-[inherit] bg-gradient-to-r opacity-50 blur-md transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:blur-lg",
              glowColor
            )}
          />
        )}

        {/* Main Button Surface */}
        <motion.button
          ref={ref}
          disabled={disabled}
          whileTap={disabled ? undefined : { scale: 0.97 }}
          whileHover={disabled ? undefined : { scale: 1.01 }}
          className={cn(
            "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",

            // Solid Variant (Light & Dark)
            variant === "solid" &&
              "border border-slate-800 bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",

            // Outline Variant
            variant === "outline" &&
              "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",

            // Glassmorphism Variant
            variant === "glass" &&
              "border border-white/20 bg-white/80 text-slate-900 backdrop-blur-md hover:bg-white/90 dark:border-slate-800/60 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-950/90",

            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Internal Glow Overlay */}
          <span className="relative z-10 flex items-center justify-center gap-[inherit]">
            {children}
          </span>
        </motion.button>
      </div>
    )
  }
)

GlowingButton.displayName = "GlowingButton"
