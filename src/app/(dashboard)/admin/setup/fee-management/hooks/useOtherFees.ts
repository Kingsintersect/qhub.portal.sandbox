import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dummyOtherFeeApi } from "../../../services/dummyData";
import type { CreateOtherFeePayload } from "../../../types";

export const otherFeeKeys = {
    bySession: (sessionId: string) =>
        ["other-fees", { sessionId }] as const,
};

export function useOtherFees(sessionId: string | null) {
    return useQuery({
        queryKey: otherFeeKeys.bySession(sessionId!),
        queryFn: () => dummyOtherFeeApi.listBySession(sessionId!),
        select: (res) => res.data,
        enabled: !!sessionId,
    });
}

export function useCreateOtherFee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateOtherFeePayload) =>
            dummyOtherFeeApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: otherFeeKeys.bySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteOtherFee(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummyOtherFeeApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: otherFeeKeys.bySession(sessionId),
            });
        },
    });
}
