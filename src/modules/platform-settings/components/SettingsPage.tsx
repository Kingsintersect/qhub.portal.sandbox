"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import QRCode from "qrcode"

import {
  useBeginMfa,
  useChangePassword,
  useConfirmMfa,
  useDisableMfa,
  useEndSession,
  useMfaStatus,
  useNotificationPreferences,
  usePlatformSessions,
  useSetNotificationPreference,
  useSignOutEverywhere,
} from "@/modules/platform-settings/hooks/use-platform-settings"
import type { MfaEnrolment } from "@/modules/platform-settings/types"
import { NOTIFICATION_KINDS } from "@/modules/platform-notifications/types"

const MIN_PASSWORD = 8

/**
 * The signed-in staff member's own account.
 *
 * Four sections, in the order they matter: the password, the second factor,
 * where the account is signed in, and what interrupts you.
 */
export function SettingsPage() {
  const { data: session } = useSession()

  const identity = {
    username: session?.user?.username ?? "",
    email: session?.user?.email ?? "",
    role: (session?.user?.roles?.[0] ?? "").toString().toLowerCase(),
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 860,
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
          Settings
        </h1>
        {/* The draft's subtitle is who you are signed in as, not a sentence
            about the page. */}
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
          {[identity.username, identity.email, identity.role]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginTop: 24,
        }}
      >
        <PasswordSection />
        <MfaSection />
        <SessionsSection />
        <NotificationPreferencesSection />
      </div>
    </div>
  )
}

// --- Shared chrome ----------------------------------------------------------

function Card({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  /** Sits at the far right of the heading row, as the draft places it. */
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--txt)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {action}
      </div>
      {description && (
        <p
          style={{
            fontSize: 12,
            color: "var(--txt4)",
            marginTop: 6,
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      )}
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  )
}

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".07em",
  color: "var(--txt4)",
  marginBottom: 7,
}

const field: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
}

/** The draft's outlined secondary control. */
const ghostButton: React.CSSProperties = {
  border: "1px solid var(--line-strong)",
  borderRadius: 9,
  background: "transparent",
  color: "var(--txt2)",
  fontSize: 12,
  fontWeight: 500,
  padding: "7px 13px",
  cursor: "pointer",
  fontFamily: "inherit",
}

function Primary({
  children,
  onClick,
  disabled,
  tone = "accent",
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "accent" | "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled
          ? "var(--line-strong)"
          : tone === "danger"
            ? "var(--neg)"
            : "var(--accent)",
        color: disabled ? "var(--txt4)" : "#fff",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "11px 16px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

// --- Password ---------------------------------------------------------------

function PasswordSection() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const change = useChangePassword()

  const submit = () => {
    if (next.length < MIN_PASSWORD) {
      setError(`Choose a password of at least ${MIN_PASSWORD} characters.`)
      return
    }

    setError(null)
    change.mutate(
      {
        currentPassword: current,
        password: next,
        // The draft asks for the new password once. The API requires a
        // confirmation field, so the same value is sent for it rather than
        // adding a third box the design does not have.
        passwordConfirmation: next,
      },
      {
        onSuccess: () => {
          setCurrent("")
          setNext("")
          setDone(true)
        },
      }
    )
  }

  const ready = current.length > 0 && next.length >= MIN_PASSWORD

  return (
    <Card title="Password">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 150px",
          gap: 10,
          alignItems: "end",
        }}
      >
        <div>
          <div style={label}>CURRENT</div>
          <input
            type="password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value)
              setDone(false)
            }}
            autoComplete="current-password"
            aria-label="Current password"
            style={field}
          />
        </div>
        <div>
          <div style={label}>NEW · MIN {MIN_PASSWORD} CHARACTERS</div>
          <input
            type="password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value)
              setDone(false)
            }}
            onKeyDown={(e) => e.key === "Enter" && ready && submit()}
            autoComplete="new-password"
            aria-label="New password"
            style={field}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!ready || change.isPending}
          style={{
            background: ready ? "var(--accent)" : "var(--line-strong)",
            color: ready ? "#fff" : "var(--txt4)",
            fontSize: 12.5,
            fontWeight: 500,
            padding: 11,
            borderRadius: 10,
            border: "none",
            cursor: ready ? "pointer" : "default",
            textAlign: "center",
            fontFamily: "inherit",
          }}
        >
          Change password
        </button>
      </div>

      {error && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--neg)",
            background: "var(--neg-bg)",
            borderRadius: 9,
            padding: "9px 12px",
            marginTop: 12,
          }}
        >
          {error}
        </div>
      )}

      {done && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--accent)",
            background: "var(--good-bg)",
            borderRadius: 9,
            padding: "9px 12px",
            marginTop: 12,
          }}
        >
          Password changed. Every other session was signed out.
        </div>
      )}
    </Card>
  )
}

// --- MFA --------------------------------------------------------------------

