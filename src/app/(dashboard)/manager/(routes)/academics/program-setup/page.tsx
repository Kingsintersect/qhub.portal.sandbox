"use client"

import { ProgramSetupWizard } from "@/modules/program-setup/components/ProgramSetupWizard"

/**
 * Institution-admin surface for programme configuration.
 *
 * Mirrors the /admin route: the ADMIN role (an institution's own administrator,
 * which is what tenant provisioning creates) owns /manager, while SUPER_ADMIN
 * owns /admin. Both configure programmes, so both routes render the same
 * wizard — the thin-shell pattern the other academics routes already use.
 */
export default function ManagerProgramSetupPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Programme setup
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure a programme for this institution.
        </p>
      </div>

      <ProgramSetupWizard />
    </div>
  )
}
