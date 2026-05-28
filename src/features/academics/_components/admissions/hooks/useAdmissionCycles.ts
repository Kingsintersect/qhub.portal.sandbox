import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    admissionSetupKeys,
    admissionSetupMutationOptions,
    admissionSetupQueryOptions,
} from "@/services/admissionSetupApi";
import type {
    AdmissionStatus,
    CreateAdmissionCyclePayload,
    UpdateAdmissionCyclePayload,
} from "@/types/school";

export function useAdmissionCycles(sessionId: string | null) {
    return useQuery({
        ...admissionSetupQueryOptions.cyclesBySession(sessionId!),
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useAdmissionCycle(id: string | null) {
    return useQuery({
        ...admissionSetupQueryOptions.cycleDetail(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateAdmissionCycle() {
    const qc = useQueryClient();
    return useMutation({
        ...admissionSetupMutationOptions.createCycle(),
        onSuccess: async (_data, variables: CreateAdmissionCyclePayload) => {
            await qc.invalidateQueries({
                queryKey: admissionSetupKeys.cyclesBySession(variables.academic_session_id),
            });
        },
    });
}

export function useUpdateAdmissionCycle(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...admissionSetupMutationOptions.updateCycle(),
        onSuccess: async (_data, variables: { id: string; payload: UpdateAdmissionCyclePayload }) => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: admissionSetupKeys.cyclesBySession(sessionId),
                }),
                qc.invalidateQueries({
                    queryKey: admissionSetupKeys.cycleDetail(variables.id),
                }),
            ]);
        },
    });
}

export function useDeleteAdmissionCycle(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...admissionSetupMutationOptions.deleteCycle(),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: admissionSetupKeys.cyclesBySession(sessionId),
            });
        },
    });
}

export function useUpdateAdmissionStatus(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        ...admissionSetupMutationOptions.updateCycleStatus(),
        onSuccess: async (_data, variables: { id: string; status: AdmissionStatus }) => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: admissionSetupKeys.cyclesBySession(sessionId),
                }),
                qc.invalidateQueries({
                    queryKey: admissionSetupKeys.cycleDetail(variables.id),
                }),
            ]);
        },
    });
}
