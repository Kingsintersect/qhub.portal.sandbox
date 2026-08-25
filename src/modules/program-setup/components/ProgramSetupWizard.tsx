"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { AlertTriangle, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  CATEGORY_ORDER,
  CATEGORY_PROFILES,
} from "@/modules/program-setup/components/category-profiles"
import {
  useAcademicUnits,
  useCreateProgram,
  useGradingSchemes,
} from "@/modules/program-setup/hooks/use-program-setup"
import {
  DURATION_UNIT_BY_CATEGORY,
  programSetupSchema,
} from "@/modules/program-setup/schemas"
import type {
  ProgramCategory,
  ProgramSetupValues,
} from "@/modules/program-setup/types"

/**
 * Configures a programme within this institution.
 *
 * The category chosen in step one decides what the rest of the form even
 * contains — a secondary class has no credit units, a certificate has no
 * faculty, and only a sandwich programme shows an accreditation gate. Fields
 * that do not apply are hidden rather than shown-and-ignored, so an admin is
 * never invited to fill in something meaningless.
 */
export function ProgramSetupWizard() {
  const [step, setStep] = useState<0 | 1>(0)

  const schemes = useGradingSchemes()
  const units = useAcademicUnits()
  const createProgram = useCreateProgram()

  const form = useForm<ProgramSetupValues>({
    resolver: zodResolver(programSetupSchema),
    defaultValues: {
      programCategory: "DEGREE",
      name: "",
      code: "",
      degreeType: "",
      durationValue: 4,
      departmentId: null,
      academicUnitId: null,
      minCreditUnits: 120,
      gradingSchemeId: undefined as unknown as number,
      isCohortBased: false,
      deliveryMode: "REGULAR",
      accreditationStatus: "NOT_REQUIRED",
      tracksFormalGpa: true,
      admissionRequirements: "",
    },
  })

  const category = useWatch({
    control: form.control,
    name: "programCategory",
  }) as ProgramCategory
  const deliveryMode = useWatch({ control: form.control, name: "deliveryMode" })
  const tracksFormalGpa = useWatch({
    control: form.control,
    name: "tracksFormalGpa",
  })

  const profile = CATEGORY_PROFILES[category]
  const durationUnit = DURATION_UNIT_BY_CATEGORY[category]

  // Choosing a category resets the settings that only make sense per type, so
  // switching from Degree to Certificate cannot leave 120 credit units behind.
  useEffect(() => {
    form.setValue("minCreditUnits", profile.usesCreditUnits ? 120 : 0)
    form.setValue("isCohortBased", category === "CERTIFICATE" ? false : false)
    form.setValue("tracksFormalGpa", !profile.gpaIsOptIn)

    if (!profile.showsAccreditation) {
      form.setValue("deliveryMode", "REGULAR")
      form.setValue("accreditationStatus", "NOT_REQUIRED")
    }
  }, [category, profile, form])

  /**
   * §5 guardrail: business-school and certificate programmes are not offered a
   * GPA scheme unless the institution has explicitly said this programme tracks
   * formal GPA — defaulting to it silently produces transcripts nobody wanted.
   */
  const selectableSchemes = useMemo(() => {
    const all = schemes.data ?? []

    if (!profile.gpaIsOptIn || tracksFormalGpa) {
      return all
    }

    return all.filter((scheme) => scheme.type !== "CREDIT_WEIGHTED_GPA")
  }, [schemes.data, profile.gpaIsOptIn, tracksFormalGpa])

  // Preselect the scheme this programme type normally uses, but only while the
  // admin has not chosen one themselves.
  const gradingSchemeId = useWatch({
    control: form.control,
    name: "gradingSchemeId",
  })

  useEffect(() => {
    if (gradingSchemeId != null) return

    const preferred = selectableSchemes.find(
      (scheme) => scheme.type === profile.defaultSchemeType
    )

    if (preferred) {
      form.setValue("gradingSchemeId", preferred.id)
    }
  }, [selectableSchemes, profile.defaultSchemeType, gradingSchemeId, form])

  const structureOptions = useMemo(() => {
    const all = units.data ?? []

    // Which node kind a programme of this type hangs off.
    const wanted =
      category === "SECONDARY_SCHOOL"
        ? ["SECTION", "STREAM"]
        : ["DEPARTMENT", "SCHOOL", "FACULTY"]

    return all.filter((unit) => wanted.includes(unit.typeCode))
  }, [units.data, category])

  const accreditationStatus = useWatch({
    control: form.control,
    name: "accreditationStatus",
  })

  const sandwichNeedsAccreditation =
    deliveryMode === "SANDWICH" && accreditationStatus !== "APPROVED"

  const onSubmit = form.handleSubmit(async (values) => {
    await createProgram.mutateAsync(
      {
        name: values.name,
        code: values.code.toUpperCase(),
        degreeType: values.degreeType,
        durationYears: durationUnit.toYears(values.durationValue),
        minCreditUnits: values.minCreditUnits,
        departmentId: values.departmentId ?? null,
        academicUnitId: values.academicUnitId ?? null,
        gradingSchemeId: values.gradingSchemeId,
        programCategory: values.programCategory,
        isCohortBased: values.isCohortBased,
        deliveryMode: values.deliveryMode,
        accreditationStatus: values.accreditationStatus,
        admissionRequirements: values.admissionRequirements || null,
      },
      {
        onSuccess: () => {
          form.reset()
          setStep(0)
        },
        onError: () => {},
      }
    )
  })

  if (step === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What kind of programme is this?
          </h2>
          <p className="text-sm text-muted-foreground">
            This decides how it is structured, graded and admitted to.
          </p>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Programme type"
        >
          {CATEGORY_ORDER.map((value) => {
            const option = CATEGORY_PROFILES[value]
            const isSelected = category === value

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => form.setValue("programCategory", value)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={() => setStep(1)}>
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="flex flex-wrap gap-x-8 gap-y-2 pt-6 text-xs">
          <Fact label="Type" value={profile.label} />
          <Fact label="Structure" value={profile.structureHint} />
          <Fact label={`${profile.courseTerm}s`} value={profile.courseTerm} />
          <Fact label="Duration in" value={durationUnit.label} />
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label="Programme name"
          error={form.formState.errors.name?.message}
          className="sm:col-span-2"
        >
          <Input id="name" {...form.register("name")} />
        </Field>

        <Field
          id="code"
          label="Code"
          error={form.formState.errors.code?.message}
        >
          <Input id="code" {...form.register("code")} />
        </Field>

        <Field
          id="degreeType"
          label={category === "SECONDARY_SCHOOL" ? "Class group" : "Award"}
          hint={
            category === "POSTGRADUATE"
              ? "PGD, Masters or PhD."
              : category === "SECONDARY_SCHOOL"
                ? "e.g. JSS or SSS."
                : undefined
          }
          error={form.formState.errors.degreeType?.message}
        >
          <Input id="degreeType" {...form.register("degreeType")} />
        </Field>

        <Field
          id="durationValue"
          label={`Duration (${durationUnit.label})`}
          error={form.formState.errors.durationValue?.message}
        >
          <Input
            id="durationValue"
            type="number"
            step="1"
            min="1"
            {...form.register("durationValue", { valueAsNumber: true })}
          />
        </Field>

        {profile.usesCreditUnits && (
          <Field
            id="minCreditUnits"
            label="Minimum credit units to graduate"
            error={form.formState.errors.minCreditUnits?.message}
          >
            <Input
              id="minCreditUnits"
              type="number"
              min="0"
              {...form.register("minCreditUnits", { valueAsNumber: true })}
            />
          </Field>
        )}

        <Field
          id="academicUnitId"
          label={
            category === "SECONDARY_SCHOOL"
              ? "Section or stream"
              : "Parent unit"
          }
          hint={
            structureOptions.length === 0
              ? "No structure has been created for this institution yet."
              : undefined
          }
          className="sm:col-span-2"
        >
          <Controller
            control={form.control}
            name="academicUnitId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={structureOptions.length === 0}
              >
                <SelectTrigger id="academicUnitId">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {structureOptions.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground">Grading</h3>

        {profile.gpaIsOptIn && (
          <label className="flex items-start gap-3 rounded-md border border-border p-3">
            <Controller
              control={form.control}
              name="tracksFormalGpa"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="This programme tracks formal GPA"
                />
              )}
            />
            <span className="text-sm">
              <span className="font-medium text-foreground">
                This programme tracks a formal GPA
              </span>
              <span className="block text-xs text-muted-foreground">
                Most {profile.label.toLowerCase()} programmes do not. Leave this
                off unless the institution issues GPA-bearing transcripts for
                it.
              </span>
            </span>
          </label>
        )}

        <Field
          id="gradingSchemeId"
          label="Grading scheme"
          error={form.formState.errors.gradingSchemeId?.message}
        >
          <Controller
            control={form.control}
            name="gradingSchemeId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="gradingSchemeId">
                  <SelectValue placeholder="Select a scheme…" />
                </SelectTrigger>
                <SelectContent>
                  {selectableSchemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={String(scheme.id)}>
                      {scheme.name} · {scheme.caWeightPercent}/
                      {scheme.examWeightPercent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </section>

      {profile.showsAccreditation && (
        <section className="space-y-4 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">Delivery</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="deliveryMode" label="Delivery mode">
              <Controller
                control={form.control}
                name="deliveryMode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="deliveryMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="SANDWICH">
                        Sandwich (vacation contact)
                      </SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                      <SelectItem value="WEEKEND">Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {deliveryMode === "SANDWICH" && (
              <Field
                id="accreditationStatus"
                label="NUC accreditation"
                error={form.formState.errors.accreditationStatus?.message}
              >
                <Controller
                  control={form.control}
                  name="accreditationStatus"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="accreditationStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}
          </div>

          {sandwichNeedsAccreditation && (
            // The hard gate, surfaced before submit rather than as a 422 after.
            <p
              role="status"
              className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                This programme can be created, but it will not accept
                applications until its NUC accreditation is approved.
              </span>
            </p>
          )}
        </section>
      )}

      <Field
        id="admissionRequirements"
        label="Entry requirements"
        hint="Shown to applicants. e.g. “5 O-level credits including English and Mathematics”."
      >
        <Textarea
          id="admissionRequirements"
          rows={3}
          {...form.register("admissionRequirements")}
        />
      </Field>

      <div className="flex justify-between gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => setStep(0)}>
          Back
        </Button>
        <Button type="submit" disabled={createProgram.isPending}>
          {createProgram.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          )}
          Create programme
        </Button>
      </div>
    </form>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div aria-describedby={describedBy || undefined}>{children}</div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}
