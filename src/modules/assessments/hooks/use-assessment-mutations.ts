"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentMutationOptions, assessmentKeys } from "../services/assessments.service";
import type { UpdateVisibilityPayload } from "../types";

/**
 * Toggle assessment visibility (Admin / Tutor).
 */
export function useUpdateVisibility() {
    const qc = useQueryClient();
    return useMutation({
        ...assessmentMutationOptions.updateVisibility(),
        onSuccess: async (_data, { id }) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: assessmentKeys.list() }),
                qc.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
            ]);
        },
    });
}

/**
 * Trigger a sync for a single Moodle course.
 */
export function useSyncCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...assessmentMutationOptions.syncCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: assessmentKeys.all });
        },
    });
}

/**
 * Retry a failed sync for a specific Moodle course.
 */
export function useRetrySyncCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...assessmentMutationOptions.retrySyncCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: assessmentKeys.all });
        },
    });
}

/**
 * Enqueue a global sync-all job.
 */
export function useSyncAll() {
    const qc = useQueryClient();
    return useMutation({
        ...assessmentMutationOptions.syncAll(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: assessmentKeys.syncStatus() });
        },
    });
}

/**
 * Delete a portal-side assessment record.
 */
export function useDeleteAssessment() {
    const qc = useQueryClient();
    return useMutation({
        ...assessmentMutationOptions.deleteAssessment(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: assessmentKeys.list() });
        },
    });
}
