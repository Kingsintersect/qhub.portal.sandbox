// ──────────────────────────────────────────────
// Admission Process / Application Form — Step Configuration
// Controls which steps students see in:
//   - src/app/(admission)/(routes)/process-admission/page.tsx
//   - src/app/(admission)/(routes)/admission-application-form/page.tsx
// ──────────────────────────────────────────────

export interface AdmissionStepToggle {
  key: string
  label: string
  description: string
  enabled: boolean
  /** Non-negotiable step — the admin cannot disable it (switch renders locked). */
  required: boolean
}

export interface AdmissionConfig {
  processSteps: AdmissionStepToggle[]
  formSteps: AdmissionStepToggle[]
}
