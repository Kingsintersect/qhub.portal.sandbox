"use client";

import { create } from "zustand";
import type { AssessmentType } from "../types";

// ── Assessments UI store — UI-only state (filters, pagination, tabs) ──────────
// Server-state (the actual assessment data) lives in React Query.

interface AssessmentsUiState {
    // Shared filters
    activeType: AssessmentType | null;
    page: number;
    limit: number;

    // Visibility filter (admin/tutor)
    visibilityFilter: "all" | "visible" | "hidden";

    // Upcoming toggle (student)
    upcomingOnly: boolean;

    // Actions
    setActiveType: (type: AssessmentType | null) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setVisibilityFilter: (v: "all" | "visible" | "hidden") => void;
    setUpcomingOnly: (v: boolean) => void;
    resetFilters: () => void;
}

const initialState = {
    activeType: null,
    page: 1,
    limit: 20,
    visibilityFilter: "all" as const,
    upcomingOnly: false,
};

export const useAssessmentsUiStore = create<AssessmentsUiState>()((set) => ({
    ...initialState,

    setActiveType: (type) => set({ activeType: type, page: 1 }),
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setVisibilityFilter: (visibilityFilter) => set({ visibilityFilter, page: 1 }),
    setUpcomingOnly: (upcomingOnly) => set({ upcomingOnly, page: 1 }),
    resetFilters: () => set(initialState),
}));
