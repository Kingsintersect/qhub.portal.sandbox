"use client"

import { useState } from "react"

/**
 * Course discussions, lifted from the bundle 25 canvas.
 *
 * A thread opens to show the prompt first, then the posts. The prompt is what
 * a graded discussion is marked against, so it stays visible while you write
 * rather than being the thing you scrolled past to reach the box.
 */

export type DiscussionPost = {
  name: string
  initials: string
  /** "2h ago · 3 replies" */
  when: string
  text: string
  /** Your own posts are filled; everyone else's are tinted. */
  isYou?: boolean
}

export type Discussion = {
  id: string
  title: string
  /** "Graded · 10 pts · closes Fri · 1,842 posts" */
  meta: string
  badge: string
  tone: "accent" | "muted"
  prompt: string
  posts: DiscussionPost[]
  /** A closed thread can be read but not posted to. */
  closed?: boolean
}

export function Discussions({ threads }: { threads: Discussion[] }) {
  const [openId, setOpenId] = useState<string | null>(threads[0]?.id ?? null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [posted, setPosted] = useState<Record<string, DiscussionPost[]>>({})

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding: "20px 22px",
      }}
    >
      {threads.map((d) => {
        const open = openId === d.id
        const draft = drafts[d.id] ?? ""
        const all = [...d.posts, ...(posted[d.id] ?? [])]

        return (
          <div
            key={d.id}
            style={{ padding: "13px 0", borderBottom: "1px solid var(--line)" }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : d.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                border: "none",
                background: "transparent",
                padding: 0,
                textAlign: "left",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{d.title}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {d.meta}
                </div>
              </div>
              <span
                className="learn-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  color: d.tone === "accent" ? "var(--accent)" : "var(--txt4)",
                  background:
                    d.tone === "accent" ? "var(--accent-soft)" : "var(--panel)",
                }}
              >
                {d.badge}
              </span>
            </button>

            {open && (
              <div
                style={{
                  marginTop: 12,
                  borderLeft: "2px solid var(--line-strong)",
                  paddingLeft: 16,
                }}
              >
                {/* The prompt stays visible while you write. A graded thread is
                    marked against it, and scrolling past it to reach the box is
                    how somebody answers a question nobody asked. */}
                <div
                  style={{
                    background: "var(--panel)",
                    borderRadius: 11,
                    padding: "11px 14px",
                    fontSize: 12.5,
                    color: "var(--txt2)",
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    className="learn-mono"
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

                {all.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 11,
                      padding: "11px 0",
                      borderBottom: "1px solid var(--line2)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background:
                          p.isYou === true
                            ? "var(--accent)"
                            : "var(--accent-soft)",
                        color: p.isYou === true ? "#fff" : "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        flex: "0 0 28px",
                      }}
                    >
                      {p.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--txt4)" }}>
                          {p.when}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "var(--txt2)",
                          lineHeight: 1.55,
                          marginTop: 3,
                        }}
                      >
                        {p.text}
                      </div>
                    </div>
                  </div>
                ))}

                {/* A closed thread is readable and not writable. Offering a box
                    that will be refused is worse than saying it is closed. */}
                {d.closed === true ? (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--txt4)",
                      marginTop: 12,
                    }}
                  >
                    This discussion is closed — you can read it, but not post.
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      value={draft}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [d.id]: e.target.value })
                      }
                      placeholder="Add to the discussion — posts carry your name"
                      style={{
                        flex: 1,
                        background: "var(--panel)",
                        border: "1px solid var(--line-strong)",
                        borderRadius: 10,
                        padding: "9px 13px",
                        fontSize: 12.5,
                        color: "var(--txt)",
                        fontFamily: "inherit",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      disabled={draft.trim() === ""}
                      onClick={() => {
                        setPosted({
                          ...posted,
                          [d.id]: [
                            ...(posted[d.id] ?? []),
                            {
                              name: "You",
                              initials: "AO",
                              when: "just now",
                              text: draft.trim(),
                              isYou: true,
                            },
                          ],
                        })
                        setDrafts({ ...drafts, [d.id]: "" })
                      }}
                      style={{
                        background:
                          draft.trim() === ""
                            ? "var(--panel)"
                            : "var(--accent)",
                        color: draft.trim() === "" ? "var(--txt4)" : "#fff",
                        border: "none",
                        fontSize: 12.5,
                        fontWeight: 500,
                        fontFamily: "inherit",
                        padding: "9px 16px",
                        borderRadius: 10,
                        cursor: draft.trim() === "" ? "default" : "pointer",
                      }}
                    >
                      Post
                    </button>
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
