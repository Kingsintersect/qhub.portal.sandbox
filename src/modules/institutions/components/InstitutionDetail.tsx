"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateInstitutionStatus } from "@/modules/institutions/hooks/use-institution-mutations"
import { useInstitution } from "@/modules/institutions/hooks/use-institutions"
import { InstitutionStatusBadge } from "@/modules/institutions/components/InstitutionStatusBadge"
import { InstitutionObservabilityPanel } from "@/modules/platform-observability/components/InstitutionObservabilityPanel"
import { CourseImportPanel } from "@/modules/platform-operations/components/CourseImportPanel"
import { DirectoryPanel } from "@/modules/platform-operations/components/DirectoryPanel"
import { FeatureControlPanel } from "@/modules/platform-controls/components/FeatureControlPanel"
import { MaintenancePanel } from "@/modules/platform-controls/components/MaintenancePanel"

export function InstitutionDetail({
  institutionId,
}: {
  institutionId: number
}) {
  const {
    data: institution,
    isPending,
    isError,
  } = useInstitution(institutionId)
  const updateStatus = useUpdateInstitutionStatus()

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError || !institution) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p role="alert" className="text-sm text-destructive">
          Could not load this institution.
        </p>
      </div>
    )
  }

  const primary =
    institution.domains.find((domain) => domain.isPrimary) ??
    institution.domains[0]
  const isSuspended = institution.status === "SUSPENDED"
  const isArchived = institution.status === "ARCHIVED"

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {institution.name}
            </h1>
            <InstitutionStatusBadge status={institution.status} />
          </div>
          {primary && (
            <a
              href={`https://${primary.domain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {primary.domain}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>

        {!isArchived && (
          <StatusAction
            label={isSuspended ? "Resume" : "Suspend"}
            variant={isSuspended ? "default" : "outline"}
            title={
              isSuspended
                ? `Resume ${institution.name}?`
                : `Suspend ${institution.name}?`
            }
            description={
              isSuspended
                ? "Students and staff will be able to sign in again immediately."
                : "Everyone at this institution is signed out of new requests immediately. Its data is untouched and resuming restores access."
            }
            pending={updateStatus.isPending}
            onConfirm={() =>
              updateStatus.mutate({
                id: institution.id,
                payload: { status: isSuspended ? "ACTIVE" : "SUSPENDED" },
              })
            }
          />
        )}
      </div>

      <InstitutionObservabilityPanel institutionId={institution.id} />

      <MaintenancePanel
        institutionId={institution.id}
        notice={institution.maintenance ?? null}
      />

      <FeatureControlPanel institutionId={institution.id} />

      <DirectoryPanel institutionId={institution.id} />

      <CourseImportPanel
        institutionId={institution.id}
        institutionName={institution.name}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Slug" value={institution.slug} mono />
              <Detail label="Plan" value={institution.plan ?? "—"} />
              <Detail
                label="Onboarded"
                value={formatDateTime(institution.provisionedAt)}
              />
              <Detail
                label="Created"
                value={formatDateTime(institution.createdAt)}
              />
              <Detail
                label="Support email"
                value={institution.supportEmail ?? "—"}
              />
              <Detail
                label="Support phone"
                value={institution.supportPhone ?? "—"}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hosts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {institution.domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <span className="font-mono text-xs">{domain.domain}</span>
                <span className="text-xs text-muted-foreground">
                  {domain.isPrimary ? "Primary" : "Alias"}
                  {domain.verifiedAt ? " · verified" : " · unverified"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {institution.provisioningRuns &&
        institution.provisioningRuns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provisioning history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {institution.provisioningRuns.map((run) => (
                <div
                  key={run.id}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{run.status}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(run.finishedAt)}
                    </span>
                  </div>
                  {run.steps.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {run.steps.join(" → ")}
                    </p>
                  )}
                  {run.error && (
                    // The reason a half-provisioned institution stopped where
                    // it did — the most useful thing on this page when
                    // something has gone wrong.
                    <p className="mt-1 text-xs text-destructive">{run.error}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/platform"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All institutions
    </Link>
  )
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-xs" : "text-foreground"}>
        {value}
      </dd>
    </div>
  )
}

function StatusAction({
  label,
  variant,
  title,
  description,
  pending,
  onConfirm,
}: {
  label: string
  variant: "default" | "outline"
  title: string
  description: string
  pending: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} disabled={pending}>
          {pending && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          )}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{label}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function formatDateTime(value: string | null): string {
  if (!value) return "—"

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString()
}
