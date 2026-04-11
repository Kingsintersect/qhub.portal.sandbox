import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    feeManagementKeys,
    feeManagementMutationOptions,
    feeManagementQueryOptions,
} from "@/services/feeManagementApi";
import type { CreateFresherFeePayload } from "@/types/school";

export function useFresherFees(sessionId: string | null) {
    return useQuery({
        ...feeManagementQueryOptions.fresherFeesBySession(sessionId!),
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateFresherFee() {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.createFresherFee(),
        onSuccess: async (_data, variables: CreateFresherFeePayload) => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.fresherFeesBySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteFresherFee(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.deleteFresherFee(),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.fresherFeesBySession(sessionId),
            });
        },
    });
}
