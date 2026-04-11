/* ------------------------------------------------------------------ */
/*  Admission Module — React Query Hooks                               */
/* ------------------------------------------------------------------ */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admissionService } from "../services/admissionService";
import { useAdmissionStore } from "../store/admissionStore";
import type {
    PaymentInitiationResponse,
    PaymentVerificationResponse,
} from "../types/admission";

/* ------------------------------------------------------------------ */
/*  Query Keys                                                          */
/* ------------------------------------------------------------------ */

export const admissionKeys = {
    all: ["admission"] as const,
    fees: () => [...admissionKeys.all, "fees"] as const,
    student: () => [...admissionKeys.all, "student"] as const,
    verifyAppPayment: (ref: string) => [...admissionKeys.all, "verify-app", ref] as const,
    verifyAccPayment: (ref: string) => [...admissionKeys.all, "verify-acc", ref] as const,
    verifyTuiPayment: (ref: string) => [...admissionKeys.all, "verify-tui", ref] as const,
};

/* ------------------------------------------------------------------ */
/*  Fetch Fees                                                          */
/* ------------------------------------------------------------------ */

export function useFees() {
    const setFees = useAdmissionStore((s) => s.setFees);

    return useQuery({
        queryKey: admissionKeys.fees(),
        queryFn: async () => {
            const data = await admissionService.fetchFees();
            setFees(data);
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 min
    });
}

/* ------------------------------------------------------------------ */
/*  Fetch Student Admission Data                                        */
/* ------------------------------------------------------------------ */

export function useStudentAdmission() {
    const setStudent = useAdmissionStore((s) => s.setStudent);

    return useQuery({
        queryKey: admissionKeys.student(),
        queryFn: async () => {
            const data = await admissionService.fetchStudentAdmission();
            setStudent(data);
            return data;
        },
        staleTime: 1000 * 60 * 1, // 1 min
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Application Payment                                        */
/* ------------------------------------------------------------------ */

export function useInitiateApplicationPayment() {
    return useMutation<PaymentInitiationResponse, Error>({
        mutationFn: () => admissionService.initiateApplicationPayment(),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Application Payment                                          */
/* ------------------------------------------------------------------ */

export function useVerifyApplicationPayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery<PaymentVerificationResponse>({
        queryKey: admissionKeys.verifyAppPayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyApplicationPayment(reference);
            // Refetch student data so store is updated
            const updated = await admissionService.fetchStudentAdmission();
            setStudent(updated);
            queryClient.invalidateQueries({ queryKey: admissionKeys.student() });
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity, // Verify once
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Acceptance Fee Payment                                      */
/* ------------------------------------------------------------------ */

export function useInitiateAcceptanceFeePayment() {
    return useMutation<PaymentInitiationResponse, Error>({
        mutationFn: () => admissionService.initiateAcceptanceFeePayment(),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Acceptance Fee Payment                                        */
/* ------------------------------------------------------------------ */

export function useVerifyAcceptanceFeePayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery<PaymentVerificationResponse>({
        queryKey: admissionKeys.verifyAccPayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyAcceptanceFeePayment(reference);
            const updated = await admissionService.fetchStudentAdmission();
            setStudent(updated);
            queryClient.invalidateQueries({ queryKey: admissionKeys.student() });
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Tuition Payment                                             */
/* ------------------------------------------------------------------ */

export function useInitiateTuitionPayment() {
    return useMutation<PaymentInitiationResponse, Error, number>({
        mutationFn: (amount: number) => admissionService.initiateTuitionPayment(amount),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Tuition Payment                                               */
/* ------------------------------------------------------------------ */

export function useVerifyTuitionPayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery<PaymentVerificationResponse>({
        queryKey: admissionKeys.verifyTuiPayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyTuitionPayment(reference);
            const updated = await admissionService.fetchStudentAdmission();
            setStudent(updated);
            queryClient.invalidateQueries({ queryKey: admissionKeys.student() });
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/*  Dev-only mutations                                                   */
/* ------------------------------------------------------------------ */

export function useDevSimulate() {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: admissionKeys.student() });

    const simulateAppPaymentPaid = useMutation({
        mutationFn: () => admissionService.devSimulateAppPaymentPaid(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    const simulateApplied = useMutation({
        mutationFn: () => admissionService.devSimulateApplied(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    const simulateOffered = useMutation({
        mutationFn: () => admissionService.devSimulateAdmissionOffered(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    const simulateAccepted = useMutation({
        mutationFn: () => admissionService.devSimulateAdmissionAccepted(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    const simulateTuitionPaid = useMutation({
        mutationFn: () => admissionService.devSimulateTuitionPaid(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    const resetAll = useMutation({
        mutationFn: () => admissionService.devResetAll(),
        onSuccess: (data) => { setStudent(data); invalidate(); },
    });

    return { simulateAppPaymentPaid, simulateApplied, simulateOffered, simulateAccepted, simulateTuitionPaid, resetAll };
}
