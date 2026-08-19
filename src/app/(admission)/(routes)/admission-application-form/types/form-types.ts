import type { z } from "zod"
import {
  User,
  Heart,
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Settings,
  CheckCircle,
} from "lucide-react"
import type { ElementType } from "react"
import type {
  personalInfoSchema,
  sponsorInfoSchema,
  nextOfKinSchema,
  documentsSchema,
  qualificationFieldsSchema,
  examSittingSchema,
  qualificationDocumentsSchema,
  programSelectionSchema,
} from "../schema/admission-schema"

// ─── Step Enum ───────────────────────────────────────────────────────────────
export enum FormStep {
  PERSONAL_INFO = 0,
  SPONSOR_INFO = 1,
  NEXT_OF_KIN = 2,
  DOCUMENTS = 3,
  QUALIFICATION_FIELDS = 4,
  EXAM_SITTING = 5,
  QUALIFICATION_DOCUMENTS = 6,
  PROGRAM_SELECTION = 7,
  REVIEW = 8,
}

// ─── Step Configuration ──────────────────────────────────────────────────────
export interface StepConfig {
  id: FormStep
  title: string
  description: string
  icon: ElementType
  isOptional?: boolean
}

export const FORM_STEPS: StepConfig[] = [
  {
    id: FormStep.PERSONAL_INFO,
    title: "Personal Information",
    description: "Basic details about yourself",
    icon: User,
  },
  {
    id: FormStep.SPONSOR_INFO,
    title: "Sponsor Information",
    description: "Details about your sponsor (if applicable)",
    icon: Heart,
    isOptional: true,
  },
  {
    id: FormStep.NEXT_OF_KIN,
    title: "Next of Kin",
    description: "Emergency contact details",
    icon: Users,
  },
  {
    id: FormStep.DOCUMENTS,
    title: "Documents",
    description: "Upload required documents",
    icon: FileText,
  },
  {
    id: FormStep.QUALIFICATION_FIELDS,
    title: "Qualification Information",
    description: "Your academic qualification details",
    icon: GraduationCap,
  },
  {
    id: FormStep.EXAM_SITTING,
    title: "Exam Sitting",
    description: "O-Level examination details",
    icon: BookOpen,
    isOptional: true,
  },
  {
    id: FormStep.QUALIFICATION_DOCUMENTS,
    title: "Qualification Documents",
    description: "Upload your academic qualification documents",
    icon: FolderOpen,
    isOptional: true,
  },
  {
    id: FormStep.PROGRAM_SELECTION,
    title: "Program Selection",
    description: "Choose your desired program",
    icon: Settings,
  },
  {
    id: FormStep.REVIEW,
    title: "Review & Submit",
    description: "Review your application before submitting",
    icon: CheckCircle,
  },
]

export const TOTAL_STEPS = FORM_STEPS.length

// ─── Admin-configurable step keys ────────────────────────────────────────────
// Matches the `key` strings in src/lib/admissionConfig.ts's formSteps defaults.
export const FORM_STEP_KEYS: Record<FormStep, string> = {
  [FormStep.PERSONAL_INFO]: "PERSONAL_INFO",
  [FormStep.SPONSOR_INFO]: "SPONSOR_INFO",
  [FormStep.NEXT_OF_KIN]: "NEXT_OF_KIN",
  [FormStep.DOCUMENTS]: "DOCUMENTS",
  [FormStep.QUALIFICATION_FIELDS]: "QUALIFICATION_FIELDS",
  [FormStep.EXAM_SITTING]: "EXAM_SITTING",
  [FormStep.QUALIFICATION_DOCUMENTS]: "QUALIFICATION_DOCUMENTS",
  [FormStep.PROGRAM_SELECTION]: "PROGRAM_SELECTION",
  [FormStep.REVIEW]: "REVIEW",
}

/**
 * Ordered list of form steps that are actually enabled, given the admin's
 * step registry rows (src/services/admissionStepsApi.ts). Steps are sorted
 * by the registry's `order` field, so admin-driven reordering is reflected
 * here. REVIEW is always last and always included regardless of its stored
 * order — it's the terminal step. Custom/unknown keys (steps the admin
 * created that don't match one of the 9 built-in FormStep values) have no
 * matching UI component yet and are silently excluded — see
 * sandbox/admission/admission_features_workflow.md.
 */
export function getActiveFormSteps(
  stepDefinitions: {
    key: string
    enabled: boolean
    required: boolean
    order: number
  }[]
): FormStep[] {
  const byKey = new Map(stepDefinitions.map((s) => [s.key, s]))

  const ordered = FORM_STEPS.filter((step) => step.id !== FormStep.REVIEW)
    .map((step) => ({
      step: step.id,
      isOptional: step.isOptional,
      def: byKey.get(FORM_STEP_KEYS[step.id]),
    }))
    // If the registry row is missing entirely (e.g. deleted), fall back to
    // whether this step is optional by design — a deleted optional step
    // stays excluded, a deleted non-optional one defensively stays included
    // rather than silently breaking the form.
    .filter(({ def, isOptional }) =>
      def ? def.enabled || def.required : !isOptional
    )
    .sort((a, b) => (a.def?.order ?? 0) - (b.def?.order ?? 0))
    .map(({ step }) => step)

  return [...ordered, FormStep.REVIEW]
}

// ─── Storage Key ─────────────────────────────────────────────────────────────
export const FORM_STORAGE_KEY = "odl_admission_form"
export const STEP_STORAGE_KEY = "odl_admission_step"

