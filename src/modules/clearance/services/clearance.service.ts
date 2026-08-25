import apiClient from "@/lib/clients/apiClient"
import type {
  ApproveClearanceDto,
  ClearanceQueryFilters,
  ClearanceSummary,
  ClearanceType,
  CreateClearanceTypeDto,
  RejectClearanceDto,
  RequestClearanceDto,
  StudentClearance,
  UpdateClearanceTypeDto,
} from "../types"

// Real backend contract per bruno/clearance/*.bru (the sole source of truth
// for this module — see CONVENTIONS.md §13). Every endpoint here returns its
// resource FLAT, with no `{ data: ... }` envelope — confirmed by every
// bruno file's post-response script reading `res.body?.id` directly, never
// `res.body?.data?.id`, and by clearance_README.md's example bodies, which
// are all flat too.
const BASE = "/clearance"
const AUTH = { access_token: true } as const

export const clearanceService = {
  // ── Clearance Types ──────────────────────
  listTypes: (): Promise<ClearanceType[]> =>
    apiClient.get<ClearanceType[]>(`${BASE}/types`, AUTH),

  createType: (payload: CreateClearanceTypeDto): Promise<ClearanceType> =>
    apiClient.post<ClearanceType>(`${BASE}/types`, payload, AUTH),

  updateType: (
    id: number,
    payload: UpdateClearanceTypeDto
  ): Promise<ClearanceType> =>
    apiClient.patch<ClearanceType>(`${BASE}/types/${id}`, payload, AUTH),

  // Soft "deactivate" (isActive: false), not a hard delete — per
  // clearance_README.md and ClearanceType - Delete.bru.
  deactivateType: (id: number): Promise<ClearanceType> =>
    apiClient.delete<ClearanceType>(`${BASE}/types/${id}`, AUTH),

  // ── Student Clearances ───────────────────
  // Assumed flat array, not {data, meta}-paginated — no example body is
  // shown for this endpoint, but every other clearance endpoint is flat
  // (unlike most other modules in this backend), so this follows suit. If
  // the real response turns out to be paginated, the review queue will just
  // silently render page 1 with no "load more" — worth a quick live check.
  list: (filters: ClearanceQueryFilters = {}): Promise<StudentClearance[]> =>
    apiClient.get<StudentClearance[]>(BASE, {
      ...AUTH,
      params: filters as Record<string, unknown>,
    }),

  getById: (id: number): Promise<StudentClearance> =>
    apiClient.get<StudentClearance>(`${BASE}/${id}`, AUTH),

  // Admin, Self only — Staff gets 403 here (unlike getById above).
  listByStudent: (studentId: number): Promise<StudentClearance[]> =>
    apiClient.get<StudentClearance[]>(`${BASE}/student/${studentId}`, AUTH),

  // Admin, Self only — same auth gate as listByStudent.
  getSummary: (studentId: number): Promise<ClearanceSummary> =>
    apiClient.get<ClearanceSummary>(
      `${BASE}/student/${studentId}/status`,
      AUTH
    ),

  request: (payload: RequestClearanceDto): Promise<StudentClearance> =>
    apiClient.post<StudentClearance>(BASE, payload, AUTH),

  requestAll: (studentId: number): Promise<StudentClearance[]> =>
    apiClient.post<StudentClearance[]>(
      `${BASE}/student/${studentId}/request-all`,
      undefined,
      AUTH
    ),

  // "Approver, Admin" — no dedicated approver role exists yet; the backend
  // currently gates this on Admin or Staff (Clearance - Approve.bru).
  approve: (
    id: number,
    payload: ApproveClearanceDto
  ): Promise<StudentClearance> =>
    apiClient.patch<StudentClearance>(`${BASE}/${id}/approve`, payload, AUTH),

  reject: (
    id: number,
    payload: RejectClearanceDto
  ): Promise<StudentClearance> =>
    apiClient.patch<StudentClearance>(`${BASE}/${id}/reject`, payload, AUTH),
}
