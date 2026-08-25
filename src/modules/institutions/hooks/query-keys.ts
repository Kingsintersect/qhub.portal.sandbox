import type { InstitutionListFilters } from "@/modules/institutions/types"

export const institutionKeys = {
  all: ["institutions"] as const,
  lists: () => [...institutionKeys.all, "list"] as const,
  list: (filters: InstitutionListFilters) =>
    [...institutionKeys.lists(), filters] as const,
  details: () => [...institutionKeys.all, "detail"] as const,
  detail: (id: number) => [...institutionKeys.details(), id] as const,
}
