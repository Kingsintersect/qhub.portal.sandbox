import type { z } from "zod"

import type {
  awardTypeSchema,
  calendarUnitSchema,
  institutionSchema,
  programCategorySchema,
  regulatorSchema,
  provisionInstitutionSchema,
  updateInstitutionStatusSchema,
} from "@/modules/institutions/schemas"

export type Institution = z.infer<typeof institutionSchema>
export type ProvisionInstitutionPayload = z.infer<
  typeof provisionInstitutionSchema
>
export type UpdateInstitutionStatusPayload = z.infer<
  typeof updateInstitutionStatusSchema
>

export type InstitutionStatus = Institution["status"]

export type InstitutionListFilters = {
  status?: InstitutionStatus
  search?: string
  perPage?: number
}

export type InstitutionListResponse = {
  data: Institution[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export type ProgramCategory = z.infer<typeof programCategorySchema>
export type AwardType = z.infer<typeof awardTypeSchema>
export type Regulator = z.infer<typeof regulatorSchema>
export type CalendarUnit = z.infer<typeof calendarUnitSchema>
