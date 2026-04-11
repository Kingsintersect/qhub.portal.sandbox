/* ------------------------------------------------------------------ */
/*  Admission Module — API Service (Mock-Ready)                        */
/*                                                                     */
/*  Replace the mock implementations with real apiClient calls when    */
/*  connecting to the live backend. The interface stays the same.      */
/* ------------------------------------------------------------------ */

import {
    createApiMutationOptions,
    createApiQueryOptions,
} from "@/lib/clients/apiClient";
import type {
    AdmissionStudent,
    FeeSchedule,
    PaymentInitiationResponse,
    PaymentVerificationResponse,
} from "../types/admission";
import { ACCEPTANCE_FEE_AMOUNT, APPLICATION_FEE_AMOUNT } from "@/config/global.config";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                           */
/* ------------------------------------------------------------------ */

const MOCK_FEES: FeeSchedule = {
    session: "2025/2026",
    fees: [
        {
            id: "fee-app-001",
            name: "Application Fee",
            slug: "application_fee",
            amount: 10_000,
            currency: "NGN",
            description: "Non-refundable admission application processing fee",
        },
        {
            id: "fee-acc-001",
            name: "Acceptance Fee",
            slug: "acceptance_fee",
            amount: 30_000,
            currency: "NGN",
            description: "Fee to accept your admission offer",
        },
        {
            id: "fee-tui-001",
            name: "Tuition Fee",
            slug: "tuition_fee",
            amount: 195_000,
            currency: "NGN",
            description: "Full session tuition — unlocks courses and LMS access",
        },
    ],
};

