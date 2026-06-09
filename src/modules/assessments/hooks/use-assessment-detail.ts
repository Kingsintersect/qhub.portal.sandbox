"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentQueryOptions } from "../services/assessments.service";

/**
 * Fetch a single assessment by ID — used on the detail page.
 */
export function useAssessmentDetail(id: number | null) {
    return useQuery({
        ...assessmentQueryOptions.detail(id!),
        enabled: id !== null && id > 0,
        staleTime: 1000 * 60 * 5,
    });
}
