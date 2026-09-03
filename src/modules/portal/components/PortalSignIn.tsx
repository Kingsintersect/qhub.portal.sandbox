"use client"

import { useState } from "react"

/**
 * Staff sign-in, lifted from the bundle 25 canvas as the presentation layer
 * over the real authentication call.
 *
 * Two rules from Design carry with the layout, and both change what the canvas
 * did rather than how it looks.
 *
 * The role comes from the session, never from the address. The canvas decided
 * it by pattern-matching the email, which would let anyone pick their own
 * permissions by typing a different one.
 *
 * An unknown email must not reveal whether the account exists — same card,
 * same timing, generic copy. The canvas greeted the account by name, which
 * turns this form into a directory of who works here. So the identity card
 * echoes what was typed rather than anything the server knows, and there is no
 * account lookup behind the first step at all: a request whose response must
 * be identical either way is a request worth not making. The delay is fixed
 * for the same reason — timing is a side channel.
 *
 * Whether a real account exists is therefore only ever settled by the password
 * submit, and its failure copy is deliberately generic.
 */

const STEP_DELAY_MS = 420

export function PortalSignIn({
  school,
  host,
  domain,
  schoolInitials,
  onSignIn,
}: {
  school: string
  host: string
  /** The institution's official email domain — not the tenant host. */
  domain: string
  schoolInitials: string
  /** Resolves to an error message, or null when the session is established. */
  onSignIn: (email: string, password: string) => Promise<string | null>
}) {
  const [step, setStep] = useState<"email" | "pass">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  // Derived from what was typed, so it discloses nothing.
  const local = email.split("@")[0] ?? ""
  const initials = local
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const submit = async () => {
    if (busy) return

    if (step === "email") {
      if (email.indexOf("@") <= 0) {
        setError("Enter your work email.")
        return
      }
      setError("")
      setBusy(true)
      // Fixed, not measured: a lookup that took longer for real accounts
      // would leak exactly what the generic copy is there to withhold.
      await new Promise((r) => setTimeout(r, STEP_DELAY_MS))
      setBusy(false)
      setStep("pass")
      return
    }

    if (password.length < 4) {
      setError("Enter your password.")
      return
    }

    setBusy(true)
    setError("")
    const message = await onSignIn(email.trim(), password)
    setBusy(false)
    if (message !== null) setError(message)
  }

  return (
    <div
      className="qhub-portal"
      data-theme="light"
      style={{
        minHeight: "100vh",
        background: "url('/portal-login-bg.jpg') center/cover no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,14,26,.28)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 26,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "rgba(255,255,255,.94)",
            color: "#0E2A55",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: ".02em",
            boxShadow: "0 8px 24px rgba(8,12,18,.3)",
          }}
        >
          {schoolInitials}
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              textShadow: "0 1px 8px rgba(8,12,18,.5)",
            }}
          >
            {school}
          </div>
          <div
            className="portal-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.85)",
              textShadow: "0 1px 6px rgba(8,12,18,.5)",
            }}
          >
            {host}
          </div>
        </div>
      </div>

      <div style={{ width: 400, position: "relative" }}>
        <div
          style={{
            background: "var(--card)",
            boxShadow: "0 40px 100px rgba(8,12,18,.45)",
            padding: "32px 32px 28px",
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--txt)",
            }}
          >
            Staff sign in
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "5px 0 20px",
              lineHeight: 1.5,
            }}
          >
            The institution portal for registry staff and lecturers. Students
            use the student app.
          </div>

          <Label>Work email</Label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              // Editing the address invalidates the step it opened.
              setStep("email")
              setPassword("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit()
            }}
            placeholder={`you@${domain}`}
            autoComplete="username"
            style={FIELD}
          />

          {step === "pass" && (
            <div
              style={{
                animation: "ipReveal .45s cubic-bezier(.2,.8,.25,1) both",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-brd)",
                  borderRadius: 11,
                  padding: "10px 13px",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    flex: "0 0 30px",
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  {/* An echo of the address, not a greeting by name: the
                      card must read the same for an account that does not
                      exist. */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {email}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--txt3)" }}>
                    Enter your password to continue
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setPassword("")
                    setError("")
                  }}
                  style={{
                    marginLeft: "auto",
                    fontSize: 11.5,
                    color: "var(--txt3)",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  Not you?
                </button>
              </div>

              <Label style={{ margin: "14px 0 6px" }}>Password</Label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit()
                }}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                style={FIELD}
              />
            </div>
          )}

          {error !== "" && (
            <div
              style={{
                fontSize: 12,
                color: "var(--neg)",
                marginTop: 10,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            style={{
              width: "100%",
              background: "var(--accent)",
              color: "#fff",
              textAlign: "center",
              fontSize: 13.5,
              fontWeight: 500,
              padding: "12px 0",
              borderRadius: 11,
              cursor: busy ? "default" : "pointer",
              marginTop: 18,
              border: "none",
              fontFamily: "inherit",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "…" : step === "email" ? "Continue" : "Sign in"}
          </button>

          <div
            style={{
              fontSize: 11.5,
              color: "var(--txt4)",
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            Accounts are created by your institution admin — there is no
            self-signup. Forgot your password? A reset link goes to your work
            email.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            marginTop: 16,
            fontSize: 11.5,
            color: "rgba(255,255,255,.9)",
            textShadow: "0 1px 6px rgba(8,12,18,.5)",
          }}
        >
          Powered by
          {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
          <img
            src="/brand/qverse-lockup-color-white.gif"
            alt="Qverse"
            style={{ height: 16, width: "auto" }}
          />
        </div>
      </div>
    </div>
  )
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

const FIELD: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "11px 13px",
  fontSize: 13.5,
  color: "var(--txt)",
  fontFamily: "inherit",
  outline: "none",
}
