"use client"

import { useState } from "react"

import { Modal } from "@/modules/portal/components/Modal"
import {
  BLOCK_TONE,
  type Lesson,
  type LessonBlock,
} from "@/modules/portal/seed"

/**
 * The lesson builder, lifted from the bundle 25 canvas.
 *
 * A lesson is a stack of blocks in the order students meet them, so the list
 * is the editor: add appends, the ✕ removes, and the order on screen is the
 * order on the page. The label under "Content blocks" says as much, because a
 * list that looks like a set of options behaves very differently from one that
 * is a sequence.
 */

const LAYOUTS = [
  {
    label: "Video lesson",
    sub: "A video leads; notes and materials sit under it",
    icon: "M2 2h30v12H2zM13 5.5l6 2.5-6 2.5zM2 17h20",
  },
  {
    label: "Reading",
    sub: "Long-form text with figures and attachments",
    icon: "M2 3h30M2 8h30M2 13h22M2 18h26",
  },
  {
    label: "Mixed media",
    sub: "Any blocks in any order — video, audio, text, quiz",
    icon: "M2 2h13v8H2zM19 2h13v8H19zM2 14h13v6H2zM19 14h13v6H19z",
  },
]

const ADDABLE: [string, string, string][] = [
  [
    "VIDEO",
    "Video",
    "lecture-recording.mp4 · from your media library or a new upload",
  ],
  ["AUDIO", "Audio", "recap-audio.m4a · plays inline"],
  ["TEXT", "Text section", "Written content — edited right on the lesson page"],
  ["PDF", "PDF / document", "handout.pdf · students can download"],
  ["SLIDES", "Slides", "week-deck.pdf · paged viewer"],
  ["QUIZ", "Inline quiz", "A short check-in — built in the assessment builder"],
]

/** Modules that exist on each course today. */
const BASE_MODULES: Record<string, number> = { "CSC 201": 2, "CSC 305": 3 }

