"use client"

import { useState } from "react"

import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"
import { UploadMediaDialog } from "@/modules/platform-media/components/UploadMediaDialog"
import { useMediaLibrary } from "@/modules/platform-media/hooks/use-media"
import type { MediaItem, MediaKind } from "@/modules/platform-media/types"

const GRID = "minmax(220px,2fr) 1.4fr 1fr .8fr .9fr 110px"

/**
 * The media library, lifted from the draft.
 *
 * Every row states who it reaches — the institution and the levels — because
 * that pair is the whole point of an upload here and getting it wrong is not
 * visible anywhere else.
 */
export function MediaLibrary() {
  const [search, setSearch] = useState("")
  const [institution, setInstitution] = useState<number | "">("")
  const [layout, setLayout] = useState<"list" | "grid">("list")
  const [uploading, setUploading] = useState(false)

  const { data: institutionPage } = useInstitutions()
  const institutions = institutionPage?.data ?? []
  const { data, isPending } = useMediaLibrary({
    institution,
    search: search.trim() === "" ? undefined : search.trim(),
    perPage: 8,
  })

  const rows = data?.data ?? []
  const stats = data?.meta.stats
  const total = data?.meta.total ?? 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            Media library
          </div>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            Pre-recorded lectures uploaded on behalf of instructors · targeted
            per institution and level · every upload and view is audited
          </div>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={() => setUploading(true)}
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
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 16V5M7 10l5-5 5 5M4 19h16" />
            </svg>
            Upload media
          </button>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <Stat label="Videos in library" value={stats?.videos ?? 0} />
        <Stat
          label="Storage used"
          value={formatBytes(stats?.storageBytes ?? 0)}
        />
        <Stat
          label="Processing now"
          value={stats?.processing ?? 0}
          tone={stats && stats.processing > 0 ? "var(--series2)" : undefined}
        />
        <Stat
          label="Institutions covered"
          value={stats?.institutionsCovered ?? 0}
          // Estate-wide uploads reach every school without naming one, so
          // the count alone would understate reach.
          note={
            stats && stats.estateWide > 0
              ? `+ ${stats.estateWide} estate-wide`
              : undefined
          }
          last
        />
      </div>

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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, course, uploader…"
            style={{
              width: 280,
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--txt)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <select
            value={institution}
            onChange={(e) =>
              setInstitution(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--txt)",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="">All institutions</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--txt4)" }}>
              {total} item{total === 1 ? "" : "s"}
            </div>

            <div
              style={{
                display: "flex",
                border: "1px solid var(--line-strong)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <LayoutButton
                on={layout === "list"}
                onClick={() => setLayout("list")}
                label="List"
              />
              <LayoutButton
                on={layout === "grid"}
                onClick={() => setLayout("grid")}
                label="Grid"
              />
            </div>
          </div>
        </div>

        {layout === "list" && rows.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 14,
                padding: "10px 12px",
                borderBottom: "1px solid var(--line-strong)",
                fontSize: 11,
                letterSpacing: ".08em",
                color: "var(--txt4)",
              }}
            >
              <div>TITLE</div>
              <div>INSTITUTION · TARGET</div>
              <div>COURSE</div>
              <div>SIZE · LENGTH</div>
              <div>UPLOADED</div>
              <div style={{ textAlign: "right" }}>STATUS</div>
            </div>

            {rows.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  gap: 14,
                  padding: "13px 12px",
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
                  <KindTile kind={m.kind} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
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
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13 }}>{institutionLabel(m)}</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--accent)",
                      fontWeight: 500,
                    }}
                  >
                    {m.levelLabels.join(" · ")}
                  </div>
                </div>

                <div
                  className="qhub-mono"
                  style={{ fontSize: 12, color: "var(--txt2)" }}
                >
                  {m.course ?? "—"}
                </div>

                <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                  {formatBytes(m.bytes)}
                  {m.durationSeconds !== null &&
                    ` · ${runtime(m.durationSeconds)}`}
                </div>

                <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                  {when(m.createdAt)}
                </div>

                <div style={{ textAlign: "right" }}>
                  <StatusPill item={m} />
                </div>
              </div>
            ))}
          </>
        )}

        {layout === "grid" && rows.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              paddingTop: 4,
            }}
          >
            {rows.map((m) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 110,
                    background: tone(m.kind).bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <KindGlyph kind={m.kind} size={30} />
                  <span
                    className="qhub-mono"
                    style={{
                      position: "absolute",
                      top: 9,
                      left: 9,
                      fontSize: 9.5,
                      letterSpacing: ".07em",
                      padding: "3px 8px",
                      borderRadius: 999,
                      color: tone(m.kind).fg,
                      background: "var(--card)",
                    }}
                  >
                    {m.kind}
                  </span>
                  <span style={{ position: "absolute", top: 9, right: 9 }}>
                    <StatusPill item={m} />
                  </span>
                </div>

                <div style={{ padding: "12px 14px" }}>
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
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt4)",
                      marginTop: 3,
                    }}
                  >
                    {institutionLabel(m)} ·{" "}
                    <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                      {m.levelLabels.join(" · ")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 8,
                      fontSize: 11.5,
                      color: "var(--txt3)",
                    }}
                  >
                    <span className="qhub-mono">{m.course ?? "—"}</span>
                    <span style={{ marginLeft: "auto" }}>
                      {formatBytes(m.bytes)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPending && rows.length === 0 && (
          <div
            style={{
              padding: "26px 12px",
              fontSize: 13,
              color: "var(--txt4)",
              textAlign: "center",
            }}
          >
            No media matches these filters.
          </div>
        )}
      </div>

      {uploading && <UploadMediaDialog onClose={() => setUploading(false)} />}
    </div>
  )
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number | string
  note?: string
  tone?: string
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last === true ? undefined : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{ fontSize: 22, fontWeight: 600, color: tone ?? "var(--txt)" }}
        >
          {value}
        </span>
        {note !== undefined && (
          <span style={{ fontSize: 11.5, color: "var(--txt4)" }}>{note}</span>
        )}
      </div>
    </div>
  )
}

