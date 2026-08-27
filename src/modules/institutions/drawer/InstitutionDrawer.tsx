"use client"

import { useEffect, useState } from "react"

import type { Institution } from "@/modules/institutions/types"
import {
  DrawerMenu,
  type DrawerTab,
} from "@/modules/institutions/drawer/DrawerMenu"
import { OverviewTab } from "@/modules/institutions/drawer/OverviewTab"
import { PeopleTab } from "@/modules/institutions/drawer/PeopleTab"

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
          width: "95vw",
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

            {!["overview", "students", "lecturers"].includes(tab) && (
              <PendingTab />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * A tab whose surface has not been lifted yet.
 *
 * Says so plainly rather than rendering an improvised stand-in — an invented
 * screen is harder to replace than an empty one, and this project's rule is
 * that surfaces come from the design.
 */
function PendingTab() {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "22px 24px",
        fontSize: 13,
        color: "var(--txt3)",
        lineHeight: 1.6,
        maxWidth: 560,
      }}
    >
      This tab is not lifted yet. Its data and endpoints exist; the surface is
      being built from the design rather than improvised.
    </div>
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
