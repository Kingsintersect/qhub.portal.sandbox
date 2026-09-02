"use client"

/**
 * Institution settings, lifted from the bundle 25 canvas.
 *
 * Everything here is shown rather than edited, and both footers say why: the
 * institution's identity comes from the regulator's record, and connectors are
 * changed with the Qverse team. A settings page whose fields cannot be typed
 * into owes the reader that explanation — otherwise it reads as broken rather
 * than as a record.
 *
 * The levels panel says what the groups are *for* — media, announcements and
 * cohort reports target them — because that is what makes an abstract list of
 * years worth reading.
 */

const INSTITUTION = [
  { k: "Legal name", v: "University of Lagos" },
  { k: "Official domain", v: "unilag.edu.ng" },
  { k: "Tenant address", v: "unilag.qhub.io" },
  { k: "Regulator", v: "NUC · accredited" },
  { k: "Primary contact", v: "cits@unilag.edu.ng" },
]

const CALENDAR = [
  { k: "Session", v: "2026/2027" },
  { k: "Structure", v: "Semester" },
  { k: "1st semester", v: "Aug 18 — Dec 19" },
  { k: "Registration closes", v: "Sep 4" },
]

const INTEGRATIONS = [
  { k: "SIS sync · nightly pull", v: "HEALTHY", healthy: true },
  { k: "Single sign-on · SAML", v: "HEALTHY", healthy: true },
  // Not used is not the same as broken, and reads in the muted tone.
  { k: "Payment gateway", v: "NOT USED", healthy: false },
]

export function Settings({ levels }: { levels: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Heading>Institution</Heading>
          {INSTITUTION.map((r) => (
            <Row key={r.k} label={r.k} value={r.v} />
          ))}
          <Note>
            Name, domain and accreditation come from the regulator&apos;s record
            — changes go through Qverse support with evidence.
          </Note>
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Levels (groups)
          </div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 12 }}>
            What media, announcements and cohort reports target
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {levels.map((c) => (
              <div
                key={c}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 13px",
                  borderRadius: 9,
                  color: "var(--accent)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-brd)",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Heading>Academic calendar</Heading>
          {CALENDAR.map((r) => (
            <Row key={r.k} label={r.k} value={r.v} />
          ))}
        </Card>

        <Card>
          <Heading>Integrations</Heading>
          {INTEGRATIONS.map((r) => (
            <div
              key={r.k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 12.5,
              }}
            >
              <div style={{ color: "var(--txt2)", flex: 1 }}>{r.k}</div>
              <span
                className="portal-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "3px 9px",
                  borderRadius: 999,
                  color: r.healthy ? "var(--accent)" : "var(--txt4)",
                  background: r.healthy ? "var(--accent-soft)" : "var(--panel)",
                }}
              >
                {r.v}
              </span>
            </div>
          ))}
          <Note>
            Connector changes are made with the Qverse team — raise a ticket to
            begin.
          </Note>
        </Card>
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      {children}
    </div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        padding: "9px 0",
        borderBottom: "1px solid var(--line)",
        fontSize: 12.5,
      }}
    >
      <div style={{ color: "var(--txt3)", flex: "0 0 150px" }}>{label}</div>
      <div style={{ color: "var(--txt)", fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 10 }}>
      {children}
    </div>
  )
}
