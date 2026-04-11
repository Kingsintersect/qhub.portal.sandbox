import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // keep these: relative/isolate are required for ::before glow
  "group/button relative isolate inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  glow = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    glow?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const shouldGlow = glow && (variant === "default" || variant === "outline")

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-glow={shouldGlow ? "true" : "false"}
      className={cn(buttonVariants({ variant, size }), shouldGlow && "btn-glow", className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }


// GLOWING EFFECT BUTTONs
type ButtonVariant = 'solid' | 'outline' | 'ghost';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const GlowingButton = ({ variant = 'solid', children, className = '', ...props }: GlowingButtonProps) => {

  // Base styles for all variants
  const baseStyles = "relative px-8 py-3 font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 hover:scale-105 active:scale-95 group";

  // Variant mapping (Switched to Orange 500/600 and updated RGBA shadows)
  const variants: Record<ButtonVariant, string> = {
    solid: "bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.7)] hover:bg-orange-500",
    outline: "border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white shadow-[0_0_10px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    ghost: "text-orange-600 hover:bg-orange-50/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Dynamic Glow Layer - uses orange-400 for the blur effect */}
      <span className={`absolute inset-0 rounded-full bg-orange-400 blur-lg opacity-0 transition-opacity duration-300 
        ${variant === 'solid' ? 'group-hover:opacity-40' : 'group-hover:opacity-20'}`}>
      </span>

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default GlowingButton;















// import * as React from "react"
// import { cva, type VariantProps } from "class-variance-authority"
// import { Slot } from "radix-ui"

// import { cn } from "@/lib/utils"

// const buttonVariants = cva(
//   "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/80",
//         outline:
//           "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
//         ghost:
//           "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
//         destructive:
//           "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default:
//           "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
//         xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
//         sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
//         lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
//         icon: "size-9",
//         "icon-xs":
//           "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
//         "icon-sm":
//           "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
//         "icon-lg": "size-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// )

// function Button({
//   className,
//   variant = "default",
//   size = "default",
//   asChild = false,
//   ...props
// }: React.ComponentProps<"button"> &
//   VariantProps<typeof buttonVariants> & {
//     asChild?: boolean
//   }) {
//   const Comp = asChild ? Slot.Root : "button"

//   return (
//     <Comp
//       data-slot="button"
//       data-variant={variant}
//       data-size={size}
//       className={cn(buttonVariants({ variant, size, className }))}
//       {...props}
//     />
//   )
// }

// export { Button, buttonVariants }
