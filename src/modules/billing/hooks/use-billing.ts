"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  billingKeys,
  billingService,
} from "@/modules/billing/services/billing.service"

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingService.plans(),
  })
}

export function useSubscriptions(
  params: { status?: string; tenantId?: number } = {}
) {
  return useQuery({
    queryKey: billingKeys.subscriptions(params),
    queryFn: () => billingService.subscriptions(params),
  })
}

export function useInvoices(
  params: { status?: string; tenantId?: number } = {}
) {
  return useQuery({
    queryKey: billingKeys.invoices(params),
    queryFn: () => billingService.invoices(params),
  })
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: billingKeys.invoice(id ?? 0),
    queryFn: () => billingService.invoice(id as number),
    enabled: id !== null && id > 0,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billingService.createPlan,
    onSuccess: () => {
      toast.success("Plan created")
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("Could not create that plan", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useUpdatePlan(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof billingService.updatePlan>[1]) =>
      billingService.updatePlan(id, payload),
    onSuccess: () => {
      // Price changes apply to future invoices only; issued ones hold their
      // own amounts and are never recomputed.
      toast.success("Plan updated", {
        description: "Applies to invoices raised from now on.",
      })
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("Could not update that plan", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billingService.createSubscription,
    onSuccess: () => {
      toast.success("Subscription started")
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("Could not start that subscription", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => billingService.cancelSubscription(id),
    onSuccess: () => {
      // Say what actually happens, not just "cancelled" — nothing is deleted,
      // the portal goes read-only, and that is the difference an operator
      // needs to be sure of before they click it.
      toast.success("Subscription cancelled — their portal goes read-only")
      void queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: () => toast.error("Could not cancel that subscription"),
  })
}

export function useUpdateSubscription(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      planId?: number
      status?: string
      trialEndsOn?: string | null
    }) => billingService.updateSubscription(id, payload),
    onSuccess: () => {
      toast.success("Subscription updated")
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("Could not update that subscription", {
        description: errorMessage(error, "The change was not applied."),
      }),
  })
}

export function useRecordPayment(invoiceId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      amountMinor: number
      method?: string
      reference?: string | null
      receivedOn?: string
    }) => billingService.recordPayment(invoiceId, payload),
    onSuccess: () => {
      toast.success("Payment recorded")
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      // The API refuses an overpayment rather than absorbing it, and that
      // refusal is the useful message — surface it rather than a generic one.
      toast.error("Could not record that payment", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useVoidInvoice(invoiceId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reason: string) =>
      billingService.voidInvoice(invoiceId, reason),
    onSuccess: () => {
      toast.success("Invoice voided")
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("Could not void that invoice", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

export function useRunBilling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => billingService.run(),
    onSuccess: (result) => {
      // Reported honestly, including the failures. A billing run that quietly
      // half-worked is the kind of thing nobody notices for a month.
      toast.success(
        result.invoiced === 0
          ? "Nothing was due"
          : `Raised ${result.invoiced} invoice${result.invoiced === 1 ? "" : "s"}`,
        {
          description:
            result.failed > 0
              ? `${result.failed} institution${result.failed === 1 ? "" : "s"} failed — check the logs.`
              : undefined,
        }
      )
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error("The billing run did not complete", {
        description: errorMessage(error, "Try again."),
      }),
  })
}

/**
 * Chase an unpaid invoice.
 *
 * The API allows one a day per invoice; the button reads "Reminded today"
 * afterwards so nobody chases the same institution twice in an afternoon.
 */
export function useSendReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => billingService.sendReminder(id),
    onSuccess: () => {
      toast.success("Reminder sent.")
      void queryClient.invalidateQueries({ queryKey: billingKeys.all })
    },
    onError: (error) =>
      toast.error(
        (error as { message?: string } | null)?.message ??
          "That reminder could not be sent."
      ),
  })
}
