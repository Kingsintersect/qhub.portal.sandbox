import type { z } from "zod";
import type {
    assessmentItemSchema,
    assessmentDetailSchema,
    assessmentFilterSchema,
    paginatedAssessmentsSchema,
    syncResultSchema,
    syncStatusSchema,
    syncAllResultSchema,
    updateVisibilitySchema,
    visibilityResponseSchema,
} from "../schemas";

// ── Inferred types from Zod schemas ─────────────────────────────────────────

export type AssessmentType = "assignment" | "quiz" | "forum";

export type SyncStatus = "PENDING" | "SYNCED" | "FAILED" | "STALE";

export type AssessmentItem = z.infer<typeof assessmentItemSchema>;

export type AssessmentDetail = z.infer<typeof assessmentDetailSchema>;

export type AssessmentFilter = z.infer<typeof assessmentFilterSchema>;

export type PaginatedAssessments = z.infer<typeof paginatedAssessmentsSchema>;

export type SyncResult = z.infer<typeof syncResultSchema>;

export type SyncStatusResult = z.infer<typeof syncStatusSchema>;

export type SyncAllResult = z.infer<typeof syncAllResultSchema>;

export type UpdateVisibilityPayload = z.infer<typeof updateVisibilitySchema>;

export type VisibilityResponse = z.infer<typeof visibilityResponseSchema>;

// ── Convenience re-export for paginated meta ─────────────────────────────────

export type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
};
