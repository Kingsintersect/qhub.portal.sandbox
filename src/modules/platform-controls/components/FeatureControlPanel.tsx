"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useInstitutionFeatures,
  useSetFeature,
} from "@/modules/platform-controls/hooks/use-controls"
import type { InstitutionFeature } from "@/modules/platform-controls/types"

/**
 * Which parts of the portal this institution can reach.
 *
 * Grouped by category, because thirty-five switches in one list is not
 * something anyone reads. The dependency graph is enforced by the API — turning
 * something off that others rest on is refused, and the refusal names them — so
 * this does not try to grey out combinations in advance. Guessing the graph
 * client-side would only be a second, drifting copy of the rule.
 */
export function FeatureControlPanel({
  institutionId,
}: {
  institutionId: number
}) {
  const { can } = usePlatformPermissions()
  const { data: features, isPending } = useInstitutionFeatures(institutionId)
  const setFeature = useSetFeature(institutionId)

  const canManage = can("institutions.update")

  const grouped = (features ?? []).reduce<Record<string, InstitutionFeature[]>>(
    (accumulator, feature) => {
      ;(accumulator[feature.category] ??= []).push(feature)
      return accumulator
    },
    {}
  )

  const offCount = (features ?? []).filter((f) => !f.enabled).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Features</CardTitle>
        <p className="text-sm text-muted-foreground">
          {features
            ? offCount === 0
              ? `All ${features.length} features available to this institution.`
              : `${offCount} of ${features.length} turned off.`
            : "What this institution can reach."}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {isPending && <Skeleton className="h-64 w-full" />}

        {!isPending && (features?.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No catalogue seeded for this institution yet.
          </p>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {category}
            </h3>

            <div className="mt-2 space-y-1">
              {items.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/40"
                >
                  <Switch
                    checked={feature.enabled}
                    disabled={!canManage || setFeature.isPending}
                    onCheckedChange={(enabled) =>
                      setFeature.mutate({ key: feature.key, enabled })
                    }
                    aria-label={feature.label}
                  />

                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">
                      {feature.label}
                    </span>

                    {feature.dependencies.length > 0 && (
                      <span className="block text-xs text-muted-foreground">
                        Needs {feature.dependencies.join(", ")}
                      </span>
                    )}

                    {/* Worth saying out loud: the catalogue intended this one
                        off, and it is on only because seeding preserved what
                        the institution could already reach. */}
                    {!feature.defaultEnabled && feature.enabled && (
                      <span className="block text-xs text-amber-700 dark:text-amber-400">
                        On, though it ships off by default
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
