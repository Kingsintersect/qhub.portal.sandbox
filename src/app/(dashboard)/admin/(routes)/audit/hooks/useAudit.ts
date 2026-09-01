"use client"

import { useQuery } from "@tanstack/react-query"
import type { AuditQueryParams, AuditStats } from "../types/audit.types"
import { auditApi } from "../services/audit.api"

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const auditKeys = {
  all: ["audit"] as const,
  logs: (params: AuditQueryParams) => ["audit", "logs", params] as const,
  log: (id: number) => ["audit", "log", id] as const,
  userLogs: (userId: number, params: AuditQueryParams) =>
    ["audit", "user", userId, params] as const,
  entityLogs: (entityType: string, entityId: number) =>
    ["audit", "entity", entityType, entityId] as const,
  stats: () => ["audit", "stats"] as const,
}

// ─── useAuditLogs ─────────────────────────────────────────────────────────────

export function useAuditLogs(params: AuditQueryParams) {
  return useQuery({
    queryKey: auditKeys.logs(params),
    queryFn: () => auditApi.getLogs(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ─── useAuditUserLogs ────────────────────────────────────────────────────────

export function useAuditUserLogs(
  userId: number,
  params: AuditQueryParams = {}
) {
  return useQuery({
    queryKey: auditKeys.userLogs(userId, params),
    queryFn: () => auditApi.getUserLogs(userId, params),
    enabled: userId > 0,
    staleTime: 30_000,
  })
}

// ─── useAuditEntityLogs ───────────────────────────────────────────────────────

export function useAuditEntityLogs(entityType: string, entityId: number) {
  return useQuery({
    queryKey: auditKeys.entityLogs(entityType, entityId),
    queryFn: () => auditApi.getEntityLogs(entityType, entityId),
    enabled: Boolean(entityType) && entityId > 0,
    staleTime: 60_000,
  })
}

// ─── useAuditStats ────────────────────────────────────────────────────────────

export function useAuditStats() {
  return useQuery<AuditStats>({
    queryKey: auditKeys.stats(),
    queryFn: () => auditApi.getStats(),
    staleTime: 60_000,
  })
}
