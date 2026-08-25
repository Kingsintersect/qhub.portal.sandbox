"use client"

import { useQuery } from "@tanstack/react-query"

import { institutionKeys } from "@/modules/institutions/hooks/query-keys"
import { institutionsService } from "@/modules/institutions/services/institutions.service"
import type { InstitutionListFilters } from "@/modules/institutions/types"

export function useInstitutions(filters: InstitutionListFilters = {}) {
  return useQuery({
    queryKey: institutionKeys.list(filters),
    queryFn: () => institutionsService.list(filters),
  })
}

export function useInstitution(id: number) {
  return useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: () => institutionsService.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
