import apiClient from "@/lib/clients/apiClient"
import type {
  BillingPlan,
  BillingRunResult,
  Invoice,
  InvoiceDetail,
  InvoiceList,
  Subscription,
} from "@/modules/billing/types"

const AUTH = { access_token: true } as const

export const billingService = {
  // --- Plans ---------------------------------------------------------------

  plans: async (): Promise<BillingPlan[]> =>
    (
      await apiClient.get<{ data: BillingPlan[] }>(
        "/platform/billing/plans",
        AUTH
      )
    ).data,

  createPlan: async (payload: {
    name: string
    code: string
    description?: string | null
    interval: string
    currency: string
    basePriceMinor: number
    includedStudents: number
    perStudentMinor: number
  }): Promise<BillingPlan> =>
    (
      await apiClient.post<{ data: BillingPlan }, typeof payload>(
        "/platform/billing/plans",
        payload,
        AUTH
      )
    ).data,

  updatePlan: async (
    id: number,
    payload: Partial<{
      name: string
      description: string | null
      basePriceMinor: number
      includedStudents: number
      perStudentMinor: number
      isActive: boolean
    }>
  ): Promise<BillingPlan> =>
    (
      await apiClient.patch<{ data: BillingPlan }, typeof payload>(
        `/platform/billing/plans/${id}`,
        payload,
        AUTH
      )
    ).data,

  // --- Subscriptions -------------------------------------------------------

  subscriptions: async (
    params: { status?: string; tenantId?: number } = {}
  ): Promise<Subscription[]> =>
    (
      await apiClient.get<{ data: Subscription[] }>(
        "/platform/billing/subscriptions",
        {
          ...AUTH,
          params,
        }
      )
    ).data,

  createSubscription: async (payload: {
    tenantId: number
    planId: number
    startedOn: string
    trialEndsOn?: string | null
  }): Promise<Subscription> =>
    (
      await apiClient.post<{ data: Subscription }, typeof payload>(
        "/platform/billing/subscriptions",
        payload,
        AUTH
      )
    ).data,

  updateSubscription: async (
    id: number,
    payload: { planId?: number; status?: string; trialEndsOn?: string | null }
  ): Promise<Subscription> =>
    (
      await apiClient.patch<{ data: Subscription }, typeof payload>(
        `/platform/billing/subscriptions/${id}`,
        payload,
        AUTH
      )
    ).data,

  // --- Invoices ------------------------------------------------------------

  invoices: (params: { status?: string; tenantId?: number } = {}) =>
    apiClient.get<InvoiceList>("/platform/billing/invoices", {
      ...AUTH,
      params,
    }),

  invoice: async (id: number): Promise<InvoiceDetail> =>
    (
      await apiClient.get<{ data: InvoiceDetail }>(
        `/platform/billing/invoices/${id}`,
        AUTH
      )
    ).data,

  recordPayment: async (
    id: number,
    payload: {
      amountMinor: number
      method?: string
      reference?: string | null
      receivedOn?: string
      notes?: string | null
    }
  ): Promise<Invoice> =>
    (
      await apiClient.post<{ data: Invoice }, typeof payload>(
        `/platform/billing/invoices/${id}/payments`,
        payload,
        AUTH
      )
    ).data,

  voidInvoice: async (id: number, reason: string): Promise<Invoice> =>
    (
      await apiClient.post<{ data: Invoice }, { reason: string }>(
        `/platform/billing/invoices/${id}/void`,
        { reason },
        AUTH
      )
    ).data,

  /** Raise whatever is due now. Safe to press twice. */
  run: async (): Promise<BillingRunResult> =>
    (
      await apiClient.post<{ data: BillingRunResult }, object>(
        "/platform/billing/invoices/run",
        {},
        AUTH
      )
    ).data,
}

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  subscriptions: (params: object) =>
    [...billingKeys.all, "subscriptions", params] as const,
  invoices: (params: object) =>
    [...billingKeys.all, "invoices", params] as const,
  invoice: (id: number) => [...billingKeys.all, "invoice", id] as const,
}