// ─── Default Form Values ─────────────────────────────────────────────────────
export const DEFAULT_FORM_VALUES: FormDefaultValues = {
  lga: "",
  religion: "",
  dob: "",
  gender: "" as "Male" | "Female" | "",
  hometown: "",
  hometown_address: "",
  contact_address: "",
  has_disability: false,
  disability: "None",

  has_sponsor: false,
  sponsor_name: "",
  sponsor_relationship: "",
  sponsor_email: "",
  sponsor_contact_address: "",
  sponsor_phone_number: "",

  next_of_kin_name: "",
  next_of_kin_relationship: "",
  next_of_kin_phone_number: "",
  next_of_kin_address: "",
  next_of_kin_email: "",
  is_next_of_kin_primary_contact: false,
  next_of_kin_alternate_phone_number: "",
  next_of_kin_occupation: "",
  next_of_kin_workplace: "",

  passport: undefined,
  first_school_leaving: undefined,
  o_level: undefined,
  other_documents: undefined,

  combined_result: "",
  awaiting_result: false,

  first_sitting_type: "",
  first_sitting_year: "",
  first_sitting_exam_number: "",
  second_sitting_type: "",
  second_sitting_year: "",
  second_sitting_exam_number: "",

  first_sitting_result: undefined,
  second_sitting_result: undefined,

  startTerm: "2026/2027 - 100 level - 1st Semester",
  studyMode: "online",

  agreeToTerms: false,
}

// ─── Step Field Mappings ─────────────────────────────────────────────────────
export const STEP_FIELDS: Record<FormStep, string[]> = {
  [FormStep.PERSONAL_INFO]: [
    "lga",
    "religion",
    "dob",
    "gender",
    "hometown",
    "hometown_address",
    "contact_address",
    "has_disability",
    "disability",
  ],
  [FormStep.SPONSOR_INFO]: [
    "has_sponsor",
    "sponsor_name",
    "sponsor_relationship",
    "sponsor_email",
    "sponsor_contact_address",
    "sponsor_phone_number",
  ],
  [FormStep.NEXT_OF_KIN]: [
    "next_of_kin_name",
    "next_of_kin_relationship",
    "next_of_kin_phone_number",
    "next_of_kin_address",
    "next_of_kin_email",
    "is_next_of_kin_primary_contact",
    "next_of_kin_alternate_phone_number",
    "next_of_kin_occupation",
    "next_of_kin_workplace",
  ],
  [FormStep.DOCUMENTS]: [
    "passport",
    "first_school_leaving",
    "o_level",
    "other_documents",
  ],
  [FormStep.QUALIFICATION_FIELDS]: ["combined_result", "awaiting_result"],
  [FormStep.EXAM_SITTING]: [
    "first_sitting_type",
    "first_sitting_year",
    "first_sitting_exam_number",
    "second_sitting_type",
    "second_sitting_year",
    "second_sitting_exam_number",
  ],
  [FormStep.QUALIFICATION_DOCUMENTS]: [
    "first_sitting_result",
    "second_sitting_result",
  ],
  [FormStep.PROGRAM_SELECTION]: ["startTerm", "studyMode"],
  [FormStep.REVIEW]: ["agreeToTerms"],
}

// ─── Per-Step Schema Types ───────────────────────────────────────────────────
export type StepSchemaMap = {
  [FormStep.PERSONAL_INFO]: typeof personalInfoSchema
  [FormStep.SPONSOR_INFO]: typeof sponsorInfoSchema
  [FormStep.NEXT_OF_KIN]: typeof nextOfKinSchema
  [FormStep.DOCUMENTS]: typeof documentsSchema
  [FormStep.QUALIFICATION_FIELDS]: typeof qualificationFieldsSchema
  [FormStep.EXAM_SITTING]: typeof examSittingSchema
  [FormStep.QUALIFICATION_DOCUMENTS]: typeof qualificationDocumentsSchema
  [FormStep.PROGRAM_SELECTION]: typeof programSelectionSchema
  [FormStep.REVIEW]: z.ZodObject<{ agreeToTerms: z.ZodBoolean }>
}

// ─── Form Default Values Type ────────────────────────────────────────────────
export interface FormDefaultValues {
  lga: string
  religion: string
  dob: string
  gender: "Male" | "Female" | ""
  hometown: string
  hometown_address: string
  contact_address: string
  has_disability: boolean
  disability: string

  has_sponsor: boolean
  sponsor_name: string
  sponsor_relationship: string
  sponsor_email: string
  sponsor_contact_address: string
  sponsor_phone_number: string

  next_of_kin_name: string
  next_of_kin_relationship: string
  next_of_kin_phone_number: string
  next_of_kin_address: string
  next_of_kin_email: string
  is_next_of_kin_primary_contact: boolean
  next_of_kin_alternate_phone_number: string
  next_of_kin_occupation: string
  next_of_kin_workplace: string

  passport: File | undefined
  first_school_leaving: File | undefined
  o_level: File | undefined
  other_documents: File[] | undefined

  combined_result: "" | "single_result" | "combined_result"
  awaiting_result: boolean

  first_sitting_type: string
  first_sitting_year: string
  first_sitting_exam_number: string
  second_sitting_type: string
  second_sitting_year: string
  second_sitting_exam_number: string

  first_sitting_result: File | undefined
  second_sitting_result: File | undefined

  startTerm: string
  studyMode: "online" | "offline"

  agreeToTerms: boolean
}

// ─── Step Component Props ────────────────────────────────────────────────────
export interface StepComponentProps {
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}