function MfaSection() {
  const { data: status, isLoading } = useMfaStatus()
  const begin = useBeginMfa()
  const confirm = useConfirmMfa()
  const disable = useDisableMfa()

  const [enrolment, setEnrolment] = useState<MfaEnrolment | null>(null)
  const [qr, setQr] = useState<{ uri: string; dataUrl: string } | null>(null)
  const [code, setCode] = useState("")
  const [codes, setCodes] = useState<string[] | null>(null)
  const [disabling, setDisabling] = useState(false)
  const [password, setPassword] = useState("")

  // Rendered client-side from the otpauth URI. The secret never leaves this
  // browser to be turned into an image somewhere else.
  //
  // The result is keyed by the URI it was drawn from rather than cleared when
  // enrolment ends, so a stale image can never be shown against a newer
  // enrolment — and there is no state to reset on teardown.
  useEffect(() => {
    if (!enrolment) return

    let cancelled = false
    const uri = enrolment.uri

    void QRCode.toDataURL(uri, { margin: 1, width: 176 }).then((url) => {
      if (!cancelled) setQr({ uri, dataUrl: url })
    })

    return () => {
      cancelled = true
    }
  }, [enrolment])

  const qrImage = enrolment && qr?.uri === enrolment.uri ? qr.dataUrl : null

  if (isLoading) {
    return <Card title="Two-factor authentication">Loading…</Card>
  }

  if (codes) {
    return (
      <Card
        title="Save your recovery codes"
        description="These are shown once and stored only as hashes — there is no way to display them again. They are how you get back in if the authenticator is gone."
      >
        <div
          className="qhub-mono"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            background: "var(--panel)",
            padding: 14,
            fontSize: 13,
            color: "var(--txt)",
          }}
        >
          {codes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Primary onClick={() => setCodes(null)}>I have saved them</Primary>
        </div>
      </Card>
    )
  }

  if (status?.enabled) {
    return (
      <Card
        title="Two-factor authentication"
        description={`On since ${status.enrolledAt ? new Date(status.enrolledAt).toLocaleDateString() : "enrolment"} · ${status.recoveryCodesRemaining} recovery ${status.recoveryCodesRemaining === 1 ? "code" : "codes"} left.`}
        action={
          <>
            <span style={{ fontSize: 12.5, color: "var(--accent)" }}>On</span>
            {!disabling && (
              <button
                type="button"
                onClick={() => setDisabling(true)}
                style={{
                  ...ghostButton,
                  marginLeft: "auto",
                  color: "var(--neg)",
                }}
              >
                Turn off
              </button>
            )}
          </>
        }
      >
        {disabling && (
          <div style={{ display: "grid", gap: 12, maxWidth: 380 }}>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--warn)",
                background: "var(--warn-bg)",
                padding: "10px 12px",
                lineHeight: 1.5,
              }}
            >
              Turning this off leaves your password as the only thing between
              anyone and this console. Confirm with your password.
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              aria-label="Your password"
              style={field}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <Primary
                tone="danger"
                onClick={() =>
                  disable.mutate(password, {
                    onSuccess: () => {
                      setDisabling(false)
                      setPassword("")
                    },
                  })
                }
                disabled={!password || disable.isPending}
              >
                Turn it off
              </Primary>
              <button
                type="button"
                onClick={() => {
                  setDisabling(false)
                  setPassword("")
                }}
                style={{
                  fontSize: 12.5,
                  color: "var(--txt3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card
      title="Two-factor authentication"
      description="MFA is required for QHub staff. The audit log's MFA policy scan flags accounts without it — enrolment here clears the flag."
      action={
        <>
          <span style={{ fontSize: 12.5, color: "var(--neg)" }}>Off</span>
          {!enrolment && (
            <button
              type="button"
              onClick={() =>
                begin.mutate(undefined, {
                  onSuccess: (data) => setEnrolment(data),
                })
              }
              disabled={begin.isPending}
              style={{ ...ghostButton, marginLeft: "auto" }}
            >
              Set up
            </button>
          )}
        </>
      }
    >
      {enrolment && (
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
            border: "1px solid var(--line2)",
            borderRadius: 14,
            background: "var(--panel)",
            padding: 18,
          }}
        >
          <div>
            {qrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImage}
                alt="Scan this with your authenticator app"
                width={176}
                height={176}
                style={{ background: "#fff", padding: 6 }}
              />
            ) : (
              <div
                style={{
                  width: 176,
                  height: 176,
                  background: "var(--img-ph)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  color: "var(--txt4)",
                }}
              >
                Drawing code…
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            {/* Two lines, as the draft has it: what to do, then the fallback
                for a device that cannot scan. One combined sentence buries
                the manual route in the middle of the instruction. */}
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Scan with your authenticator app
            </div>
            <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 4 }}>
              Or enter the secret by hand:
            </div>
            <div
              className="qhub-mono"
              style={{
                fontSize: 13,
                color: "var(--txt)",
                background: "var(--panel)",
                padding: "9px 12px",
                marginTop: 8,
                wordBreak: "break-all",
              }}
            >
              {enrolment.manualEntry}
            </div>

            <div style={{ ...label, marginTop: 16 }}>6-DIGIT CODE</div>
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="••••••"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Six-digit code from your authenticator"
              className="qhub-mono"
              style={{ ...field, fontSize: 17, letterSpacing: ".3em" }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <Primary
                onClick={() =>
                  confirm.mutate(code, {
                    onSuccess: (recovery) => {
                      setCodes(recovery)
                      setEnrolment(null)
                      setCode("")
                    },
                  })
                }
                disabled={code.length !== 6 || confirm.isPending}
              >
                Verify &amp; enrol
              </Primary>
              <button
                type="button"
                onClick={() => {
                  setEnrolment(null)
                  setCode("")
                }}
                style={{
                  fontSize: 12.5,
                  color: "var(--txt3)",
                  background: "none",
                  border: "none",
                  padding: "9px 6px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>

            <div
              style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 10 }}
            >
              Recovery codes are shown once after verification — store them
              outside this device.
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// --- Sessions ---------------------------------------------------------------

function SessionsSection() {
  const { data: sessions, isLoading } = usePlatformSessions()
  const endSession = useEndSession()
  const signOutAll = useSignOutEverywhere()
  const [confirming, setConfirming] = useState(false)

  return (
    <Card
      title="Sessions & devices"
      action={
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{
            ...ghostButton,
            marginLeft: "auto",
            color: "var(--neg)",
          }}
        >
          Sign out everywhere
        </button>
      }
    >
      {confirming && (
        <div
          style={{
            background: "var(--warn-bg)",
            borderRadius: 9,
            padding: "10px 13px",
            marginBottom: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{ fontSize: 12.5, color: "var(--warn)", lineHeight: 1.5 }}
          >
            This ends every session including this one. You will be signed out
            and will need to sign in again.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Primary
              tone="danger"
              onClick={() => signOutAll.mutate()}
              disabled={signOutAll.isPending}
            >
              Sign out everywhere
            </Primary>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              style={{
                fontSize: 12.5,
                color: "var(--txt3)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>Loading…</div>
      )}

      {!isLoading && (sessions?.length ?? 0) === 0 && (
        <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
          No other sessions.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {sessions?.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 0",
              borderBottom: "1px solid var(--line2)",
              fontSize: 13,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: "var(--txt)" }}>
                {s.device}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  marginTop: 2,
                }}
              >
                {s.ipAddress ?? "unknown IP"} ·{" "}
                {s.lastActive
                  ? new Date(s.lastActive).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "never used"}
              </div>
            </div>

            {s.isCurrent ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  color: "var(--accent)",
                  background: "var(--good-bg)",
                  padding: "3px 9px",
                  borderRadius: 999,
                }}
              >
                THIS DEVICE
              </span>
            ) : (
              // The current session gets no end button: ending the one you are
              // sitting in reads as a bug.
              <button
                type="button"
                onClick={() => endSession.mutate(s.id)}
                disabled={endSession.isPending}
                style={{
                  marginLeft: "auto",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                  background: "transparent",
                  color: "var(--txt3)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  padding: "5px 11px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                End session
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// --- Notification preferences -----------------------------------------------

function NotificationPreferencesSection() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const setPref = useSetNotificationPreference()

  return (
    <Card
      title="Notification preferences"
      description="These mute the bell, not the record — assignments stay visible to everyone in the queues by design."
    >
      {isLoading && (
        <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>Loading…</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {NOTIFICATION_KINDS.map((kind) => {
          // The API returns every kind, filling unset ones with true, so an
          // absent key only happens while the request is still in flight.
          const enabled = prefs?.[kind] ?? true

          return (
            <div
              key={kind}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <Toggle
                on={enabled}
                label={`Notify me about ${kind}`}
                onChange={(value) => setPref.mutate({ kind, enabled: value })}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "var(--txt2)",
                  textTransform: "capitalize",
                }}
              >
                {kind}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * The draft's pill switch.
 *
 * A real button rather than a styled div: it has to be reachable by keyboard
 * and announce its state, which a div with an onClick does neither of.
 */
function Toggle({
  on,
  label,
  onChange,
}: {
  on: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        position: "relative",
        width: 34,
        height: 18,
        flex: "0 0 34px",
        borderRadius: 999,
        background: on ? "var(--accent)" : "var(--line-strong)",
        border: "none",
        padding: 0,
        cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 14,
          height: 14,
          borderRadius: 999,
          background: "#fff",
          transition: "left .15s",
          boxShadow: "0 1px 3px rgba(8,12,18,.3)",
        }}
      />
    </button>
  )
}
