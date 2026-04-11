// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { feeStructureApi, programApi } from "../services/feeManagementApi";
// import type { CreateFeeStructurePayload } from "../types";

// export const feeStructureKeys = {
//     bySession: (sessionId: string) =>
//         ["fee-structures", { sessionId }] as const,
// };

// export function useFeeStructures(sessionId: string | null) {
//     return useQuery({
//         queryKey: feeStructureKeys.bySession(sessionId!),
//         queryFn: () => feeStructureApi.listBySession(sessionId!),
//         select: (res) => res.data,
//         enabled: !!sessionId,
//     });
// }

// export function usePrograms() {
//     return useQuery({
//         queryKey: ["programs"],
//         queryFn: () => programApi.list(),
//         select: (res) => res.data,
//     });
// }

// export function useCreateFeeStructure() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: CreateFeeStructurePayload) =>
//             feeStructureApi.create(payload),
//         onSuccess: (_data, variables) => {
//             qc.invalidateQueries({
//                 queryKey: feeStructureKeys.bySession(variables.academic_session_id),
//             });
//         },
//     });
// }

// export function useDeleteFeeStructure(sessionId: string) {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (id: string) => feeStructureApi.delete(id),
//         onSuccess: () => {
//             qc.invalidateQueries({
//                 queryKey: feeStructureKeys.bySession(sessionId),
//             });
//         },
//     });
// }


// RUNNING IN DUMMY DATA FROM HERE
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    dummyFeeStructureApi,
    dummyProgramApi,
} from "@/services/dummyData";
import type { CreateFeeStructurePayload } from "@/types/school";

export const feeStructureKeys = {
    bySession: (sessionId: string) =>
        ["fee-structures", { sessionId }] as const,
};

export function useFeeStructures(sessionId: string | null) {
    return useQuery({
        queryKey: feeStructureKeys.bySession(sessionId!),
        queryFn: () => dummyFeeStructureApi.listBySession(sessionId!),
        select: (res) => res.data,
        enabled: !!sessionId,
    });
}

export function usePrograms() {
    return useQuery({
        queryKey: ["programs"],
        queryFn: () => dummyProgramApi.list(),
        select: (res) => res.data,
    });
}

export function useCreateFeeStructure() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFeeStructurePayload) =>
            dummyFeeStructureApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: feeStructureKeys.bySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteFeeStructure(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummyFeeStructureApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: feeStructureKeys.bySession(sessionId),
            });
        },
    });
}