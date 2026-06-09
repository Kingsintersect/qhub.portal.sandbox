import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const assessmentTypeSchema = z.enum(["assignment", "quiz", "forum"]);

export const syncStatusEnumSchema = z.enum(["PENDING", "SYNCED", "FAILED", "STALE"]);

// ── Assessment list item (used in lists) ─────────────────────────────────────

export const assessmentItemSchema = z.object({
    id: z.number(),
    assessmentType: assessmentTypeSchema,
    name: z.string(),
    description: z.string().nullable(),
    dueDate: z.string().nullable(),
    maxGrade: z.number().nullable(),
    isVisible: z.boolean(),
    course: z.object({
        code: z.string(),
        title: z.string(),
        semesterName: z.string(),
    }),
});

// ── Assessment detail (single fetch) ─────────────────────────────────────────

export const assessmentDetailSchema = z.object({
    id: z.number(),
    moodleSyncCourseId: z.number(),
    moodleAssessmentId: z.number(),
    assessmentType: assessmentTypeSchema,
    name: z.string(),
    description: z.string().nullable(),
    dueDate: z.string().nullable(),
    maxGrade: z.number().nullable(),
    isVisible: z.boolean(),
    lastSyncAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    course: z.object({
        id: z.number(),
        moodleCourseId: z.number(),
        moodleShortName: z.string(),
        moodleFullName: z.string(),
        courseOffering: z.object({
            id: z.number(),
            course: z.object({ code: z.string(), title: z.string() }),
            semester: z.object({ name: z.string() }),
            academicSession: z.object({ name: z.string() }),
        }),
    }),
});

// ── Filter schema ─────────────────────────────────────────────────────────────

export const assessmentFilterSchema = z.object({
    type: assessmentTypeSchema.optional(),
    courseOfferingId: z.number().optional(),
    semesterId: z.number().optional(),
    isVisible: z.boolean().optional(),
    upcoming: z.boolean().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

// ── Paginated response ────────────────────────────────────────────────────────

export const paginatedAssessmentsSchema = z.object({
    data: z.array(assessmentItemSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
    }),
});

// ── Sync result ───────────────────────────────────────────────────────────────

export const syncResultSchema = z.object({
    moodleCourseId: z.number(),
    pulled: z.number(),
    created: z.number(),
    updated: z.number(),
    failed: z.number(),
    errors: z.array(z.string()),
    syncedAt: z.string(),
});

// ── Sync-all result ───────────────────────────────────────────────────────────

export const syncAllResultSchema = z.object({
    jobId: z.string(),
    message: z.string(),
});

// ── Sync status ───────────────────────────────────────────────────────────────

export const syncStatusSchema = z.object({
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
});

// ── Visibility ────────────────────────────────────────────────────────────────

export const updateVisibilitySchema = z.object({
    isVisible: z.boolean(),
});

export const visibilityResponseSchema = z.object({
    id: z.number(),
    isVisible: z.boolean(),
    updatedAt: z.string(),
});
