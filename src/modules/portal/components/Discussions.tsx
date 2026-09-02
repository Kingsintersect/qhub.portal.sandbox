"use client"

import { useState } from "react"

import { initialsOf, scoreSteps, type Discussion } from "@/modules/portal/seed"

/**
 * Discussions, lifted from the bundle 25 canvas.
 *
 * A row opens into the prompt and the posts, and on a graded discussion each
 * post carries its score buttons — grading happens where the writing is, not
 * on a separate screen that would make you hold the argument in your head.
 *
 * The note above the publish button is the one that matters: unscored posters
 * get 0 unless you score them. Publishing is the moment that becomes real, so
 * the count of who has been scored sits next to the button that does it.
 */

const GRID = "minmax(0,2fr) 90px 130px 90px 160px 80px 90px"

export function Discussions({
  discussions,
  onStart,
  onPublish,
}: {
  discussions: Discussion[]
  onStart: () => void
  onPublish: (title: string, course: string, scored: number) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  // Keyed "<discussion>|<poster>", as the canvas keys them.
  const [scores, setScores] = useState<Record<string, number>>({})
  const [published, setPublished] = useState<Record<string, boolean>>({})

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Discussions</div>
          <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 2 }}>
            Graded discussions land in the gradebook at their deadline ·
            involvement counts students who posted
          </div>
        </div>
        <button
          type="button"
          onClick={onStart}
          style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: 10,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Start discussion
        </button>
      </div>

      {discussions.map((d) => {
        const isOpen = open === d.title
        const steps = scoreSteps(d.pts)
        const posts = d.postList
        const scored = posts.filter(
          (p) => scores[`${d.title}|${p.name}`] !== undefined
        ).length
        const done = published[d.title] === true

        const invColor =
          d.inv >= 60
            ? "var(--accent)"
            : d.inv >= 45
              ? "var(--series2)"
              : "var(--neg)"

        return (
          <div key={d.title}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : d.title)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpen(isOpen ? null : d.title)
                }
              }}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                columnGap: 14,
                alignItems: "center",
                padding: "13px 4px",
                borderBottom: "1px solid var(--line)",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.title}
              </div>
              <div className="portal-mono" style={{ fontSize: 11.5 }}>
                {d.course}
              </div>
              <div>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".06em",
                    padding: "3px 9px",
                    borderRadius: 999,
                    color: d.graded ? "var(--series2)" : "var(--txt3)",
                    background: d.graded ? "var(--warn-bg)" : "var(--panel)",
                  }}
                >
                  {d.graded ? `GRADED · ${d.pts} PTS` : "UNGRADED"}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {d.posts} posts
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ fontWeight: 600, color: invColor }}>
                    {d.inv}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--txt4)" }}>
                    involved
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 999,
                    background: "var(--panel)",
                    marginTop: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${d.inv}%`,
                      background: invColor,
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                {d.due}
              </div>
              <div>
                <span
                  className="portal-mono"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".07em",
                    padding: "3px 9px",
                    borderRadius: 999,
                    color:
                      d.status === "OPEN" ? "var(--accent)" : "var(--txt3)",
                    background:
                      d.status === "OPEN"
                        ? "var(--accent-soft)"
                        : "var(--panel)",
                  }}
                >
                  {d.status}
                </span>
              </div>
            </div>

            {isOpen && (
              <div
                style={{
                  borderBottom: "1px solid var(--line)",
                  padding: "16px 4px 18px",
                  background: "var(--row-hover)",
                }}
              >
                <div
                  style={{
                    background: "var(--panel)",
                    borderRadius: 11,
                    padding: "12px 16px",
                    fontSize: 12.5,
                    color: "var(--txt2)",
                    lineHeight: 1.55,
                    marginBottom: 14,
                  }}
                >
                  <span
                    className="portal-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".07em",
                      color: "var(--txt4)",
                      marginRight: 8,
                    }}
                  >
                    PROMPT
                  </span>
                  {d.prompt}
                </div>

                {posts.map((p) => {
                  const key = `${d.title}|${p.name}`

                  return (
                    <div
                      key={p.name}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10.5,
                          fontWeight: 600,
                          flex: "0 0 30px",
                        }}
                      >
                        {initialsOf(p.name)}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 9,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {p.name}
                          </div>
                          <div
                            className="portal-mono"
                            style={{ fontSize: 10, color: "var(--txt4)" }}
                          >
                            {p.matric}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                            {p.meta}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "var(--txt2)",
                            lineHeight: 1.55,
                            marginTop: 4,
                          }}
                        >
                          {p.text}
                        </div>
                      </div>

                      {d.graded && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flex: "0 0 auto",
                          }}
                        >
                          {steps.map((v) => {
                            const on = scores[key] === v

                            return (
                              <button
                                key={v}
                                type="button"
                                className="portal-mono"
                                onClick={(e) => {
                                  // The row toggles the panel shut otherwise.
                                  e.stopPropagation()
                                  setScores((all) => {
                                    const next = { ...all }
                                    // Clicking the current score clears it,
                                    // so a mis-click is undoable in place.
                                    if (on) delete next[key]
                                    else next[key] = v
                                    return next
                                  })
                                }}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  width: 30,
                                  textAlign: "center",
                                  padding: "6px 0",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  color: on ? "#fff" : "var(--txt3)",
                                  background: on
                                    ? "var(--accent)"
                                    : "transparent",
                                  border: `1px solid ${
                                    on ? "var(--accent)" : "var(--line-strong)"
                                  }`,
                                  fontFamily: "inherit",
                                }}
                              >
                                {v}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {d.graded ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 14,
                    }}
                  >
                    <div style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {done
                        ? "Published — scores are in the gradebook's discussion component"
                        : `${scored} of ${posts.length} posters scored · out of ${d.pts} pts · unscored posters get 0 unless you score them`}
                    </div>
                    <button
                      type="button"
                      disabled={done || scored === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (done || scored === 0) return
                        setPublished((all) => ({ ...all, [d.title]: true }))
                        onPublish(d.title, d.course, scored)
                      }}
                      style={{
                        marginLeft: "auto",
                        background:
                          !done && scored > 0
                            ? "var(--accent)"
                            : "var(--line-strong)",
                        color: !done && scored > 0 ? "#fff" : "var(--txt4)",
                        fontSize: 12.5,
                        fontWeight: 500,
                        padding: "9px 16px",
                        borderRadius: 10,
                        cursor: !done && scored > 0 ? "pointer" : "default",
                        border: "none",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Publish scores to gradebook
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt4)",
                      marginTop: 12,
                    }}
                  >
                    Ungraded — participation is tracked for the engagement
                    metrics, but nothing here lands in the gradebook.
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
