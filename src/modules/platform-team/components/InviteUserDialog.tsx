"use client"

import { useMemo, useState } from "react"

import {
  useCreatePlatformUser,
  usePlatformRoles,
} from "@/modules/platform-team/hooks/use-platform-team"

/**
 * Invite somebody to the platform team, lifted from the draft.
 *
 * Roles are granted at creation rather than afterwards, because an account
 * with no role is the loudest row on the People tab — somebody who can sign in
 * and do nothing, which is almost always a half-finished invitation.
 *
 * No password field, deliberately. The account is created dormant and the
 * person sets their own via a single-use link; a password typed here would be
 * one somebody else chose and then had to communicate.
 */
export function InviteUserDialog({ onClose }: { onClose: () => void }) {
  const { data: roles } = usePlatformRoles()
  const invite = useCreatePlatformUser()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [roleIds, setRoleIds] = useState<number[]>([])

  const grantable = useMemo(
    // Owner is a superuser bypass, not a grant. It is transferred, never
    // assigned — offering it here would be offering something the backend
    // will not do.
    () => (roles ?? []).filter((r) => !r.isSuperuser),
    [roles]
  )

  /**
   * How much this actually grants, counted once across the chosen roles.
   *
   * Two roles overlapping heavily grant far less than their totals suggest,
   * and the distinct count is the honest figure.
   */
  const distinctPermissions = useMemo(() => {
    const set = new Set<number>()

    for (const role of grantable) {
      if (roleIds.includes(role.id)) {
        for (const p of role.permissionIds ?? []) set.add(p)
      }
    }

    return set.size
  }, [grantable, roleIds])

  const ready =
    email.trim() !== "" && username.trim() !== "" && roleIds.length > 0

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
        aria-label="Invite user"
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
          Invite user
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          They set their own password from a single-use link. The account cannot
          sign in until they do.
        </div>

        <Label>NAME</Label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            autoFocus
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            maxLength={100}
            style={{ ...field, flex: 1, minWidth: 0 }}
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            maxLength={100}
            style={{ ...field, flex: 1, minWidth: 0 }}
          />
        </div>

        <Label>WORK EMAIL</Label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            // A sensible default they can override — one less field to fill,
            // and it keeps usernames consistent.
            if (username === "") {
              const local = e.target.value.split("@")[0] ?? ""
              setUsername(local.replace(/[^A-Za-z0-9._-]/g, ""))
            }
          }}
          placeholder="name@qverselearning.org"
          type="email"
          maxLength={200}
          style={{ ...field, width: "100%" }}
        />

        <Label>USERNAME</Label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="n.eze"
          maxLength={100}
          className="qhub-mono"
          style={{ ...field, width: "100%" }}
        />

        <Label>ROLES — GRANTED AT CREATION</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {grantable.map((role) => {
            const on = roleIds.includes(role.id)

            return (
              <button
                key={role.id}
                type="button"
                onClick={() =>
                  setRoleIds((prev) =>
                    on ? prev.filter((p) => p !== role.id) : [...prev, role.id]
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  padding: "11px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: on ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: on ? "var(--accent)" : "var(--txt)",
                    }}
                  >
                    {role.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt4)",
                      marginTop: 1,
                    }}
                  >
                    {role.description ?? "—"}
                  </div>
                </div>
                <div
                  className="qhub-mono"
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "var(--txt4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(role.permissionIds ?? []).length} perms
                </div>
              </button>
            )
          })}
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: roleIds.length === 0 ? "var(--series2)" : "var(--txt4)",
            marginTop: 14,
            lineHeight: 1.55,
          }}
        >
          {roleIds.length === 0
            ? "At least one role — an account with none can sign in and do nothing."
            : `Grants ${distinctPermissions} distinct permission${distinctPermissions === 1 ? "" : "s"}. Owner is transferred, never assigned.`}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button type="button" onClick={onClose} style={ghost}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || invite.isPending}
            onClick={() =>
              invite.mutate(
                {
                  email: email.trim(),
                  username: username.trim(),
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  roleIds,
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
              cursor: ready && !invite.isPending ? "pointer" : "not-allowed",
              opacity: ready && !invite.isPending ? 1 : 0.55,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {invite.isPending ? "Inviting…" : "Send invitation"}
          </button>
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: ".07em",
        color: "var(--txt4)",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
