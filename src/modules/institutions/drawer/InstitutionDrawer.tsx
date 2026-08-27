"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import {
  SupportSessionDialog,
  SupportSessionFrame,
  type SupportSession,
} from "@/modules/platform-shared/SupportSessionDialog"
import { EscalateDialog } from "@/modules/institutions/drawer/EscalateDialog"

import type { Institution } from "@/modules/institutions/types"
import {
  DrawerMenu,
  type DrawerTab,
} from "@/modules/institutions/drawer/DrawerMenu"
import { OverviewTab } from "@/modules/institutions/drawer/OverviewTab"
import { PeopleTab } from "@/modules/institutions/drawer/PeopleTab"
import { FeatureFlagsTab } from "@/modules/institutions/drawer/FeatureFlagsTab"
import { MaintenanceTab } from "@/modules/institutions/drawer/MaintenanceTab"
import { AuditTab } from "@/modules/institutions/drawer/AuditTab"
import { BillingTab } from "@/modules/institutions/drawer/BillingTab"
import { TicketsTab } from "@/modules/institutions/drawer/TicketsTab"
import { BulkImportTab } from "@/modules/institutions/drawer/BulkImportTab"
import { InfrastructureTab } from "@/modules/institutions/drawer/InfrastructureTab"

/**
 * The institution profile drawer, lifted from the draft.
 *
 * 95vw, sliding right-to-left over .4s, with its own 236px side menu. A drawer
 * rather than a page on purpose: the operator is looking INTO one institution
 * from the estate, and closing it should put them back exactly where they
 * were rather than navigating them somewhere and back.
 */
