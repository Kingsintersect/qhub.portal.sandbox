import { notFound } from "next/navigation"

import { InstitutionDetail } from "@/modules/institutions/components/InstitutionDetail"

export default async function PlatformInstitutionPage({
  params,
}: {
  params: Promise<{ institutionId: string }>
}) {
  const { institutionId } = await params
  const id = Number(institutionId)

  // Guards the route before it reaches the query — a non-numeric segment would
  // otherwise produce a request for /platform/tenants/NaN.
  if (!Number.isInteger(id) || id <= 0) {
    notFound()
  }

  return <InstitutionDetail institutionId={id} />
}
