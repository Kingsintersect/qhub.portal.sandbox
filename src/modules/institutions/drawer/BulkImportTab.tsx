"use client"

import { useRef, useState } from "react"

import {
  useImportCourses,
  usePreviewCourseImport,
} from "@/modules/platform-operations/hooks/use-operations"
import type {
  CourseImportPreview,
  CourseImportResult,
} from "@/modules/platform-operations/types"

/**
 * Bulk import into one institution, lifted from the draft.
 *
 * Parse, look, then commit. Nothing is written until the preview is
 * committed, because discovering you overwrote six hundred live courses is
 * not a thing an operator can undo.
 */
export function BulkImportTab({
  tenantId,
  institution,
}: {
  tenantId: number
  institution: string
}) {
  const input = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CourseImportPreview | null>(null)
  const [result, setResult] = useState<CourseImportResult | null>(null)

  const parse = usePreviewCourseImport(tenantId)
  const commit = useImportCourses(tenantId)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (input.current) input.current.value = ""
  }

  const onChoose = async (chosen: File) => {
    setFile(chosen)
    setResult(null)

    const parsed = await parse.mutateAsync(chosen).catch(() => null)

    setPreview(parsed)
  }

  const creates =
    preview?.rows.filter((r) => r.valid && r.outcome === "create").length ?? 0
  const updates =
    preview?.rows.filter((r) => r.valid && r.outcome === "update").length ?? 0

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "18px 22px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        Bulk import — courses &amp; mappings
      </div>
      <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 3 }}>
        CSV or XLSX. Nothing is written until you commit the parsed preview.
      </div>

      <input
        ref={input}
        type="file"
        accept=".csv,.xlsx,.xls"
        aria-label="Choose a file to import"
        onChange={(e) => {
          const chosen = e.target.files?.[0]

          if (chosen) void onChoose(chosen)
        }}
        style={{ display: "none" }}
      />

      {preview === null && result === null && !parse.isPending && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          style={{
            display: "block",
            width: "100%",
            border: "1.5px dashed var(--line-strong)",
            borderRadius: 14,
            padding: 34,
            textAlign: "center",
            marginTop: 16,
            cursor: "pointer",
            background: "transparent",
            color: "var(--txt)",
            fontFamily: "inherit",
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>
            Drop a file here or click to browse
          </div>
          <div style={{ fontSize: 12, color: "var(--txt4)", marginTop: 5 }}>
            courses.csv · imported into {institution} only
          </div>
        </button>
      )}

      {parse.isPending && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 18,
            }}
          >
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              Parsing {file?.name ?? "the file"}…
            </div>
          </div>
          <Bar />
        </>
      )}

      {commit.isPending && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 18,
            }}
          >
            <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              Writing rows…
            </div>
          </div>
          <Bar />
        </>
      )}

      {preview !== null && result === null && !commit.isPending && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 16,
              fontSize: 12.5,
              flexWrap: "wrap",
            }}
          >
            <span className="qhub-mono" style={{ color: "var(--txt3)" }}>
              {file?.name ?? "file"} · {preview.rows.length} rows parsed
            </span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              {creates} create
            </span>
            <span style={{ color: "var(--txt2)", fontWeight: 600 }}>
              {updates} update
            </span>
            <span style={{ color: "var(--neg)", fontWeight: 600 }}>
              {preview.invalid} errors
            </span>
          </div>

          <div
            style={{
              border: "1px solid var(--line2)",
              borderRadius: 12,
              overflow: "hidden",
              marginTop: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "110px minmax(0,1fr) 160px",
                columnGap: 14,
                padding: "10px 16px 8px",
                fontSize: 10,
                letterSpacing: ".09em",
                color: "var(--txt4)",
              }}
            >
              <div>ROW</div>
              <div>CONTENT</div>
              <div>ACTION</div>
            </div>

            {preview.rows.map((row) => (
              <div
                key={row.row}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px minmax(0,1fr) 160px",
                  columnGap: 14,
                  padding: "9px 16px",
                  fontSize: 12.5,
                  borderTop: "1px solid var(--line2)",
                }}
              >
                <div
                  className="qhub-mono"
                  style={{ fontSize: 11, color: "var(--txt4)" }}
                >
                  {row.row}
                </div>
                <div style={{ color: "var(--txt2)", minWidth: 0 }}>
                  {row.code} · {row.title}
                  {row.valid ? "" : ` — ${row.errors.join("; ")}`}
                </div>
                <div
                  style={{
                    fontWeight: 500,
                    color: row.valid
                      ? row.outcome === "create"
                        ? "var(--accent)"
                        : "var(--txt2)"
                      : "var(--neg)",
                  }}
                >
                  {row.valid ? row.outcome : "skip"}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
            }}
          >
            <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
              Errored rows are skipped — the import still commits.
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  border: "1px solid var(--line-strong)",
                  color: "var(--txt2)",
                  background: "transparent",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Discard
              </button>

              <button
                type="button"
                disabled={preview.valid === 0 || file === null}
                onClick={() => {
                  if (file === null) return

                  commit.mutate(file, { onSuccess: setResult })
                }}
                style={{
                  background:
                    preview.valid === 0 ? "var(--panel)" : "var(--accent)",
                  color: preview.valid === 0 ? "var(--txt4)" : "#fff",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 10,
                  cursor: preview.valid === 0 ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                Commit {preview.valid} row{preview.valid === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </>
      )}

      {result !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            background: "var(--good-bg)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 13,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ flex: "0 0 18px" }}
          >
            <path d="M4 12l5 5L20 6" />
          </svg>

          <div>
            {result.skipped > 0 ? "Partial success: " : "Imported: "}
            <b>
              {result.created} created, {result.updated} updated,{" "}
              {result.skipped} skipped.
            </b>
          </div>

          <button
            type="button"
            onClick={reset}
            style={{
              marginLeft: "auto",
              border: "1px solid var(--line-strong)",
              color: "var(--txt2)",
              background: "transparent",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 12px",
              borderRadius: 9,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            New import
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * The draft's indeterminate progress bar.
 *
 * The API does not stream row-level progress, so this animates rather than
 * claiming a percentage it cannot know — a number that is made up is worse
 * than no number.
 */
function Bar() {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: "var(--panel)",
        marginTop: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "40%",
          background: "linear-gradient(90deg, var(--accent), var(--series2))",
          borderRadius: 999,
          animation: "qhub-import-sweep 1.1s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes qhub-import-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes qhub-import-sweep {
            0%, 100% { transform: translateX(0); }
          }
        }
      `}</style>
    </div>
  )
}
