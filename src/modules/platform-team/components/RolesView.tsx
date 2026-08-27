"use client"

import { useMemo, useState } from "react"

import { usePlatformPermissions as useMyPermissions } from "@/lib/auth/platform-permissions"
import {
  useDeleteRole,
  usePlatformPermissions,
  usePlatformRoles,
  usePlatformUsers,
  useUpdateRolePermissions,
} from "@/modules/platform-team/hooks/use-platform-team"
import type { PlatformRole, PlatformUser } from "@/modules/platform-team/types"

type Tab = "roles" | "matrix" | "people"

/**
 * Roles and permissions, lifted from the draft.
 *
 * Three views over one set of data: the roles as cards, the permission matrix
 * with an explicit save, and the people holding them.
 *
 * Refusals name the exact permission that is missing rather than saying "not
 * allowed" — somebody who knows which box to tick can get unblocked without
 * asking anybody.
 */
export function RolesView() {
  const { can } = useMyPermissions()
  const canManage = can("roles.manage")

  const [tab, setTab] = useState<Tab>("roles")
  const [openRoleId, setOpenRoleId] = useState<number | null>(null)

  const { data: roles, isPending } = usePlatformRoles()
  const { data: catalog } = usePlatformPermissions()
  const { data: users } = usePlatformUsers()

  const permissionCount = useMemo(
    () => Object.values(catalog ?? {}).flat().length,
    [catalog]
  )
  const moduleCount = Object.keys(catalog ?? {}).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
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
            Roles &amp; Permissions
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
            {roles?.length ?? 0} roles · {permissionCount} permissions across{" "}
            {moduleCount} modules · counts computed from the live set
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            background: "var(--panel)",
            borderRadius: 12,
            padding: 3,
            width: "fit-content",
          }}
        >
          {(
            [
              ["roles", "Roles"],
              ["matrix", "Permission matrix"],
              ["people", "People"],
            ] as Array<[Tab, string]>
          ).map(([value, label]) => (
            <Segment
              key={value}
              label={label}
              active={tab === value}
              onClick={() => setTab(value)}
            />
          ))}
        </div>
      </div>

      {!canManage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-brd)",
            borderRadius: 12,
            padding: "11px 16px",
            fontSize: 12.5,
            color: "var(--txt2)",
          }}
        >
          Read-only — this account does not hold{" "}
          <span className="qhub-mono" style={{ fontSize: 11.5 }}>
            roles.manage
          </span>
          . Everything is visible; nothing is editable.
        </div>
      )}

      {isPending && <Empty>Loading…</Empty>}

      {tab === "roles" && roles && (
        <RoleCards
          roles={roles}
          users={users ?? []}
          canManage={canManage}
          permissionCount={permissionCount}
          onOpenMatrix={(id) => {
            setOpenRoleId(id)
            setTab("matrix")
          }}
        />
      )}

      {tab === "matrix" && roles && catalog && (
        <Matrix
          roles={roles}
          catalog={catalog}
          users={users ?? []}
          canManage={canManage}
          openRoleId={openRoleId ?? roles[0]?.id ?? null}
          onSelectRole={setOpenRoleId}
        />
      )}

      {tab === "people" && <People users={users ?? []} />}
    </div>
  )
}

// --- Roles ------------------------------------------------------------------

