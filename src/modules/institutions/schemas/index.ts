import { z } from "zod"

/**
 * Mirrors the API's ProvisionTenantRequest rules. The slug pattern is
 * duplicated from the backend deliberately: it is the value that ends up in a
 * CREATE DATABASE statement, so it is validated on both sides rather than the
 * client trusting the server to be the only gate (or vice versa).
 */
export const INSTITUTION_SLUG_PATTERN = /^[a-z][a-z0-9_]{1,30}$/

export const institutionStatusSchema = z.enum([
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
])

export const institutionDomainSchema = z.object({
  id: z.number(),
  domain: z.string(),
  isPrimary: z.boolean(),
  verifiedAt: z.string().nullable(),
})

export const provisioningRunSchema = z.object({
  id: z.number(),
  status: z.enum(["RUNNING", "SUCCEEDED", "FAILED"]),
  steps: z.array(z.string()),
  error: z.string().nullable(),
  finishedAt: z.string().nullable(),
})

export const institutionSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  slug: z.string(),
  status: institutionStatusSchema,
  plan: z.string().nullable(),
  // Null unless downtime is announced for this institution.
  maintenance: z
    .object({
      message: z.string().nullable(),
      startsAt: z.string().nullable(),
      endsAt: z.string().nullable(),
      active: z.boolean(),
    })
    .nullable()
    .optional(),
  logoUrl: z.string().nullable(),
  supportEmail: z.string().nullable(),
  supportPhone: z.string().nullable(),
  programCategories: z.array(z.string()).optional(),
  awardTypes: z.array(z.string()).optional(),
  regulator: z.string().nullable().optional(),
  calendarUnit: z.string().nullable().optional(),
  periodsPerSession: z.number().nullable().optional(),
  tagline: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  branding: z
    .object({
      colors: z
        .object({
          primary: z.string().optional(),
          accent: z.string().optional(),
          sidebar: z.string().optional(),
        })
        .optional(),
      fontFamily: z.string().nullable().optional(),
    })
    .optional(),
  // Whether, never where — the API deliberately does not send the host.
  dedicatedDatabaseServer: z.boolean().default(false),
  provisionedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
  domains: z.array(institutionDomainSchema),
  provisioningRuns: z.array(provisioningRunSchema).optional(),
})

export const programCategorySchema = z.enum([
  "DEGREE",
  "POSTGRADUATE",
  "CERTIFICATE",
  "SECONDARY_SCHOOL",
])

export const awardTypeSchema = z.enum([
  "DEGREE_CERTIFICATE",
  "POSTGRADUATE_AWARD",
  "DIPLOMA",
  "CERTIFICATE_OF_COMPLETION",
  "TERM_RESULT_SHEET",
  "TRANSCRIPT",
])

export const regulatorSchema = z.enum([
  "NUC",
  "WAEC_NECO",
  "PROFESSIONAL_BODY",
  "NONE",
])

export const calendarUnitSchema = z.enum(["SEMESTER", "TERM", "MODULE"])

const hexColor = z
  .string()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    "Use a hex colour like #0F5132"
  )

export const brandingSchema = z.object({
  colors: z.object({
    primary: hexColor,
    accent: hexColor,
    sidebar: hexColor,
  }),
  fontFamily: z.string().max(80).optional().or(z.literal("")),
})

export const provisionInstitutionSchema = z.object({
  name: z.string().min(2, "Institution name is required").max(200),
  slug: z
    .string()
    .min(2)
    .max(32)
    .regex(
      INSTITUTION_SLUG_PATTERN,
      "Start with a letter; lowercase letters, digits and underscores only"
    ),
  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i,
      "Enter a valid hostname, e.g. unilag.qhub.ng"
    ),
  plan: z.string().max(40).optional().or(z.literal("")),

  // What the institution actually is. These drive what gets provisioned —
  // the calendar's periods, the structure scaffold, whether a certificate
  // template is created — so they are required rather than optional extras.
  programCategories: z
    .array(programCategorySchema)
    .min(1, "Select at least one programme type"),
  awardTypes: z.array(awardTypeSchema).min(1, "Select at least one award"),
  regulator: regulatorSchema,
  calendarUnit: calendarUnitSchema,
  periodsPerSession: z.number().int().min(1).max(6),

  tagline: z.string().max(200).optional().or(z.literal("")),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  supportEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  supportPhone: z.string().max(40).optional().or(z.literal("")),
  branding: brandingSchema,
  adminEmail: z.string().email("Enter a valid email"),
  adminUsername: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "Letters, digits, dot, underscore and dash only"
    ),
  adminPassword: z.string().min(8, "At least 8 characters").max(200),
  adminFirstName: z.string().max(100).optional().or(z.literal("")),
  adminLastName: z.string().max(100).optional().or(z.literal("")),
})

export const updateInstitutionStatusSchema = z.object({
  // PROVISIONING is absent to match the API: it is a state the provisioner
  // sets, not one an operator can select.
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]),
})
