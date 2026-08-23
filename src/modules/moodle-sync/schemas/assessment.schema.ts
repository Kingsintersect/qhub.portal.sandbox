import { z } from "zod"

export const AssessmentTypeSchema = z.enum(["assignment", "quiz", "forum"])

// Full detail shape — matches the nested course/courseOffering/semester/
// academicSession relations documented for this entity (previously reached
// only via the retired /assessments/:id route; now the sole real surface for
// MoodleSyncAssessment). isVisible/moodleSyncCourseId/moodleAssessmentId/
// lastSyncAt/createdAt/updatedAt are additive fields the list/course/upcoming
// endpoints already return on the underlying row — not confirmed by an
// example body, so read defensively.
export const AssessmentResponseSchema = z.object({
  id: z.number(),
  moodleSyncCourseId: z.number().optional(),
  moodleAssessmentId: z.number().optional(),
  assessmentType: AssessmentTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  maxGrade: z.number().nullable(),
  isVisible: z.boolean().default(true),
  lastSyncAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  course: z.object({
    id: z.number().optional(),
    moodleCourseId: z.number().optional(),
    moodleShortName: z.string(),
    moodleFullName: z.string(),
    courseOffering: z.object({
      id: z.number().optional(),
      course: z.object({ code: z.string(), title: z.string() }),
      semester: z.object({ name: z.string() }).optional(),
      academicSession: z.object({ name: z.string() }).optional(),
    }),
  }),
})

export const AssessmentListResponseSchema = z.object({
  data: z.array(AssessmentResponseSchema),
})

// ── Filters / pagination ──────────────────────────────────────────────────

export const AssessmentFilterSchema = z.object({
  type: AssessmentTypeSchema.optional(),
  courseOfferingId: z.number().optional(),
  semesterId: z.number().optional(),
  isVisible: z.boolean().optional(),
  upcoming: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const PaginatedAssessmentsSchema = z.object({
  data: z.array(AssessmentResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})

// ── Visibility ─────────────────────────────────────────────────────────────

export const UpdateVisibilitySchema = z.object({
  isVisible: z.boolean(),
})

export const VisibilityResponseSchema = z.object({
  id: z.number(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
})

// ── Sync result / status ───────────────────────────────────────────────────

export const SyncResultSchema = z.object({
  moodleCourseId: z.number(),
  pulled: z.number(),
  created: z.number().optional(),
  updated: z.number().optional(),
  failed: z.number().optional(),
})

export const SyncStatusSchema = z.object({
  summary: z.object({
    totalCourses: z.number(),
    totalAssessments: z.number(),
    byStatus: z.object({
      SYNCED: z.number(),
      PENDING: z.number(),
      FAILED: z.number(),
      STALE: z.number(),
    }),
  }),
  courses: z.array(
    z.object({
      courseOfferingId: z.number(),
      courseCode: z.string(),
      moodleCourseId: z.number(),
      assessmentCount: z.number(),
      lastSyncAt: z.string().nullable(),
      failedCount: z.number(),
    })
  ),
})

// ── CA preview (Moodle → Grade.caScore bridge) ────────────────────────────

export const CaPreviewItemSchema = z.object({
  studentId: z.number(),
  studentName: z.string(),
  studentMatric: z.string(),
  sourceItemCount: z.number(),
  sourceTotal: z.number(),
  sourceMax: z.number(),
  computedCaScore: z.number(),
})

export const CaPreviewResponseSchema = z.object({
  offeringId: z.number(),
  semesterId: z.number(),
  caMax: z.number(),
  students: z.array(CaPreviewItemSchema),
})
