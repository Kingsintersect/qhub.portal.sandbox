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
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { useCreatePlan, usePlans } from "@/modules/billing/hooks/use-billing"
import { formatMinor, toMinor } from "@/modules/billing/lib/money"

const INTERVALS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
]

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"]

export function PlanList() {
  const { can } = usePlatformPermissions()
  const { data: plans, isPending } = usePlans()
  const [creating, setCreating] = useState(false)

  const canManage = can("billing.manage")

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            New plan
          </Button>
        </div>
      )}

      {isPending && <Skeleton className="h-40 w-full" />}

      {!isPending && (plans?.length ?? 0) === 0 && (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No plans yet. A plan sets the base price, how many students it covers,
          and what each extra student costs.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans?.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {plan.name}
                </h3>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {plan.code}
                </p>
              </div>
              {!plan.isActive && (
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  Retired
                </span>
              )}
            </div>

            <p className="mt-3 font-mono text-lg text-foreground">
              {formatMinor(plan.basePriceMinor, plan.currency)}
              <span className="ml-1 text-xs text-muted-foreground">
                / {plan.interval.toLowerCase()}
              </span>
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {plan.includedStudents.toLocaleString()} students included, then{" "}
              {formatMinor(plan.perStudentMinor, plan.currency)} each
            </p>

            {plan.subscriptionCount !== null && (
              <p className="mt-2 text-xs text-muted-foreground">
                {plan.subscriptionCount} institution
                {plan.subscriptionCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
        ))}
      </div>

      <NewPlanDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function NewPlanDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreatePlan()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [interval, setInterval] = useState("MONTHLY")
  const [currency, setCurrency] = useState("NGN")
  const [basePrice, setBasePrice] = useState("")
  const [included, setIncluded] = useState("")
  const [perStudent, setPerStudent] = useState("")

  const ready = name.trim() && code.trim() && basePrice.trim()

  const submit = async () => {
    if (!ready) return

    await create.mutateAsync({
      name: name.trim(),
      code: code.trim(),
      interval,
      currency,
      // Entered in major units and converted once, here. Nothing downstream
      // sees anything but minor units.
      basePriceMinor: toMinor(basePrice, currency),
      includedStudents: Number.parseInt(included || "0", 10),
      perStudentMinor: toMinor(perStudent || "0", currency),
    })

    setName("")
    setCode("")
    setBasePrice("")
    setIncluded("")
    setPerStudent("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New plan</DialogTitle>
          <DialogDescription>
            Prices are entered in {currency}. Changing a plan later affects
            future invoices only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Growth"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-code">Code</Label>
              <Input
                id="plan-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="growth"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-interval">Billed</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger id="plan-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="plan-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-base">Base price</Label>
              <Input
                id="plan-base"
                inputMode="decimal"
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-included">Students included</Label>
              <Input
                id="plan-included"
                inputMode="numeric"
                value={included}
                onChange={(event) => setIncluded(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-per-student">Per extra student</Label>
              <Input
                id="plan-per-student"
                inputMode="decimal"
                value={perStudent}
                onChange={(event) => setPerStudent(event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!ready || create.isPending}>
            Create plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
