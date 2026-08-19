import apiClient from "@/lib/clients/apiClient"
import type {
  CreateFeeTypeDto,
  FeeTypeResponse,
  ActivateFeeTypeResponse,
  GenerationStatusResponse,
  EligibleCountResponse,
  FeeCategory,
  StudentType,
  InvoiceResponse,
  ResolveInvoicesResponse,
  CollectionsSummaryResponse,
  OutstandingReportResponse,
  InitiatePaymentDto,
  InitiatePaymentResponse,
  VerifyPaymentResponse,
  PaymentHistoryResponse,
} from "../types"

const BASE = "/fees"
const AUTH = { access_token: true } as const

export const feeManagementService = {
  // ── Fee Types ────────────────────────────────────────────────────────────────

  listFeeTypes: (filters?: {
    sessionId?: number
    category?: string
    isActive?: boolean
  }) =>
    apiClient.get<FeeTypeResponse[]>(`${BASE}/types`, {
      ...AUTH,
      params: filters as Record<string, unknown>,
    }),

  getFeeType: (id: number) =>
    apiClient.get<FeeTypeResponse>(`${BASE}/types/${id}`, AUTH),

  createFeeType: (dto: CreateFeeTypeDto) =>
    apiClient.post<FeeTypeResponse>(`${BASE}/types`, dto, AUTH),

  updateFeeType: (id: number, dto: Partial<CreateFeeTypeDto>) =>
    apiClient.patch<FeeTypeResponse>(`${BASE}/types/${id}`, dto, AUTH),

  activateFeeType: (id: number) =>
    apiClient.post<ActivateFeeTypeResponse>(
      `${BASE}/types/${id}/activate`,
      undefined,
      AUTH
    ),

  deactivateFeeType: (id: number) =>
    apiClient.post<void>(`${BASE}/types/${id}/deactivate`, undefined, AUTH),

  deleteFeeType: (id: number) =>
    apiClient.delete<void>(`${BASE}/types/${id}`, AUTH),

  getGenerationStatus: (id: number) =>
    apiClient.get<GenerationStatusResponse>(
      `${BASE}/types/${id}/generation-status`,
      AUTH
    ),

  // Preview: estimated eligible student count for a given scope configuration.
  // Endpoint: GET /fees/types/eligible-count — pending backend implementation.
  // Returns gracefully if unavailable (retry: false in useEligibleCount hook).
  getEligibleCount: (filters: {
    category: FeeCategory
    sessionId?: number
    programId?: number
    levelId?: number
    studentType?: StudentType
  }) =>
    apiClient.get<EligibleCountResponse>(`${BASE}/types/eligible-count`, {
      ...AUTH,
      params: filters as Record<string, unknown>,
    }),

  // ── Invoices ────────────────────────────────────────────────────────────────

  listInvoices: (filters?: {
    status?: string
    feeTypeId?: number
    sessionId?: number
    studentId?: number
  }) =>
    apiClient.get<{ data: InvoiceResponse[] }>(`${BASE}/invoices`, {
      ...AUTH,
      params: filters as Record<string, unknown>,
    }),

  getInvoice: (id: number) =>
    apiClient.get<InvoiceResponse>(`${BASE}/invoices/${id}`, AUTH),

  getMyInvoices: () =>
    apiClient.get<{ data: InvoiceResponse[] }>(`${BASE}/invoices/my`, AUTH),

  getStudentInvoices: (studentId: number) =>
    apiClient.get<{ data: InvoiceResponse[] }>(
      `${BASE}/invoices/student/${studentId}`,
      AUTH
    ),

  getOverdueInvoices: () =>
    apiClient.get<{ data: InvoiceResponse[] }>(
      `${BASE}/invoices/overdue`,
      AUTH
    ),

  resolveInvoices: () =>
    apiClient.post<ResolveInvoicesResponse>(
      `${BASE}/invoices/resolve`,
      undefined,
      AUTH
    ),

  waiveInvoice: (id: number, reason: string) =>
    apiClient.post<void>(`${BASE}/invoices/${id}/waive`, { reason }, AUTH),

  cancelInvoice: (id: number) =>
    apiClient.post<void>(`${BASE}/invoices/${id}/cancel`, undefined, AUTH),

  // ── Payments ─────────────────────────────────────────────────────────────────

  initiatePayment: (dto: InitiatePaymentDto) =>
    apiClient.post<InitiatePaymentResponse>(
      `${BASE}/payments/initiate`,
      dto,
      AUTH
    ),

  verifyPayment: (reference: string) =>
    apiClient.post<VerifyPaymentResponse>(
      `${BASE}/payments/verify/${reference}`,
      undefined,
      AUTH
    ),

  getInvoicePaymentHistory: (invoiceId: number) =>
    apiClient.get<PaymentHistoryResponse>(
      `${BASE}/payments/invoice/${invoiceId}`,
      AUTH
    ),

  // ── Reports ─────────────────────────────────────────────────────────────────

  getCollectionsSummary: (filters?: {
    sessionId?: number
    feeTypeId?: number
  }) =>
    apiClient.get<CollectionsSummaryResponse>(`${BASE}/reports/summary`, {
      ...AUTH,
      params: filters as Record<string, unknown>,
    }),

  getOutstandingReport: () =>
    apiClient.get<OutstandingReportResponse>(
      `${BASE}/reports/outstanding`,
      AUTH
    ),
}