export function InstitutionDrawer({
  institution,
  onClose,
}: {
  institution: Institution
  onClose: () => void
}) {
  const [tab, setTab] = useState<DrawerTab>("overview")
  const [openingSession, setOpeningSession] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [session, setSession] = useState<SupportSession | null>(null)
  const [reason, setReason] = useState("")

  const confirm = useConfirm()
  const queryClient = useQueryClient()

  const act = useMutation({
    mutationFn: async (path: string) =>
      apiClient.post(
        `/platform/tenants/${institution.id}/${path}`,
        {},
        { access_token: true }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform"] })
      void queryClient.invalidateQueries({
        queryKey: ["platform-observability"],
      })
    },
    onError: (e) =>
      toast.error(
        (e as { message?: string } | null)?.message ?? "That did not work."
      ),
  })

  // Mounted closed, then opened on the next frame, so the transform actually
  // animates instead of rendering already-open.
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))

    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)

    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const badge = lifecycleBadge(institution.status)

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
          opacity: shown ? 1 : 0,
          transition: "opacity .34s",
          border: "none",
          padding: 0,
          cursor: "default",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={institution.name}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "calc(95vw / var(--zoom))",
          background: "var(--bg)",
          borderLeft: "1px solid var(--drawer-edge)",
          boxShadow: "-30px 0 70px rgba(8,12,18,.3)",
          transform: shown ? "translateX(0)" : "translateX(100%)",
          transition: "transform .4s cubic-bezier(.32,.72,.28,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 26px",
            borderBottom: "1px solid var(--line-strong)",
            background: "var(--card)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to the estate"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--panel)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg
              style={{ stroke: "var(--icon-strong)" }}
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  whiteSpace: "nowrap",
                  color: "var(--txt)",
                }}
              >
                {institution.name}
              </div>
              <span
                className="qhub-mono"
                style={{
                  fontSize: 10.5,
                  letterSpacing: ".06em",
                  padding: "4px 9px",
                  borderRadius: 7,
                  ...badge.tone,
                }}
              >
                {badge.label}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                marginTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              {institution.slug}
              {institution.plan ? ` · ${institution.plan}` : ""}
              {institution.regulator ? ` · ${institution.regulator}` : ""}
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 9,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setOpeningSession(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Open tenant console
            </button>

            <button
              type="button"
              onClick={() => setEscalating(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Escalate
            </button>

            {institution.status === "SUSPENDED" && (
              <Pill tone="neg">SUSPENDED · portal closed</Pill>
            )}
            {institution.status === "ARCHIVED" && (
              <Pill tone="muted">ARCHIVED · data retained 24 months</Pill>
            )}
            {institution.maintenance?.active && (
              <Pill tone="warn">IN MAINTENANCE</Pill>
            )}

            <div
              style={{
                width: 1,
                height: 22,
                background: "var(--divider)",
                margin: "0 2px",
              }}
            />

            <button
              type="button"
              onClick={onClose}
              title="Close"
              aria-label="Close"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                border: "1px solid var(--line-strong)",
                background: "var(--panel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                style={{ stroke: "var(--icon-strong)" }}
                width="15"
                height="15"
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
        </header>

        <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
          <DrawerMenu tab={tab} onTab={setTab} tenantId={institution.id} />

          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              overflowY: "auto",
              padding: "20px 26px 30px",
            }}
          >
            {tab === "overview" && <OverviewTab institution={institution} />}

            {tab === "students" && (
              <PeopleTab tenantId={institution.id} kind="students" />
            )}
            {tab === "lecturers" && (
              <PeopleTab tenantId={institution.id} kind="lecturers" />
            )}

            {tab === "features" && (
              <FeatureFlagsTab tenantId={institution.id} />
            )}
            {tab === "maint" && <MaintenanceTab institution={institution} />}

            {tab === "infra" && (
              <InfrastructureTab
                tenantId={institution.id}
                institution={institution.name}
              />
            )}

            {tab === "audit" && <AuditTab tenantId={institution.id} />}
            {tab === "billing" && <BillingTab tenantId={institution.id} />}

            {tab === "tickets" && (
              <TicketsTab
                tenantId={institution.id}
                institution={institution.name}
              />
            )}

            {tab === "import" && (
              <BulkImportTab
                tenantId={institution.id}
                institution={institution.name}
              />
            )}
          </div>
        </div>

        <footer
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "13px 26px",
            borderTop: "1px solid var(--line-strong)",
            background: "var(--card)",
          }}
        >
          <div
            className="qhub-mono"
            style={{
              fontSize: 11.5,
              color: "var(--txt3)",
              whiteSpace: "nowrap",
            }}
          >
            {institution.slug}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--txt4)",
              whiteSpace: "nowrap",
            }}
          >
            DPA signed · data resides on{" "}
            {institution.dedicatedDatabaseServer
              ? "this institution's own database server"
              : "the shared cluster"}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FooterAction onClick={() => setTab("audit")}>
              View audit log
            </FooterAction>

            <div
              style={{
                width: 1,
                height: 20,
                background: "var(--divider)",
                margin: "0 4px",
              }}
            />

            {institution.status === "ACTIVE" && (
              <>
                <FooterAction
                  tone="neg"
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Suspend ${institution.name}?`,
                      body: "Their portal closes on the next request. Nothing is deleted and every record is kept — resuming puts it straight back.",
                      label: "Suspend tenant",
                      danger: true,
                    })

                    if (ok) act.mutate("suspend")
                  }}
                >
                  Suspend tenant
                </FooterAction>

                <FooterAction
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Archive ${institution.name}?`,
                      body: "They come off the estate and their records are retained for 24 months, restorable throughout. This is not deletion.",
                      label: "Archive",
                      danger: true,
                    })

                    if (ok) act.mutate("archive")
                  }}
                >
                  Archive
                </FooterAction>
              </>
            )}

            {institution.status !== "ACTIVE" && (
              <FooterAction tone="accent" onClick={() => act.mutate("resume")}>
                {institution.status === "ARCHIVED"
                  ? "Restore"
                  : "Resume tenant"}
              </FooterAction>
            )}
          </div>
        </footer>
      </div>

      {openingSession && (
        <SupportSessionDialog
          tenantId={institution.id}
          name={institution.name}
          slug={institution.slug}
          onReason={setReason}
          onClose={() => setOpeningSession(false)}
          onOpened={setSession}
        />
      )}

      {session !== null && (
        <SupportSessionFrame
          session={session}
          institution={institution.name}
          slug={institution.slug}
          reason={reason}
          onEnd={() => setSession(null)}
        />
      )}

      {escalating && (
        <EscalateDialog
          tenantId={institution.id}
          name={institution.name}
          onClose={() => setEscalating(false)}
        />
      )}
    </div>
  )
}

/** One control in the drawer's footer bar. */
function FooterAction({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  tone?: "neg" | "accent"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        border: `1px solid ${tone === "accent" ? "var(--accent)" : "var(--line-strong)"}`,
        background: "transparent",
        color:
          tone === "neg"
            ? "var(--neg)"
            : tone === "accent"
              ? "var(--accent)"
              : "var(--txt2)",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "9px 14px",
        borderRadius: 10,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "neg" | "warn" | "muted"
}) {
  const tones = {
    neg: { color: "var(--neg)", background: "var(--neg-bg)" },
    warn: { color: "var(--warn)", background: "var(--warn-bg)" },
    muted: { color: "var(--txt3)", background: "var(--panel)" },
  } as const

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "10px 14px",
        borderRadius: 10,
        whiteSpace: "nowrap",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  )
}

function lifecycleBadge(status: string) {
  if (status === "SUSPENDED") {
    return {
      label: "SUSPENDED",
      tone: { color: "var(--neg)", background: "var(--neg-bg)" },
    }
  }
  if (status === "ARCHIVED") {
    return {
      label: "ARCHIVED",
      tone: { color: "var(--txt3)", background: "var(--panel)" },
    }
  }
  if (status === "PROVISIONING") {
    return {
      label: "PROVISIONING",
      tone: { color: "var(--warn)", background: "var(--warn-bg)" },
    }
  }

  return {
    label: "ACTIVE",
    tone: { color: "var(--accent)", background: "var(--accent-soft)" },
  }
}
