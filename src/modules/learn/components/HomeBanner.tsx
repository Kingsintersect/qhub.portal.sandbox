"use client"

/**
 * The student's profile banner and the five-stat strip beneath it, lifted from
 * the bundle 24 canvas.
 *
 * The gradient and the ghosted mark are drawn on the card rather than supplied
 * as an image, exactly as the canvas has them — the mark is the Qverse GIF at
 * 18% opacity, not a recoloured copy.
 */

export type HomeStat = {
  label: string
  value: string
  /** The line under the number: what it is measured against. */
  delta: string
  /** A token name. Colour carries meaning here, so it comes from the data. */
  tone: "txt" | "neg" | "series2"
}

const TONE: Record<HomeStat["tone"], string> = {
  txt: "var(--txt)",
  neg: "var(--neg)",
  series2: "var(--series2)",
}

export function HomeBanner({
  greeting,
  name,
  initials,
  matric,
  standing,
  stats,
}: {
  greeting: string
  name: string
  initials: string
  matric: string
  /** "Year 2 · Computer Science · Monday, Aug 31 · week 6 of 13" */
  standing: string
  stats: HomeStat[]
}) {
  return (
    <>
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background:
            "linear-gradient(100deg, #0E2A55 0%, #1D5FBF 55%, #4A84D6 100%)",
          boxShadow: "var(--shadow-card)",
          padding: "22px 26px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- supplied GIF artwork, used verbatim */}
        <img
          src="/brand/qverse-mark-white.gif"
          alt=""
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            height: 130,
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            background: "rgba(255,255,255,.94)",
            color: "#0E2A55",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            flex: "0 0 54px",
            boxShadow: "0 8px 24px rgba(8,12,18,.3)",
          }}
        >
          {initials}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
            {greeting}, {name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,.82)",
              marginTop: 3,
            }}
          >
            <span className="learn-mono" style={{ fontSize: 11.5 }}>
              {matric}
            </span>{" "}
            · {standing}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {stats.map((k, i) => (
          <div
            key={k.label}
            style={{
              padding: "16px 20px",
              // No rule after the last cell: the canvas divides the five, it
              // does not fence them.
              borderRight:
                i === stats.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                color: "var(--txt3)",
                marginBottom: 6,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: TONE[k.tone],
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                {k.delta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
