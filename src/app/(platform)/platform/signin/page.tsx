"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"

import { requestPlatformPasswordReset } from "@/lib/auth/platformAuth"

/**
 * Sign-in for platform staff.
 *
 * Lifted from the QHub estate console design. Every colour, size, weight and
 * sentence here comes from that draft — nothing is improvised.
 *
 * Four states on one square-cornered card, because they are four different
 * conversations and merging any two of them wastes somebody's time:
 *
 *  - **signin** — email and password.
 *  - **mfa** — the password was right and no session exists yet. Distinct on
 *    purpose: the design's line is "no session exists until it's right".
 *  - **forgot** — a non-disclosing sent state that reveals nothing about
 *    whether the address is registered.
 *  - **invite** — an account that was created but never set up. This is NOT a
 *    wrong password, and telling somebody to check their typing when the real
 *    answer is "use the link in your invitation" sends them round in circles.
 */

type Mode = "signin" | "mfa" | "forgot" | "invite"
type SigninError = "plain" | "unset" | null

// Straight from the design's palette.
const C = {
  ink: "#141A22",
  body: "#5A6472",
  bodyStrong: "#3E4753",
  label: "#8A93A0",
  accent: "#1D5FBF",
  accentHover: "#174C99",
  field: "#F5F7FA",
  fieldBorder: "#DCE1E8",
  negText: "#C2453A",
  negBg: "#FBEBE9",
  warnText: "#8A6116",
  warnBg: "#FBF3E2",
  infoBg: "#EDF3FC",
  disabledBg: "#E8EBF0",
  disabledText: "#A6AEB9",
} as const

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: C.field,
  border: `1px solid ${C.fieldBorder}`,
  padding: "12px 14px",
  fontSize: 14,
  color: C.ink,
  outline: "none",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".07em",
  color: C.label,
  marginTop: 22,
  marginBottom: 7,
}

const primaryStyle: React.CSSProperties = {
  marginTop: 20,
  background: C.accent,
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  padding: 13,
  textAlign: "center",
  cursor: "pointer",
  border: "none",
  width: "100%",
  fontFamily: "inherit",
}

const linkStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: C.accent,
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "inherit",
}

