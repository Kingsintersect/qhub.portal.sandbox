import { InstitutionsTable } from "@/modules/institutions/components/InstitutionsTable"
import { EstateDashboard } from "@/modules/platform-observability/components/EstateDashboard"
import { ProvisionInstitutionDialog } from "@/modules/institutions/components/ProvisionInstitutionDialog"

export default function PlatformInstitutionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Institutions
          </h1>
          <p className="text-sm text-muted-foreground">
            Every institution onboarded to the platform.
          </p>
        </div>
        <ProvisionInstitutionDialog />
      </div>

      <EstateDashboard />

      <InstitutionsTable />
    </div>
  )
}
