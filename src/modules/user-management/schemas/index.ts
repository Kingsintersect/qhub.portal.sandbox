import { z } from "zod"
import { passwordSchema } from "@/lib/validations/zod"

export const createUserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be 100 characters or less"),
  password: passwordSchema,
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  role_ids: z
    .array(z.number().int().positive())
    .min(1, "Select at least one role"),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

// ── Bulk Import Tutors ──
// See sandbox/user/tutor_onboarding_README.md §1 for the CSV contract this
// validates against before the multipart request goes out.
const ACCEPTED_BULK_IMPORT_TYPES = [
  "text/csv",
  "text/plain",
  "application/vnd.ms-excel", // some browsers report .csv this way
]
const MAX_BULK_IMPORT_SIZE_BYTES = 10 * 1024 * 1024 // 10MB, matches the backend limit

export const bulkImportTutorsSchema = z.object({
  file: z
    .instanceof(File, { message: "Select a CSV file to upload" })
    .refine(
      (f) => f.size > 0 && f.size <= MAX_BULK_IMPORT_SIZE_BYTES,
      "File must be under 10MB"
    )
    .refine(
      (f) =>
        ACCEPTED_BULK_IMPORT_TYPES.includes(f.type) ||
        f.name.toLowerCase().endsWith(".csv") ||
        f.name.toLowerCase().endsWith(".txt"),
      "Only .csv or .txt files are accepted"
    ),
  send_welcome_email: z.boolean(),
  login_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

export type BulkImportTutorsFormValues = z.infer<typeof bulkImportTutorsSchema>
