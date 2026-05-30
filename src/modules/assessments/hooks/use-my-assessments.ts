"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentQueryOptions } from "../services/assessments.service";
import type { AssessmentFilter } from "../types";

/**
 * Assessments scoped to the authenticated student's enrolled courses.
 */
export function useMyAssessments(filters?: Partial<Pick<AssessmentFilter, "type" | "upcoming" | "semesterId" | "page" | "limit">>) {
    return useQuery({
        ...assessmentQueryOptions.my(filters),
        staleTime: 1000 * 60 * 3,
    });
}
