"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import Modal from "@/components/custom/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  ADMISSION_STEP_ICON_NAMES,
  getStepIcon,
} from "@/lib/admissionStepIcons"
import type { AdmissionStepDefinition } from "@/types/admissionConfig"

const stepFormSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters").max(100),
  description: z.string().max(300).optional(),
  icon: z.string().min(1, "Pick an icon"),
  required: z.boolean(),
  enabled: z.boolean(),
})

export type StepFormValues = z.infer<typeof stepFormSchema>

interface StepFormModalProps {
  open: boolean
  onClose: () => void
  groupLabel: string
  editing: AdmissionStepDefinition | null
  onSubmit: (values: StepFormValues) => Promise<void> | void
  isSubmitting: boolean
}

function toDefaults(step: AdmissionStepDefinition | null): StepFormValues {
  return {
    label: step?.label ?? "",
    description: step?.description ?? "",
    icon: step?.icon ?? "ListChecks",
    required: step?.required ?? false,
    enabled: step?.enabled ?? true,
  }
}

export default function StepFormModal({
  open,
  onClose,
  groupLabel,
  editing,
  onSubmit,
  isSubmitting,
}: StepFormModalProps) {
  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: toDefaults(editing),
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(editing))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  const required = form.watch("required")

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(required ? { ...values, enabled: true } : values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Step" : `Add Step — ${groupLabel}`}
      subtitle={
        editing
          ? `Key: ${editing.key} (fixed)`
          : "Custom steps are saved and visible here, but only show on the live student pages once matching UI exists — see the workflow doc."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
            )}
            {editing ? "Save Changes" : "Create Step"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="step-label">Label</Label>
          <Input
            id="step-label"
            placeholder="e.g. Health Declaration"
            {...form.register("label")}
          />
          {form.formState.errors.label && (
            <p className="text-xs text-destructive">
              {form.formState.errors.label.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="step-description">Description</Label>
          <Textarea
            id="step-description"
            placeholder="Shown to the admin under the step title."
            rows={2}
            {...form.register("description")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Icon</Label>
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <div className="grid grid-cols-7 gap-2 rounded-xl border border-border p-2 sm:grid-cols-10">
                {ADMISSION_STEP_ICON_NAMES.map((name) => {
                  const Icon = getStepIcon(name)
                  const selected = field.value === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => field.onChange(name)}
                      title={name}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg border transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon size={15} />
                    </button>
                  )
                })}
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Required</p>
            <p className="text-xs text-muted-foreground">
              Applicants can&apos;t skip this step — forces it enabled.
            </p>
          </div>
          <Controller
            control={form.control}
            name="required"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Enabled</p>
            <p className="text-xs text-muted-foreground">
              {required
                ? "Locked on because this step is required."
                : "Whether applicants see this step right now."}
            </p>
          </div>
          <Controller
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <Switch
                checked={required ? true : field.value}
                disabled={required}
                onCheckedChange={field.onChange}
                className="data-checked:bg-success"
              />
            )}
          />
        </div>
      </div>
    </Modal>
  )
}
