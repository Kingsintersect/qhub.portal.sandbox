import type {
  AdmissionConfig,
  AdmissionStepToggle,
} from "@/types/admissionConfig"

/* ------------------------------------------------------------------ */
/*  Defaults — mirrors the current hardcoded step lists:               */
/*  AdmissionStep enum (process) + FormStep enum (application form)    */
/* ------------------------------------------------------------------ */

export const DEFAULT_ADMISSION_CONFIG: AdmissionConfig = {
  processSteps: [
    {
      key: "APPLICATION_PAYMENT",
      label: "Application Fee",
      description:
        "Applicant pays the non-refundable application processing fee before the form unlocks.",
      enabled: true,
      required: false,
    },
    {
      key: "APPLICATION_FORM",
      label: "Application Form",
      description:
        "Applicant completes the multi-step admission application form.",
      enabled: true,
      required: true,
    },
    {
      key: "ADMISSION_STATUS",
      label: "Admission Status",
      description:
        "Applicant waits for and views the admission office's review decision.",
      enabled: true,
      required: true,
    },
    {
      key: "ACCEPTANCE_FEE",
      label: "Acceptance Fee",
      description:
        "Admitted applicant pays the acceptance fee to confirm their offer.",
      enabled: true,
      required: false,
    },
    {
      key: "TUITION_PAYMENT",
      label: "Tuition Payment",
      description:
        "Applicant pays tuition (installments supported) to complete enrollment.",
      enabled: true,
      required: false,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      description:
        "Enrollment is complete and the student record has been created.",
      enabled: true,
      required: true,
    },
  ],
  formSteps: [
    {
      key: "PERSONAL_INFO",
      label: "Personal Information",
      description: "Basic details about the applicant.",
      enabled: true,
      required: true,
    },
    {
      key: "SPONSOR_INFO",
      label: "Sponsor Information",
      description: "Details about the applicant's sponsor, if any.",
      enabled: true,
      required: false,
    },
    {
      key: "NEXT_OF_KIN",
      label: "Next of Kin",
      description: "Emergency contact details.",
      enabled: true,
      required: true,
    },
    {
      key: "DOCUMENTS",
      label: "Documents",
      description:
        "Upload passport, first school leaving certificate, O-Level certificate.",
      enabled: true,
      required: true,
    },
    {
      key: "QUALIFICATION_FIELDS",
      label: "Qualification Information",
      description: "The applicant's academic qualification details.",
      enabled: true,
      required: true,
    },
    {
      key: "EXAM_SITTING",
      label: "Exam Sitting",
      description: "O-Level examination sitting details.",
      enabled: true,
      required: false,
    },
    {
      key: "QUALIFICATION_DOCUMENTS",
      label: "Qualification Documents",
      description: "Upload academic qualification / exam result documents.",
      enabled: true,
      required: false,
    },
    {
      key: "PROGRAM_SELECTION",
      label: "Program Selection",
      description:
        "Applicant chooses their desired program, start term, and study mode.",
      enabled: true,
      required: true,
    },
    {
      key: "REVIEW",
      label: "Review & Submit",
      description:
        "Applicant reviews all entered information before submitting.",
      enabled: true,
      required: true,
    },
  ],
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function mergeToggleList(
  defaults: AdmissionStepToggle[],
  saved: AdmissionStepToggle[] | undefined
): AdmissionStepToggle[] {
  if (!saved || saved.length === 0) return defaults
  const savedByKey = new Map(saved.map((s) => [s.key, s]))
  // Preserve default order/labels/required flags (source of truth), only carry over `enabled`.
  return defaults.map((def) => {
    const match = savedByKey.get(def.key)
    return match
      ? { ...def, enabled: def.required ? true : match.enabled }
      : def
  })
}

/** Merges a saved config (possibly stale/partial — e.g. missing a newly added step) onto the current defaults. */
export function mergeAdmissionConfig(
  saved: Partial<AdmissionConfig> | null | undefined
): AdmissionConfig {
  if (!saved) return DEFAULT_ADMISSION_CONFIG
  return {
    processSteps: mergeToggleList(
      DEFAULT_ADMISSION_CONFIG.processSteps,
      saved.processSteps
    ),
    formSteps: mergeToggleList(
      DEFAULT_ADMISSION_CONFIG.formSteps,
      saved.formSteps
    ),
  }
}

export function getEnabledStepKeys(steps: AdmissionStepToggle[]): Set<string> {
  return new Set(steps.filter((s) => s.enabled || s.required).map((s) => s.key))
}
