"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  infrastructureKeys,
  infrastructureService,
} from "@/modules/platform-infrastructure/services/infrastructure.service"

/**
 * The API's own words when it has them.
 *
 * A refused operation answers with why — "writes are not enabled for this
 * institution" is something the operator can fix in one click, and a generic
 * fallback would throw that away.
 */
function errorMessage(error: unknown, fallback: string): string {
  const data = (
    error as {
      response?: { data?: { error?: { message?: string }; message?: string } }
    }
  )?.response?.data

  return data?.error?.message ?? data?.message ?? fallback
}

export function useInfrastructure(tenantId: number) {
  return useQuery({
    queryKey: infrastructureKeys.tenant(tenantId),
    queryFn: () => infrastructureService.show(tenantId),
    enabled: Number.isFinite(tenantId) && tenantId > 0,
    // The write window runs down on the clock, so the panel has to notice it
    // running out rather than keep offering operations that will be refused.
    refetchInterval: 30_000,
  })
}

/**
 * The named operations.
 *
 * One hook for all of them because they share a failure mode worth handling
 * once: the API refuses with a 409 when writes are not open, and that refusal
 * should read as "enable writes", not as "the console is broken".
 */
export function useInfrastructureOperation(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (op: {
      kind: "enableWrites" | "disableWrites" | "migrate" | "backup" | "rotate"
    }) => {
      switch (op.kind) {
        case "enableWrites":
          return infrastructureService.enableWrites(tenantId)
        case "disableWrites":
          return infrastructureService.disableWrites(tenantId)
        case "migrate":
          return infrastructureService.migrate(tenantId)
        case "backup":
          return infrastructureService.backup(tenantId)
        case "rotate":
          return infrastructureService.rotate(tenantId)
      }
    },
    onSuccess: (_result, op) => {
      const said: Record<typeof op.kind, string> = {
        enableWrites: "Writes enabled for this session",
        disableWrites: "Writes closed",
        migrate: "Pending migrations run",
        backup: "Backup taken",
        rotate: "Credentials rotated — the old one is valid for 24 hours",
      }

      toast.success(said[op.kind])
      void queryClient.invalidateQueries({
        queryKey: infrastructureKeys.tenant(tenantId),
      })
    },
    onError: (error) =>
      toast.error("That operation did not run", {
        description: errorMessage(error, "Nothing was changed."),
      }),
  })
}

export function useSetStorageQuota(tenantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bytes: number | null) =>
      infrastructureService.setQuota(tenantId, bytes),
    onSuccess: (_result, bytes) => {
      toast.success(bytes === null ? "Quota cleared" : "Quota set")
      void queryClient.invalidateQueries({
        queryKey: infrastructureKeys.tenant(tenantId),
      })
    },
    onError: (error) =>
      toast.error("Could not set that quota", {
        description: errorMessage(error, "The ceiling is unchanged."),
      }),
  })
}