function LayoutButton({
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
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "7px 12px",
        cursor: "pointer",
        border: "none",
        fontFamily: "inherit",
        color: on ? "var(--accent)" : "var(--txt3)",
        background: on ? "var(--accent-soft)" : "transparent",
      }}
    >
      {label}
    </button>
  )
}

/** Each kind carries its own tone, as drawn. */
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

const GLYPH: Record<MediaKind, string> = {
  VIDEO: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
  AUDIO:
    "M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z",
  PDF: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
}

function KindGlyph({ kind, size }: { kind: MediaKind; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={tone(kind).fg}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={GLYPH[kind]} />
    </svg>
  )
}

function KindTile({ kind }: { kind: MediaKind }) {
  return (
    <div
      style={{
        width: 34,
        height: 24,
        flex: "0 0 34px",
        borderRadius: 6,
        background: tone(kind).bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <KindGlyph kind={kind} size={11} />
    </div>
  )
}

/**
 * Status, with the failure reason attached.
 *
 * A FAILED lecture that cannot say why is a support ticket, so the reason
 * rides along in the title rather than being dropped on the floor.
 */
function StatusPill({ item }: { item: MediaItem }) {
  const map = {
    READY: { fg: "var(--accent)", bg: "var(--good-bg)" },
    PROCESSING: { fg: "var(--series2)", bg: "var(--warn-bg)" },
    FAILED: { fg: "var(--neg)", bg: "var(--neg-bg)" },
  }[item.status]

  return (
    <span
      className="qhub-mono"
      title={item.failedReason ?? undefined}
      style={{
        fontSize: 10,
        letterSpacing: ".07em",
        padding: "4px 9px",
        borderRadius: 999,
        color: map.fg,
        background: map.bg,
        whiteSpace: "nowrap",
      }}
    >
      {item.status}
    </span>
  )
}

/** "All institutions" is a real target, not a missing name. */
function institutionLabel(item: MediaItem): string {
  return item.estateWide ? "All institutions" : (item.institution ?? "—")
}

/** "1h 42m", or "58m" under the hour — the draft's own shape. */
function runtime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
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

function when(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}
