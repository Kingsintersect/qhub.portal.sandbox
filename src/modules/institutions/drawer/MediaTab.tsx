"use client"

import { useState } from "react"

import { useMediaLibrary } from "@/modules/platform-media/hooks/use-media"
import type { MediaItem, MediaKind } from "@/modules/platform-media/types"

const GRID = "minmax(200px,2fr) .8fr 1fr .8fr 100px"

const FILTERS: Array<{ key: "" | MediaKind; label: string }> = [
  { key: "", label: "All" },
  { key: "VIDEO", label: "Video" },
  { key: "AUDIO", label: "Audio" },
  { key: "PDF", label: "PDF" },
]

/**
 * What this school can see, lifted from the draft.
 *
 * Its own uploads AND the estate-wide ones — the server's visibleTo() answers
 * both halves, which is the point: filtering to this tenant alone would hide
 * every lecture uploaded for all institutions from the school it was meant
 * for, and the omission would look like an empty shelf rather than a bug.
 */
export function MediaTab({ tenantId }: { tenantId: number }) {
  const [kind, setKind] = useState<"" | MediaKind>("")

  const { data, isPending } = useMediaLibrary({
    institution: tenantId,
    kind: kind === "" ? undefined : kind,
    perPage: 32,
  })

  const rows = data?.data ?? []

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "18px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            Media attached to this school
          </div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Uploaded from the library and targeted here, or to all institutions
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
          {FILTERS.map((f) => {
            const on = kind === f.key

            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setKind(f.key)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 12px",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: on ? "var(--accent)" : "var(--txt3)",
                  background: on ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {rows.map((m) => (
        <div
          key={m.id}
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 14,
            padding: "13px 2px",
            borderBottom: "1px solid var(--line)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 24,
                flex: "0 0 34px",
                borderRadius: 6,
                background: tone(m.kind).bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tone(m.kind).fg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={GLYPH[m.kind]} />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {m.title}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                {m.uploadedBy ?? "—"}
                {/* Says where it came from: a lecture that reaches this school
                    because it was sent to everybody is a different fact from
                    one uploaded for this school alone. */}
                {m.estateWide ? " · all institutions" : ""}
              </div>
            </div>
          </div>

          <div
            className="qhub-mono"
            style={{ fontSize: 11, color: tone(m.kind).fg }}
          >
            {m.kind}
          </div>

          <div
            style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}
          >
            {m.levelLabels.join(" · ")}
          </div>

          <div style={{ fontSize: 12, color: "var(--txt3)" }}>
            {formatBytes(m.bytes)}
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              className="qhub-mono"
              title={m.failedReason ?? undefined}
              style={{
                fontSize: 10,
                letterSpacing: ".07em",
                padding: "4px 9px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                ...statusTone(m.status),
              }}
            >
              {m.status}
            </span>
          </div>
        </div>
      ))}

      {!isPending && rows.length === 0 && (
        <div
          style={{
            padding: "24px 2px",
            fontSize: 13,
            color: "var(--txt4)",
            textAlign: "center",
          }}
        >
          Nothing here yet — media uploaded from the library and targeted to
          this school (or to all institutions) appears here.
        </div>
      )}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        Delivery follows the level targeting · opening any item from the tenant
        side is written to the school&rsquo;s audit log
      </div>
    </div>
  )
}

const GLYPH: Record<MediaKind, string> = {
  VIDEO: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
  AUDIO:
    "M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z",
  PDF: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
}

function tone(kind: MediaKind): { fg: string; bg: string } {
  switch (kind) {
    case "VIDEO":
      return { fg: "var(--accent)", bg: "var(--accent-soft)" }
    case "AUDIO":
      return { fg: "var(--series2)", bg: "var(--warn-bg)" }
    default:
      return { fg: "var(--neg)", bg: "var(--neg-bg)" }
  }
}

function statusTone(status: MediaItem["status"]): {
  color: string
  background: string
} {
  switch (status) {
    case "READY":
      return { color: "var(--accent)", background: "var(--good-bg)" }
    case "PROCESSING":
      return { color: "var(--series2)", background: "var(--warn-bg)" }
    default:
      return { color: "var(--neg)", background: "var(--neg-bg)" }
  }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  )
  const value = bytes / 1024 ** i

  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}
