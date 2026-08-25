"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { institutionKeys } from "@/modules/institutions/hooks/query-keys"
import { institutionsService } from "@/modules/institutions/services/institutions.service"
import type {
  Institution,
  ProvisionInstitutionPayload,
  UpdateInstitutionStatusPayload,
} from "@/modules/institutions/types"

/** Pulls the API's message out of an axios-shaped error without assuming it. */
function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

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
