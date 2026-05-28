import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    courseManagementKeys,
    courseManagementMutationOptions,
    courseManagementQueryOptions,
} from "@/services/courseManagementApi";

// ── Courses ─────────────────────────────────

export function useCourses() {
    return useQuery({
        ...courseManagementQueryOptions.courses.list(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCoursesBySemester(semesterId: string | null) {
    return useQuery({
        ...courseManagementQueryOptions.courses.bySemester(semesterId!),
        enabled: !!semesterId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...courseManagementMutationOptions.createCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: courseManagementKeys.courses.all });
        },
    });
}

export function useUpdateCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...courseManagementMutationOptions.updateCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: courseManagementKeys.courses.all });
        },
    });
}

// ── Program Courses ─────────────────────────

export function useProgramCoursesByCourse(courseId: string | null) {
    return useQuery({
        ...courseManagementQueryOptions.programCourses.byCourse(courseId!),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useProgramCoursesByProgram(programId: string | null) {
    return useQuery({
        ...courseManagementQueryOptions.programCourses.byProgram(programId!),
        enabled: !!programId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useAssignCourseToProgram() {
    const qc = useQueryClient();
    return useMutation({
        ...courseManagementMutationOptions.assignCourseToProgram(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: courseManagementKeys.programCourses.all });
        },
    });
}

export function useUpdateProgramCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...courseManagementMutationOptions.updateProgramCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: courseManagementKeys.programCourses.all });
        },
    });
}

export function useRemoveProgramCourse() {
    const qc = useQueryClient();
    return useMutation({
        ...courseManagementMutationOptions.removeProgramCourse(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: courseManagementKeys.programCourses.all });
        },
    });
}
