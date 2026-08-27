import apiClient from "@/lib/clients/apiClient"
import type {
  CourseImportPreview,
  CourseImportResult,
  DirectoryResult,
} from "@/modules/platform-operations/types"

const AUTH = { access_token: true } as const

/** Operations that reach inside an institution's own database. */
export const operationsService = {
  previewCourseImport: async (
    tenantId: number,
    file: File
  ): Promise<CourseImportPreview> => {
    const form = new FormData()
    form.append("file", file)

    return (
      await apiClient.post<{ data: CourseImportPreview }, FormData>(
        `/platform/tenants/${tenantId}/courses/preview`,
        form,
        // Imports run over the network against another database; the client's
        // 10s default is not enough for a real catalogue.
        { ...AUTH, timeout: 120_000 }
      )
    ).data
  },

  importCourses: async (
    tenantId: number,
    file: File
  ): Promise<CourseImportResult> => {
    const form = new FormData()
    form.append("file", file)

    return (
      await apiClient.post<{ data: CourseImportResult }, FormData>(
        `/platform/tenants/${tenantId}/courses/import`,
        form,
        { ...AUTH, timeout: 120_000 }
      )
    ).data
  },

  directory: (
    tenantId: number,
    params: { kind: "lecturers" | "students"; search?: string; limit?: number }
  ): Promise<DirectoryResult> =>
    apiClient.get<DirectoryResult>(`/platform/tenants/${tenantId}/directory`, {
      ...AUTH,
      params,
    }),
}

export const operationsKeys = {
  all: ["platform-operations"] as const,
  directory: (tenantId: number, params: object) =>
    [...operationsKeys.all, "directory", tenantId, params] as const,
}
