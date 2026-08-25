import type {
  AwardType,
  CalendarUnit,
  ProgramCategory,
  Regulator,
} from "@/modules/institutions/types"

/**
 * The choices an institution makes at onboarding, and what each one means.
 *
 * Descriptions are not decoration: an operator onboarding a client needs to
 * know that picking "Secondary School" is what produces three terms and a
 * Junior/Senior structure rather than two semesters and a faculty tree.
 */

export const PROGRAM_CATEGORY_OPTIONS: Array<{
  value: ProgramCategory
  label: string
  description: string
}> = [
  {
    value: "DEGREE",
    label: "Degree (Undergraduate)",
    description:
      "NUC-regulated. Faculty → Department → Programme → Level. Credit-unit-weighted GPA.",
  },
  {
    value: "POSTGRADUATE",
    label: "Postgraduate",
    description:
      "PGD, Masters, PhD under a School of Postgraduate Studies. Seeds that school.",
  },
  {
    value: "CERTIFICATE",
    label: "Certificate / Short courses",
    description:
      "Weeks rather than years, rolling intake, pass/fail. No levels, no GPA.",
  },
  {
    value: "SECONDARY_SCHOOL",
    label: "Secondary School",
    description:
      "JSS/SSS with streams. Terms rather than semesters, WAEC 9-point scale, class positions.",
  },
]

export const AWARD_TYPE_OPTIONS: Array<{
  value: AwardType
  label: string
  description: string
}> = [
  {
    value: "DEGREE_CERTIFICATE",
    label: "Degree certificate",
    description: "Awarded on graduation from an undergraduate programme.",
  },
  {
    value: "POSTGRADUATE_AWARD",
    label: "Postgraduate award",
    description: "PGD, Masters or doctoral award.",
  },
  { value: "DIPLOMA", label: "Diploma", description: "Sub-degree award." },
  {
    value: "CERTIFICATE_OF_COMPLETION",
    label: "Certificate of completion",
    description: "For short courses. Seeds a printable certificate template.",
  },
  {
    value: "TERM_RESULT_SHEET",
    label: "Term result sheet",
    description:
      "WAEC-style report card with subject scores and class position.",
  },
  {
    value: "TRANSCRIPT",
    label: "Academic transcript",
    description: "Per-session record of courses, grades and CGPA.",
  },
]

export const REGULATOR_OPTIONS: Array<{ value: Regulator; label: string }> = [
  { value: "NUC", label: "NUC" },
  { value: "WAEC_NECO", label: "WAEC / NECO" },
  { value: "PROFESSIONAL_BODY", label: "Professional body" },
  { value: "NONE", label: "Institutional only" },
]

export const CALENDAR_UNIT_OPTIONS: Array<{
  value: CalendarUnit
  label: string
  hint: string
}> = [
  {
    value: "SEMESTER",
    label: "Semesters",
    hint: "Universities — usually 2 per session",
  },
  {
    value: "TERM",
    label: "Terms",
    hint: "Secondary schools — usually 3 per session",
  },
  { value: "MODULE", label: "Modules", hint: "Cohort-based programmes" },
]

/**
 * Sensible starting points, so an operator who picks "Secondary School" is not
 * then left to work out that it means three terms regulated by WAEC.
 */
export const CATEGORY_DEFAULTS: Record<
  ProgramCategory,
  {
    calendarUnit: CalendarUnit
    periodsPerSession: number
    regulator: Regulator
    awards: AwardType[]
  }
> = {
  DEGREE: {
    calendarUnit: "SEMESTER",
    periodsPerSession: 2,
    regulator: "NUC",
    awards: ["DEGREE_CERTIFICATE", "TRANSCRIPT"],
  },
  POSTGRADUATE: {
    calendarUnit: "SEMESTER",
    periodsPerSession: 2,
    regulator: "NUC",
    awards: ["POSTGRADUATE_AWARD", "TRANSCRIPT"],
  },
  CERTIFICATE: {
    calendarUnit: "MODULE",
    periodsPerSession: 1,
    regulator: "NONE",
    awards: ["CERTIFICATE_OF_COMPLETION"],
  },
  SECONDARY_SCHOOL: {
    calendarUnit: "TERM",
    periodsPerSession: 3,
    regulator: "WAEC_NECO",
    awards: ["TERM_RESULT_SHEET"],
  },
}

/** Starting palette — the portal's own default brand. */
export const DEFAULT_BRAND_COLORS = {
  primary: "#E2571E",
  accent: "#F5F3F0",
  sidebar: "#FAFAF9",
}
