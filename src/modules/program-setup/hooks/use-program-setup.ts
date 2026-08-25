"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  programSetupKeys,
  programSetupService,
} from "@/modules/program-setup/services/program-setup.service"
import type { Program } from "@/modules/program-setup/types"

export function usePrograms() {
  return useQuery({
    queryKey: programSetupKeys.programs(),
    queryFn: () => programSetupService.listPrograms(),
  })
}

export function useGradingSchemes() {
  return useQuery({
    queryKey: programSetupKeys.gradingSchemes(),
    queryFn: () => programSetupService.listGradingSchemes(),
    // Schemes are seeded at provisioning and change rarely.
    staleTime: 5 * 60 * 1000,
  })
}

export function useAcademicUnits() {
  return useQuery({
    queryKey: programSetupKeys.academicUnits(),
    queryFn: () => programSetupService.listAcademicUnits(),
    staleTime: 5 * 60 * 1000,
  })
}

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })
    ?.response
  return response?.data?.message ?? fallback
}

export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      programSetupService.createProgram(payload),
    onSuccess: (program: Program) => {
      toast.success(`${program.name} created`, {
        description: program.canOpenAdmission
          ? "It can accept applications now."
          : (program.admissionBlockReason ?? undefined),
      })
      queryClient.invalidateQueries({ queryKey: programSetupKeys.programs() })
    },
    onError: (error) => {
      toast.error("Could not create the programme", {
        description: errorMessage(error, "Check the form and try again."),
      })
    },
  })
}
