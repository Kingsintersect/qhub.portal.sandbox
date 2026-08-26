"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useClearMaintenance,
  useScheduleMaintenance,
} from "@/modules/platform-controls/hooks/use-controls"
import type { MaintenanceNotice } from "@/modules/platform-controls/types"

/**
 * Scheduled downtime for one institution.
 *
 * Announcing a window ahead of time is the useful case: the portal keeps
 * working and warns people, so they can finish what they are doing. Setting a
 * start time in the past closes it immediately, which is what an incident
 * needs.
 *
 * The message is shown to that institution's users verbatim, including on the
 * sign-in page, so it is written for them rather than for the platform team.
 */
export function MaintenancePanel({
  institutionId,
  notice,
}: {
  institutionId: number
  notice: MaintenanceNotice | null
}) {
  const { can } = usePlatformPermissions()
  const schedule = useScheduleMaintenance(institutionId)
  const clear = useClearMaintenance(institutionId)

  const [message, setMessage] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  const canManage = can("institutions.suspend")

  const submit = async () => {
    if (!message.trim() || !startsAt) return

    await schedule.mutateAsync({
      message: message.trim(),
      startsAt,
      endsAt: endsAt || null,
      // An open-ended window is honest for an incident but a bad default for
      // planned work, so the API insists it be asked for.
      ...(endsAt ? {} : { openEnded: true }),
    })

    setMessage("")
    setStartsAt("")
    setEndsAt("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Maintenance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Take this institution&apos;s portal offline with a reason its users
          can read.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {notice && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5",
              notice.active
                ? "border-red-400 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                : "border-amber-400 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
            )}
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-foreground"
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {notice.active
                  ? "Portal is closed right now"
                  : "Window announced — portal still open"}
              </p>
              <p className="mt-0.5 text-sm whitespace-pre-wrap text-foreground/90">
                {notice.message}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notice.startsAt
                  ? new Date(notice.startsAt).toLocaleString()
                  : "—"}{" "}
                →{" "}
                {notice.endsAt
                  ? new Date(notice.endsAt).toLocaleString()
                  : "until cleared"}
              </p>
            </div>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                disabled={clear.isPending}
                onClick={() => clear.mutate()}
              >
                {notice.active ? "Reopen now" : "Cancel"}
              </Button>
            )}
          </div>
        )}

        {canManage && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-message">
                What their users will see
              </Label>
              <Textarea
                id="maintenance-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={2}
                maxLength={300}
                placeholder="We're upgrading the portal. Results and payments are unaffected."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-start">Starts</Label>
                <Input
                  id="maintenance-start"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maintenance-end">Ends (optional)</Label>
                <Input
                  id="maintenance-end"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Leave the end time blank to keep the portal closed until you clear
              it. A start time in the past closes it immediately.
            </p>

            <Button
              onClick={submit}
              disabled={!message.trim() || !startsAt || schedule.isPending}
            >
              {schedule.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {notice ? "Replace window" : "Schedule maintenance"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
