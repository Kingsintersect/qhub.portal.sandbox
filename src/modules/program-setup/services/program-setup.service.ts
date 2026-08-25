import apiClient from "@/lib/clients/apiClient"
import type {
  AcademicUnit,
  GradingScheme,
  Program,
} from "@/modules/program-setup/types"

const AUTH = { access_token: true } as const

/**
 * Programme configuration for the institution the current host belongs to.
 * Tenant scoping is implicit — the API resolves the institution from the host.
 */
export const programSetupService = {
  listPrograms: async (): Promise<Program[]> => {
    const res = await apiClient.get<{ data: Program[] }>(
      "/academic/programs",
      AUTH
    )
    return res.data
  },

  listGradingSchemes: async (): Promise<GradingScheme[]> => {
    const res = await apiClient.get<{ data: GradingScheme[] }>(
      "/academic/grading-schemes",
      AUTH
    )
    return res.data
  },

  listAcademicUnits: async (): Promise<AcademicUnit[]> => {
    const res = await apiClient.get<{ data: AcademicUnit[] }>(
      "/academic/units",
      AUTH
    )
    return res.data
  },

  createProgram: async (payload: Record<string, unknown>): Promise<Program> => {
    const res = await apiClient.post<{ data: Program }>(
      "/academic/programs",
      payload,
      AUTH
    )
    return res.data
  },

  updateProgram: async (
    id: number,
    payload: Record<string, unknown>
  ): Promise<Program> => {
    const res = await apiClient.patch<{ data: Program }>(
      `/academic/programs/${id}`,
      payload,
      AUTH
    )
    return res.data
  },
}

export const programSetupKeys = {
  all: ["program-setup"] as const,
  programs: () => [...programSetupKeys.all, "programs"] as const,
  gradingSchemes: () => [...programSetupKeys.all, "grading-schemes"] as const,
  academicUnits: () => [...programSetupKeys.all, "academic-units"] as const,
}
