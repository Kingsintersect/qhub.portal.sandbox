"use client"

import { useState } from "react"

import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"
import { useOpenIncident } from "@/modules/platform-ops-overview/hooks/use-ops-overview"

const SEVERITIES: Array<{ key: string; label: string; note: string }> = [
  { key: "SEV1", label: "SEV-1", note: "Students cannot work" },
  { key: "SEV2", label: "SEV-2", note: "Badly degraded" },
  { key: "SEV3", label: "SEV-3", note: "Noticeable, not blocking" },
]

/**
 * Open a platform incident, lifted from the draft.
 *
 * Opening one is not a private note: affected institutions see a banner in
 * their own console. So the dialog says who will see it before the button is
 * pressed, and platform-wide is a deliberate choice rather than the default —
 * telling every university that something is broken when it affects two of
 * them costs trust that is hard to earn back.
 */
export function LogIncidentDialog({ onClose }: { onClose: () => void }) {
  const { data: institutionPage } = useInstitutions()
  const institutions = institutionPage?.data ?? []
  const open = useOpenIncident()

  const [title, setTitle] = useState("")
  const [detail, setDetail] = useState("")
  const [severity, setSeverity] = useState("SEV2")
  const [platformWide, setPlatformWide] = useState(false)
  const [tenantIds, setTenantIds] = useState<number[]>([])

  const ready = title.trim() !== "" && (platformWide || tenantIds.length > 0)

  const audience = platformWide
    ? "Every institution will see a banner in its console."
    : tenantIds.length === 0
      ? "Pick who is affected — or mark it platform-wide."
      : `${tenantIds.length} institution${tenantIds.length === 1 ? "" : "s"} will see a banner.`

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,12,18,.45)",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log incident"
        style={{
          position: "relative",
          width: 560,
          maxWidth: "calc(94vw / var(--zoom))",
          maxHeight: "calc(88vh / var(--zoom))",
          overflow: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Log incident
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          Opens as Investigating, owned by you. Affected institutions see a
          banner in their own console.
        </div>

        <Label>WHAT IS HAPPENING</Label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Grade exports failing for large cohorts"
          maxLength={200}
          style={{ ...field, width: "100%" }}
        />

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="What is known so far. Institutions do not see this — it is the internal record."
          rows={3}
          maxLength={5000}
          style={{ ...field, width: "100%", marginTop: 8, resize: "vertical" }}
        />

        <Label>SEVERITY</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SEVERITIES.map((s) => {
            const on = severity === s.key

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSeverity(s.key)}
                style={{
                  textAlign: "left",
                  padding: "8px 13px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: on ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                }}
              >
                <div
                  className="qhub-mono"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: on ? "var(--accent)" : "var(--txt2)",
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                  {s.note}
                </div>
              </button>
            )
          })}
        </div>

        <Label>WHO IS AFFECTED</Label>
        <button
          type="button"
          onClick={() => {
            setPlatformWide((p) => !p)
            setTenantIds([])
          }}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "10px 13px",
            borderRadius: 11,
            cursor: "pointer",
            fontFamily: "inherit",
            background: platformWide ? "var(--warn-bg)" : "transparent",
            border: `1px solid ${platformWide ? "var(--series2)" : "var(--line-strong)"}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: platformWide ? "var(--series2)" : "var(--txt)",
            }}
          >
            Platform-wide
          </div>
          <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 1 }}>
            Every institution is told. Only when it genuinely affects all of
            them.
          </div>
        </button>

        {!platformWide && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              marginTop: 8,
            }}
          >
            {institutions.map((i) => {
              const on = tenantIds.includes(i.id)

              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() =>
                    setTenantIds((prev) =>
                      on ? prev.filter((p) => p !== i.id) : [...prev, i.id]
                    )
                  }
                  style={{
                    textAlign: "left",
                    padding: "9px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: on ? "var(--accent-soft)" : "transparent",
                    border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: on ? "var(--accent)" : "var(--txt2)",
                  }}
                >
                  {i.name}
                </button>
              )
            })}
          </div>
        )}

        <div
          style={{
            fontSize: 11.5,
            color: ready ? "var(--txt4)" : "var(--series2)",
            marginTop: 14,
            lineHeight: 1.55,
          }}
        >
          {audience}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button type="button" onClick={onClose} style={ghost}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || open.isPending}
            onClick={() =>
              open.mutate(
                {
                  title: title.trim(),
                  detail: detail.trim() === "" ? null : detail.trim(),
                  severity,
                  isPlatformWide: platformWide,
                  tenantIds: platformWide ? [] : tenantIds,
                },
                { onSuccess: () => onClose() }
              )
            }
            style={{
              border: "1px solid var(--neg)",
              background: "var(--neg)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 10,
              cursor: ready && !open.isPending ? "pointer" : "not-allowed",
              opacity: ready && !open.isPending ? 1 : 0.55,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {open.isPending ? "Opening…" : "Open incident"}
          </button>
        </div>
      </div>
    </div>
  )
}

const field: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
}

const ghost: React.CSSProperties = {
  border: "1px solid var(--line-strong)",
  background: "transparent",
  color: "var(--txt2)",
  fontSize: 12.5,
  fontWeight: 500,
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: ".07em",
        color: "var(--txt4)",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
