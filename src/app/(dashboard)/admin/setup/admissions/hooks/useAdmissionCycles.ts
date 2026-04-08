import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    dummyAdmissionCycleApi,
} from "../../../services/dummyData";
import type {
    AdmissionStatus,
    CreateAdmissionCyclePayload,
    UpdateAdmissionCyclePayload,
} from "../../../types";

export const admissionCycleKeys = {
    bySession: (sessionId: string) =>
        ["admission-cycles", { sessionId }] as const,
    detail: (id: string) => ["admission-cycles", id] as const,
};

export function useAdmissionCycles(sessionId: string | null) {
    return useQuery({
        queryKey: admissionCycleKeys.bySession(sessionId!),
        queryFn: () => dummyAdmissionCycleApi.listBySession(sessionId!),
        select: (res) => res.data,
        enabled: !!sessionId,
    });
}

export function useAdmissionCycle(id: string | null) {
    return useQuery({
        queryKey: admissionCycleKeys.detail(id!),
        queryFn: () => dummyAdmissionCycleApi.getById(id!),
        select: (res) => res.data,
        enabled: !!id,
    });
}

export function useCreateAdmissionCycle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAdmissionCyclePayload) =>
            dummyAdmissionCycleApi.create(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: admissionCycleKeys.bySession(variables.academic_session_id),
            });
        },
    });
}

export function useUpdateAdmissionCycle(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAdmissionCyclePayload }) =>
            dummyAdmissionCycleApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: admissionCycleKeys.bySession(sessionId),
            });
        },
    });
}

export function useDeleteAdmissionCycle(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => dummyAdmissionCycleApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: admissionCycleKeys.bySession(sessionId),
            });
        },
    });
}

export function useUpdateAdmissionStatus(sessionId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: AdmissionStatus }) =>
            dummyAdmissionCycleApi.updateStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: admissionCycleKeys.bySession(sessionId),
            });
        },
    });
}
