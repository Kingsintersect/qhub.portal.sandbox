"use client"

import { useEffect, useRef, useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import type { Course, MediaItem } from "@/modules/portal/seed"

/**
 * Uploading media, lifted from the bundle 25 canvas.
 *
 * The course is chosen, never the audience: targeting follows the course's own
 * level, which is what stops a Year 2 recording being published to Year 1 by a
 * slip of a dropdown. The modal says so rather than leaving it implicit.
 *
 * The file pick and the progress bar are the canvas's simulation — there is no
 * upload endpoint behind this yet. Raised with Design and the user; the shape
 * is right and only the transport is missing.
 */

export function UploadMedia({
  courses,
  isAdmin,
  onClose,
  onUploaded,
}: {
  /** An admin can publish to any course; a lecturer only to their own. */
  courses: Course[]
  isAdmin: boolean
  onClose: () => void
  onUploaded: (item: MediaItem, notice: string) => void
}) {
  const [phase, setPhase] = useState<"form" | "busy">("form")
  const [title, setTitle] = useState("")
  const [code, setCode] = useState<string | null>(null)
  const [file, setFile] = useState<{ name: string; size: string } | null>(null)
  const [pct, setPct] = useState(0)

  const ready = title.trim() !== "" && code !== null && file !== null

  // The interval outlives a render, so the values it needs at completion are
  // read from a ref rather than captured — otherwise it finishes with the
  // state as it stood when the upload began.
  const latest = useRef({ title, code, file })
  useEffect(() => {
    latest.current = { title, code, file }
  }, [title, code, file])

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  // Progress is kept in a ref as well as in state. The arithmetic must not
  // live in a setState updater: React invokes updaters more than once (twice
  // under StrictMode in development), and an updater that also fires the
  // completion callback therefore records the upload twice.
  const pctRef = useRef(0)
  const finished = useRef(false)
  useEffect(
    () => () => {
      if (timer.current !== null) clearInterval(timer.current)
    },
    []
  )

  const pick = () => {
    const gb = (Math.random() * 1.6 + 0.3).toFixed(1)
    const stem =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 36) || "recording"
    setFile({ name: `${stem}.mp4`, size: `${gb} GB` })
  }

  const go = () => {
    if (!ready) return

    setPhase("busy")
    pctRef.current = 0
    setPct(0)

    timer.current = setInterval(() => {
      const next = Math.min(
        100,
        pctRef.current + Math.floor(Math.random() * 10) + 5
      )
      pctRef.current = next
      setPct(next)

      if (next < 100 || finished.current) return

      finished.current = true
      if (timer.current !== null) {
        clearInterval(timer.current)
        timer.current = null
      }

      const { title: t, code: c, file: f } = latest.current
      const course = courses.find((x) => x.code === c)
      const level = course?.level ?? "—"

      onUploaded(
        {
          id: `pm${Date.now()}`,
          type: "Video",
          title: t.trim(),
          by: isAdmin ? "Uploaded by registry" : "Dr. F. Adeyemi",
          course: c!,
          target: level,
          // Honest about what it is right now: the file has landed, but
          // nobody can watch it until transcoding finishes.
          sizeLen: `${f!.size} · transcoding`,
          when: "Just now",
          src: "PORTAL",
        },
        `“${t.trim()}” uploaded — transcoding, then visible to ${level} on ${c}`
      )
      onClose()
    }, 150)
  }

  return (
    <Modal onClose={onClose} width={520} label="Upload media">
      {phase === "form" ? (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Upload media</div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 18px",
            }}
          >
            {isAdmin
              ? "Uploaded under the institution — pick the course; targeting follows its level."
              : "Credited to you · only your own courses can carry it."}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title — e.g. Week 6: Normalisation, worked examples"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--panel)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: "10px 13px",
              fontSize: 13,
              color: "var(--txt)",
              fontFamily: "inherit",
              outline: "none",
              marginBottom: 12,
            }}
          />

          <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 7 }}>
            Course
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {courses.map((c) => {
              const on = code === c.code

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCode(c.code)}
                  className="portal-mono"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    padding: "7px 12px",
                    borderRadius: 9,
                    cursor: "pointer",
                    color: on ? "var(--accent)" : "var(--txt2)",
                    background: on ? "var(--accent-soft)" : "transparent",
                    border: `1px solid ${
                      on ? "var(--accent-brd)" : "var(--line-strong)"
                    }`,
                    fontFamily: "inherit",
                  }}
                >
                  {c.code}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={pick}
            style={{
              width: "100%",
              border: "1.5px dashed var(--line-strong)",
              borderRadius: 13,
              padding: 16,
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 16,
              background: "transparent",
              fontFamily: "inherit",
            }}
          >
            {file === null ? (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    fontWeight: 500,
                  }}
                >
                  Choose a file
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 4,
                  }}
                >
                  Video, audio or PDF · the level targeting follows the
                  course&apos;s level
                </div>
              </>
            ) : (
              <>
                <div
                  className="portal-mono"
                  style={{ fontSize: 12.5, color: "var(--accent)" }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 4,
                  }}
                >
                  {file.size} · click to change
                </div>
              </>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "var(--txt2)",
                padding: "10px 6px",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ready}
              onClick={go}
              style={{
                marginLeft: "auto",
                background: ready ? "var(--accent)" : "var(--line-strong)",
                color: ready ? "#fff" : "var(--txt4)",
                fontSize: 13,
                fontWeight: 500,
                padding: "11px 20px",
                borderRadius: 11,
                cursor: ready ? "pointer" : "default",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              Upload
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Uploading…</div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--txt3)",
              margin: "4px 0 18px",
            }}
          >
            {file?.name}
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "var(--panel)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, var(--accent), var(--series2))",
                transition: "width .18s linear",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontSize: 12,
              color: "var(--txt4)",
            }}
          >
            <div>{pct}%</div>
            <div style={{ marginLeft: "auto" }}>
              Transcoding starts when the upload lands
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
