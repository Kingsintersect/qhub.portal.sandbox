import { z } from "zod"
import { SyncStatusSchema, SyncDirectionSchema } from "./common.schema"

export const MoodleRoleSchema = z.enum([
  "student",
  "editingteacher",
  "teacher",
  "manager",
])
export const PortalRoleSchema = z.enum(["STUDENT", "TUTOR", "STAFF", "ADMIN"])

// `portalRole`/`name`/`email` are display-only convenience fields — see
// "Frontend Contract Additions" in moodle_sync_UI_README.md.
export const UserSyncResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  email: z.string(),
  portalRole: PortalRoleSchema,
  moodleUserId: z.number().nullable(),
  moodleUsername: z.string().nullable(),
  moodleRole: MoodleRoleSchema,
  syncStatus: SyncStatusSchema,
  syncDirection: SyncDirectionSchema,
  lastSyncAt: z.string().nullable(),
})

export const UserSyncQueryFiltersSchema = z.object({
  role: MoodleRoleSchema.optional(),
  status: SyncStatusSchema.optional(),
})
