// ──────────────────────────────────────────────
// Admission Process / Application Form — Step Registry
// Controls which steps students see in:
//   - src/app/(admission)/(routes)/process-admission/page.tsx
//   - src/app/(admission)/(routes)/admission-application-form/page.tsx
// Full CRUD — see src/services/admissionStepsApi.ts (dummy-backed today,
// real endpoints documented in sandbox/admission/admission_features_workflow.md).
// ──────────────────────────────────────────────

export type AdmissionStepGroup = "PROCESS" | "FORM"

export interface AdmissionStepDefinition {
  id: number
  group: AdmissionStepGroup
  key: string
  label: string
  description: string
  /** Lucide icon name — see src/lib/admissionStepIcons.ts for the picker/lookup list. */
  icon: string
  enabled: boolean
  /** Non-negotiable step — cannot be disabled or deleted (switch/delete render locked). */
  required: boolean
  /** Display/navigation order within its group, ascending. */
  order: number
}

/** @deprecated kept as an alias while older code migrates — same shape as AdmissionStepDefinition. */
export type AdmissionStepToggle = AdmissionStepDefinition

export interface AdmissionConfig {
  processSteps: AdmissionStepDefinition[]
  formSteps: AdmissionStepDefinition[]
}

export interface CreateAdmissionStepPayload {
  group: AdmissionStepGroup
  key: string
  label: string
  description: string
  icon: string
  required: boolean
  enabled: boolean
}

export type UpdateAdmissionStepPayload = Partial<
  Omit<CreateAdmissionStepPayload, "group">
> & { order?: number }
