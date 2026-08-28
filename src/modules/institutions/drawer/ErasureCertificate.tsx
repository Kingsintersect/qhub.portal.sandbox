"use client"

/**
 * The certificate produced when an institution's data is destroyed.
 *
 * Deliberately not themed. Every other surface in the console takes its
 * colours from the design tokens; this one is fixed light because it is a
 * printed artefact — the thing produced when someone has to prove the erasure
 * was lawful — and it should look the same on screen as it does on paper.
 */
export function ErasureCertificate({
  certificate,
  onClose,
}: {
  certificate: Record<string, unknown>
  onClose: () => void
}) {
  const text = (key: string): string => {
    const value = certificate[key]

    return typeof value === "string" && value !== "" ? value : "—"
  }

  const destroyed = certificate.recordsDestroyed
  const rows =
    destroyed !== null && typeof destroyed === "object"
      ? Object.entries(destroyed as Record<string, unknown>)
      : []

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 390,
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
          background: "rgba(8,12,18,.55)",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Certificate of erasure"
        style={{
          position: "relative",
          width: 620,
          maxWidth: "calc(94vw / var(--zoom))",
          maxHeight: "calc(88vh / var(--zoom))",
          overflow: "auto",
          background: "#FFFFFF",
          color: "#141A22",
          boxShadow: "0 40px 100px rgba(8,12,18,.5)",
          padding: "44px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#141A22",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Q
          </div>
          <div
            style={{ fontSize: 12, letterSpacing: ".14em", color: "#5A6472" }}
          >
            QHUB · CERTIFICATE OF ERASURE
          </div>
          <div
            className="qhub-mono"
            style={{ marginLeft: "auto", fontSize: 12, color: "#5A6472" }}
          >
            {text("reference")}
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginTop: 26,
          }}
        >
          {text("institution")}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#3E4753",
            lineHeight: 1.65,
            marginTop: 10,
          }}
        >
          All data held by QHub for this institution was permanently erased on{" "}
          <b>{stamp(certificate.erasedAt)}</b>, following the offboarding
          sequence required by our data-handling policy. A complete export was
          delivered to the institution before erasure. This certificate is the
          surviving record.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 24px",
            marginTop: 22,
            fontSize: 12.5,
          }}
        >
          <div style={{ color: "#8A93A0" }}>Requested by</div>
          <div>{text("requestedBy")}</div>

          <div style={{ color: "#8A93A0" }}>Approved by (second owner)</div>
          <div>{text("approvedBy")}</div>

          <div style={{ color: "#8A93A0" }}>Export delivered</div>
          <div>{stamp(certificate.exportDeliveredAt)}</div>

          <div style={{ color: "#8A93A0" }}>Erased by</div>
          <div>
            {text("erasedBy")} · {stamp(certificate.erasedAt)}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: ".09em",
            color: "#8A93A0",
            marginTop: 26,
            marginBottom: 8,
          }}
        >
          RECORDS DESTROYED, BY TABLE
        </div>

        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: "#5A6472" }}>
            No per-table counts were recorded for this erasure.
          </div>
        )}

        {rows.map(([table, count]) => (
          <div
            key={table}
            style={{
              display: "flex",
              alignItems: "baseline",
              padding: "7px 0",
              borderBottom: "1px solid #EDF0F4",
              fontSize: 13,
            }}
          >
            <div>{table}</div>
            <div
              style={{
                flex: 1,
                borderBottom: "1px dotted #C9D0D9",
                margin: "0 10px",
              }}
            />
            <div className="qhub-mono" style={{ fontSize: 12.5 }}>
              {typeof count === "number"
                ? count.toLocaleString()
                : String(count)}
            </div>
          </div>
        ))}

        <div
          style={{
            fontSize: 11.5,
            color: "#8A93A0",
            marginTop: 22,
            lineHeight: 1.6,
          }}
        >
          This certificate is written to the QHub audit store and retained
          indefinitely. It is the artefact produced when asked to prove the
          erasure was lawful.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              border: "1px solid #D5DBE3",
              color: "#3E4753",
              background: "transparent",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Print
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#141A22",
              color: "#fff",
              border: "none",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function stamp(value: unknown): string {
  if (typeof value !== "string" || value === "") return "—"

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
