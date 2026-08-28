"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

import { useProvisionInstitution } from "@/modules/institutions/hooks/use-institution-mutations"
import { ProvisioningPanel } from "@/modules/institutions/components/ProvisioningPanel"
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
  "Institution",
  "Academic profile",
  "Infrastructure",
  "Branding",
  "Administrator",
] as const

/**
 * Onboards an institution, lifted from the draft.
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
  const [dedicated, setDedicated] = useState(false)

  // Set once the tenant record exists, which is when the wizard stops being a
  // form and becomes a progress panel. The run may finish, fail, or stop and
  // wait for a credential; all three are the panel's business, not the form's.
  const [provisioningId, setProvisioningId] = useState<number | null>(null)

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
    ["dbHost", "dbPort", "dbUsername", "dbSslCa"],
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

  const close = () => {
    form.reset()
    setSlugTouched(false)
    setProfileTouched(false)
    setDedicated(false)
    setProvisioningId(null)
    setStep(0)
    setOpen(false)
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
        // Hand off to the progress panel rather than closing. The run may
        // still stop and wait for a database credential, and that prompt is
        // the only place it is ever accepted — closing here would strand it.
        onSuccess: (institution) => setProvisioningId(institution.id),
        onError: () => {},
      }
    )
  })

  const isLastStep = step === STEPS.length - 1
  const errors = form.formState.errors

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--accent)",
          color: "#fff",
          fontSize: 13.5,
          fontWeight: 500,
          padding: "11px 18px",
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Onboard institution
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        disabled
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--accent)",
          color: "#fff",
          fontSize: 13.5,
          fontWeight: 500,
          padding: "11px 18px",
          borderRadius: 11,
          border: "none",
          cursor: "default",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
          opacity: 0.6,
        }}
      >
        Onboard institution
      </button>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
        }}
      >
        <div
          onClick={close}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8,12,18,.5)",
          }}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Onboard an institution"
          style={{
            position: "relative",
            width: 780,
            maxWidth: "calc(94vw / var(--zoom))",
            maxHeight: "calc(92vh / var(--zoom))",
            overflowY: "auto",
            background: "var(--surface-solid)",
            borderRadius: 20,
            boxShadow: "var(--shadow-pop)",
            padding: "26px 30px",
            color: "var(--txt)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              Onboard an institution
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              style={{
                marginLeft: "auto",
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--panel)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                style={{ stroke: "var(--icon-strong)" }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div
            style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 18 }}
          >
            A tenant is provisioned empty — the institution loads its own people
            and courses.
          </div>

          {provisioningId !== null ? (
            <ProvisioningPanel
              tenantId={provisioningId}
              name={form.getValues("name")}
              host={form.getValues("dbHost") ?? null}
              onDone={close}
              onBackToForm={() => {
                setProvisioningId(null)
                setStep(0)
              }}
            />
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {STEPS.map((label, i) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background:
                          i <= step ? "var(--accent)" : "var(--line-strong)",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        color: i <= step ? "var(--txt2)" : "var(--txt4)",
                        marginTop: 6,
                        fontWeight: i === step ? 600 : 400,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {step === 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 18px",
                  }}
                >
                  <Field
                    label="Institution name"
                    span
                    error={errors.name?.message}
                  >
                    <Text
                      {...form.register("name")}
                      placeholder="e.g. University of Lagos"
                    />
                  </Field>

                  <Field
                    label="Slug"
                    hint="Becomes the database name. Lowercase letters, digits and underscores."
                    error={errors.slug?.message}
                  >
                    <Text
                      {...form.register("slug", {
                        onChange: () => setSlugTouched(true),
                      })}
                      placeholder="unilag"
                      mono
                    />
                  </Field>

                  <Field
                    label="Official domain"
                    hint="Admin accounts must use this domain."
                    error={errors.domain?.message}
                  >
                    <Text
                      {...form.register("domain")}
                      placeholder="unilag.edu.ng"
                    />
                  </Field>

                  <Field label="Plan" error={errors.plan?.message}>
                    <Text {...form.register("plan")} placeholder="pilot" />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  <Controller
                    control={form.control}
                    name="programCategories"
                    render={({ field }) => (
                      <Field
                        label="Programs they run — pick all that apply"
                        hint="This decides what gets provisioned: the calendar, the structural nodes, and which award templates exist."
                        error={errors.programCategories?.message}
                      >
                        <Chips
                          options={PROGRAM_CATEGORY_OPTIONS.map((o) => ({
                            value: o.value,
                            label: o.label,
                          }))}
                          selected={field.value ?? []}
                          multiple
                          onPick={(value) => {
                            const current = field.value ?? []

                            field.onChange(
                              current.includes(value as never)
                                ? current.filter((v) => v !== value)
                                : [...current, value]
                            )
                          }}
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="calendarUnit"
                    render={({ field }) => (
                      <Field label="Academic calendar">
                        <Chips
                          options={CALENDAR_UNIT_OPTIONS.map((o) => ({
                            value: o.value,
                            label: o.label,
                          }))}
                          selected={[field.value]}
                          onPick={(value) => {
                            setProfileTouched(true)
                            field.onChange(value)
                          }}
                        />
                      </Field>
                    )}
                  />

                  <Field
                    label="Periods per session"
                    error={errors.periodsPerSession?.message}
                  >
                    <Text
                      type="number"
                      min={1}
                      max={12}
                      {...form.register("periodsPerSession", {
                        valueAsNumber: true,
                        onChange: () => setProfileTouched(true),
                      })}
                      mono
                    />
                  </Field>

                  <Controller
                    control={form.control}
                    name="regulator"
                    render={({ field }) => (
                      <Field label="Regulator">
                        <Chips
                          options={REGULATOR_OPTIONS.map((o) => ({
                            value: o.value,
                            label: o.label,
                          }))}
                          selected={[field.value]}
                          onPick={(value) => {
                            setProfileTouched(true)
                            field.onChange(value)
                          }}
                        />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="awardTypes"
                    render={({ field }) => (
                      <Field
                        label="Awards they issue"
                        error={errors.awardTypes?.message}
                      >
                        <Chips
                          options={AWARD_TYPE_OPTIONS.map((o) => ({
                            value: o.value,
                            label: o.label,
                          }))}
                          selected={field.value ?? []}
                          multiple
                          onPick={(value) => {
                            setProfileTouched(true)

                            const current = field.value ?? []

                            field.onChange(
                              current.includes(value as never)
                                ? current.filter((v) => v !== value)
                                : [...current, value]
                            )
                          }}
                        />
                      </Field>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  <Field
                    label="Database"
                    hint={
                      dedicated
                        ? "Their hardware, their region, their backups. The password is NOT collected here — the provisioning job asks for it once, and that prompt is the only place it ever exists in a browser."
                        : "Shared MySQL cluster — isolated schema, managed backups. Most institutions start here."
                    }
                  >
                    <Chips
                      options={[
                        { value: "shared", label: "Shared cluster" },
                        { value: "dedicated", label: "Dedicated server" },
                      ]}
                      selected={[dedicated ? "dedicated" : "shared"]}
                      onPick={(value) => {
                        const on = value === "dedicated"

                        setDedicated(on)

                        if (!on) {
                          // Clear the whole set together. A host left behind with
                          // the toggle off would still reach the API and pause a
                          // run nobody meant to start.
                          form.setValue("dbHost", undefined)
                          form.setValue("dbPort", undefined)
                          form.setValue("dbUsername", undefined)
                          form.setValue("dbSslCa", undefined)
                        }
                      }}
                    />
                  </Field>

                  {dedicated && (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 90px 1.4fr",
                          gap: 10,
                        }}
                      >
                        <Text
                          {...form.register("dbHost")}
                          placeholder="db.unilag.edu.ng"
                          mono
                        />
                        <Text
                          type="number"
                          {...form.register("dbPort", { valueAsNumber: true })}
                          placeholder="3306"
                          mono
                        />
                        <Text
                          {...form.register("dbUsername")}
                          placeholder="db user"
                        />
                      </div>

                      <Field
                        label="CA bundle"
                        hint="Attached means connections verify the server certificate."
                        error={errors.dbSslCa?.message}
                      >
                        <Text
                          {...form.register("dbSslCa")}
                          placeholder="Paste the CA bundle, or leave empty for no verification"
                        />
                      </Field>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 18px",
                  }}
                >
                  <Field label="Tagline" span error={errors.tagline?.message}>
                    <Text
                      {...form.register("tagline")}
                      placeholder="Knowledge for service"
                    />
                  </Field>

                  <Field label="Website" error={errors.websiteUrl?.message}>
                    <Text
                      {...form.register("websiteUrl")}
                      placeholder="https://unilag.edu.ng"
                    />
                  </Field>

                  <Field label="Logo URL" error={errors.logoUrl?.message}>
                    <Text
                      {...form.register("logoUrl")}
                      placeholder="https://…"
                    />
                  </Field>

                  <Field
                    label="Support email"
                    error={errors.supportEmail?.message}
                  >
                    <Text
                      {...form.register("supportEmail")}
                      placeholder="support@unilag.edu.ng"
                    />
                  </Field>

                  <Field
                    label="Support phone"
                    error={errors.supportPhone?.message}
                  >
                    <Text
                      {...form.register("supportPhone")}
                      placeholder="+234…"
                    />
                  </Field>

                  <Field
                    label="Brand colours"
                    span
                    hint="Their portal is painted with these. Nothing in this console uses them."
                  >
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {(
                        Object.keys(DEFAULT_BRAND_COLORS) as Array<
                          keyof typeof DEFAULT_BRAND_COLORS
                        >
                      ).map((key) => (
                        <label
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12.5,
                            color: "var(--txt2)",
                          }}
                        >
                          <input
                            type="color"
                            {...form.register(
                              `branding.colors.${key}` as never
                            )}
                            style={{
                              width: 30,
                              height: 30,
                              padding: 0,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 8,
                              background: "var(--panel)",
                              cursor: "pointer",
                            }}
                          />
                          {key}
                        </label>
                      ))}

                      <div
                        className="qhub-mono"
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          color: "var(--txt4)",
                          alignSelf: "center",
                        }}
                      >
                        {Object.values(colors ?? {}).join(" · ")}
                      </div>
                    </div>
                  </Field>

                  <Field label="Font family" span>
                    <Text
                      {...form.register("branding.fontFamily")}
                      placeholder="Optional — their portal's typeface"
                    />
                  </Field>
                </div>
              )}

              {step === 4 && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px 18px",
                    }}
                  >
                    <Field
                      label="Admin email"
                      span
                      hint="Must be on the official domain. The invitation goes here."
                      error={errors.adminEmail?.message}
                    >
                      <Text
                        {...form.register("adminEmail")}
                        placeholder="registrar@unilag.edu.ng"
                      />
                    </Field>

                    <Field
                      label="First name"
                      error={errors.adminFirstName?.message}
                    >
                      <Text {...form.register("adminFirstName")} />
                    </Field>

                    <Field
                      label="Last name"
                      error={errors.adminLastName?.message}
                    >
                      <Text {...form.register("adminLastName")} />
                    </Field>

                    <Field
                      label="Username"
                      error={errors.adminUsername?.message}
                    >
                      <Text {...form.register("adminUsername")} mono />
                    </Field>

                    <Field
                      label="Initial password"
                      error={errors.adminPassword?.message}
                    >
                      <Text
                        type="password"
                        {...form.register("adminPassword")}
                      />
                    </Field>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      padding: "13px 15px",
                      borderRadius: 11,
                      background: "var(--warn-bg)",
                      fontSize: 12.5,
                      color: "var(--txt2)",
                      lineHeight: 1.55,
                    }}
                  >
                    Provisioning creates a live, empty tenant and emails the
                    primary admin at the official domain. It does not load any
                    student data — the institution does that itself.
                  </div>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  style={{
                    fontSize: 13,
                    color: step === 0 ? "var(--txt4)" : "var(--txt2)",
                    padding: "10px 6px",
                    background: "transparent",
                    border: "none",
                    cursor: step === 0 ? "default" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Back
                </button>

                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "var(--txt4)",
                  }}
                >
                  Step {step + 1} of {STEPS.length}
                </div>

                <button
                  type="button"
                  disabled={provision.isPending}
                  onClick={() => {
                    if (isLastStep) void onSubmit()
                    else void goNext()
                  }}
                  style={{
                    background: provision.isPending
                      ? "var(--panel)"
                      : "var(--accent)",
                    color: provision.isPending ? "var(--txt4)" : "#fff",
                    fontSize: 13.5,
                    fontWeight: 500,
                    padding: "11px 22px",
                    borderRadius: 11,
                    border: "none",
                    cursor: provision.isPending ? "default" : "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {provision.isPending
                    ? "Provisioning…"
                    : isLastStep
                      ? "Provision institution"
                      : "Continue"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ── pieces ──────────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  error,
  span,
  children,
}: {
  label: string
  hint?: string
  error?: string
  span?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : undefined}>
      <div style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>

      {children}

      {error !== undefined && (
        <div style={{ fontSize: 11.5, color: "var(--neg)", marginTop: 6 }}>
          {error}
        </div>
      )}

      {error === undefined && hint !== undefined && (
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 6 }}>
          {hint}
        </div>
      )}
    </div>
  )
}

const Text = function Text({
  mono,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean
  ref?: React.Ref<HTMLInputElement>
}) {
  return (
    <input
      ref={ref}
      {...props}
      className={mono === true ? "qhub-mono" : undefined}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--line-strong)",
        borderRadius: 11,
        background: "var(--panel)",
        padding: "12px 14px",
        fontSize: 14,
        color: "var(--txt)",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  )
}

function Chips({
  options,
  selected,
  multiple,
  onPick,
}: {
  options: Array<{ value: string; label: string }>
  selected: readonly string[]
  multiple?: boolean
  onPick: (value: string) => void
}) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {options.map((option) => {
        const on = selected.includes(option.value)

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={multiple === true ? on : undefined}
            onClick={() => onPick(option.value)}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 13px",
              borderRadius: 9,
              cursor: "pointer",
              color: on ? "var(--accent)" : "var(--txt2)",
              background: on ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
              fontFamily: "inherit",
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
