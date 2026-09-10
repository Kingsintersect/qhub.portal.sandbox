"use client"

import { FormProvider } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadProgress } from "@/components/upload-progress"
import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { useAdmissionForm } from "./hooks/useAdmissionForm"
import FormStepIndicator from "./components/FormStepIndicator"
import FormNavigation from "./components/FormNavigation"
import SuccessModal from "./components/SuccessModal"
import {
  PersonalInfoStep,
  SponsorInfoStep,
  NextOfKinStep,
  DocumentsStep,
  QualificationFieldsStep,
  ExamSittingStep,
  QualificationDocumentsStep,
  ProgramSelectionStep,
  ReviewStep,
} from "./components/steps"
import {
  FormStep,
  getFieldLabel,
  getStepForField,
  collectFormErrors,
} from "./types/form-types"

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

function FormLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-center gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="size-10 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}

function StepRenderer({
  step,
  activeSteps,
  completedSteps,
  onEditStep,
}: {
  step: FormStep
  activeSteps: FormStep[]
  completedSteps: Set<FormStep>
  onEditStep: (step: FormStep) => void
}) {
  switch (step) {
    case FormStep.PERSONAL_INFO:
      return <PersonalInfoStep />
    case FormStep.SPONSOR_INFO:
      return <SponsorInfoStep />
    case FormStep.NEXT_OF_KIN:
      return <NextOfKinStep />
    case FormStep.DOCUMENTS:
      return <DocumentsStep />
    case FormStep.QUALIFICATION_FIELDS:
      return <QualificationFieldsStep />
    case FormStep.EXAM_SITTING:
      return <ExamSittingStep />
    case FormStep.QUALIFICATION_DOCUMENTS:
      return <QualificationDocumentsStep />
    case FormStep.PROGRAM_SELECTION:
      return <ProgramSelectionStep />
    case FormStep.REVIEW:
      return (
        <ReviewStep
          activeSteps={activeSteps}
          completedSteps={completedSteps}
          onEditStep={onEditStep}
        />
      )
    default:
      return null
  }
}

export default function AdmissionApplicationFormPage() {
  const {
    form,
    currentStep,
    activeSteps,
    totalSteps,
    completedSteps,
    isLoading,
    isSubmitting,
    submitStage,
    submitPercent,
    isSubmitted,
    submitAttempted,
    goToStep,
    nextStep,
    prevStep,
    submitForm,
    saveProgress,
    resetForm,
    clearStep,
    direction,
  } = useAdmissionForm()

  const currentStepPosition = activeSteps.indexOf(currentStep)

  const submitErrors = submitAttempted
    ? collectFormErrors(form.formState.errors).map(
        ({ path, field, message }) => ({
          field: path,
          message,
          step: getStepForField(field),
          label: getFieldLabel(field),
        })
      )
    : []

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <FormLoadingSkeleton />
        </Card>
      </div>
    )
  }

  return (
    <PermissionGate
      require={{ resource: "my-application", action: "submit" }}
      denyBehavior="modal"
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admission Application Form
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete all steps below to submit your application. Your progress
            is automatically saved.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStepPosition + 1) / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
        <p className="mb-6 text-right text-xs text-muted-foreground">
          Step {currentStepPosition + 1} of {totalSteps}
        </p>

        {/* Step Indicator */}
        <FormStepIndicator
          currentStep={currentStep}
          activeSteps={activeSteps}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        {/* Form Content */}
        <FormProvider {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Card className="mt-6">
              <CardContent className="min-h-100 overflow-hidden p-6 sm:p-8">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <StepRenderer
                      step={currentStep}
                      activeSteps={activeSteps}
                      completedSteps={completedSteps}
                      onEditStep={goToStep}
                    />
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              {/* Submit error summary — every outstanding error, visible right above the footer */}
              {submitErrors.length > 0 && (
                <div className="px-6 sm:px-8">
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
                  >
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {submitErrors.length === 1
                        ? "Please fix 1 error before submitting:"
                        : `Please fix ${submitErrors.length} errors before submitting:`}
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      {submitErrors.map(({ field, message, step, label }) => (
                        <li key={field} className="text-sm text-destructive">
                          {step !== undefined ? (
                            <button
                              type="button"
                              onClick={() => goToStep(step)}
                              className="text-left underline-offset-2 hover:underline"
                            >
                              <span className="font-medium">{label}:</span>{" "}
                              {message}
                            </button>
                          ) : (
                            <>
                              <span className="font-medium">{label}:</span>{" "}
                              {message}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Submission progress — documents can be several MB on a slow
                  connection, so the transfer is reported rather than hidden
                  behind a spinner. */}
              {submitStage !== "idle" && (
                <div className="px-6 sm:px-8">
                  <UploadProgress
                    stage={submitStage}
                    percent={submitPercent}
                    message={
                      submitStage === "done"
                        ? "Application submitted successfully"
                        : submitStage === "error"
                          ? "We couldn't submit your application — please try again"
                          : undefined
                    }
                    className="mb-4"
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="px-6 pb-6 sm:px-8">
                <FormNavigation
                  currentStep={currentStep}
                  currentStepPosition={currentStepPosition}
                  totalSteps={totalSteps}
                  isSubmitting={isSubmitting}
                  onNext={nextStep}
                  onPrev={prevStep}
                  onSubmit={submitForm}
                  onSave={saveProgress}
                  onClearStep={() => clearStep(currentStep)}
                  onClearForm={resetForm}
                />
              </div>
            </Card>
          </form>
        </FormProvider>

        {/* Success Modal */}
        <SuccessModal isOpen={isSubmitted} />
      </div>
    </PermissionGate>
  )
}
