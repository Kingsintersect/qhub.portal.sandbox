"use client"

import { ProgramSetupWizard } from "@/modules/program-setup/components/ProgramSetupWizard"

export default function ProgramSetupPage() {
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