let mockStudent: AdmissionStudent = {
    id: "std-001",
    name: "Chukwuemeka Okonkwo",
    email: "c.okonkwo@students.unilag.edu.ng",
    department: "Computer Science",
    faculty: "Science",
    application_payment_status: "unpaid",
    application_status: "not_started",
    admission_status: "pending",
    acceptance_payment_status: "unpaid",
    tuition_payment_status: "unpaid",
    tuition_amount_paid: 0,
    has_applied: false,
    is_admitted: false,
    session: "2025/2026",
};

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export const admissionService = {
    /* ---------- Fees ---------- */
    async fetchFees(): Promise<FeeSchedule> {
        // TODO: replace with → apiClient.get<FeeSchedule>("/admission/fees", { access_token: true })
        await delay(800);
        return MOCK_FEES;
    },

    /* ---------- Student Data ---------- */
    async fetchStudentAdmission(): Promise<AdmissionStudent> {
        // TODO: replace with → apiClient.get<AdmissionStudent>("/admission/student", { access_token: true })
        await delay(600);
        return { ...mockStudent };
    },

    /* ---------- Initiate Application Payment ---------- */
    async initiateApplicationPayment(): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/application/initiate", {}, { access_token: true })
        await delay(1200);
        const ref = `QHUB-APP-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${APPLICATION_FEE_AMOUNT}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Application Payment ---------- */
    async verifyApplicationPayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/application/verify", { reference }, { access_token: true })
        await delay(1500);
        // Simulate success — update mock state
        mockStudent = {
            ...mockStudent,
            application_payment_status: "paid",
        };
        return {
            success: true,
            status: "paid",
            reference,
            amount: APPLICATION_FEE_AMOUNT,
            message: "Application payment verified successfully",
        };
    },

    /* ---------- Initiate Acceptance Fee Payment ---------- */
    async initiateAcceptanceFeePayment(): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/acceptance/initiate", {}, { access_token: true })
        await delay(1200);
        const ref = `QHUB-ACC-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${ACCEPTANCE_FEE_AMOUNT}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Acceptance Fee Payment ---------- */
    async verifyAcceptanceFeePayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/acceptance/verify", { reference }, { access_token: true })
        await delay(1500);
        mockStudent = {
            ...mockStudent,
            acceptance_payment_status: "paid",
            admission_status: "accepted",
        };
        return {
            success: true,
            status: "paid",
            reference,
            amount: 30_000,
            message: "Acceptance fee payment verified successfully",
        };
    },

    /* ---------- Initiate Tuition Payment ---------- */
    async initiateTuitionPayment(amount: number): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/tuition/initiate", { amount }, { access_token: true })
        await delay(1200);
        const ref = `QHUB-TUI-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${amount}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Tuition Payment ---------- */
    async verifyTuitionPayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/tuition/verify", { reference }, { access_token: true })
        await delay(1500);
        // Simulate: extract amount from reference URL or use a fixed mock amount
        const TUITION_TOTAL = 195_000;
        // For mock, assume each verify adds half if partial, or full
        const paymentAmount = mockStudent.tuition_amount_paid === 0
            ? (mockStudent.tuition_amount_paid + TUITION_TOTAL) // Will be overridden by actual gateway amount
            : TUITION_TOTAL - mockStudent.tuition_amount_paid;
        const newTotal = Math.min(mockStudent.tuition_amount_paid + paymentAmount, TUITION_TOTAL);
        mockStudent = {
            ...mockStudent,
            tuition_amount_paid: newTotal,
            tuition_payment_status: newTotal >= TUITION_TOTAL ? "paid" : "partial",
        };
        return {
            success: true,
            status: newTotal >= TUITION_TOTAL ? "paid" : "partial",
            reference,
            amount: paymentAmount,
            message: newTotal >= TUITION_TOTAL
                ? "Tuition payment completed"
                : `Partial payment received. ₦${(TUITION_TOTAL - newTotal).toLocaleString()} remaining.`,
        };
    },

    /* ---------- Dev-only: Simulate status changes ---------- */
    async devSimulateAppPaymentPaid(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            application_payment_status: "paid",
        };
        return { ...mockStudent };
    },

    async devSimulateApplied(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            has_applied: true,
            application_status: "submitted",
        };
        return { ...mockStudent };
    },

    async devSimulateAdmissionOffered(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            admission_status: "offered",
            is_admitted: true,
        };
        return { ...mockStudent };
    },

    async devSimulateAdmissionAccepted(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            admission_status: "accepted",
            acceptance_payment_status: "paid",
        };
        return { ...mockStudent };
    },

    async devSimulateTuitionPaid(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            tuition_payment_status: "paid",
            tuition_amount_paid: 195_000,
        };
        return { ...mockStudent };
    },

    async devResetAll(): Promise<AdmissionStudent> {
        await delay(300);
        mockStudent = {
            id: "std-001",
            name: "Chukwuemeka Okonkwo",
            email: "c.okonkwo@students.unilag.edu.ng",
            department: "Computer Science",
            faculty: "Science",
            application_payment_status: "unpaid",
            application_status: "not_started",
            admission_status: "pending",
            acceptance_payment_status: "unpaid",
            tuition_payment_status: "unpaid",
            tuition_amount_paid: 0,
            has_applied: false,
            is_admitted: false,
            session: "2025/2026",
        };
        return { ...mockStudent };
    },
};

export const admissionKeys = {
    all: ["admission"] as const,
    fees: () => [...admissionKeys.all, "fees"] as const,
    student: () => [...admissionKeys.all, "student"] as const,
    verifyAppPayment: (reference: string) =>
        [...admissionKeys.all, "verify-app", reference] as const,
    verifyAccPayment: (reference: string) =>
        [...admissionKeys.all, "verify-acc", reference] as const,
    verifyTuiPayment: (reference: string) =>
        [...admissionKeys.all, "verify-tui", reference] as const,
};

export const admissionQueryOptions = {
    fees: () =>
        createApiQueryOptions({
            queryKey: admissionKeys.fees(),
            queryFn: admissionService.fetchFees,
        }),

    student: () =>
        createApiQueryOptions({
            queryKey: admissionKeys.student(),
            queryFn: admissionService.fetchStudentAdmission,
        }),

    verifyApplicationPayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyAppPayment(reference),
            queryFn: () => admissionService.verifyApplicationPayment(reference),
        }),

    verifyAcceptanceFeePayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyAccPayment(reference),
            queryFn: () => admissionService.verifyAcceptanceFeePayment(reference),
        }),

    verifyTuitionPayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyTuiPayment(reference),
            queryFn: () => admissionService.verifyTuitionPayment(reference),
        }),
};

export const admissionMutationOptions = {
    initiateApplicationPayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, void>({
            mutationKey: [...admissionKeys.all, "payments", "application", "initiate"],
            mutationFn: () => admissionService.initiateApplicationPayment(),
        }),

    initiateAcceptanceFeePayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, void>({
            mutationKey: [...admissionKeys.all, "payments", "acceptance", "initiate"],
            mutationFn: () => admissionService.initiateAcceptanceFeePayment(),
        }),

    initiateTuitionPayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, number>({
            mutationKey: [...admissionKeys.all, "payments", "tuition", "initiate"],
            mutationFn: admissionService.initiateTuitionPayment,
        }),

    simulateAppPaymentPaid: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "app-paid"],
            mutationFn: () => admissionService.devSimulateAppPaymentPaid(),
        }),

    simulateApplied: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "applied"],
            mutationFn: () => admissionService.devSimulateApplied(),
        }),

    simulateOffered: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "offered"],
            mutationFn: () => admissionService.devSimulateAdmissionOffered(),
        }),

    simulateAccepted: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "accepted"],
            mutationFn: () => admissionService.devSimulateAdmissionAccepted(),
        }),

    simulateTuitionPaid: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "tuition-paid"],
            mutationFn: () => admissionService.devSimulateTuitionPaid(),
        }),

    resetAll: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "reset"],
            mutationFn: () => admissionService.devResetAll(),
        }),
};
