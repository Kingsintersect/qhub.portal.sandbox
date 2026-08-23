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
