import { notFound } from "next/navigation"

import { InstitutionsView } from "@/modules/institutions/components/InstitutionsView"

/**
 * One institution, by address.
 *
 * Renders the estate list with that institution's drawer already open, rather
 * than a second page built to show the same thing — one surface for an
 * institution means one place to fix when it changes.
 */
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

  return <InstitutionsView initialOpenId={id} />
}
