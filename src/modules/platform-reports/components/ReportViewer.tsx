"use client"

import {
  useReportRun,
  useRerunReport,
} from "@/modules/platform-reports/hooks/use-platform-reports"

/**
 * A generated report, rendered, lifted from the draft.
 *
 * What appears here is what downloads — the same artefact, not a summary of
 * it. A preview that showed something else would make the download a surprise,
 * and the whole point of a preview is that it is not.
 *
 * Opening it is written to the audit log, which the footer says out loud
 * rather than leaving somebody to discover.
 */
export function ReportViewer({
  runId,
  onClose,
}: {
  runId: number
  onClose: () => void
}) {
  const { data, isPending } = useReportRun(runId)
  const rerun = useRerunReport()

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 290 }}>
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
        aria-label="Report"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(880px, 92vw)",
          background: "var(--surface-solid)",
          borderLeft: "1px solid var(--line-strong)",
          boxShadow: "-30px 0 80px rgba(8,12,18,.35)",
          padding: 26,
          overflowY: "auto",
          color: "var(--txt)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              {data?.title ?? data?.template ?? "Report"}
            </div>
            <div
              className="qhub-mono"
              style={{ fontSize: 12, color: "var(--txt3)", marginTop: 4 }}
            >
              {meta(data)}
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
              flex: "0 0 auto",
            }}
          >
            <button
              type="button"
              onClick={() => rerun.mutate(runId)}
              disabled={rerun.isPending}
              style={ghost}
            >
              {rerun.isPending ? "Re-running…" : "Re-run"}
            </button>
            <button type="button" onClick={onClose} style={ghost}>
              Close
            </button>
          </div>
        </div>

        {isPending && (
          <div style={{ fontSize: 13, color: "var(--txt4)", marginTop: 20 }}>
            Building the report…
          </div>
        )}

        {data !== undefined && (
          <>
            {(data.sections ?? []).length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 14,
                }}
              >
                {(data.sections ?? []).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--txt3)",
                      background: "var(--panel)",
                      padding: "5px 11px",
                      borderRadius: 999,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {data.kpis.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                {data.kpis.map((k) => (
                  <div
                    key={k.label}
                    style={{
                      border: "1px solid var(--line2)",
                      borderRadius: 14,
                      background: "var(--panel)",
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "var(--txt3)" }}>
                      {k.label}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        marginTop: 5,
                      }}
                    >
                      {k.value}
                    </div>
                    {k.sub !== undefined && k.sub !== null && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--txt4)",
                          marginTop: 2,
                        }}
                      >
                        {k.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.tables.map((table, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--line2)",
                  borderRadius: 14,
                  overflow: "hidden",
                  marginTop: 16,
                }}
              >
                {table.title !== undefined && table.title !== null && (
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "12px 18px 0",
                    }}
                  >
                    {table.title}
                  </div>
                )}

                <div style={{ overflowX: "auto" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${table.columns.length}, minmax(120px, 1fr))`,
                      columnGap: 14,
                      padding: "12px 18px 8px",
                      fontSize: 10,
                      letterSpacing: ".09em",
                      color: "var(--txt4)",
                    }}
                  >
                    {table.columns.map((c) => (
                      <div key={c}>{c}</div>
                    ))}
                  </div>

                  {table.rows.map((row, r) => (
                    <div
                      key={r}
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${table.columns.length}, minmax(120px, 1fr))`,
                        columnGap: 14,
                        padding: "10px 18px",
                        fontSize: 12.5,
                        borderTop: "1px solid var(--line2)",
                      }}
                    >
                      {row.map((cell, c) => (
                        <div
                          key={c}
                          style={{
                            color: "var(--txt2)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}

                  {table.rows.length === 0 && (
                    <div
                      style={{
                        padding: "18px",
                        fontSize: 12.5,
                        color: "var(--txt4)",
                        borderTop: "1px solid var(--line2)",
                      }}
                    >
                      Nothing in this period.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {data.notes.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {data.notes.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12.5,
                      color: "var(--txt2)",
                      lineHeight: 1.6,
                      borderLeft: "2px solid var(--accent-brd)",
                      paddingLeft: 12,
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                Delivery &amp; retention
              </div>

              {data.deliveries.length === 0 ? (
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--txt4)",
                    padding: "9px 0",
                  }}
                >
                  Not sent to anybody — generated and read here only.
                </div>
              ) : (
                data.deliveries.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "9px 0",
                      borderBottom: "1px solid var(--line2)",
                      fontSize: 12.5,
                    }}
                  >
                    <div style={{ flex: "0 0 110px", color: "var(--txt4)" }}>
                      {when(d.occurredAt)}
                    </div>
                    <div style={{ color: "var(--txt2)" }}>
                      {d.channel}
                      {d.recipient !== null ? ` · ${d.recipient}` : ""}
                    </div>
                  </div>
                ))
              )}

              {data.expiresOn !== null && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 10,
                  }}
                >
                  Kept until {when(data.expiresOn)}.
                </div>
              )}
            </div>

            {/* Said out loud rather than left to be discovered. */}
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                marginTop: 16,
                lineHeight: 1.6,
              }}
            >
              This preview renders the artefact itself — what you download is
              exactly this. Opening it was logged.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const ghost: React.CSSProperties = {
  border: "1px solid var(--line-strong)",
  background: "transparent",
  color: "var(--txt2)",
  fontSize: 12,
  fontWeight: 500,
  padding: "7px 13px",
  borderRadius: 9,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
}

function meta(
  run:
    | {
        reference?: string
        periodStart?: string | null
        periodEnd?: string | null
        requestedBy?: string | null
      }
    | undefined
): string {
  if (run === undefined) return ""

  const period =
    run.periodStart !== null && run.periodStart !== undefined
      ? `${when(run.periodStart)} – ${when(run.periodEnd ?? null)}`
      : null

  return [run.reference, period, run.requestedBy]
    .filter((p) => p !== null && p !== undefined && p !== "")
    .join("  ·  ")
}

function when(iso: string | null): string {
  if (iso === null) return "—"

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
