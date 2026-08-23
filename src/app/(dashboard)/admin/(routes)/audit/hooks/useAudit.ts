"use client"

import { useQuery } from "@tanstack/react-query"
import type { AuditQueryParams, AuditStats } from "../types/audit.types"
// ── Live API import (uncomment to use) ──
// import { auditApi } from "@/lib/api/audit.api";
import {
  getDummyAuditLogs,
  getDummyEntityLogs,
  DUMMY_AUDIT_STATS,
} from "../services/audit.dummy"
import { auditApi } from "../services/audit.api"

// ─── Delay helper (dev / demo only) ──────────────────────────────────────────

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
    queryFn: async () => {
      // await simulateDelay(350);
      // return getDummyAuditLogs(params.page ?? 1, params.limit ?? 10, {
      //     action: params.action ?? "",
      //     entityType: params.entityType ?? "",
      //     userId: params.userId,
      //     search: params.search ?? "",
      //     startDate: params.startDate ?? "",
      //     endDate: params.endDate ?? "",
      // });
      // ── LIVE API (uncomment when backend is ready) ──────────────────────
      return auditApi.getLogs(params)
      // ────────────────────────────────────────────────────────────────────
    },
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
    queryFn: async () => {
      // await simulateDelay(300)
      // return getDummyAuditLogs(params.page ?? 1, params.limit ?? 10, {
      //     userId,
      //     action: params.action ?? "",
      //     search: params.search ?? "",
      // });
      // ── LIVE API ──────────────────────────────────────────────────────
      return auditApi.getUserLogs(userId, params)
      // ─────────────────────────────────────────────────────────────────
    },
    enabled: userId > 0,
    staleTime: 30_000,
  })
}

// ─── useAuditEntityLogs ───────────────────────────────────────────────────────

export function useAuditEntityLogs(entityType: string, entityId: number) {
  return useQuery({
    queryKey: auditKeys.entityLogs(entityType, entityId),
    queryFn: async () => {
      // await simulateDelay(250);
      // return getDummyEntityLogs(entityType, entityId);
      // ── LIVE API ──────────────────────────────────────────────────────
      return auditApi.getEntityLogs(entityType, entityId)
      // ─────────────────────────────────────────────────────────────────
    },
    enabled: Boolean(entityType) && entityId > 0,
    staleTime: 60_000,
  })
}

// ─── useAuditStats ────────────────────────────────────────────────────────────

export function useAuditStats() {
  return useQuery<AuditStats>({
    queryKey: auditKeys.stats(),
    queryFn: async () => {
      // await simulateDelay(400);
      // return DUMMY_AUDIT_STATS;
      // ── LIVE API ──────────────────────────────────────────────────────
      return auditApi.getStats()
      // ─────────────────────────────────────────────────────────────────
    },
    staleTime: 60_000,
  })
}
