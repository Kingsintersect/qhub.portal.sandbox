"use client"

import { useEffect, useState } from "react"
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
  return (
    <div style={{ padding: "26px 30px", maxWidth: 860 }}>
      <h1
        style={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt)",
          margin: 0,
        }}
      >
        Settings
      </h1>
      <p style={{ fontSize: 13, color: "var(--txt3)", marginTop: 5 }}>
        Your account. Nothing here affects any institution.
      </p>

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
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
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
      {description && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--txt3)",
            marginTop: 4,
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
  marginBottom: 6,
}

const field: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--panel)",
  border: "1px solid var(--line-strong)",
  padding: "10px 12px",
  fontSize: 13.5,
  color: "var(--txt)",
  outline: "none",
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
        fontSize: 13,
        fontWeight: 500,
        padding: "10px 16px",
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
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const change = useChangePassword()

  const submit = () => {
    if (next.length < MIN_PASSWORD) {
      setError(`Choose a password of at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (next !== confirm) {
      setError("Those two passwords do not match.")
      return
    }

    setError(null)
    change.mutate(
      {
        currentPassword: current,
        password: next,
        passwordConfirmation: confirm,
      },
      {
        onSuccess: () => {
          setCurrent("")
          setNext("")
          setConfirm("")
        },
      }
    )
  }

  return (
    <Card
      title="Password"
      description="Changing it signs out every other session on this account — including any you have forgotten about."
    >
      <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <div>
          <div style={label}>CURRENT PASSWORD</div>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            aria-label="Current password"
            style={field}
          />
        </div>
        <div>
          <div style={label}>NEW PASSWORD</div>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            aria-label="New password"
            style={field}
          />
        </div>
        <div>
          <div style={label}>CONFIRM NEW PASSWORD</div>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-label="Confirm new password"
            style={field}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--neg)",
              background: "var(--neg-bg)",
              padding: "9px 12px",
            }}
          >
            {error}
          </div>
        )}

        <div>
          <Primary
            onClick={submit}
            disabled={!current || !next || change.isPending}
          >
            Change password
          </Primary>
        </div>
      </div>
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
      >
        {!disabling ? (
          <button
            type="button"
            onClick={() => setDisabling(true)}
            style={{
              fontSize: 12.5,
              color: "var(--neg)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Turn off two-factor authentication
          </button>
        ) : (
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
      description="Off. QHub staff accounts hold the keys to every institution on the estate — a password alone is not enough between anyone and that."
    >
      {!enrolment ? (
        <Primary
          onClick={() =>
            begin.mutate(undefined, { onSuccess: (data) => setEnrolment(data) })
          }
          disabled={begin.isPending}
        >
          Set up an authenticator
        </Primary>
      ) : (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
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
            <div
              style={{ fontSize: 12.5, color: "var(--txt2)", lineHeight: 1.55 }}
            >
              Scan the code, or type this into your authenticator by hand:
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

            <div style={{ marginTop: 14 }}>
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
                Verify &amp; turn on
              </Primary>
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
      title="Sessions and devices"
      description="Everywhere this account is currently signed in."
    >
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
              justifyContent: "space-between",
              gap: 12,
              padding: "11px 0",
              borderBottom: "1px solid var(--line2)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--txt)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {s.device}
                {s.isCurrent && (
                  <span
                    className="qhub-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".06em",
                      color: "var(--accent)",
                      background: "var(--accent-soft)",
                      padding: "2px 6px",
                    }}
                  >
                    THIS DEVICE
                  </span>
                )}
              </div>
              <div
                className="qhub-mono"
                style={{ fontSize: 11, color: "var(--txt4)", marginTop: 3 }}
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

            {/* The current session gets no end button: ending the one you are
                sitting in reads as a bug, not a feature. */}
            {!s.isCurrent && (
              <button
                type="button"
                onClick={() => endSession.mutate(s.id)}
                disabled={endSession.isPending}
                style={{
                  fontSize: 12,
                  color: "var(--neg)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                End session
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            style={{
              fontSize: 12.5,
              color: "var(--neg)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out everywhere
          </button>
        ) : (
          <div
            style={{
              background: "var(--warn-bg)",
              padding: "12px 14px",
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
      title="What interrupts you"
      description="These mute the bell, not the record. Ticket assignments stay visible to everyone by design — muting one does not opt you out of the work."
    >
      {isLoading && (
        <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>Loading…</div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {NOTIFICATION_KINDS.map((kind) => {
          // The API returns every kind, filling unset ones with true, so an
          // absent key only happens while the request is still in flight.
          const enabled = prefs?.[kind] ?? true

          return (
            <label
              key={kind}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--line2)",
                fontSize: 13,
                color: "var(--txt)",
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {kind}
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) =>
                  setPref.mutate({ kind, enabled: e.target.checked })
                }
              />
            </label>
          )
        })}
      </div>
    </Card>
  )
}
