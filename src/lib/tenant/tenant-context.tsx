"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { TenantBranding } from "@/lib/tenant/types"

const TenantContext = createContext<TenantBranding | null>(null)

/**
 * Makes the institution resolved on the server available to client components.
 * Value is passed down from the root layout rather than fetched here, so there
 * is exactly one lookup per request and no identity flash on hydration.
 */
export function TenantProvider({
  value,
  children,
}: {
  value: TenantBranding | null
  children: ReactNode
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

/** Null on the platform host, which belongs to no institution. */
export function useTenant(): TenantBranding | null {
  return useContext(TenantContext)
}

/**
 * Institution display name, falling back to the build-time default when no
 * tenant is resolved (the platform host, or an API that failed to answer).
 * Consumers get a sensible string rather than having to handle null everywhere.
 */
export function useInstitutionName(fallback: string): string {
  return useTenant()?.name ?? fallback
}

/** Institution logo, falling back to the bundled default asset. */
export function useInstitutionLogo(fallback: string): string {
  return useTenant()?.logoUrl ?? fallback
}
