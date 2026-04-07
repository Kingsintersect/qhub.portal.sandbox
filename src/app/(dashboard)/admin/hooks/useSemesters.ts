// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { semesterApi } from "../services/feeManagementApi";
// import type { CreateSemesterPayload } from "../types";
// import { sessionKeys } from "./useAcademicSessions";

// export const semesterKeys = {
//     bySession: (sessionId: string) =>
//         ["semesters", { sessionId }] as const,
// };

// export function useSemesters(sessionId: string | null) {
//     return useQuery({
//         queryKey: semesterKeys.bySession(sessionId!),
//         queryFn: () => semesterApi.listBySession(sessionId!),
//         select: (res) => res.data,
//         enabled: !!sessionId,
//     });
// }

// export function useCreateSemester() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: CreateSemesterPayload) =>
//             semesterApi.create(payload),
//         onSuccess: (_data, variables) => {
//             qc.invalidateQueries({
//                 queryKey: semesterKeys.bySession(variables.academic_session_id),
//             });
//         },
//     });
// }

// export function useDeleteSemester(sessionId: string) {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (id: string) => semesterApi.delete(id),
//         onSuccess: () => {
//             qc.invalidateQueries({
//                 queryKey: semesterKeys.bySession(sessionId),
//             });
//         },
//     });
// }

// export function useActivateSemester(sessionId: string) {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (id: string) => semesterApi.activate(id),
//         onSuccess: () => {
//             qc.invalidateQueries({
//                 queryKey: semesterKeys.bySession(sessionId),
//             });
//             // Also refresh session detail since semester state affects it
//             qc.invalidateQueries({ queryKey: sessionKeys.all });
//         },
//     });
// }


// RUNNING ON DUMMY DATA FROM HERE
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dummySemesterApi } from "../services/dummyData";
import type { CreateSemesterPayload } from "../types";
import { sessionKeys } from "./useAcademicSessions";

export const semesterKeys = {
    bySession: (sessionId: string) =>
        ["semesters", { sessionId }] as const,
};

export function useSemesters(sessionId: string | null) {
    return useQuery({
        queryKey: semesterKeys.bySession(sessionId!),
        queryFn: () => dummySemesterApi.listBySession(sessionId!),
        select: (res) => res.data,
        enabled: !!sessionId,
    });
}

export function useCreateSemester() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSemesterPayload) =>
            dummySemesterApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: semesterKeys.bySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteSemester(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummySemesterApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: semesterKeys.bySession(sessionId),
            });
        },
    });
}

export function useActivateSemester(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummySemesterApi.activate(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: semesterKeys.bySession(sessionId),
            });
            qc.invalidateQueries({ queryKey: sessionKeys.all });
        },
    });
}
