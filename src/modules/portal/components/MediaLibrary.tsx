"use client"

import { useState } from "react"

import type { MediaItem } from "@/modules/portal/seed"
import { TYPE_META } from "@/modules/portal/seed"

/**
 * The institution's media library, lifted from the bundle 25 canvas.
 *
 * Two facts ride in the footer because they change how the table is read. A
 * PLATFORM item was delivered by Qverse on the institution's behalf, not
 * uploaded by anyone here — so nobody hunts for the staff member who added it.
 * And every student open is written to the audit log, which is the sort of
 * thing people should be told rather than discover.
 */

const GRID = "minmax(0,2fr) 90px minmax(0,1fr) 110px 130px 110px"

const TYPES = ["All", "Video", "Audio", "PDF"] as const

export function MediaLibrary({
  items,
  title,
  sub,
  onUpload,
}: {
  items: MediaItem[]
  title: string
  sub: string
  onUpload: () => void
}) {
  const [type, setType] = useState<(typeof TYPES)[number]>("All")

  const shown = items.filter((m) => type === "All" || m.type === type)

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            {sub}
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            {TYPES.map((t) => {
              const on = type === t

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "7px 12px",
                    borderRadius: 9,
                    cursor: "pointer",
                    color: on ? "var(--accent)" : "var(--txt2)",
                    background: on ? "var(--accent-soft)" : "transparent",
                    border: `1px solid ${
                      on ? "var(--accent-brd)" : "var(--line-strong)"
                    }`,
                    fontFamily: "inherit",
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onUpload}
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 10,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border: "none",
              fontFamily: "inherit",
            }}
          >
            Upload media
          </button>
        </div>
      </div>

      {shown.map((m) => {
        const meta = TYPE_META[m.type]
        const platform = m.src === "PLATFORM"

        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              columnGap: 14,
              alignItems: "center",
              padding: "12px 4px",
              fontSize: 13,
              borderBottom: "1px solid var(--line)",
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
                  background: meta.bg,
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
                  stroke={meta.tone}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={meta.d} />
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
                  {m.by}
                </div>
              </div>
            </div>

            <div
              className="portal-mono"
              style={{ fontSize: 11, color: meta.tone }}
            >
              {m.type}
            </div>

            <div
              className="portal-mono"
              style={{ fontSize: 11.5, color: "var(--txt2)" }}
            >
              {m.course} ·{" "}
              {/* Who it reaches, in the accent — the targeting is the part
                  somebody double-checks before publishing. */}
              <span style={{ color: "var(--accent)" }}>{m.target}</span>
            </div>

            <div style={{ fontSize: 12, color: "var(--txt3)" }}>
              {m.sizeLen}
            </div>

            <div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: platform ? "var(--series2)" : "var(--accent)",
                  background: platform
                    ? "var(--warn-bg)"
                    : "var(--accent-soft)",
                }}
              >
                {m.src}
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>{m.when}</div>
          </div>
        )
      })}

      {shown.length === 0 && (
        <div
          style={{
            padding: "26px 4px",
            fontSize: 13,
            color: "var(--txt4)",
            textAlign: "center",
          }}
        >
          No media of this type yet.
        </div>
      )}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 12 }}>
        Items marked PLATFORM were delivered by Qverse on the institution&apos;s
        behalf · every student open is written to the audit log
      </div>
    </div>
  )
}
