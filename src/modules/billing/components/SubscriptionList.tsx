"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useCreateSubscription,
  usePlans,
  useSubscriptions,
} from "@/modules/billing/hooks/use-billing"
import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"

const STATUS_TONE: Record<string, string> = {
  ACTIVE:
    "border-emerald-400 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300",
  TRIALING: "border-sky-300 text-sky-700 dark:border-sky-900 dark:text-sky-300",
  PAST_DUE:
    "border-amber-400 text-amber-700 dark:border-amber-900 dark:text-amber-300",
  CANCELLED: "border-border text-muted-foreground",
}

export function SubscriptionList() {
  const { can } = usePlatformPermissions()
  const { data: subscriptions, isPending } = useSubscriptions()
  const [creating, setCreating] = useState(false)

  const canManage = can("billing.manage")

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Subscribe an institution
          </Button>
        </div>
      )}

      {isPending && <Skeleton className="h-40 w-full" />}

      {!isPending && (subscriptions?.length ?? 0) === 0 && (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No institution is subscribed yet. Nothing will be invoiced until one
          is.
        </p>
      )}

      {(subscriptions?.length ?? 0) > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Institution</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Started</th>
                <th className="px-3 py-2 font-medium">Invoiced through</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions?.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-3 py-2 text-foreground">
                    {subscription.institution}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {subscription.plan}
                    {subscription.currency ? ` · ${subscription.currency}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        STATUS_TONE[subscription.status] ?? "border-border"
                      )}
                    >
                      {subscription.inTrial
                        ? `Trial to ${subscription.trialEndsOn}`
                        : subscription.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {subscription.startedOn}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {/* Blank means nothing has been billed yet, which for a
                        subscription older than a period is worth noticing. */}
                    {subscription.invoicedThrough ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewSubscriptionDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function NewSubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateSubscription()
  const institutions = useInstitutions({ perPage: 100 })
  const { data: plans } = usePlans()

  const [tenantId, setTenantId] = useState("")
  const [planId, setPlanId] = useState("")
  const [startedOn, setStartedOn] = useState("")
  const [trialEndsOn, setTrialEndsOn] = useState("")

  const ready = tenantId && planId && startedOn

  const submit = async () => {
    if (!ready) return

    await create.mutateAsync({
      tenantId: Number.parseInt(tenantId, 10),
      planId: Number.parseInt(planId, 10),
      startedOn,
      trialEndsOn: trialEndsOn || null,
    })

    setTenantId("")
    setPlanId("")
    setStartedOn("")
    setTrialEndsOn("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscribe an institution</DialogTitle>
          <DialogDescription>
            Billing starts from the start date. The first invoice is raised once
            that first period has ended.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sub-institution">Institution</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger id="sub-institution">
                <SelectValue placeholder="Choose an institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.data?.data.map((institution) => (
                  <SelectItem
                    key={institution.id}
                    value={String(institution.id)}
                  >
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-plan">Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger id="sub-plan">
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans
                  ?.filter((plan) => plan.isActive)
                  .map((plan) => (
                    <SelectItem key={plan.id} value={String(plan.id)}>
                      {plan.name} · {plan.currency} ·{" "}
                      {plan.interval.toLowerCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sub-start">Starts</Label>
              <Input
                id="sub-start"
                type="date"
                value={startedOn}
                onChange={(event) => setStartedOn(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-trial">Trial ends (optional)</Label>
              <Input
                id="sub-trial"
                type="date"
                value={trialEndsOn}
                onChange={(event) => setTrialEndsOn(event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!ready || create.isPending}>
            Start subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