function RoleCards({
  roles,
  users,
  canManage,
  permissionCount,
  onOpenMatrix,
}: {
  roles: PlatformRole[]
  users: PlatformUser[]
  canManage: boolean
  permissionCount: number
  onOpenMatrix: (id: number) => void
}) {
  const remove = useDeleteRole()

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
        gap: 14,
      }}
    >
      {roles.map((role) => {
        const holders = users.filter((u) =>
          u.roles.some((r) => r.id === role.id)
        )

        // Built-in roles are never deletable, and a custom role with members
        // is not either — the draft states both reasons under the control
        // rather than letting somebody find out by clicking.
        const deletable = !role.isSystem && holders.length === 0
        const reason = role.isSystem
          ? "Built-in roles cannot be deleted."
          : holders.length > 0
            ? `Remove its ${holders.length} member${holders.length === 1 ? "" : "s"} first.`
            : ""

        return (
          <div
            key={role.id}
            style={{
              background: "var(--card)",
              borderRadius: 18,
              boxShadow: "var(--shadow-card)",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="qhub-mono"
                style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)" }}
              >
                {role.name}
              </div>
              <Badge
                tone={
                  role.isSystem
                    ? { c: "var(--txt3)", bg: "var(--panel)" }
                    : { c: "var(--accent)", bg: "var(--accent-soft)" }
                }
              >
                {role.isSystem ? "BUILT-IN" : "CUSTOM"}
              </Badge>
              {role.isSuperuser && (
                <Badge tone={{ c: "var(--neg)", bg: "var(--neg-bg)" }}>
                  SUPERUSER
                </Badge>
              )}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--txt2)",
                lineHeight: 1.5,
                minHeight: 38,
              }}
            >
              {role.description ?? "No description."}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 12.5,
                color: "var(--txt3)",
              }}
            >
              <div style={{ fontWeight: 500, color: "var(--txt)" }}>
                {role.isSuperuser
                  ? "every permission, by bypass"
                  : `${role.permissions.length} of ${permissionCount} permissions`}
              </div>
              <div>
                {holders.length} member{holders.length === 1 ? "" : "s"}
              </div>
            </div>

            <div
              style={{
                fontSize: 11.5,
                color: "var(--txt4)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {holders.map((h) => h.username).join(", ") || "nobody yet"}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Ghost onClick={() => onOpenMatrix(role.id)}>
                Open in matrix
              </Ghost>
              {canManage && deletable && (
                <Ghost tone="danger" onClick={() => remove.mutate(role.id)}>
                  Delete
                </Ghost>
              )}
            </div>

            {reason && (
              <div
                style={{ fontSize: 11, color: "var(--txt4)", lineHeight: 1.45 }}
              >
                {reason}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Matrix -----------------------------------------------------------------

function Matrix({
  roles,
  catalog,
  users,
  canManage,
  openRoleId,
  onSelectRole,
}: {
  roles: PlatformRole[]
  catalog: Record<
    string,
    Array<{ id: number; name: string; description?: string | null }>
  >
  users: PlatformUser[]
  canManage: boolean
  openRoleId: number | null
  onSelectRole: (id: number) => void
}) {
  const role = roles.find((r) => r.id === openRoleId) ?? roles[0]
  const save = useUpdateRolePermissions()

  const [draft, setDraft] = useState<number[] | null>(null)
  const [collapsed, setCollapsed] = useState<string[]>([])

  const current = draft ?? role?.permissionIds ?? []
  const dirty =
    draft !== null &&
    (draft.length !== (role?.permissionIds.length ?? 0) ||
      draft.some((id) => !(role?.permissionIds ?? []).includes(id)))

  const holders = users.filter((u) => u.roles.some((r) => r.id === role?.id))

  if (!role) return <Empty>No roles yet.</Empty>

  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              onSelectRole(r.id)
              setDraft(null)
            }}
            className="qhub-mono"
            style={{
              fontSize: 11,
              color: r.id === role.id ? "var(--accent)" : "var(--txt3)",
              border: `1px solid ${r.id === role.id ? "var(--accent-brd)" : "var(--line-strong)"}`,
              background:
                r.id === role.id ? "var(--accent-soft)" : "transparent",
              padding: "5px 10px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 460px",
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {/* Superuser renders no checkboxes at all. It is a bypass flag, not
              a set of grants — drawing 26 ticked boxes would imply somebody
              could untick one and take something away, and they cannot. */}
          {role.isSuperuser ? (
            <div style={{ padding: "24px 24px 26px" }}>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)" }}
              >
                {role.name} bypasses permission checks
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--txt3)",
                  lineHeight: 1.6,
                  marginTop: 8,
                  maxWidth: 520,
                }}
              >
                Superuser is a flag, not a list of grants. There are no boxes to
                tick here because unticking one would take nothing away — the
                check is bypassed before it reaches the permission set. It
                cannot be granted from this screen either; it is transferred.
              </p>
            </div>
          ) : (
            Object.entries(catalog).map(([module, permissions]) => {
              const isCollapsed = collapsed.includes(module)
              const granted = permissions.filter((p) =>
                current.includes(p.id)
              ).length

              return (
                <div
                  key={module}
                  style={{ borderTop: "1px solid var(--line2)" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((prev) =>
                        prev.includes(module)
                          ? prev.filter((m) => m !== module)
                          : [...prev, module]
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--txt)",
                        textTransform: "capitalize",
                      }}
                    >
                      {module}
                    </span>
                    <span
                      className="qhub-mono"
                      style={{ fontSize: 11, color: "var(--txt4)" }}
                    >
                      {granted}/{permissions.length}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "var(--txt4)",
                      }}
                    >
                      {isCollapsed ? "show" : "hide"}
                    </span>
                  </button>

                  {!isCollapsed &&
                    permissions.map((p) => {
                      const on = current.includes(p.id)
                      const changed =
                        draft !== null &&
                        on !== role.permissionIds.includes(p.id)

                      return (
                        <label
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 24px",
                            fontSize: 12.5,
                            color: "var(--txt2)",
                            cursor: canManage ? "pointer" : "default",
                            background: changed
                              ? "var(--warn-bg)"
                              : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={!canManage}
                            onChange={() =>
                              setDraft((prev) => {
                                const base = prev ?? role.permissionIds

                                return base.includes(p.id)
                                  ? base.filter((id) => id !== p.id)
                                  : [...base, p.id]
                              })
                            }
                          />
                          <span
                            className="qhub-mono"
                            style={{ fontSize: 11.5 }}
                          >
                            {p.name}
                          </span>
                          {changed && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: ".06em",
                                color: "var(--warn)",
                              }}
                            >
                              UNSAVED
                            </span>
                          )}
                        </label>
                      )
                    })}
                </div>
              )
            })
          )}

          {canManage && dirty && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                borderTop: "1px solid var(--line-strong)",
                background: "var(--surface-solid)",
              }}
            >
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--warn)",
                  fontWeight: 500,
                }}
              >
                Unsaved changes · nothing applies until you save
              </div>
              <button
                type="button"
                onClick={() => setDraft(null)}
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "var(--txt3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() =>
                  save.mutate(
                    { roleId: role.id, permissionIds: current },
                    { onSuccess: () => setDraft(null) }
                  )
                }
                disabled={save.isPending}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            flex: "0 1 280px",
            background: "var(--card)",
            borderRadius: 18,
            boxShadow: "var(--shadow-card)",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)" }}>
            Who holds this role
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--txt4)",
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Saving changes what these people can do, immediately.
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {holders.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                Nobody yet.
              </div>
            )}
            {holders.map((h) => (
              <div key={h.id} style={{ fontSize: 12.5, color: "var(--txt2)" }}>
                {h.username}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// --- People -----------------------------------------------------------------

function People({ users }: { users: PlatformUser[] }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      {users.length === 0 && <Empty>No platform accounts yet.</Empty>}

      {users.map((u) => {
        // The loudest row on the page. An account with no role can sign in and
        // do nothing, which is almost always a half-finished invitation.
        const roleless = u.roles.length === 0

        return (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 24px",
              borderTop: "1px solid var(--line2)",
              background: roleless ? "var(--neg-bg)" : "transparent",
              fontSize: 13,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: "var(--txt)" }}>
                {u.username}
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 2 }}
              >
                {u.email}
              </div>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {roleless ? (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: ".06em",
                    color: "var(--neg)",
                  }}
                >
                  NO ROLES — CAN DO NOTHING
                </span>
              ) : (
                u.roles.map((r) => (
                  <span
                    key={r.id}
                    className="qhub-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      background: "var(--accent-soft)",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {r.name}
                  </span>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: { c: string; bg: string }
}) {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: ".08em",
        padding: "3px 8px",
        borderRadius: 6,
        color: tone.c,
        background: tone.bg,
      }}
    >
      {children}
    </span>
  )
}

function Segment({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt3)",
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        padding: "8px 16px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Ghost({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  tone?: "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${tone === "danger" ? "var(--neg)" : "var(--line-strong)"}`,
        borderRadius: 9,
        background: "transparent",
        color: tone === "danger" ? "var(--neg)" : "var(--txt2)",
        fontSize: 12,
        fontWeight: 500,
        padding: "7px 13px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "26px 24px", fontSize: 13, color: "var(--txt3)" }}>
      {children}
    </div>
  )
}
