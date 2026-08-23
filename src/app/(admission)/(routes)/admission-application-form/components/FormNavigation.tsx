"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react"
import { FormStep } from "../types/form-types"

interface FormNavigationProps {
  currentStep: FormStep
  currentStepPosition: number
  totalSteps: number
  isSubmitting: boolean
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onSave: () => void
}

export default function FormNavigation({
  currentStep,
  currentStepPosition,
  totalSteps,
  isSubmitting,
  onNext,
  onPrev,
  onSubmit,
  onSave,
}: FormNavigationProps) {
  const isFirst = currentStep === FormStep.PERSONAL_INFO
  const isLast = currentStep === FormStep.REVIEW

  return (
    <motion.div
      className="flex items-center justify-between border-t pt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex gap-2">
        {!isFirst && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 size-4" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onSave}
          disabled={isSubmitting}
          className="text-muted-foreground"
        >
          <Save className="mr-2 size-4" />
          Save Draft
        </Button>

        {isLast ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-35"
          >
            {isSubmitting ? (
              <motion.div
                className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Submit Application
              </>
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* Progress text */}
      <span className="sr-only">
        Step {currentStepPosition + 1} of {totalSteps}
      </span>
    </motion.div>
  )
}
