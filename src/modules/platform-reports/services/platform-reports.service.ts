import apiClient from "@/lib/clients/apiClient"
import type {
  GenerateReportPayload,
  ReportFormat,
  ReportRun,
  ReportRunDetail,
  ReportRunPage,
  ReportSchedule,
  ReportTemplate,
} from "@/modules/platform-reports/types"

const AUTH = { access_token: true } as const

export const platformReportKeys = {
  all: ["platform", "reports"] as const,
  templates: () => [...platformReportKeys.all, "templates"] as const,
  runs: (status: string, page: number) =>
    [...platformReportKeys.all, "runs", status, page] as const,
  schedules: () => [...platformReportKeys.all, "schedules"] as const,
}

export const platformReportsService = {
  templates: async (): Promise<{
    templates: ReportTemplate[]
    formats: ReportFormat[]
  }> => {
    const res = await apiClient.get<{
      data: ReportTemplate[]
      meta: { formats: ReportFormat[] }
    }>("/platform/reports/templates", AUTH)

    return { templates: res.data, formats: res.meta.formats }
  },

  runs: async (params: {
    status?: string
    page?: number
  }): Promise<ReportRunPage> => {
    const query = new URLSearchParams()
    if (params.status) query.set("status", params.status)
    if (params.page) query.set("page", String(params.page))

    return apiClient.get<ReportRunPage>(
      `/platform/reports?${query.toString()}`,
      AUTH
    )
  },

  generate: async (payload: GenerateReportPayload): Promise<ReportRun> =>
    (
      await apiClient.post<{ data: ReportRun }, GenerateReportPayload>(
        "/platform/reports",
        payload,
        AUTH
      )
    ).data,

  /**
   * One run, with its contents.
   *
   * Separate from the list because building a report's tables is real work,
   * and the list would become expensive for data nobody has asked to see.
   */
  show: async (id: number): Promise<ReportRunDetail> =>
    (
      await apiClient.get<{ data: ReportRunDetail }>(
        `/platform/reports/${id}`,
        {
          access_token: true,
        }
      )
    ).data,

  rerun: async (id: number): Promise<ReportRun> =>
    (
      await apiClient.post<{ data: ReportRun }>(
        `/platform/reports/${id}/rerun`,
        {},
        AUTH
      )
    ).data,

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/platform/reports/${id}`, AUTH)
  },

  schedules: async (): Promise<ReportSchedule[]> =>
    (
      await apiClient.get<{ data: ReportSchedule[] }>(
        "/platform/reports/schedules",
        AUTH
      )
    ).data,

  updateSchedule: async (
    id: number,
    payload: { isActive?: boolean }
  ): Promise<void> => {
    await apiClient.patch(`/platform/reports/schedules/${id}`, payload, AUTH)
  },

  destroySchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/platform/reports/schedules/${id}`, AUTH)
  },

  /**
   * Fetch the artefact as a blob and hand it to the browser.
   *
   * Not a plain <a href>: the API needs the bearer token, and a link carries
   * no headers — it would 401 and the operator would see a broken download
   * with no explanation. Fetching it here also means the download is
   * attributable, which matters because opening a report is an audited event.
   */
  download: async (run: {
    id: number
    reference: string
    format: string
  }): Promise<void> => {
    const blob = await apiClient.get<Blob>(
      `/platform/reports/${run.id}/download`,
      { ...AUTH, responseType: "blob" }
    )

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${run.reference}.${run.format.toLowerCase()}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
