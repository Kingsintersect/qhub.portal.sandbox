"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import apiClient from "@/lib/clients/apiClient"
import { useConfirm } from "@/modules/platform-shared/ConfirmProvider"
import {
  SupportSessionDialog,
  SupportSessionFrame,
  type SupportSession,
} from "@/modules/platform-shared/SupportSessionDialog"
import { OffboardingTracker } from "@/modules/institutions/drawer/OffboardingTracker"
import { useInstitutionObservability } from "@/modules/platform-observability/hooks/use-observability"
import type { Institution } from "@/modules/institutions/types"

/**
 * The drawer's Overview: the offboarding tracker when one is running, the
 * institution's stat strip, its notes, and the lifecycle controls.
 */
export function OverviewTab({ institution }: { institution: Institution }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()

  const [openingSession, setOpeningSession] = useState(false)
  const [session, setSession] = useState<SupportSession | null>(null)
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  const { data: detail } = useInstitutionObservability(institution.id)

  const act = useMutation({
    mutationFn: async (input: {
      path: string
      body?: Record<string, unknown>
    }) =>
      apiClient.post(
        `/platform/tenants/${institution.id}/${input.path}`,
        input.body ?? {},
        { access_token: true }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform"] })
    },
    onError: (e) =>
      toast.error(
        (e as { message?: string } | null)?.message ?? "That did not work."
      ),
  })

  const metrics = detail?.current

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <OffboardingTracker tenantId={institution.id} />

      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        <Stat label="Students" value={metrics?.students ?? 0} />
        <Stat label="Lecturers" value={metrics?.lecturers ?? 0} />
        <Stat label="Programmes" value={metrics?.programs ?? 0} />
        <Stat label="Courses" value={metrics?.courses ?? 0} />
        <Stat label="Staff" value={metrics?.staff ?? 0} />
        <Stat label="Users" value={metrics?.users ?? 0} last />
      </div>

      <div
        style={{
          display: "flex",
          gap: 9,
          flexWrap: "wrap",
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

        {institution.status === "ACTIVE" && (
          <Ghost
            onClick={async () => {
              const ok = await confirm({
                title: `Suspend ${institution.name}?`,
                body: "Their portal closes on the next request. Nothing is deleted and every record is kept — resuming puts it straight back.",
                label: "Suspend",
                danger: true,
              })

              if (ok) act.mutate({ path: "suspend" })
            }}
          >
            Suspend
          </Ghost>
        )}

        {institution.status !== "ACTIVE" && (
          <Ghost onClick={() => act.mutate({ path: "resume" })}>Resume</Ghost>
        )}

        {institution.status !== "ARCHIVED" && (
          <Ghost
            onClick={async () => {
              const ok = await confirm({
                title: `Archive ${institution.name}?`,
                body: "They come off the estate and their records are retained for 24 months, restorable throughout. This is not deletion.",
                label: "Archive",
                danger: true,
              })

              if (ok) act.mutate({ path: "archive" })
            }}
          >
            Archive
          </Ghost>
        )}

        <Ghost
          onClick={() =>
            act.mutate(
              { path: "contact" },
              {
                onSuccess: () =>
                  toast.success(
                    "Registry contacted — once a day is the limit."
                  ),
              }
            )
          }
        >
          Contact registry
        </Ghost>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 18,
          boxShadow: "var(--shadow-card)",
          padding: "18px 22px",
        }}
      >
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--txt)" }}>
          Notes
        </div>
        <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}>
          Internal and timestamped. The institution never sees these.
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note…"
            aria-label="Add a note"
            style={{
              flex: 1,
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 9,
              padding: "8px 12px",
              fontSize: 12.5,
              color: "var(--txt)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <Ghost
            onClick={() =>
              note.trim() &&
              act.mutate(
                { path: "notes", body: { body: note.trim() } },
                { onSuccess: () => setNote("") }
              )
            }
          >
            Add note
          </Ghost>
        </div>
      </div>

      {openingSession && (
        <SupportSessionDialog
          tenantId={institution.id}
          name={institution.name}
          slug={institution.slug}
          onClose={() => setOpeningSession(false)}
          onOpened={(s) => {
            setSession(s)
            setReason(reason)
          }}
        />
      )}

      {session && (
        <SupportSessionFrame
          session={session}
          institution={institution.name}
          slug={institution.slug}
          reason={reason}
          onEnd={() => setSession(null)}
        />
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  last,
}: {
  label: string
  value: number
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--txt3)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        className="qhub-mono"
        style={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt)",
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function Ghost({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 10,
        background: "transparent",
        color: "var(--txt2)",
        fontSize: 13,
        fontWeight: 500,
        padding: "10px 16px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}
