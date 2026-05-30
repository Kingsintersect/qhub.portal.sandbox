"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentQueryOptions } from "../services/assessments.service";

/**
 * Upcoming assessments sorted by due date — used in the student dashboard widget.
 */
export function useUpcomingAssessments(limit = 10) {
    return useQuery({
        ...assessmentQueryOptions.upcoming(limit),
        staleTime: 1000 * 60 * 2,
    });
}
