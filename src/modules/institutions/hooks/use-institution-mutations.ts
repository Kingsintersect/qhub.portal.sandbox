"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { institutionKeys } from "@/modules/institutions/hooks/query-keys"
import { institutionsService } from "@/modules/institutions/services/institutions.service"
import type {
  Institution,
  ProvisioningProgress,
  ProvisionInstitutionPayload,
  UpdateInstitutionStatusPayload,
} from "@/modules/institutions/types"
import { errorMessage } from "@/lib/api-error"

/** Pulls the API's message out of an axios-shaped error without assuming it. */

export function useProvisionInstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProvisionInstitutionPayload) =>
      institutionsService.provision(payload),
    onSuccess: (institution: Institution) => {
      toast.success(`${institution.name} is ready`, {
        description: `Its administrator can sign in at ${
          institution.domains[0]?.domain ?? institution.slug
        }.`,
      })
      queryClient.invalidateQueries({ queryKey: institutionKeys.lists() })
    },
    onError: (error) => {
      // Provisioning failures are the interesting ones — surface the API's
      // reason (which step failed) rather than a generic message.
      toast.error("Provisioning failed", {
        description: errorMessage(error, "Could not create the institution."),
      })
    },
  })
}

export function useUpdateInstitutionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateInstitutionStatusPayload
    }) => institutionsService.updateStatus(id, payload),
    onSuccess: (institution: Institution) => {
      toast.success(
        `${institution.name} is now ${institution.status.toLowerCase()}`
      )
      queryClient.invalidateQueries({ queryKey: institutionKeys.all })
    },
    onError: (error) => {
      toast.error("Could not change status", {
        description: errorMessage(error, "The change was not applied."),
      })
    },
  })
}

/**
 * How far a provisioning run has got.
 *
 * Polled rather than streamed: provisioning holds one PHP-FPM worker for its
 * whole duration and the poll lands on a different one, which is the only
 * reason the progress it reports is real rather than decorative.
 */
export function useProvisioningProgress(tenantId: number | null) {
  return useQuery({
    queryKey: ["platform", "provisioning", tenantId],
    queryFn: () => institutionsService.provisioning(tenantId as number),
    enabled: tenantId !== null && tenantId > 0,
    // Stop polling once there is nothing left to watch. A run waiting on a
    // person is not making progress, and neither is one that timed out.
    refetchInterval: (query: { state: { data?: ProvisioningProgress } }) => {
      const data = query.state.data

      if (!data) return 3_000

      const settled =
        data.status === "SUCCEEDED" ||
        data.status === "FAILED" ||
        data.timedOut ||
        data.awaitingCredential

      return settled ? false : 3_000
    },
  })
}

export function useResumeProvisioning(tenantId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) =>
      institutionsService.resumeProvisioning(tenantId as number, password),
    onSuccess: () => {
      toast.success("Credential stored — provisioning resumed")
      void queryClient.invalidateQueries({
        queryKey: ["platform", "provisioning", tenantId],
      })
    },
    onError: (error) =>
      toast.error("Could not resume provisioning", {
        description:
          (
            error as {
              response?: { data?: { error?: { message?: string } } }
            }
          )?.response?.data?.error?.message ?? "The run is unchanged.",
      }),
  })
}
