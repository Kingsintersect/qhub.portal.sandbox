import apiClient, { RequestOptions } from "@/lib/clients/apiClient"
import type {
  AuditQueryParams,
  AuditLogsResponse,
  AuditEntityLog,
  AuditStats,
  AuditEntityType,
  AuditEntityLogsResponse,
} from "../types/audit.types"

/**
 * Audit API Client
 *
 * Uses the shared ApiClient for consistent request handling,
 * token management, error handling, and logging.
 *
 * Usage in hooks:
 *   import { auditApi } from "@/lib/api/audit.api";
 */

export const auditApi = {
  /**
   * GET /audit/logs
   * Fetches audit logs with pagination and filters
   */
  getLogs: async (
    params: AuditQueryParams,
    options?: RequestOptions
  ): Promise<AuditLogsResponse> => {
    const queryParams: Record<string, unknown> = {}

    // Build query params object for ApiClient
    if (params.page) queryParams.page = String(params.page)
    if (params.limit) queryParams.limit = String(params.limit)
    if (params.search) queryParams.search = params.search
    if (params.action) queryParams.action = params.action
    if (params.entityType) queryParams.entityType = params.entityType
    if (params.userId) queryParams.userId = String(params.userId)
    if (params.startDate) queryParams.startDate = params.startDate
    if (params.endDate) queryParams.endDate = params.endDate
    if (params.academicYear) queryParams.academicYear = params.academicYear
    if (params.semester) queryParams.semester = params.semester
    if (params.program) queryParams.program = params.program

    return apiClient.get<AuditLogsResponse>("/audit/logs", {
      params: queryParams,
      access_token: true,
      ...options,
    })
  },

  /**
   * GET /audit/logs/user/:userId
   * Fetches logs for a specific user
   */
  getUserLogs: async (
    userId: number,
    params: AuditQueryParams,
    options?: RequestOptions
  ): Promise<AuditLogsResponse> => {
    const queryParams: Record<string, unknown> = {}

    if (params.page) queryParams.page = String(params.page)
    if (params.limit) queryParams.limit = String(params.limit)
    if (params.search) queryParams.search = params.search
    if (params.action) queryParams.action = params.action
    if (params.startDate) queryParams.startDate = params.startDate
    if (params.endDate) queryParams.endDate = params.endDate

    return apiClient.get<AuditLogsResponse>(`/audit/logs/user/${userId}`, {
      params: queryParams,
      access_token: true,
      ...options,
    })
  },

  /**
   * GET /audit/logs/entity/:type/:id
   * Fetches logs for a specific entity
   */
  getEntityLogs: async (
    entityType: AuditEntityType | string,
    entityId: number,
    options?: RequestOptions
  ): Promise<AuditEntityLogsResponse> => {
    return apiClient.get<AuditEntityLogsResponse>(
      `/audit/logs/entity/${entityType}/${entityId}`,
      {
        access_token: true,
        ...options,
      }
    )
  },

  /**
   * GET /audit/stats
   * Fetches audit statistics
   */
  getStats: async (options?: RequestOptions): Promise<AuditStats> => {
    return apiClient.get<AuditStats>("/audit/stats", {
      access_token: true,
      ...options,
    })
  },

  /**
   * GET /audit/export
   * Exports audit logs in various formats
   */
  exportLogs: async (
    params: AuditQueryParams & { format: "csv" | "excel" | "pdf" },
    options?: RequestOptions
  ): Promise<Blob> => {
    const queryParams: Record<string, unknown> = {}

    // Build query params
    if (params.page) queryParams.page = String(params.page)
    if (params.limit) queryParams.limit = String(params.limit)
    if (params.search) queryParams.search = params.search
    if (params.action) queryParams.action = params.action
    if (params.entityType) queryParams.entityType = params.entityType
    if (params.userId) queryParams.userId = String(params.userId)
    if (params.startDate) queryParams.startDate = params.startDate
    if (params.endDate) queryParams.endDate = params.endDate
    if (params.academicYear) queryParams.academicYear = params.academicYear
    if (params.semester) queryParams.semester = params.semester
    if (params.program) queryParams.program = params.program
    if (params.format) queryParams.format = params.format

    // Use axios directly for blob response
    const axiosInstance = apiClient.getAxiosInstance()
    const response = await axiosInstance.get("/audit/export", {
      params: queryParams,
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${apiClient["pickAuthToken"]()}`,
      },
    })

    return response.data
  },

  /**
   * POST /audit/log
   * Creates a custom audit log entry
   */
  createLog: async (
    data: {
      action: string
      entityType: string
      entityId: number
      oldValues?: Record<string, unknown>
      newValues?: Record<string, unknown>
    },
    options?: RequestOptions
  ): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>("/audit/log", data, {
      access_token: true,
      ...options,
    })
  },
}

// Export types for convenience
export type {
  AuditQueryParams,
  AuditLogsResponse,
  AuditEntityLog,
  AuditStats,
  AuditEntityType,
  AuditEntityLogsResponse,
}
