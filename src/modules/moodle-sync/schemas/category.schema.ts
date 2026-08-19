import { z } from "zod"
import { SyncStatusSchema, SyncDirectionSchema } from "./common.schema"

export const CategoryEntityTypeSchema = z.enum([
  "faculty",
  "department",
  "program",
  "level",
  "semester",
])

export const PushCategoryDtoSchema = z.object({
  entityType: CategoryEntityTypeSchema,
  entityId: z.number().int().positive(),
  parentMoodleCategoryId: z.number().int().positive().optional(),
})

// `entityName`/`parentId` are display-only convenience fields this frontend
// needs for the category tree, and `moodleCategoryId`/`moodleCategoryName` are
// relaxed to nullable so the tree can represent portal entities that exist but
// have never been pushed (syncStatus: "PENDING") — see "Frontend Contract
// Additions" in moodle_sync_UI_README.md.
export const CategorySyncResponseSchema = z.object({
  id: z.number(),
  entityType: CategoryEntityTypeSchema,
  entityId: z.number(),
  entityName: z.string(),
  moodleCategoryId: z.number().nullable(),
  moodleCategoryName: z.string().nullable(),
  parentMoodleCategoryId: z.number().nullable(),
  parentId: z.number().nullable(),
  syncStatus: SyncStatusSchema,
  syncDirection: SyncDirectionSchema,
  lastSyncAt: z.string().nullable(),
})