export default function PlatformSigninPage() {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<SigninError>(null)
  const [inviteErr, setInviteErr] = useState(false)
  const [forgotErr, setForgotErr] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const toSignin = () => {
    setMode("signin")
    setSent(false)
    setError(null)
    setCode("")
  }

  /**
   * One call serves both the password step and the code step: the API answers
   * a correct password on an MFA account by asking for the code, and expects
   * the same credentials back with it.
   */
  const attempt = async (mfaCode?: string) => {
    setBusy(true)
    setError(null)

    const result = await signIn("platform-credentials", {
      identifier: email,
      password,
      mfaCode: mfaCode ?? "",
      redirect: false,
    })

    setBusy(false)

    if (result?.ok) {
      router.replace("/platform")
      router.refresh()
      return
    }

    switch (result?.error) {
      case "MFA_REQUIRED":
        setMode("mfa")
        setCode("")
        return
      case "PASSWORD_NOT_SET":
        setMode("signin")
        setError("unset")
        return
      default:
        setError("plain")
    }
  }

  const submitSignin = () => {
    if (!email.trim() || !password) {
      setError("plain")
      return
    }
    void attempt()
  }

  const sendReset = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setForgotErr(true)
      return
    }

    setForgotErr(false)
    setBusy(true)
    // Always reports sent, whatever the answer — the API does not disclose
    // whether the address is registered and neither does this screen.
    await requestPlatformPasswordReset(email).catch(() => undefined)
    setBusy(false)
    setSent(true)
  }

  const requestInvite = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInviteErr(true)
      return
    }

    setInviteErr(false)
    setBusy(true)
    await requestPlatformPasswordReset(email).catch(() => undefined)
    setBusy(false)
    setSent(true)
    setMode("forgot")
  }

  const codeReady = code.length === 6

  return (
    <div
      style={{
        // Fills the shell exactly rather than setting its own viewport
        // height: two stacked viewport-height boxes is what put a scrollbar
        // on a page that should never have one.
        height: "100%",
        // The card scrolls inside instead of the page, on a window too short
        // to hold it — clipping it would put the submit button out of reach.
        overflowY: "auto",
        background: "url('/platform/login-bg.jpg') center / cover no-repeat",
        fontFamily: "var(--font-geist), Geist, 'Helvetica Neue', sans-serif",
        display: "flex",
        // Column, so the lockup stacks above the card as drawn. As a row it
        // would sit beside it.
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,16,28,.22)",
        }}
        aria-hidden="true"
      />

      {/*
        The lockup sits centred above the card, at 56px, with a drop shadow —
        it is over a photograph, so the shadow is what keeps it legible
        wherever the painting happens to be light. Supplied artwork, never
        rebuilt as HTML text.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim; next/image would resample it */}
      <img
        src="/brand/qverse-lockup-color-white.gif"
        alt="Qverse"
        height={56}
        style={{
          position: "relative",
          height: 56,
          width: "auto",
          marginBottom: 20,
          filter: "drop-shadow(0 3px 12px rgba(8,12,18,.45))",
        }}
      />

      <div
        style={{
          position: "relative",
          width: 400,
          background: "#FFFFFF",
          boxShadow: "0 40px 100px rgba(8,12,18,.45)",
          padding: "34px 34px 30px",
          color: C.ink,
        }}
      >
        {mode === "forgot" && (
          <>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Reset password
            </div>

            {sent ? (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: C.bodyStrong,
                    lineHeight: 1.6,
                    marginTop: 14,
                    background: C.infoBg,
                    padding: "12px 14px",
                  }}
                >
                  If that address belongs to a QHub account, a reset link is on
                  its way. It expires in 30 minutes and works once. Nothing is
                  revealed about whether the account exists.
                </div>
                <button
                  type="button"
                  onClick={toSignin}
                  style={{
                    ...linkStyle,
                    fontSize: 13,
                    marginTop: 18,
                    display: "block",
                  }}
                >
                  ← Back to sign in
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: C.body, marginTop: 5 }}>
                  Enter your work email — we send a single-use reset link.
                </div>
                <div style={labelStyle}>WORK EMAIL</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void sendReset()}
                  placeholder="you@qhub.io"
                  style={fieldStyle}
                  aria-label="Work email"
                />
                {forgotErr && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: C.negText,
                      background: C.negBg,
                      padding: "9px 12px",
                      marginTop: 12,
                    }}
                  >
                    That doesn&apos;t look like an email address.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => void sendReset()}
                  disabled={busy}
                  style={primaryStyle}
                >
                  Send reset link
                </button>
                <button
                  type="button"
                  onClick={toSignin}
                  style={{ ...linkStyle, marginTop: 16, display: "block" }}
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </>
        )}

        {mode === "invite" && (
          <>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome to QHub
            </div>
            <div style={{ fontSize: 13, color: C.body, marginTop: 5 }}>
              First sign-in — set your password to activate the account your
              admin created.
            </div>
            <div style={labelStyle}>INVITED EMAIL</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void requestInvite()}
              placeholder="you@qhub.io"
              style={fieldStyle}
              aria-label="Invited email"
            />
            {inviteErr && (
              <div
                style={{
                  fontSize: 12.5,
                  color: C.negText,
                  background: C.negBg,
                  padding: "9px 12px",
                  marginTop: 12,
                }}
              >
                Use the invited email address.
              </div>
            )}
            <div style={{ fontSize: 12, color: C.label, marginTop: 12 }}>
              We send a single-use link to that address — you choose your
              password there, then enrol an authenticator app. QHub staff
              accounts require MFA.
            </div>
            <button
              type="button"
              onClick={() => void requestInvite()}
              disabled={busy}
              style={{ ...primaryStyle, marginTop: 16 }}
            >
              Send my setup link
            </button>
            <button
              type="button"
              onClick={toSignin}
              style={{ ...linkStyle, marginTop: 16, display: "block" }}
            >
              ← Back to sign in
            </button>
          </>
        )}

        {mode === "mfa" && (
          <>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Check your authenticator
            </div>
            <div style={{ fontSize: 13, color: C.body, marginTop: 5 }}>
              Password confirmed. Enter the 6-digit code from your authenticator
              app — no session exists until it&apos;s right.
            </div>
            <div style={labelStyle}>6-DIGIT CODE</div>
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onKeyDown={(e) =>
                e.key === "Enter" && codeReady && void attempt(code)
              }
              placeholder="••••••"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Six-digit authenticator code"
              style={{
                ...fieldStyle,
                fontSize: 18,
                letterSpacing: ".35em",
                fontFamily: "var(--font-mono), 'Geist Mono', monospace",
              }}
            />
            {error === "plain" && (
              <div
                style={{
                  fontSize: 12.5,
                  color: C.negText,
                  background: C.negBg,
                  padding: "9px 12px",
                  marginTop: 12,
                }}
              >
                That code is not right. Check your authenticator and try the
                next one.
              </div>
            )}
            <button
              type="button"
              onClick={() => codeReady && void attempt(code)}
              disabled={!codeReady || busy}
              style={{
                ...primaryStyle,
                background: codeReady ? C.accent : C.disabledBg,
                color: codeReady ? "#fff" : C.disabledText,
                cursor: codeReady ? "pointer" : "default",
              }}
            >
              Verify &amp; sign in
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <button type="button" onClick={toSignin} style={linkStyle}>
                ← Start over
              </button>
              <div style={{ fontSize: 12, color: C.label }}>
                Lost your device? Use a recovery code
              </div>
            </div>
          </>
        )}

        {mode === "signin" && (
          <>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Sign in
            </div>
            <div style={{ fontSize: 13, color: C.body, marginTop: 5 }}>
              The estate console for QHub staff.
            </div>

            <div style={{ ...labelStyle, marginTop: 24 }}>WORK EMAIL</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSignin()}
              placeholder="you@qhub.io"
              autoComplete="username"
              aria-label="Work email"
              style={fieldStyle}
            />

            <div style={labelStyle}>PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSignin()}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-label="Password"
              style={fieldStyle}
            />

            {error === "plain" && (
              <div
                style={{
                  fontSize: 12.5,
                  color: C.negText,
                  background: C.negBg,
                  padding: "9px 12px",
                  marginTop: 12,
                }}
              >
                That didn&apos;t work — check the email address and password,
                then try again.
              </div>
            )}
            {error === "unset" && (
              <div
                style={{
                  fontSize: 12.5,
                  color: C.warnText,
                  background: C.warnBg,
                  padding: "9px 12px",
                  marginTop: 12,
                }}
              >
                This account hasn&apos;t been set up yet — set your password
                using the link in your invitation. Nothing is wrong with the
                password you typed.
              </div>
            )}

            <button
              type="button"
              onClick={submitSignin}
              disabled={busy}
              style={primaryStyle}
            >
              Sign in
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("forgot")
                  setSent(false)
                  setError(null)
                }}
                style={linkStyle}
              >
                Forgot password?
              </button>
              <div style={{ fontSize: 12, color: C.label }}>
                Password + 6-digit code
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("invite")
                setInviteErr(false)
              }}
              style={{
                ...linkStyle,
                fontSize: 12,
                color: C.label,
                marginTop: 12,
                display: "block",
              }}
            >
              Invited by your admin?{" "}
              <span style={{ color: C.accent }}>Set your password</span>
            </button>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11.5,
          color: "rgba(255,255,255,.75)",
          textShadow: "0 1px 6px rgba(8,12,18,.4)",
        }}
      >
        © 2026 Qverse Technologies · access is logged to the platform audit
        trail
      </div>
    </div>
  )
}
