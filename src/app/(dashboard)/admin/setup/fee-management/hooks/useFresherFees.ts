import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dummyFresherFeeApi } from "../../../services/dummyData";
import type { CreateFresherFeePayload } from "../../../types";

export const fresherFeeKeys = {
    bySession: (sessionId: string) =>
        ["fresher-fees", { sessionId }] as const,
};

export function useFresherFees(sessionId: string | null) {
    return useQuery({
        queryKey: fresherFeeKeys.bySession(sessionId!),
        queryFn: () => dummyFresherFeeApi.listBySession(sessionId!),
        select: (res) => res.data,
        enabled: !!sessionId,
    });
}

export function useCreateFresherFee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFresherFeePayload) =>
            dummyFresherFeeApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: fresherFeeKeys.bySession(variables.academic_session_id),
            });
        },
    });
}

export function useDeleteFresherFee(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummyFresherFeeApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: fresherFeeKeys.bySession(sessionId),
            });
        },
    });
}
