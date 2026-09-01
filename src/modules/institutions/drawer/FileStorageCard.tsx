"use client"

import type { Infrastructure } from "@/modules/platform-infrastructure/types"

type Storage = NonNullable<Infrastructure["fileStorage"]>

/**
 * Where a school's uploaded files live, lifted from the draft.
 *
 * Four states, and the interesting one is the middle: a school being moved to
 * object storage has its files in TWO places at once, for minutes, and reads
 * still serve from local disk until every file verifies. A card that could not
 * show that would be lying during exactly the window when somebody is watching.
 */
export function FileStorageCard({
  storage,
  onMigrate,
  migrating,
}: {
  storage: Storage | null
  onMigrate: () => void
  migrating: boolean
}) {
  if (storage === null) {
    return null
  }

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>File storage</div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--txt3)",
          }}
        >
          {storage.providerConfigured
            ? `${storage.bucket ?? "object storage"} · ${storage.region ?? "region unset"}`
            : "not provisioned yet"}
        </span>
      </div>

      {storage.state === "LOCAL" && (
        <>
          <div style={{ fontSize: 12.5, color: "var(--txt2)", marginTop: 10 }}>
            {bytes(storage.bytesUsed)} · on the server&rsquo;s own disk
          </div>

          {/* The button is offered only when there is somewhere to move TO.
              A migrate control that always refuses is a control that teaches
              people to ignore controls. */}
          {storage.providerConfigured ? (
            <button
              type="button"
              onClick={onMigrate}
              disabled={migrating}
              style={ghost}
            >
              {migrating ? "Starting…" : "Migrate to object storage…"}
            </button>
          ) : (
            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                marginTop: 10,
                lineHeight: 1.55,
              }}
            >
              Object storage has no bucket or credential yet, so there is
              nowhere to move these to. Uploads stay closed until there is —
              lecture video on this disk would fill the volume the database sits
              on.
            </div>
          )}
        </>
      )}

      {storage.state === "MIGRATING" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginTop: 10,
            }}
          >
            <span
              className="qhub-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".05em",
                padding: "3px 8px",
                borderRadius: 6,
                color: "var(--series2)",
                background: "var(--warn-bg)",
              }}
            >
              MIGRATING
            </span>
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>
              moving {bytes(storage.migration.totalBytes ?? 0)}
            </div>
            <div
              className="qhub-mono"
              style={{
                marginLeft: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--series2)",
              }}
            >
              {storage.migration.percent ?? 0}%
            </div>
          </div>

          <Bar
            percent={storage.migration.percent ?? 0}
            colour="var(--series2)"
          />

          <div
            style={{
              fontSize: 11,
              color: "var(--txt4)",
              marginTop: 8,
              lineHeight: 1.55,
            }}
          >
            {bytes(storage.migration.movedBytes ?? 0)} moved — files exist in
            two places right now; reads serve from local disk until every file
            verifies. Nothing is deleted mid-move.
          </div>
        </>
      )}

      {storage.state === "FAILED" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              className="qhub-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".05em",
                padding: "3px 8px",
                borderRadius: 6,
                color: "var(--neg)",
                background: "var(--neg-bg)",
              }}
            >
              MIGRATION FAILED · PARTIAL
            </span>
            <div style={{ fontSize: 11.5, color: "var(--txt3)" }}>
              {bytes(storage.migration.movedBytes ?? 0)} already moved
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--txt2)",
              lineHeight: 1.55,
              marginTop: 8,
            }}
          >
            {storage.migration.failedReason ??
              "The move stopped without saying why."}
          </div>

          {/* Resumes rather than restarts — the batch number is why. */}
          <button
            type="button"
            onClick={onMigrate}
            disabled={migrating}
            style={{
              ...ghost,
              background: "var(--accent)",
              color: "#fff",
              border: "1px solid var(--accent)",
            }}
          >
            {migrating
              ? "Retrying…"
              : `Retry from batch ${storage.migration.batch + 1}`}
          </button>
        </>
      )}

      {storage.state === "DONE" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "7px 0",
              fontSize: 12.5,
              marginTop: 10,
            }}
          >
            <div style={{ color: "var(--txt2)" }}>Usage · trend</div>
            <div style={{ fontWeight: 500 }}>
              {bytes(storage.bytesUsed)}{" "}
              {storage.trendBytes !== null && (
                <span style={{ fontSize: 11, color: "var(--accent)" }}>
                  {storage.trendBytes >= 0 ? "+" : "−"}
                  {bytes(Math.abs(storage.trendBytes))} · 30d
                </span>
              )}
            </div>

            <div style={{ color: "var(--txt2)" }}>Prefix</div>
            <div
              className="qhub-mono"
              style={{ fontSize: 11, color: "var(--txt2)" }}
            >
              {storage.bucket !== null
                ? `s3://${storage.bucket}/${storage.prefix ?? ""}`
                : (storage.prefix ?? "—")}
            </div>

            <div style={{ color: "var(--txt2)" }}>Region</div>
            <div style={{ fontSize: 12, color: "var(--txt2)" }}>
              {storage.region ?? "—"}
            </div>

            <div style={{ color: "var(--txt2)" }}>Quota</div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: quotaTone(storage),
              }}
            >
              {/* No ceiling is not 0% full — a bar drawn at zero and no bar at
                  all say opposite things. */}
              {storage.quotaBytes === null
                ? "No ceiling set"
                : `${bytes(storage.bytesUsed)} / ${bytes(storage.quotaBytes)} · ${storage.usedPercent}%`}
            </div>
          </div>

          {storage.quotaBytes !== null && (
            <Bar
              percent={storage.usedPercent ?? 0}
              colour={quotaTone(storage)}
            />
          )}

          {storage.overWarningLine && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 9,
                background: "var(--neg-bg)",
                borderRadius: 9,
                padding: "8px 11px",
                fontSize: 11.5,
                color: "var(--txt)",
                lineHeight: 1.5,
              }}
            >
              Over the {storage.warnAtPercent}% warning line — uploads are
              blocked at 100%. Raise the quota or help them prune.
            </div>
          )}
        </>
      )}

      <div
        style={{
          fontSize: 11,
          color: "var(--txt4)",
          marginTop: 10,
          borderTop: "1px solid var(--line2)",
          paddingTop: 9,
          lineHeight: 1.5,
        }}
      >
        One credential per school, scoped to its prefix — policy, not
        convention. The database-per-school rule, applied to files.
      </div>
    </div>
  )
}

function Bar({ percent, colour }: { percent: number; colour: string }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "var(--panel)",
        marginTop: 9,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: colour,
          borderRadius: 999,
        }}
      />
    </div>
  )
}

function quotaTone(storage: Storage): string {
  if (storage.full) return "var(--neg)"
  if (storage.overWarningLine) return "var(--series2)"

  return "var(--txt2)"
}

const ghost: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  border: "1px solid var(--line-strong)",
  background: "transparent",
  color: "var(--txt2)",
  fontSize: 12,
  fontWeight: 500,
  padding: "7px 13px",
  borderRadius: 9,
  cursor: "pointer",
  fontFamily: "inherit",
}

function bytes(n: number): string {
  if (n <= 0) return "0 MB"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const value = n / 1024 ** i

  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}
