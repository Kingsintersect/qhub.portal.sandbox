"use client"

import { useState } from "react"

import { useLogUpgrade } from "@/modules/platform-ops-overview/hooks/use-ops-overview"

/** The components an upgrade can touch, as drawn. */
const COMPONENTS = [
  "API",
  "Console",
  "Moodle bridge",
  "Database",
  "Payments",
  "Reports",
]

const ROLLOUT: Array<{ key: string; label: string }> = [
  { key: "FLEET_WIDE", label: "Fleet-wide" },
  { key: "SELECTED", label: "Selected" },
  { key: "CANARY", label: "Canary" },
]

const WHEN: Array<{ key: string; label: string }> = [
  { key: "ROLLING_OUT", label: "Rolling out" },
  { key: "SCHEDULED", label: "Scheduled" },
]

/**
 * Log an upgrade, lifted from the draft.
 *
 * Recorded here and posted to affected tenants' consoles when it starts
 * rolling out — which is why the rollout scope is asked for rather than
 * assumed: "fleet-wide" reaches every institution at once.
 */
export function LogUpgradeDialog({ onClose }: { onClose: () => void }) {
  const log = useLogUpgrade()

  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [component, setComponent] = useState<string | null>(null)
  const [scope, setScope] = useState("FLEET_WIDE")
  const [status, setStatus] = useState("ROLLING_OUT")
  const [scheduledFor, setScheduledFor] = useState("")

  const ready = title.trim() !== "" && component !== null

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
        aria-label="Log upgrade"
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
          Log upgrade
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          Tracked here and posted to affected tenants&rsquo; consoles when it
          starts rolling out.
        </div>

        <Label>UPGRADE</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grade export batching improvements"
            maxLength={200}
            style={{ ...field, flex: 1, minWidth: 0 }}
          />
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v1.0.0"
            maxLength={40}
            className="qhub-mono"
            style={{ ...field, width: 90 }}
          />
        </div>

        <Label>COMPONENT</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {COMPONENTS.map((c) => (
            <Chip
              key={c}
              on={component === c}
              onClick={() => setComponent(c)}
              label={c}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
          <div>
            <div style={miniLabel}>ROLLOUT</div>
            <Segmented options={ROLLOUT} value={scope} onChange={setScope} />
          </div>

          <div>
            <div style={miniLabel}>WHEN</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Segmented options={WHEN} value={status} onChange={setStatus} />
              {status === "SCHEDULED" && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  style={{ ...field, width: 190 }}
                />
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
            Scheduled upgrades can be announced from the Announcements module.
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={ghost}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!ready || log.isPending}
              onClick={() =>
                log.mutate(
                  {
                    title: title.trim(),
                    component: component as string,
                    version: version.trim() === "" ? null : version.trim(),
                    rolloutScope: scope,
                    status,
                    scheduledFor:
                      status === "SCHEDULED" && scheduledFor !== ""
                        ? scheduledFor
                        : null,
                  },
                  { onSuccess: () => onClose() }
                )
              }
              style={{
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 10,
                cursor: ready && !log.isPending ? "pointer" : "not-allowed",
                opacity: ready && !log.isPending ? 1 : 0.55,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {log.isPending ? "Logging…" : "Log upgrade"}
            </button>
          </div>
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

const miniLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".07em",
  color: "var(--txt4)",
  marginBottom: 8,
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ ...miniLabel, marginTop: 20 }}>{children}</div>
}

function Chip({
  on,
  onClick,
  label,
}: {
  on: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "7px 12px",
        borderRadius: 9,
        cursor: "pointer",
        fontFamily: "inherit",
        color: on ? "var(--accent)" : "var(--txt2)",
        background: on ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
      }}
    >
      {label}
    </button>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: Array<{ key: string; label: string }>
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--panel)",
        borderRadius: 11,
        padding: 3,
        width: "fit-content",
      }}
    >
      {options.map((o) => {
        const on = value === o.key

        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              fontSize: 12.5,
              fontWeight: on ? 600 : 500,
              color: on ? "var(--txt)" : "var(--txt3)",
              background: on ? "var(--card)" : "transparent",
              boxShadow: on ? "var(--shadow-card)" : "none",
              padding: "7px 14px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
