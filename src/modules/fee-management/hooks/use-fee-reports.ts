"use client"

import { useQuery } from "@tanstack/react-query"
import { feeManagementService } from "../services/fee-management.service"
import { feeKeys } from "./query-keys"

export function useCollectionsSummary(filters?: {
  sessionId?: number
  feeTypeId?: number
}) {
  return useQuery({
    queryKey: feeKeys.collectionsSummary(filters as Record<string, unknown>),
    queryFn: () => feeManagementService.getCollectionsSummary(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useOutstandingReport() {
  return useQuery({
    queryKey: feeKeys.outstandingReport(),
    queryFn: feeManagementService.getOutstandingReport,
    staleTime: 1000 * 60 * 2,
  })
}
