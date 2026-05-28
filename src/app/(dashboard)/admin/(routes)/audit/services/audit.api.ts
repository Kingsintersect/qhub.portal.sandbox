/**
 * Audit API Client
 *
 * Live API stub — all methods below are commented out.
 * Uncomment when the backend is ready and set NEXT_PUBLIC_API_URL.
 *
 * Usage in hooks:
 *   import { auditApi } from "@/lib/api/audit.api";
 */

import type {
    AuditQueryParams,
    AuditLogsResponse,
    AuditEntityLog,
    AuditStats,
    AuditEntityType,
} from "../types/audit.types";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// export const auditApi = {
//   /** GET /api/audit/logs */
//   getLogs: async (params: AuditQueryParams): Promise<AuditLogsResponse> => {
//     const qs = new URLSearchParams();
//     if (params.page)       qs.set("page",       String(params.page));
//     if (params.limit)      qs.set("limit",      String(params.limit));
//     if (params.search)     qs.set("search",     params.search);
//     if (params.action)     qs.set("action",     params.action);
//     if (params.entityType) qs.set("entityType", params.entityType);
//     if (params.userId)     qs.set("userId",     String(params.userId));
//     if (params.dateFrom)   qs.set("dateFrom",   params.dateFrom);
//     if (params.dateTo)     qs.set("dateTo",     params.dateTo);
//
//     const res = await fetch(`${API_BASE}/api/audit/logs?${qs}`);
//     if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.status}`);
//     return res.json() as Promise<AuditLogsResponse>;
//   },
//
//   /** GET /api/audit/users/:userId/logs */
//   getUserLogs: async (
//     userId: number,
//     params: AuditQueryParams,
//   ): Promise<AuditLogsResponse> => {
//     const qs = new URLSearchParams();
//     if (params.page)  qs.set("page",  String(params.page));
//     if (params.limit) qs.set("limit", String(params.limit));
//
//     const res = await fetch(`${API_BASE}/api/audit/users/${userId}/logs?${qs}`);
//     if (!res.ok) throw new Error(`Failed to fetch user logs: ${res.status}`);
//     return res.json() as Promise<AuditLogsResponse>;
//   },
//
//   /** GET /api/audit/entity/:type/:id */
//   getEntityLogs: async (
//     entityType: AuditEntityType | string,
//     entityId: number,
//   ): Promise<{ data: AuditEntityLog[] }> => {
//     const res = await fetch(`${API_BASE}/api/audit/entity/${entityType}/${entityId}`);
//     if (!res.ok) throw new Error(`Failed to fetch entity logs: ${res.status}`);
//     return res.json() as Promise<{ data: AuditEntityLog[] }>;
//   },
//
//   /** GET /api/audit/stats */
//   getStats: async (): Promise<AuditStats> => {
//     const res = await fetch(`${API_BASE}/api/audit/stats`);
//     if (!res.ok) throw new Error(`Failed to fetch audit stats: ${res.status}`);
//     return res.json() as Promise<AuditStats>;
//   },
// };

// ─── Placeholder export so the module is valid ─────────────────────────────────

export type {
    AuditQueryParams,
    AuditLogsResponse,
    AuditEntityLog,
    AuditStats,
    AuditEntityType,
};
