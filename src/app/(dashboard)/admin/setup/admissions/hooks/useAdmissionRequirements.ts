import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dummyAdmissionRequirementApi } from "../../../services/dummyData";
import type { CreateAdmissionRequirementPayload } from "../../../types";

export const admissionRequirementKeys = {
    byCycle: (cycleId: string) =>
        ["admission-requirements", { cycleId }] as const,
};

export function useAdmissionRequirements(cycleId: string | null) {
    return useQuery({
        queryKey: admissionRequirementKeys.byCycle(cycleId!),
        queryFn: () => dummyAdmissionRequirementApi.listByCycle(cycleId!),
        select: (res) => res.data,
        enabled: !!cycleId,
    });
}

export function useCreateAdmissionRequirement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAdmissionRequirementPayload) =>
            dummyAdmissionRequirementApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: admissionRequirementKeys.byCycle(variables.admission_cycle_id),
            });
        },
    });
}

export function useDeleteAdmissionRequirement(cycleId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummyAdmissionRequirementApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: admissionRequirementKeys.byCycle(cycleId),
            });
        },
    });
}
