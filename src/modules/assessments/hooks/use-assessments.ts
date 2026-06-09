"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentQueryOptions } from "../services/assessments.service";
import type { AssessmentFilter } from "../types";

/**
 * Paginated list of all assessments — used by Admin and Tutor views.
 */
export function useAssessments(filters?: Partial<AssessmentFilter>) {
    return useQuery({
        ...assessmentQueryOptions.list(filters),
        staleTime: 1000 * 60 * 5,
    });
}
