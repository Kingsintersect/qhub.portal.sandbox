import { z } from "zod"

/**
 * Programme configuration, per the Program Type Configuration Reference.
 *
 * Mirrors the API's CreateProgramRequest rules. The category is the pivot:
 * it decides which fields are meaningful, which are hidden, and which are
 * locked — a certificate programme has no faculty and no GPA, a secondary
 * class has no credit units, and a sandwich programme cannot admit until it
 * is accredited.
 */

export const programCategorySchema = z.enum([
  "DEGREE",
  "POSTGRADUATE",
  "CERTIFICATE",
  "SECONDARY_SCHOOL",
])

export const deliveryModeSchema = z.enum([
  "REGULAR",
  "SANDWICH",
  "EVENING",
  "WEEKEND",
])

export const accreditationStatusSchema = z.enum([
  "NOT_REQUIRED",
  "PENDING",
  "APPROVED",
  "EXPIRED",
])

export const gradingSchemeTypeSchema = z.enum([
  "CREDIT_WEIGHTED_GPA",
  "SIMPLE_AVERAGE",
  "PASS_FAIL",
])

export const gradingSchemeSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: gradingSchemeTypeSchema,
  caWeightPercent: z.number(),
  examWeightPercent: z.number(),
  showsGpa: z.boolean(),
})

export const academicUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  parentId: z.number().nullable(),
  typeCode: z.string(),
  depth: z.number(),
})

export const programSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  departmentId: z.number().nullable(),
  degreeType: z.string(),
  durationYears: z.number(),
  minCreditUnits: z.number(),
  isActive: z.boolean(),
  programCategory: programCategorySchema,
  isCohortBased: z.boolean(),
  deliveryMode: deliveryModeSchema,
  accreditationStatus: accreditationStatusSchema,
  gradingSchemeId: z.number().nullable(),
  academicUnitId: z.number().nullable(),
  certificateTemplateId: z.number().nullable(),
  canOpenAdmission: z.boolean(),
  admissionBlockReason: z.string().nullable(),
})

export const programSetupSchema = z
  .object({
    programCategory: programCategorySchema,
    name: z.string().min(2, "Programme name is required").max(200),
    code: z.string().min(2).max(20),
    degreeType: z.string().min(1, "Required").max(30),

    // Duration is entered in the unit that suits the category — weeks for a
    // certificate, months for a cohort — and converted to the fractional years
    // the column stores.
    durationValue: z.number().positive("Must be greater than zero"),

    departmentId: z.number().nullable().optional(),
    academicUnitId: z.number().nullable().optional(),

    minCreditUnits: z.number().int().min(0),
    gradingSchemeId: z.number({ message: "Choose a grading scheme" }),

    isCohortBased: z.boolean(),
    deliveryMode: deliveryModeSchema,
    accreditationStatus: accreditationStatusSchema,

    // §5 guardrail: GPA is not offered to business-school or certificate
    // programmes without the institution explicitly opting in, because
    // defaulting to it produces transcripts nobody asked for.
    tracksFormalGpa: z.boolean(),

    admissionRequirements: z.string().max(2000).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    // A sandwich programme is a degree with a different calendar plus a
    // regulatory gate — it cannot be left as NOT_REQUIRED.
    if (
      values.deliveryMode === "SANDWICH" &&
      values.accreditationStatus === "NOT_REQUIRED"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["accreditationStatus"],
        message:
          "Sandwich programmes require NUC accreditation — set this to Pending or Approved.",
      })
    }

    // Credit units are meaningless where subjects are equally weighted.
    if (
      values.programCategory === "SECONDARY_SCHOOL" &&
      values.minCreditUnits > 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minCreditUnits"],
        message:
          "Secondary school subjects are equally weighted — leave this at 0.",
      })
    }
  })

export const DURATION_UNIT_BY_CATEGORY: Record<
  z.infer<typeof programCategorySchema>,
  {
    label: string
    toYears: (value: number) => number
    fromYears: (years: number) => number
  }
> = {
  // The column is nominally years; the wizard shows whichever unit the
  // institution actually thinks in and converts on the way through.
  DEGREE: { label: "years", toYears: (v) => v, fromYears: (y) => y },
  POSTGRADUATE: {
    label: "months",
    toYears: (v) => Number((v / 12).toFixed(2)),
    fromYears: (y) => Math.round(y * 12),
  },
  CERTIFICATE: {
    label: "weeks",
    toYears: (v) => Number((v / 52).toFixed(2)),
    fromYears: (y) => Math.round(y * 52),
  },
  SECONDARY_SCHOOL: { label: "years", toYears: (v) => v, fromYears: (y) => y },
}
