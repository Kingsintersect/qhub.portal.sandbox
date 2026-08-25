import type { z } from "zod"

import type {
  academicUnitSchema,
  gradingSchemeSchema,
  programCategorySchema,
  programSchema,
  programSetupSchema,
} from "@/modules/program-setup/schemas"

export type ProgramCategory = z.infer<typeof programCategorySchema>
export type GradingScheme = z.infer<typeof gradingSchemeSchema>
export type AcademicUnit = z.infer<typeof academicUnitSchema>
export type Program = z.infer<typeof programSchema>
export type ProgramSetupValues = z.infer<typeof programSetupSchema>

/** What the wizard shows for a given category — the document's §2 table. */
export type CategoryProfile = {
  label: string
  description: string
  courseTerm: string
  structureHint: string
  usesCreditUnits: boolean
  usesLevels: boolean
  showsAccreditation: boolean
  defaultSchemeType: GradingScheme["type"]
  /** Whether GPA must be explicitly opted into rather than assumed. */
  gpaIsOptIn: boolean
}
