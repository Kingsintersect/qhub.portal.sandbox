"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import type { Lecturer } from "@/modules/portal/seed"

/**
 * Inviting a lecturer, lifted from the bundle 25 canvas.
 *
 * Two rules are stated rather than enforced silently. The admin never sees or
 * sends a password — the invitee sets their own from the link — and the work
 * email must be on the institution's domain, checked as it is typed rather
 * than on submit, because being told at the end which field was wrong is the
 * slower way to find out.
 */

const DEPARTMENTS = [
  "Computer Science",
  "Medicine & Surgery",
  "Law",
  "Electrical Engineering",
  "Accounting",
  "Economics",
]

const DOMAIN = "unilag.edu.ng"

export function InviteLecturer({
  onClose,
  onInvited,
}: {
  onClose: () => void
  onInvited: (lecturer: Lecturer, notice: string) => void
}) {
  const [phase, setPhase] = useState<"form" | "done">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [dept, setDept] = useState<string | null>(null)

  const domain = email.includes("@") ? email.split("@")[1] : undefined
  // Only complain once there is a domain to complain about — flagging
  // "a.bello@" as wrong while somebody is still typing it is noise.
  const domainWrong =
    domain !== undefined && domain !== "" && !email.endsWith(`@${DOMAIN}`)

  const ready =
    name.trim() !== "" && email.endsWith(`@${DOMAIN}`) && dept !== null

  const send = () => {
    if (!ready) return

    setPhase("done")
    onInvited(
      {
        name: name.trim(),
        email: email.trim(),
        dept: dept!,
        codes: [],
        students: 0,
        status: "INVITED",
        last: "—",
      },
      `Invitation sent to ${email.trim()} — expires in 7 days`
    )
  }

  return (
    <Modal onClose={onClose} width={480} label="Invite a lecturer">
      {phase === "form" ? (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Invite a lecturer</div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 18px",
            }}
          >
            They set their own password from the invitation link — you never see
            or send one.
          </div>

          <Label>Full name</Label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Amina Bello"
            style={{ ...FIELD, marginBottom: 12 }}
          />

          <Label>Work email — must be on {DOMAIN}</Label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`a.bello@${DOMAIN}`}
            className="portal-mono"
            style={{ ...FIELD, fontSize: 12.5, marginBottom: 4 }}
          />
          {domainWrong && (
            <div
              style={{
                fontSize: 11.5,
                color: "var(--neg)",
                marginBottom: 8,
              }}
            >
              That address is not on {DOMAIN} — personal addresses cannot hold a
              staff account.
            </div>
          )}

          <Label style={{ margin: "10px 0 6px" }}>Department</Label>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {DEPARTMENTS.map((d) => {
              const on = dept === d

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDept(d)}
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
                  {d}
                </button>
              )
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "var(--txt2)",
                padding: "10px 6px",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ready}
              onClick={send}
              style={{
                marginLeft: "auto",
                background: ready ? "var(--accent)" : "var(--line-strong)",
                color: ready ? "#fff" : "var(--txt4)",
                fontSize: 13,
                fontWeight: 500,
                padding: "11px 20px",
                borderRadius: 11,
                cursor: ready ? "pointer" : "default",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              Send invitation
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "14px 8px 8px" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: "var(--good-bg)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.5l5 5L20 7" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Invitation sent</div>
          {/* What INVITED means and how long it lasts, said once, here. */}
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "8px auto 0",
              maxWidth: 330,
              lineHeight: 1.55,
            }}
          >
            Sent to {email}. They appear as INVITED until they set a password;
            the invitation expires in 7 days.
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 22px",
              borderRadius: 11,
              cursor: "pointer",
              marginTop: 16,
              border: "none",
              fontFamily: "inherit",
            }}
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  )
}

const FIELD: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  fontFamily: "inherit",
  outline: "none",
}

function Label({
  style,
  children,
}: {
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--txt3)",
        marginBottom: 6,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
