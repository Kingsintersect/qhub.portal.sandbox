import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    feeManagementKeys,
    feeManagementMutationOptions,
    feeManagementQueryOptions,
} from "@/services/feeManagementApi";
import type { CreateOtherFeePayload } from "@/types/school";

export function useOtherFees(sessionId: string | null) {
    return useQuery({
        ...feeManagementQueryOptions.otherFeesBySession(sessionId!),
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateOtherFee() {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.createOtherFee(),
        onSuccess: async (_data, variables: CreateOtherFeePayload) => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.otherFeesBySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteOtherFee(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...feeManagementMutationOptions.deleteOtherFee(),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: feeManagementKeys.otherFeesBySession(sessionId),
            });
        },
    });
}
