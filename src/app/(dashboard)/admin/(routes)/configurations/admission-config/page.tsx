"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Loader2,
  RotateCcw,
  Save,
  CheckCircle2,
  CreditCard,
  FileText,
  Search,
  BadgeCheck,
  GraduationCap,
  PartyPopper,
  User,
  Heart,
  Users,
  BookOpen,
  FolderOpen,
  Settings as SettingsIcon,
  ListChecks,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/EmptyState"
import {
  admissionConfigQueryOptions,
  admissionConfigMutationOptions,
} from "@/services/admissionConfigApi"
import { DEFAULT_ADMISSION_CONFIG } from "@/lib/admissionConfig"
import type { AdmissionConfig } from "@/types/admissionConfig"
import StepConfigPanel from "./components/StepConfigPanel"

const PROCESS_ICONS: Record<string, typeof CreditCard> = {
  APPLICATION_PAYMENT: CreditCard,
  APPLICATION_FORM: FileText,
  ADMISSION_STATUS: Search,
  ACCEPTANCE_FEE: BadgeCheck,
  TUITION_PAYMENT: GraduationCap,
  COMPLETED: PartyPopper,
}

const FORM_ICONS: Record<string, typeof User> = {
  PERSONAL_INFO: User,
  SPONSOR_INFO: Heart,
  NEXT_OF_KIN: Users,
  DOCUMENTS: FileText,
  QUALIFICATION_FIELDS: GraduationCap,
  EXAM_SITTING: BookOpen,
  QUALIFICATION_DOCUMENTS: FolderOpen,
  PROGRAM_SELECTION: SettingsIcon,
  REVIEW: CheckCircle2,
}

export default function AdmissionConfigPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery(
    admissionConfigQueryOptions.get()
  )
  const saveMutation = useMutation(admissionConfigMutationOptions.save())

  const [draft, setDraft] = useState<AdmissionConfig | null>(null)
  // Reset the editable draft whenever the server config (re)loads — computed
  // during render (React's recommended pattern) rather than in a useEffect.
  const [syncedFrom, setSyncedFrom] = useState<AdmissionConfig | undefined>(
    undefined
  )
  if (data && data !== syncedFrom) {
    setSyncedFrom(data)
    setDraft(data)
  }

  const isDirty =
    !!data && !!draft && JSON.stringify(data) !== JSON.stringify(draft)

  const toggleStep = (
    group: "processSteps" | "formSteps",
    key: string,
    next: boolean
  ) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [group]: prev[group].map((s) =>
          s.key === key ? { ...s, enabled: next } : s
        ),
      }
    })
  }

  const handleReset = () => setDraft(data ?? DEFAULT_ADMISSION_CONFIG)

  const handleSave = async () => {
    if (!draft) return
    try {
      const saved = await saveMutation.mutateAsync(draft)
      queryClient.setQueryData(
        admissionConfigQueryOptions.get().queryKey,
        saved
      )
      toast.success("Admission configuration saved", {
        description: "Students will see the updated steps immediately.",
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save configuration"
      )
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError || !draft) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          icon={Sparkles}
          title="Couldn't load admission configuration"
          description={
            error?.message ?? "Something went wrong. Please try again."
          }
        />
      </div>
    )
  }

  const enabledProcess = draft.processSteps.filter(
    (s) => s.enabled || s.required
  )
  const enabledForm = draft.formSteps.filter((s) => s.enabled || s.required)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admission Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Turn admission process stages and application form steps on or off
              for every applicant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isDirty && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-xs font-medium text-amber-600 dark:text-amber-400"
              >
                Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || saveMutation.isPending}
          >
            <RotateCcw className="size-3.5" data-icon="inline-start" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2
                className="size-3.5 animate-spin"
                data-icon="inline-start"
              />
            ) : (
              <Save className="size-3.5" data-icon="inline-start" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Live preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="size-4 text-primary" />
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Live preview — what applicants will see
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout">
            {enabledProcess.map((step, idx) => (
              <motion.div
                key={step.key}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1.5 rounded-full border border-success/30 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-success text-[10px] text-success-foreground">
                  {idx + 1}
                </span>
                {step.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {enabledForm.length} of {draft.formSteps.length} application form
          steps enabled.
        </p>
      </motion.div>

      {/* Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StepConfigPanel
            title="Admission Process Steps"
            description="The end-to-end journey shown on the student's admission dashboard."
            icon={GraduationCap}
            items={draft.processSteps}
            icons={PROCESS_ICONS}
            onToggle={(key, next) => toggleStep("processSteps", key, next)}
            disabled={saveMutation.isPending}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StepConfigPanel
            title="Application Form Steps"
            description="Steps inside the 8-step admission application form."
            icon={FileText}
            items={draft.formSteps}
            icons={FORM_ICONS}
            onToggle={(key, next) => toggleStep("formSteps", key, next)}
            disabled={saveMutation.isPending}
          />
        </motion.div>
      </div>
    </div>
  )
}
