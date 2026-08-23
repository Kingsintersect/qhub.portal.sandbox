"use client"

import { useQuery } from "@tanstack/react-query"
import { feeManagementService } from "../services/fee-management.service"
import { feeKeys } from "./query-keys"

export function useMyInvoices() {
  return useQuery({
    queryKey: feeKeys.myInvoices(),
    queryFn: feeManagementService.getMyInvoices,
  })
}

export function useInvoices(filters?: {
  status?: string
  feeTypeId?: number
  sessionId?: number
  studentId?: number
}) {
  return useQuery({
    queryKey: feeKeys.invoices(filters as Record<string, unknown>),
    queryFn: () => feeManagementService.listInvoices(filters),
    staleTime: 1000 * 60,
  })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: feeKeys.invoice(id),
    queryFn: () => feeManagementService.getInvoice(id),
    enabled: !!id,
  })
}

export function useOverdueInvoices() {
  return useQuery({
    queryKey: feeKeys.overdueInvoices(),
    queryFn: feeManagementService.getOverdueInvoices,
    staleTime: 1000 * 60 * 2,
  })
}

export function useStudentInvoices(studentId: number) {
  return useQuery({
    queryKey: feeKeys.studentInvoices(studentId),
    queryFn: () => feeManagementService.getStudentInvoices(studentId),
    enabled: !!studentId,
  })
}