export function CreateLesson({
  courses,
  onClose,
  onPublish,
}: {
  courses: string[]
  onClose: () => void
  onPublish: (lesson: Lesson, notice: string) => void
}) {
  const [course, setCourse] = useState<string | null>(null)
  const [module, setModule] = useState("Module 1")
  const [title, setTitle] = useState("")
  const [layout, setLayout] = useState("Video lesson")
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  // Modules added in this session, per course.
  const [extra, setExtra] = useState<Record<string, number>>({})

  const base = course !== null ? (BASE_MODULES[course] ?? 2) : 2
  const count = base + (extra[course ?? "_"] ?? 0)
  const modules = [
    ...Array.from({ length: count }, (_, i) => `Module ${i + 1}`),
    "Whole course",
  ]

  const ready = title.trim().length > 2 && course !== null && blocks.length > 0

  const addModule = () => {
    const key = course ?? "_"
    const next = base + (extra[key] ?? 0) + 1
    setExtra((v) => ({ ...v, [key]: (v[key] ?? 0) + 1 }))
    setModule(`Module ${next}`)
  }

  return (
    <Modal onClose={onClose} width={720} label="Create a lesson">
      <div style={{ fontSize: 17, fontWeight: 600 }}>Create a lesson</div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--txt3)",
          margin: "4px 0 16px",
        }}
      >
        Pick a layout, then stack content blocks — the lesson publishes to the
        course&apos;s Moodle page under its module.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        {courses.map((c) => (
          <Chip
            key={c}
            label={c}
            mono
            active={course === c}
            onClick={() => {
              setCourse(c)
              setModule("Module 1")
            }}
          />
        ))}

        <div
          style={{ width: 1, height: 20, background: "var(--line-strong)" }}
        />

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {modules.map((m) => (
            <Chip
              key={m}
              label={m}
              active={module === m}
              onClick={() => setModule(m)}
            />
          ))}
          <button
            type="button"
            onClick={addModule}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "7px 12px",
              borderRadius: 9,
              cursor: "pointer",
              color: "var(--accent)",
              border: "1px dashed var(--accent-brd)",
              background: "transparent",
              fontFamily: "inherit",
            }}
          >
            + New module
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lesson title — e.g. Week 7: B-trees and disk-friendly structures"
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
          marginBottom: 14,
        }}
      />

      <Label>Layout</Label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {LAYOUTS.map((c) => {
          const on = layout === c.label

          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setLayout(c.label)}
              style={{
                border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                background: on ? "var(--accent-soft)" : "transparent",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <svg
                width="34"
                height="22"
                viewBox="0 0 34 22"
                style={{ display: "block", marginBottom: 8 }}
              >
                <path
                  d={c.icon}
                  fill="none"
                  stroke={on ? "var(--accent)" : "var(--txt4)"}
                  strokeWidth={1.4}
                />
              </svg>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: on ? "var(--accent)" : "var(--txt)",
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {c.sub}
              </div>
            </button>
          )
        })}
      </div>

      <Label>Content blocks — in the order students meet them</Label>

      {blocks.length === 0 && (
        <div
          style={{
            border: "1.5px dashed var(--line-strong)",
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
            fontSize: 12,
            color: "var(--txt4)",
            marginBottom: 10,
          }}
        >
          Nothing yet — add blocks below.
        </div>
      )}

      {blocks.map((b, i) => {
        const [tone, background] = BLOCK_TONE[b.kind] ?? BLOCK_TONE.TEXT!

        return (
          <div
            key={`${b.kind}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid var(--line)",
              borderRadius: 11,
              padding: "9px 13px",
              marginBottom: 6,
            }}
          >
            <span
              className="portal-mono"
              style={{
                fontSize: 9.5,
                letterSpacing: ".06em",
                padding: "3px 9px",
                borderRadius: 999,
                color: tone,
                background,
              }}
            >
              {b.kind}
            </span>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--txt2)",
                flex: 1,
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {b.label}
            </div>
            <button
              type="button"
              aria-label={`Remove ${b.kind} block`}
              onClick={() => setBlocks((all) => all.filter((_, j) => j !== i))}
              style={{
                fontSize: 12,
                color: "var(--txt3)",
                cursor: "pointer",
                padding: "2px 6px",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        )
      })}

      <div
        style={{
          display: "flex",
          gap: 7,
          flexWrap: "wrap",
          margin: "10px 0 18px",
        }}
      >
        {ADDABLE.map(([kind, label, sub]) => (
          <button
            key={kind}
            type="button"
            onClick={() => setBlocks((all) => [...all, { kind, label: sub }])}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              padding: "8px 13px",
              borderRadius: 9,
              cursor: "pointer",
              color: "var(--txt2)",
              border: "1px solid var(--line-strong)",
              background: "transparent",
              fontFamily: "inherit",
            }}
          >
            + {label}
          </button>
        ))}
      </div>

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

        {/* Reads back what is about to be published, next to the button that
            publishes it. */}
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11.5,
            color: "var(--txt4)",
          }}
        >
          {blocks.length} blocks · {layout} · {module}
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!ready) return

            const lesson: Lesson = {
              course: course!,
              module,
              title: title.trim(),
              layout,
              blocks: blocks.map((b) => b.kind),
              done: "0%",
              status: "PUBLISHED",
            }
            onPublish(
              lesson,
              `Lesson published — “${lesson.title}” · ${lesson.course} ${module} · live on the Moodle page`
            )
          }}
          style={{
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
          Publish to Moodle
        </button>
      </div>
    </Modal>
  )
}

function Chip({
  label,
  active,
  onClick,
  mono,
}: {
  label: string
  active: boolean
  onClick: () => void
  mono?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={mono === true ? "portal-mono" : undefined}
      style={{
        fontSize: mono === true ? 11.5 : 12,
        fontWeight: 500,
        padding: "7px 12px",
        borderRadius: 9,
        cursor: "pointer",
        color: active ? "var(--accent)" : "var(--txt2)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: `1px solid ${
          active ? "var(--accent-brd)" : "var(--line-strong)"
        }`,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 7 }}>
      {children}
    </div>
  )
}
