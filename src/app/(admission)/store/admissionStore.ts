/* ------------------------------------------------------------------ */
/*  Admission Module — Zustand Store                                   */
/* ------------------------------------------------------------------ */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  AdmissionStudent,
  FeeSchedule,
  AdmissionStep,
} from "../types/admission"
import {
  getEnabledStepKeys,
  DEFAULT_ADMISSION_CONFIG,
} from "@/lib/admissionConfig"

interface AdmissionState {
  student: AdmissionStudent | null
  fees: FeeSchedule | null
  currentStep: AdmissionStep
  enabledStepKeys: Set<string>

  /* Actions */
  setStudent: (student: AdmissionStudent) => void
  setFees: (fees: FeeSchedule) => void
  setStepConfig: (enabledKeys: Set<string>) => void
  computeStep: () => void
  reset: () => void
}

/**
 * Derives the current step from the student's data and the admin-configured
 * set of enabled process steps (src/lib/admissionConfig.ts). Disabled,
 * non-required stages (e.g. Acceptance Fee) are treated as already satisfied.
 * This is the single source of truth for which section to display.
 */
function deriveStep(
  student: AdmissionStudent | null,
  enabledKeys: Set<string>
): AdmissionStep {
  if (!student) return 0 // APPLICATION_PAYMENT

  const isOn = (key: string) => enabledKeys.has(key)

  // Step 0 → Application payment not done (skippable if disabled)
  if (
    isOn("APPLICATION_PAYMENT") &&
    student.application_payment_status !== "paid"
  )
    return 0

  // Step 1 → Paid but has not applied yet (always required)
  if (!student.has_applied) return 1

  // Step 2 → Applied but admission not yet offered/accepted (always required)
  if (
    student.admission_status === "pending" ||
    student.admission_status === "rejected" ||
    student.admission_status === "declined" ||
    student.admission_status === "expired"
  )
    return 2

  // Step 3 → Admission offered or accepted, needs acceptance fee payment (skippable if disabled)
  if (isOn("ACCEPTANCE_FEE") && student.acceptance_payment_status !== "paid")
    return 3

  // Step 4 → Tuition not paid (skippable if disabled)
  if (isOn("TUITION_PAYMENT") && student.tuition_payment_status !== "paid")
    return 4

  // Step 5 → Everything done
  return 5
}

export const useAdmissionStore = create<AdmissionState>()(
  persist(
    (set, get) => ({
      student: null,
      fees: null,
      currentStep: 0,
      enabledStepKeys: getEnabledStepKeys(
        DEFAULT_ADMISSION_CONFIG.processSteps
      ),

      setStudent: (student) => {
        set({ student })
        // Recompute step whenever student data changes
        set({ currentStep: deriveStep(student, get().enabledStepKeys) })
      },

      setFees: (fees) => set({ fees }),

      setStepConfig: (enabledKeys) => {
        set({ enabledStepKeys: enabledKeys })
        set({ currentStep: deriveStep(get().student, enabledKeys) })
      },

      computeStep: () => {
        const { student, enabledStepKeys } = get()
        set({ currentStep: deriveStep(student, enabledStepKeys) })
      },

      reset: () =>
        set({
          student: null,
          fees: null,
          currentStep: 0,
        }),
    }),
    {
      name: "qhub-admission",
      partialize: (state) => ({
        student: state.student,
        fees: state.fees,
        currentStep: state.currentStep,
      }),
    }
  )
)
