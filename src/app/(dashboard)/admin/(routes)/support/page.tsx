"use client"

import { InstitutionSupportPanel } from "@/modules/tickets/components/InstitutionSupportPanel"

/**
 * Mirrored on both admin surfaces, matching how the other institution routes
 * are shelled: ADMIN owns /manager and SUPER_ADMIN owns /admin.
 */
export default function SupportPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <InstitutionSupportPanel />
    </div>
  )
}
