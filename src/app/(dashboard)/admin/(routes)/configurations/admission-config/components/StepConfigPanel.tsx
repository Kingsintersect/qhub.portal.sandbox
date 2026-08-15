"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { AdmissionStepToggle } from "@/types/admissionConfig"

interface StepConfigPanelProps {
  title: string
  description: string
  icon: LucideIcon
  items: AdmissionStepToggle[]
  icons: Record<string, LucideIcon>
  onToggle: (key: string, next: boolean) => void
  disabled?: boolean
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export default function StepConfigPanel({
  title,
  description,
  icon: HeaderIcon,
  items,
  icons,
  onToggle,
  disabled,
}: StepConfigPanelProps) {
  const enabledCount = items.filter((s) => s.enabled || s.required).length

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <HeaderIcon size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-success/30 text-success">
          {enabledCount}/{items.length} on
        </Badge>
      </div>

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="divide-y divide-border"
      >
        {items.map((step) => {
          const Icon = icons[step.key]
          const isOn = step.enabled || step.required

          return (
            <motion.li
              key={step.key}
              variants={rowVariants}
              className={cn(
                "flex items-start gap-3 px-5 py-4 transition-colors",
                isOn ? "bg-success/[0.03]" : "bg-transparent"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isOn
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {Icon && <Icon size={15} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {step.label}
                  </p>
                  {step.required && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <Lock size={10} data-icon="inline-start" />
                      Required
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <Switch
                checked={isOn}
                disabled={step.required || disabled}
                onCheckedChange={(checked) => onToggle(step.key, checked)}
                className="mt-1 shrink-0 data-checked:bg-success"
                aria-label={`Toggle ${step.label}`}
              />
            </motion.li>
          )
        })}
      </motion.ul>
    </div>
  )
}
