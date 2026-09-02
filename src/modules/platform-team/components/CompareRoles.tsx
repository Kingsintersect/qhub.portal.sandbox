"use client"

import { useState } from "react"

import type {
  PermissionCatalog,
  PlatformRole,
} from "@/modules/platform-team/types"

/**
 * Two roles, side by side, lifted from the draft.
 *
 * It answers "how does support differ from read_only" without opening either
 * one — which is the question actually asked before granting somebody a role,
 * and the one that otherwise gets answered by opening both in turn and
 * remembering.
 *
 * Only the differences are listed. A diff that also prints every permission
 * the two share is a diff you have to read to find the diff.
 */
export function CompareRoles({
  roles,
  catalog,
}: {
  roles: PlatformRole[]
  /** Keyed by module, which is exactly what the MODULE column needs. */
  catalog: PermissionCatalog
}) {
  const [open, setOpen] = useState(false)
  const [a, setA] = useState<number | null>(roles[0]?.id ?? null)
  const [b, setB] = useState<number | null>(roles[1]?.id ?? null)

  const roleA = roles.find((r) => r.id === a) ?? null
  const roleB = roles.find((r) => r.id === b) ?? null

  const flat = Object.entries(catalog).flatMap(([group, items]) =>
    items.map((p) => ({ ...p, group }))
  )

  const moduleOf = (name: string) =>
    flat.find((p) => p.name === name)?.group ?? "—"

  const describe = (name: string) =>
    flat.find((p) => p.name === name)?.description ?? ""

  /*
   * A superuser role holds no permission rows — it bypasses the check
   * entirely. Diffing its empty list against a real role would report that it
   * can do nothing, which is the opposite of true.
   */
  const bypasses = (r: PlatformRole | null) => r?.isSuperuser === true

  const held = (r: PlatformRole | null) => new Set(r?.permissions ?? [])

  const differences =
    roleA === null || roleB === null || bypasses(roleA) || bypasses(roleB)
      ? []
      : [...new Set([...held(roleA), ...held(roleB)])]
          .filter((p) => held(roleA).has(p) !== held(roleB).has(p))
          .sort((x, y) =>
            moduleOf(x) === moduleOf(y)
              ? x.localeCompare(y)
              : moduleOf(x).localeCompare(moduleOf(y))
          )

  const identical =
    roleA !== null &&
    roleB !== null &&
    !bypasses(roleA) &&
    !bypasses(roleB) &&
    differences.length === 0

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 18,
        boxShadow: "var(--shadow-card)",
        padding: "18px 22px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Compare two roles</div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            border: "1px solid var(--line-strong)",
            background: "transparent",
            color: "var(--txt2)",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "inherit",
            padding: "6px 12px",
            borderRadius: 9,
            cursor: "pointer",
          }}
        >
          Toggle
        </button>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}>
          Answers &ldquo;how does support differ from read_only&rdquo; without
          opening either.
        </div>
      </div>

      {open && (
        <>
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <ChipRow label="A" roles={roles} selected={a} onSelect={setA} />
            <ChipRow label="B" roles={roles} selected={b} onSelect={setB} />
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt2)",
              marginTop: 12,
            }}
          >
            {summary(roleA, roleB, differences.length)}
          </div>

          {identical && (
            <div style={{ fontSize: 13, color: "var(--txt3)", marginTop: 10 }}>
              These two roles hold exactly the same permissions.
            </div>
          )}

          {differences.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px minmax(0,1fr) 90px 90px",
                  columnGap: 14,
                  padding: "12px 4px 6px",
                  fontSize: 10.5,
                  letterSpacing: ".09em",
                  color: "var(--txt4)",
                }}
              >
                <div>MODULE</div>
                <div>PERMISSION</div>
                <div style={{ textAlign: "center" }}>{roleA?.name}</div>
                <div style={{ textAlign: "center" }}>{roleB?.name}</div>
              </div>

              {differences.map((permission) => (
                <div
                  key={permission}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px minmax(0,1fr) 90px 90px",
                    columnGap: 14,
                    alignItems: "center",
                    padding: "9px 4px",
                    borderTop: "1px solid var(--line2)",
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ color: "var(--txt3)" }}>
                    {moduleOf(permission)}
                  </div>
                  <div>
                    <span
                      className="qhub-mono"
                      style={{ fontSize: 11, color: "var(--txt2)" }}
                    >
                      {permission}
                    </span>
                    {describe(permission) !== "" && (
                      <span style={{ color: "var(--txt4)" }}>
                        {" "}
                        — {describe(permission)}
                      </span>
                    )}
                  </div>
                  <Mark held={held(roleA).has(permission)} />
                  <Mark held={held(roleB).has(permission)} />
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

/**
 * What the comparison amounts to, in a sentence.
 *
 * A superuser is called out rather than diffed: it holds no permission rows
 * because it bypasses the check, so a diff would report it can do nothing.
 */
function summary(
  a: PlatformRole | null,
  b: PlatformRole | null,
  count: number
): string {
  if (a === null || b === null) return "Pick a role on each side."

  if (a.id === b.id) return "That is the same role on both sides."

  if (a.isSuperuser || b.isSuperuser) {
    const name = a.isSuperuser ? a.name : b.name

    return `${name} bypasses permission checks entirely, so there is nothing to compare against.`
  }

  if (count === 0) return `${a.name} and ${b.name} are equivalent.`

  return `${count} ${count === 1 ? "permission differs" : "permissions differ"} between ${a.name} and ${b.name}.`
}

function ChipRow({
  label,
  roles,
  selected,
  onSelect,
}: {
  label: string
  roles: PlatformRole[]
  selected: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{ fontSize: 11, color: "var(--txt4)", letterSpacing: ".06em" }}
      >
        {label}
      </span>
      {roles.map((r) => {
        const on = r.id === selected

        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className="qhub-mono"
            style={{
              fontSize: 11,
              color: on ? "var(--accent)" : "var(--txt3)",
              border: `1px solid ${on ? "var(--accent-brd)" : "var(--line-strong)"}`,
              background: on ? "var(--accent-soft)" : "transparent",
              padding: "5px 10px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {r.name}
          </button>
        )
      })}
    </div>
  )
}

/** Held or not. A tick and a dash, never a cross — nothing here has failed. */
function Mark({ held }: { held: boolean }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontWeight: 600,
        color: held ? "var(--accent)" : "var(--txt4)",
      }}
    >
      {held ? "✓" : "—"}
    </div>
  )
}
