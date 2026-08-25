"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Check, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cn } from "@/lib/utils"
import { useProvisionInstitution } from "@/modules/institutions/hooks/use-institution-mutations"
import { provisionInstitutionSchema } from "@/modules/institutions/schemas"
import type { ProvisionInstitutionPayload } from "@/modules/institutions/types"
import {
  AWARD_TYPE_OPTIONS,
  CALENDAR_UNIT_OPTIONS,
  CATEGORY_DEFAULTS,
  DEFAULT_BRAND_COLORS,
  PROGRAM_CATEGORY_OPTIONS,
  REGULATOR_OPTIONS,
} from "@/modules/institutions/components/onboarding-options"
import type { ProgramCategory } from "@/modules/program-setup/types"

const STEPS = [
  { title: "Institution" },
  { title: "Academic profile" },
  { title: "Branding" },
  { title: "Administrator" },
] as const

/**
 * Onboards an institution.
 *
 * Split across steps because the answers are not interchangeable: the academic
 * profile decides what actually gets provisioned — how many periods the
 * calendar has and what they are called, which structural nodes exist, whether
 * a certificate template is created — while branding and the admin account are
 * independent of it. One wall of fields hid that distinction.
 */
export function ProvisionInstitutionDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const provision = useProvisionInstitution()

  const form = useForm<ProvisionInstitutionPayload>({
    resolver: zodResolver(provisionInstitutionSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      slug: "",
      domain: "",
      plan: "",
      programCategories: ["DEGREE"],
      awardTypes: ["DEGREE_CERTIFICATE", "TRANSCRIPT"],
      regulator: "NUC",
      calendarUnit: "SEMESTER",
      periodsPerSession: 2,
      tagline: "",
      websiteUrl: "",
      logoUrl: "",
      supportEmail: "",
      supportPhone: "",
      branding: { colors: { ...DEFAULT_BRAND_COLORS }, fontFamily: "" },
      adminEmail: "",
      adminUsername: "admin",
      adminPassword: "",
      adminFirstName: "",
      adminLastName: "",
    },
  })

  const nameValue = useWatch({ control: form.control, name: "name" })
  const slugValue = useWatch({ control: form.control, name: "slug" })
  const categories = useWatch({
    control: form.control,
    name: "programCategories",
  })
  const colors = useWatch({ control: form.control, name: "branding.colors" })

  const [slugTouched, setSlugTouched] = useState(false)
  const [profileTouched, setProfileTouched] = useState(false)

  // Suggest a slug from the name until the operator edits it themselves — the
  // slug becomes the database name, so a sane default avoids most validation
  // bounces without ever overwriting a deliberate choice.
  useEffect(() => {
    if (slugTouched) return

    const suggestion = (nameValue ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^[^a-z]+/, "")
      .replace(/_+$/g, "")
      .slice(0, 32)

    if (suggestion !== slugValue) {
      form.setValue("slug", suggestion, { shouldValidate: false })
    }
  }, [nameValue, slugTouched, slugValue, form])

  // Picking programme types pre-fills the calendar, regulator and awards that
  // normally follow from them — an operator choosing "Secondary School" should
  // not have to know that means three terms regulated by WAEC. Stops as soon as
  // they touch those fields themselves.
  useEffect(() => {
    if (profileTouched) return

    const primary = (categories?.[0] ?? "DEGREE") as ProgramCategory
    const defaults = CATEGORY_DEFAULTS[primary]

    if (!defaults) return

    form.setValue("calendarUnit", defaults.calendarUnit as never)
    form.setValue("periodsPerSession", defaults.periodsPerSession)
    form.setValue("regulator", defaults.regulator as never)
    form.setValue("awardTypes", defaults.awards as never)
  }, [categories, profileTouched, form])

  const stepFields: Array<Array<keyof ProvisionInstitutionPayload>> = [
    ["name", "slug", "domain", "plan"],
    [
      "programCategories",
      "awardTypes",
      "regulator",
      "calendarUnit",
      "periodsPerSession",
    ],
    [
      "tagline",
      "websiteUrl",
      "logoUrl",
      "supportEmail",
      "supportPhone",
      "branding",
    ],
    [
      "adminEmail",
      "adminUsername",
      "adminPassword",
      "adminFirstName",
      "adminLastName",
    ],
  ]

  // Validate only the current step, so an operator is not shown errors for
  // fields they have not reached yet.
  const goNext = async () => {
    const valid = await form.trigger(stepFields[step] as never)
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await provision.mutateAsync(
      {
        ...values,
        plan: values.plan || undefined,
        tagline: values.tagline || undefined,
        websiteUrl: values.websiteUrl || undefined,
        logoUrl: values.logoUrl || undefined,
        supportEmail: values.supportEmail || undefined,
        supportPhone: values.supportPhone || undefined,
        branding: {
          ...values.branding,
          fontFamily: values.branding.fontFamily || undefined,
        },
      } as ProvisionInstitutionPayload,
      {
        onSuccess: () => {
          form.reset()
          setSlugTouched(false)
          setProfileTouched(false)
          setStep(0)
          setOpen(false)
        },
        onError: () => {},
      }
    )
  })

  const isLastStep = step === STEPS.length - 1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Onboard institution
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Onboard an institution</DialogTitle>
          <DialogDescription>
            What you choose here decides how the institution is set up — its
            calendar, its structure and what it awards.
          </DialogDescription>
        </DialogHeader>

        <ol
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
          aria-label="Progress"
        >
          {STEPS.map((s, index) => (
            <li
              key={s.title}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5",
                index === step
                  ? "font-medium text-foreground"
                  : index < step
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
              )}
            >
              {index < step ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{index + 1}.</span>
              )}
              {s.title}
            </li>
          ))}
        </ol>

        <form onSubmit={onSubmit} className="space-y-6">
          {step === 0 && (
            <section className="space-y-4">
              <Field
                id="name"
                label="Institution name"
                error={form.formState.errors.name?.message}
              >
                <Input
                  id="name"
                  placeholder="University of Lagos"
                  {...form.register("name")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="slug"
                  label="Slug"
                  hint="Used for the institution's database name."
                  error={form.formState.errors.slug?.message}
                >
                  <Input
                    id="slug"
                    placeholder="unilag"
                    {...form.register("slug", {
                      onChange: () => setSlugTouched(true),
                    })}
                  />
                </Field>

                <Field
                  id="plan"
                  label="Plan"
                  hint="Optional."
                  error={form.formState.errors.plan?.message}
                >
                  <Input
                    id="plan"
                    placeholder="pilot"
                    {...form.register("plan")}
                  />
                </Field>
              </div>

              <Field
                id="domain"
                label="Host"
                hint="The address students and staff will use."
                error={form.formState.errors.domain?.message}
              >
                <Input
                  id="domain"
                  placeholder="unilag.qhub.ng"
                  {...form.register("domain")}
                />
              </Field>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-5">
              <Field
                id="programCategories"
                label="Programme types offered"
                hint="Select every kind this institution runs."
                error={form.formState.errors.programCategories?.message}
              >
                <Controller
                  control={form.control}
                  name="programCategories"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2" role="group">
                      {PROGRAM_CATEGORY_OPTIONS.map((option) => {
                        const selected = field.value?.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter(
                                      (v: string) => v !== option.value
                                    )
                                  : [...(field.value ?? []), option.value]
                              )
                            }
                            className={cn(
                              "rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <span className="flex items-start justify-between gap-2 text-sm font-medium text-foreground">
                              {option.label}
                              {selected && (
                                <Check
                                  className="mt-0.5 size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {option.description}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </Field>

              <Field
                id="awardTypes"
                label="What it awards"
                error={form.formState.errors.awardTypes?.message}
              >
                <Controller
                  control={form.control}
                  name="awardTypes"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="group">
                      {AWARD_TYPE_OPTIONS.map((option) => {
                        const selected = field.value?.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            title={option.description}
                            aria-pressed={selected}
                            onClick={() => {
                              setProfileTouched(true)
                              field.onChange(
                                selected
                                  ? field.value.filter(
                                      (v: string) => v !== option.value
                                    )
                                  : [...(field.value ?? []), option.value]
                              )
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="regulator" label="Regulator">
                  <Controller
                    control={form.control}
                    name="regulator"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          setProfileTouched(true)
                          field.onChange(v)
                        }}
                      >
                        <SelectTrigger
                          id="regulator"
                          className="w-full min-w-0"
                        >
                          <SelectValue className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGULATOR_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field id="calendarUnit" label="Academic periods">
                  <Controller
                    control={form.control}
                    name="calendarUnit"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          setProfileTouched(true)
                          field.onChange(v)
                        }}
                      >
                        <SelectTrigger
                          id="calendarUnit"
                          className="w-full min-w-0"
                        >
                          <SelectValue className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {CALENDAR_UNIT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field
                  id="periodsPerSession"
                  label="Per session"
                  error={form.formState.errors.periodsPerSession?.message}
                >
                  <Input
                    id="periodsPerSession"
                    type="number"
                    min="1"
                    max="6"
                    {...form.register("periodsPerSession", {
                      valueAsNumber: true,
                      onChange: () => setProfileTouched(true),
                    })}
                  />
                </Field>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {(["primary", "accent", "sidebar"] as const).map((role) => (
                  <Field
                    key={role}
                    id={`color-${role}`}
                    label={
                      role === "sidebar"
                        ? "Sidebar"
                        : role === "accent"
                          ? "Accent"
                          : "Primary"
                    }
                    error={
                      form.formState.errors.branding?.colors?.[role]?.message
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name={`branding.colors.${role}` as const}
                        render={({ field }) => (
                          <>
                            <input
                              id={`color-${role}`}
                              type="color"
                              value={field.value || "#000000"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                              aria-label={`${role} colour`}
                            />
                            {/* A hex field as well as the swatch: institutions
                                arrive with a brand hex, not a colour wheel. */}
                            <Input
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="font-mono text-xs"
                              aria-label={`${role} colour hex`}
                            />
                          </>
                        )}
                      />
                    </div>
                  </Field>
                ))}
              </div>

              <BrandPreview
                colors={colors}
                name={nameValue || "Your institution"}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="logoUrl"
                  label="Logo URL"
                  error={form.formState.errors.logoUrl?.message}
                >
                  <Input
                    id="logoUrl"
                    placeholder="https://…/logo.png"
                    {...form.register("logoUrl")}
                  />
                </Field>
                <Field
                  id="fontFamily"
                  label="Font family"
                  hint="Optional. Falls back to the portal default."
                >
                  <Input
                    id="fontFamily"
                    placeholder="Georgia"
                    {...form.register("branding.fontFamily")}
                  />
                </Field>
              </div>

              <Field
                id="tagline"
                label="Tagline"
                error={form.formState.errors.tagline?.message}
              >
                <Input
                  id="tagline"
                  placeholder="Truth and Courage"
                  {...form.register("tagline")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  id="websiteUrl"
                  label="Website"
                  error={form.formState.errors.websiteUrl?.message}
                >
                  <Input
                    id="websiteUrl"
                    placeholder="https://…"
                    {...form.register("websiteUrl")}
                  />
                </Field>
                <Field
                  id="supportEmail"
                  label="Support email"
                  error={form.formState.errors.supportEmail?.message}
                >
                  <Input
                    id="supportEmail"
                    type="email"
                    {...form.register("supportEmail")}
                  />
                </Field>
                <Field
                  id="supportPhone"
                  label="Support phone"
                  error={form.formState.errors.supportPhone?.message}
                >
                  <Input id="supportPhone" {...form.register("supportPhone")} />
                </Field>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <p className="text-xs text-muted-foreground">
                The account the institution signs in with to configure itself.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="adminFirstName" label="First name">
                  <Input
                    id="adminFirstName"
                    {...form.register("adminFirstName")}
                  />
                </Field>
                <Field id="adminLastName" label="Last name">
                  <Input
                    id="adminLastName"
                    {...form.register("adminLastName")}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="adminEmail"
                  label="Email"
                  error={form.formState.errors.adminEmail?.message}
                >
                  <Input
                    id="adminEmail"
                    type="email"
                    {...form.register("adminEmail")}
                  />
                </Field>
                <Field
                  id="adminUsername"
                  label="Username"
                  error={form.formState.errors.adminUsername?.message}
                >
                  <Input
                    id="adminUsername"
                    {...form.register("adminUsername")}
                  />
                </Field>
              </div>

              <Field
                id="adminPassword"
                label="Temporary password"
                hint="Share this with the institution; they should change it on first sign-in."
                error={form.formState.errors.adminPassword?.message}
              >
                <Input
                  id="adminPassword"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("adminPassword")}
                />
              </Field>
            </section>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                step === 0 ? setOpen(false) : setStep((s) => s - 1)
              }
              disabled={provision.isPending}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {isLastStep ? (
              <Button type="submit" disabled={provision.isPending}>
                {provision.isPending && (
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {provision.isPending ? "Provisioning…" : "Onboard institution"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Continue
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Shows the chosen palette on portal-shaped furniture, not bare swatches. */
function BrandPreview({
  colors,
  name,
}: {
  colors?: { primary?: string; accent?: string; sidebar?: string }
  name: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex">
        <div
          className="w-28 shrink-0 p-3 text-[10px] leading-tight"
          style={{ background: colors?.sidebar ?? "transparent" }}
        >
          <span className="block font-semibold text-neutral-900">{name}</span>
          <span className="mt-2 block text-neutral-600">Dashboard</span>
          <span className="mt-1 block text-neutral-600">Students</span>
        </div>
        <div className="flex-1 space-y-2 p-3">
          <div
            className="h-2 w-24 rounded"
            style={{ background: colors?.accent ?? "#eee" }}
          />
          <div
            className="h-2 w-16 rounded"
            style={{ background: colors?.accent ?? "#eee" }}
          />
          <span
            className="inline-block rounded-md px-3 py-1.5 text-[11px] font-medium text-white"
            style={{ background: colors?.primary ?? "#000" }}
          >
            Primary action
          </span>
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="space-y-1.5">
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
