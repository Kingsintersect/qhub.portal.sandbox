// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { academicSessionApi } from "../services/feeManagementApi";
// import type { CreateAcademicSessionPayload, UpdateAcademicSessionPayload } from "../types";

// export const sessionKeys = {
//     all: ["academic-sessions"] as const,
//     detail: (id: string) => ["academic-sessions", id] as const,
// };

// export function useAcademicSessions() {
//     return useQuery({
//         queryKey: sessionKeys.all,
//         queryFn: () => academicSessionApi.list(),
//         select: (res) => res.data,
//     });
// }

// export function useAcademicSession(id: string) {
//     return useQuery({
//         queryKey: sessionKeys.detail(id),
//         queryFn: () => academicSessionApi.getById(id),
//         select: (res) => res.data,
//         enabled: !!id,
//     });
// }

// export function useCreateSession() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: CreateAcademicSessionPayload) =>
//             academicSessionApi.create(payload),
//         onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
//     });
// }

// export function useUpdateSession() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: ({
//             id,
//             payload,
//         }: {
//             id: string;
//             payload: UpdateAcademicSessionPayload;
//         }) => academicSessionApi.update(id, payload),
//         onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
//     });
// }

// export function useDeleteSession() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (id: string) => academicSessionApi.delete(id),
//         onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
//     });
// }

// export function useActivateSession() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (id: string) => academicSessionApi.activate(id),
//         onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
//     });
// }




// RUNNING ON DUMMY DATA FROM HERE
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dummySessionApi } from "../services/dummyData";
import type {
    CreateAcademicSessionPayload,
    UpdateAcademicSessionPayload,
} from "../types";

export const sessionKeys = {
    all: ["academic-sessions"] as const,
    detail: (id: string) => ["academic-sessions", id] as const,
};

export function useAcademicSessions() {
    return useQuery({
        queryKey: sessionKeys.all,
        queryFn: () => dummySessionApi.list(),
        select: (res) => res.data,
    });
}

export function useCreateSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAcademicSessionPayload) =>
            dummySessionApi.create(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
    });
}

export function useDeleteSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummySessionApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
    });
}

export function useActivateSession() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummySessionApi.activate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
    });
}
