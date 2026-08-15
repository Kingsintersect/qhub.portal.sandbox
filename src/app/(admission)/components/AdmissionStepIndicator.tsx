"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  FileText,
  Search,
  BadgeCheck,
  GraduationCap,
  PartyPopper,
} from "lucide-react"
import { AdmissionStep } from "../types/admission"

const STEPS = [
  {
    step: AdmissionStep.APPLICATION_PAYMENT,
    key: "APPLICATION_PAYMENT",
    label: "Application Fee",
    icon: CreditCard,
  },
  {
    step: AdmissionStep.APPLICATION_FORM,
    key: "APPLICATION_FORM",
    label: "Application Form",
    icon: FileText,
  },
  {
    step: AdmissionStep.ADMISSION_STATUS,
    key: "ADMISSION_STATUS",
    label: "Admission Status",
    icon: Search,
  },
  {
    step: AdmissionStep.ACCEPTANCE_FEE,
    key: "ACCEPTANCE_FEE",
    label: "Acceptance Fee",
    icon: BadgeCheck,
  },
  {
    step: AdmissionStep.TUITION_PAYMENT,
    key: "TUITION_PAYMENT",
    label: "Tuition Fee",
    icon: GraduationCap,
  },
  {
    step: AdmissionStep.COMPLETED,
    key: "COMPLETED",
    label: "Completed",
    icon: PartyPopper,
  },
] as const

interface AdmissionStepIndicatorProps {
  currentStep: AdmissionStep
  enabledStepKeys: Set<string>
}

export function AdmissionStepIndicator({
  currentStep,
  enabledStepKeys,
}: AdmissionStepIndicatorProps) {
  const steps = STEPS.filter((s) => enabledStepKeys.has(s.key))

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex min-w-[600px] items-center justify-between gap-1 px-2">
        {steps.map((step, idx) => {
          const isCompleted = step.step < currentStep
          const isActive = step.step === currentStep
          const Icon = step.icon

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isCompleted
                      ? "var(--color-primary)"
                      : isActive
                        ? "var(--color-primary)"
                        : "var(--color-muted)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full transition-shadow",
                    isActive && "shadow-lg shadow-primary/30",
                    isCompleted && "shadow-md shadow-primary/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      isCompleted || isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  />

                  {/* Pulse ring for active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "max-w-[80px] text-center text-[10px] leading-tight font-medium",
                    isCompleted
                      ? "text-primary"
                      : isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="relative mx-1 h-[2px] flex-1">
                  <div className="absolute inset-0 rounded-full bg-muted" />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
