"use client"

import { useMemo, useState } from "react"

import { useEstateOverview } from "@/modules/platform-observability/hooks/use-observability"
import type {
  EstateInstitution,
  HealthStatus,
} from "@/modules/platform-observability/types"
import { ProvisionInstitutionDialog } from "@/modules/institutions/components/ProvisionInstitutionDialog"
import { InstitutionDrawer } from "@/modules/institutions/drawer/InstitutionDrawer"
import { useInstitution } from "@/modules/institutions/hooks/use-institutions"

const GRID = "1.5fr 120px 110px 130px 1.2fr 160px 40px"
const PAGE_SIZE = 8

/**
 * The estate, lifted from the draft.
 *
 * One rollup query feeds both the stat strip and the table — the whole point
 * of the rollup is that this costs the same whether there are five
 * institutions or five hundred.
 */
export function InstitutionsView() {
  const { data, isPending, isError } = useEstateOverview()
  const [openId, setOpenId] = useState<number | null>(null)

  const [issuesOnly, setIssuesOnly] = useState(false)
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const all = data?.institutions ?? []

    return issuesOnly ? all.filter((i) => i.issues > 0) : all
  }, [data, issuesOnly])

  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const needingAttention =
    (data?.health.failing ?? 0) + (data?.health.warning ?? 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--txt)",
              margin: 0,
            }}
          >
            Institutions
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            {data
              ? `${data.totals.institutions} onboarded · ${data.totals.active} active · counts from the rollup${
                  data.lastCapturedAt
                    ? `, last captured ${new Date(data.lastCapturedAt).toLocaleString()}`
                    : ""
                }`
              : "Every institution onboarded to the platform"}
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
          <button
            type="button"
            onClick={() => {
              setIssuesOnly((v) => !v)
              setPage(1)
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 15px",
              borderRadius: 11,
              cursor: "pointer",
              color: issuesOnly ? "var(--neg)" : "var(--txt2)",
              background: issuesOnly ? "var(--neg-bg)" : "transparent",
              border: `1px solid ${issuesOnly ? "var(--neg)" : "var(--line-strong)"}`,
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: "var(--neg)",
              }}
            />
            {issuesOnly
              ? "Showing issues only"
              : `Issues only · ${needingAttention}`}
          </button>

          <ProvisionInstitutionDialog />
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        <Stat
          label="Institutions"
          value={data?.totals.institutions ?? 0}
          note={`${data?.totals.active ?? 0} active`}
        />
        <Stat
          label="Needing attention"
          value={needingAttention}
          note="failing or warning"
          tone={needingAttention > 0 ? "neg" : undefined}
        />
        <Stat
          label="Learners"
          value={data?.totals.students ?? 0}
          note="estate-wide"
        />
        <Stat
          label="Lecturers"
          value={data?.totals.lecturers ?? 0}
          note="estate-wide"
        />
        <Stat
          label="Programmes"
          value={data?.totals.programs ?? 0}
          note="estate-wide"
        />
        <Stat
          label="Never captured"
          value={data?.health.unknown ?? 0}
          note="check the scheduler"
          tone={(data?.health.unknown ?? 0) > 0 ? "warn" : undefined}
          last
        />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            columnGap: 18,
            padding: "16px 24px 10px",
            fontSize: 10.5,
            letterSpacing: ".09em",
            color: "var(--txt4)",
          }}
        >
          <div>INSTITUTION</div>
          <div>PLAN</div>
          <div>LEARNERS</div>
          <div>LAST SYNC</div>
          <div>OPEN ISSUE</div>
          <div>HEALTH</div>
          <div />
        </div>

        {isError && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--neg)",
            }}
            role="alert"
          >
            The estate rollup could not be read.
          </div>
        )}

        {isPending && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Loading…
          </div>
        )}

        {!isPending && !isError && pageRows.length === 0 && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            No institutions match these filters.
          </div>
        )}

        {pageRows.map((row) => (
          <InstitutionRow
            key={row.id}
            row={row}
            onOpen={() => setOpenId(row.id)}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--line2)",
            fontSize: 12.5,
            color: "var(--txt3)",
          }}
        >
          <div>
            {rows.length} institution{rows.length === 1 ? "" : "s"}
            {issuesOnly ? " with open issues" : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--txt4)" }}>
              Page {page} of {lastPage}
            </div>
            <Pager
              label="Previous"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <Pager
              label="Next"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            />
          </div>
        </div>
      </div>

      {openId !== null && (
        <InstitutionDrawerLoader
          tenantId={openId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}

/**
 * Loads the full institution before opening the drawer.
 *
 * The estate rollup carries enough for a row but not enough for a profile —
 * lifecycle state, branding and maintenance all come from the tenant record.
 */
function InstitutionDrawerLoader({
  tenantId,
  onClose,
}: {
  tenantId: number
  onClose: () => void
}) {
  const { data } = useInstitution(tenantId)

  if (!data) return null

  return <InstitutionDrawer institution={data} onClose={onClose} />
}

function InstitutionRow({
  row,
  onOpen,
}: {
  row: EstateInstitution
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        columnGap: 18,
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        padding: "14px 24px",
        fontSize: 13.5,
        borderTop: "1px solid var(--line2)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "var(--txt)",
      }}
    >
      <span
        style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: dotFor(row.health),
            flex: "0 0 7px",
          }}
        />
        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.name}
          </span>
          <span
            style={{
              display: "block",
              fontSize: 11.5,
              color: "var(--txt3)",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.slug}
          </span>
        </span>
      </span>

      <span style={{ color: "var(--txt2)" }}>{row.plan ?? "—"}</span>

      <span
        className="qhub-mono"
        style={{ fontSize: 12.5, color: "var(--txt2)" }}
      >
        {row.students.toLocaleString()}
      </span>

      <span style={{ color: "var(--txt2)", fontSize: 12.5 }}>
        {row.capturedAt
          ? new Date(row.capturedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })
          : "never"}
      </span>

      <span
        style={{
          fontSize: 12.5,
          color: row.issues > 0 ? "var(--neg)" : "var(--txt3)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {row.issues > 0
          ? `${row.issues} failing check${row.issues === 1 ? "" : "s"}`
          : "none"}
      </span>

      <span>
        <span
          className="qhub-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: ".06em",
            padding: "4px 9px",
            borderRadius: 7,
            ...healthTone(row.health),
          }}
        >
          {healthLabel(row.health)}
        </span>
      </span>

      <span
        style={{
          display: "flex",
          justifyContent: "flex-end",
          color: "var(--txt4)",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}

// --- Small pieces -----------------------------------------------------------

function dotFor(health: HealthStatus): string {
  if (health === "FAIL") return "var(--neg)"
  if (health === "WARN") return "var(--warn)"

  return "var(--accent)"
}

function healthTone(health: HealthStatus) {
  if (health === "FAIL") {
    return { color: "var(--neg)", background: "var(--neg-bg)" }
  }
  if (health === "WARN") {
    return { color: "var(--warn)", background: "var(--warn-bg)" }
  }

  return { color: "var(--accent)", background: "var(--accent-soft)" }
}

function healthLabel(health: HealthStatus): string {
  if (health === "FAIL") return "DEGRADED"
  if (health === "WARN") return "WARNING"

  return "HEALTHY"
}

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number
  note: string
  tone?: "neg" | "warn"
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
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
        <div
          className="qhub-mono"
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color:
              tone === "neg"
                ? "var(--neg)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--txt)",
          }}
        >
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function Pager({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: 9,
        background: "var(--panel)",
        border: "none",
        color: disabled ? "var(--txt4)" : "var(--txt2)",
        fontSize: 12.5,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}
