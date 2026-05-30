"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentQueryOptions } from "../services/assessments.service";

/**
 * Admin sync status — aggregate over all Moodle-synced courses.
 */
export function useSyncStatus() {
    return useQuery({
        ...assessmentQueryOptions.syncStatus(),
        staleTime: 1000 * 60 * 1,
        refetchInterval: 1000 * 60 * 2,
    });
}
