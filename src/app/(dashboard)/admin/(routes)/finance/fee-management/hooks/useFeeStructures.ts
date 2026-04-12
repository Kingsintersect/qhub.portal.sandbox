import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    feeManagementKeys,
    feeManagementMutationOptions,
    feeManagementQueryOptions,
} from "@/services/feeManagementApi";
import type { CreateFeeStructurePayload } from "@/types/school";

export function useFeeStructures(sessionId: string | null) {
    return useQuery({
        ...feeManagementQueryOptions.feeStructuresBySession(sessionId!),
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 2,
    });
}

export function usePrograms() {
    return useQuery({
        ...feeManagementQueryOptions.programs(),
        staleTime: 1000 * 60 * 30,
    });
}

export function useCreateFeeStructure() {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.createFeeStructure(),
        onSuccess: async (_data, variables: CreateFeeStructurePayload) => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.feeStructuresBySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteFeeStructure(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.deleteFeeStructure(),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.feeStructuresBySession(sessionId),
            });
        },
    });
}
