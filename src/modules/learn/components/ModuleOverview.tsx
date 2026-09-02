"use client"

import type { CourseModule, ModuleItem } from "@/modules/learn/types"

/**
 * A module's overview page, lifted from the bundle 25 canvas.
 *
 * The split is the point: learning materials are what you work through, and
 * assessment is what is graded. A student who reads the module top to bottom
 * should finish knowing which of the two a given item is, because the cost of
 * confusing them is a missed submission.
 */

const OUTCOMES = [
  "Explain the module's core structures and when each is the right choice.",
  "Work the standard worked examples unaided — the exam reuses their shape.",
  "Apply the material in the graded lab and quiz below.",
]

export function ModuleOverview({
  module,
  courseCode,
  onBack,
  onOpenItem,
}: {
  module: CourseModule
  courseCode: string
  onBack: () => void
  onOpenItem: (item: ModuleItem) => void
}) {
  // "Module 2 — Trees and heaps" reads as "Module 2" in the crumb.
  const short = module.title.split(" — ")[0] ?? module.title

  const materials = module.items.filter(
    (i) => i.kind !== "quiz" && i.kind !== "disc"
  )
  const assessment = module.items.filter(
    (i) => i.kind === "quiz" || i.kind === "disc"
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 900,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "var(--txt3)",
        }}
      >
        <Crumb onClick={onBack}>Courses</Crumb> /
        <Crumb onClick={onBack}>{courseCode}</Crumb> /
        <span style={{ color: "var(--txt2)" }}>{short} overview</span>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 120,
            background:
              "linear-gradient(120deg, #0E2A55, #1D5FBF 60%, #4A84D6)",
            display: "flex",
            alignItems: "flex-end",
            padding: "18px 26px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#fff",
              textShadow: "0 1px 8px rgba(8,12,18,.3)",
            }}
          >
            {module.title}
          </div>
        </div>

        <div style={{ padding: "22px 26px" }}>
          <SectionTitle>Learning outcomes</SectionTitle>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
            Students who complete this module will be able to:
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              marginTop: 10,
            }}
          >
            {OUTCOMES.map((o) => (
              <div
                key={o}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--txt2)",
                  lineHeight: 1.55,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: "var(--accent)",
                    marginTop: 7,
                    flex: "0 0 5px",
                  }}
                />
                {o}
              </div>
            ))}
          </div>

          <SectionTitle top>Learning materials</SectionTitle>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 6,
            }}
          >
            {materials.map((l) => (
              <Row key={l.title}>
                {/* Locked material is inert here too — the lock lives on the
                    item, not on the screen that happens to list it. */}
                <RowTitle
                  onClick={() => {
                    if (l.badge?.text !== "LOCKED") onOpenItem(l)
                  }}
                >
                  {l.title}
                </RowTitle>
                <RowMeta>{l.meta}</RowMeta>
                <Tick done={l.done} />
              </Row>
            ))}
          </div>

          <SectionTitle top>Assessment</SectionTitle>
          <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
            Complete the following for this module:
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 6,
            }}
          >
            {assessment.length === 0 ? (
              <Row>
                <RowTitle>No graded work in this module</RowTitle>
                <RowMeta>assessment lands when the module opens</RowMeta>
              </Row>
            ) : (
              assessment.map((a) => (
                <Row key={a.title}>
                  <RowTitle onClick={() => onOpenItem(a)}>{a.title}</RowTitle>
                  <RowMeta>{a.meta} · graded</RowMeta>
                  {a.kind === "quiz" && !a.done && (
                    <button
                      type="button"
                      onClick={() => onOpenItem(a)}
                      style={{
                        marginLeft: "auto",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "7px 14px",
                        borderRadius: 9,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "inherit",
                      }}
                    >
                      Start
                    </button>
                  )}
                </Row>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Crumb({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        color: "var(--accent)",
        cursor: "pointer",
        border: "none",
        background: "transparent",
        padding: 0,
        fontSize: 12,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function SectionTitle({
  top,
  children,
}: {
  top?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: "var(--accent)",
        marginTop: top === true ? 22 : undefined,
      }}
    >
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {children}
    </div>
  )
}

function RowTitle({
  onClick,
  children,
}: {
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--accent)",
        cursor: onClick === undefined ? "default" : "pointer",
        border: "none",
        background: "transparent",
        padding: 0,
        textAlign: "left",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function RowMeta({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, color: "var(--txt4)" }}>{children}</div>
}

/** Done is a filled tick; not-done is an empty ring, never a cross. */
function Tick({ done }: { done: boolean }) {
  if (!done) {
    return (
      <div
        style={{
          marginLeft: "auto",
          width: 18,
          height: 18,
          borderRadius: 999,
          border: "1.5px solid var(--line-strong)",
          flex: "0 0 18px",
        }}
      />
    )
  }

  return (
    <div
      style={{
        marginLeft: "auto",
        width: 18,
        height: 18,
        borderRadius: 999,
        background: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 18px",
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12.5l5 5L20 7" />
      </svg>
    </div>
  )
}
