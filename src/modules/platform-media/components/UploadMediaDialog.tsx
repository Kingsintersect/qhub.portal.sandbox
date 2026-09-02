"use client"

import { useState } from "react"

import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"
import {
  useCourseSearch,
  useTutorSearch,
  useUploadMedia,
} from "@/modules/platform-media/hooks/use-media"
import { MEDIA_LEVELS, type MediaLevel } from "@/modules/platform-media/types"

/**
 * Upload a lecture and say who it reaches, lifted from the draft.
 *
 * The field order is the decision flow, not a form layout: the institution
 * decides which catalogue the course comes from, so it is asked first, and
 * changing it clears the course rather than leaving an id belonging to a
 * different school attached.
 *
 * Course and tutor are SEARCHED and selected, never typed. A typed id is an
 * id nobody checked, and the same number means a different course in every
 * institution's database.
 */
export function UploadMediaDialog({ onClose }: { onClose: () => void }) {
  const { data: institutionPage } = useInstitutions()
  const institutions = institutionPage?.data ?? []
  const upload = useUploadMedia()

  const [title, setTitle] = useState("")
  const [institutionId, setInstitutionId] = useState<number | "*" | null>(null)
  const [levels, setLevels] = useState<MediaLevel[]>([])
  const [courseSearch, setCourseSearch] = useState("")
  const [courseId, setCourseId] = useState<number | null>(null)
  const [courseLabel, setCourseLabel] = useState<string | null>(null)
  const [tutorSearch, setTutorSearch] = useState("")
  const [tutorId, setTutorId] = useState<number | null>(null)
  const [tutorLabel, setTutorLabel] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  // A catalogue belongs to one school; there is nothing to search until one
  // is picked, and nothing coherent to search for "all institutions".
  const singleSchool = typeof institutionId === "number" ? institutionId : null

  const { data: courses } = useCourseSearch(singleSchool, courseSearch)
  const { data: tutors } = useTutorSearch(singleSchool, tutorSearch)

  const ready =
    title.trim() !== "" &&
    institutionId !== null &&
    levels.length > 0 &&
    file !== null

  function pickInstitution(next: number | "*") {
    setInstitutionId(next)
    // The course and tutor belonged to the previous school. Keeping them
    // would attach one institution's ids to another's upload.
    setCourseId(null)
    setCourseLabel(null)
    setCourseSearch("")
    setTutorId(null)
    setTutorLabel(null)
    setTutorSearch("")
  }

  const audience =
    institutionId === null
      ? "Pick an institution."
      : levels.length === 0
        ? "Pick at least one level — nothing is delivered institution-wide by accident."
        : `${
            institutionId === "*"
              ? "Every institution"
              : (institutions.find((i) => i.id === institutionId)?.name ??
                "This institution")
          } · ${levels
            .map((l) => MEDIA_LEVELS.find((m) => m.key === l)?.label)
            .join(", ")}`

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(10,14,20,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload media"
        style={{
          position: "relative",
          width: 600,
          maxWidth: "calc(94vw / var(--zoom))",
          maxHeight: "calc(90vh / var(--zoom))",
          overflowY: "auto",
          background: "var(--surface-solid)",
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(8,12,18,.35)",
          padding: 24,
          color: "var(--txt)",
        }}
      >
        <div
          style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          Upload media
        </div>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
          Uploaded on behalf of an instructor, and targeted before it reaches
          anybody.
        </div>

        <Label>Title</Label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Introduction to Human Anatomy — Lecture 1"
          maxLength={200}
          style={fieldStyle}
        />

        <Label>Institution</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
          }}
        >
          <Choice
            on={institutionId === "*"}
            onClick={() => pickInstitution("*")}
            title="All institutions"
            note="Level targeting still applies at each school"
          />
          {institutions.map((i) => (
            <Choice
              key={i.id}
              on={institutionId === i.id}
              onClick={() => pickInstitution(i.id)}
              title={i.name}
              note={i.slug}
            />
          ))}
        </div>

        <Label>Target levels — only these students see it</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {MEDIA_LEVELS.map((l) => {
            const on = levels.includes(l.key)

            return (
              <button
                key={l.key}
                type="button"
                onClick={() =>
                  setLevels((prev) =>
                    on ? prev.filter((p) => p !== l.key) : [...prev, l.key]
                  )
                }
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "7px 13px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: on ? "#fff" : "var(--txt2)",
                  background: on ? "var(--accent)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                }}
              >
                {l.label}
              </button>
            )
          })}
        </div>

        {singleSchool !== null && (
          <>
            <Label>Course — from the school&rsquo;s catalogue</Label>
            <input
              value={courseLabel ?? courseSearch}
              onChange={(e) => {
                setCourseSearch(e.target.value)
                setCourseId(null)
                setCourseLabel(null)
              }}
              placeholder="Search by code or title…"
              style={fieldStyle}
            />
            {courseId === null && courseSearch.trim() !== "" && (
              <Options
                empty="No match. Courses arrive via SIS sync or bulk import, not here."
                items={(courses ?? []).map((c) => ({
                  id: c.id,
                  label: c.label,
                }))}
                onPick={(id, label) => {
                  setCourseId(id)
                  setCourseLabel(label)
                }}
              />
            )}

            <Label>Tutor — optional, credited on the video</Label>
            <input
              value={tutorLabel ?? tutorSearch}
              onChange={(e) => {
                setTutorSearch(e.target.value)
                setTutorId(null)
                setTutorLabel(null)
              }}
              placeholder="Search the school&rsquo;s lecturers…"
              style={fieldStyle}
            />
            {tutorId === null && tutorSearch.trim() !== "" && (
              <Options
                empty="No match. A tutor must already exist on the school's platform."
                items={(tutors ?? []).map((t) => ({
                  id: t.id,
                  label: t.label,
                }))}
                onPick={(id, label) => {
                  setTutorId(id)
                  setTutorLabel(label)
                }}
              />
            )}
          </>
        )}

        {/*
          The draft's dashed picker rather than a bare file input: it names
          the formats and the ceiling before somebody spends ten minutes
          uploading an 8 GB file the platform will refuse, and it says
          transcoding follows so the wait afterwards is expected.
        */}
        <label
          htmlFor="media-file"
          style={{
            display: "block",
            border: "1.5px dashed var(--line-strong)",
            borderRadius: 13,
            padding: 18,
            textAlign: "center",
            cursor: "pointer",
            marginTop: 16,
          }}
        >
          {file === null ? (
            <>
              <div
                style={{ fontSize: 13, color: "var(--txt2)", fontWeight: 500 }}
              >
                Choose a video file
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}
              >
                MP4, MOV or MKV · up to 8 GB · transcoded after upload
              </div>
            </>
          ) : (
            <>
              <div
                className="qhub-mono"
                style={{ fontSize: 13, color: "var(--accent)" }}
              >
                {file.name}
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 4 }}
              >
                {fileSize(file.size)} · click to choose a different file
              </div>
            </>
          )}
        </label>
        <input
          id="media-file"
          type="file"
          accept=".mp4,.mov,.webm,.m4v,.mkv,.mp3,.m4a,.wav,.aac,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: "none" }}
        />

        <div
          style={{
            fontSize: 11.5,
            color: levels.length === 0 ? "var(--series2)" : "var(--txt4)",
            marginTop: 14,
            lineHeight: 1.55,
          }}
        >
          {audience}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button type="button" onClick={onClose} style={ghostStyle}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || upload.isPending}
            onClick={() =>
              upload.mutate(
                {
                  title: title.trim(),
                  institutionId: institutionId as number | "*",
                  levels,
                  courseId,
                  tutorId,
                  file: file as File,
                },
                { onSuccess: () => onClose() }
              )
            }
            style={{
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 500,
              padding: "8px 18px",
              borderRadius: 10,
              cursor: ready && !upload.isPending ? "pointer" : "not-allowed",
              opacity: ready && !upload.isPending ? 1 : 0.55,
              fontFamily: "inherit",
            }}
          >
            {upload.isPending ? "Uploading…" : "Upload & target"}
          </button>
        </div>
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--card)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "var(--txt)",
  outline: "none",
  fontFamily: "inherit",
}

const ghostStyle: React.CSSProperties = {
  border: "1px solid var(--line-strong)",
  background: "transparent",
  color: "var(--txt2)",
  fontSize: 12.5,
  fontWeight: 500,
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
}

/** "1.8 GB", as the draft shows beside a chosen file. */
function fileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024))
  )
  const value = bytes / 1024 ** i

  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12.5,
        color: "var(--txt3)",
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function Choice({
  on,
  onClick,
  title,
  note,
}: {
  on: boolean
  onClick: () => void
  title: string
  note?: string | null
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
        background: on ? "var(--accent-soft)" : "transparent",
        borderRadius: 12,
        padding: "10px 13px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: on ? "var(--accent)" : "var(--txt)",
        }}
      >
        {title}
      </div>
      {note !== undefined && note !== null && (
        <div style={{ fontSize: 11, color: "var(--txt4)", marginTop: 1 }}>
          {note}
        </div>
      )}
    </button>
  )
}

/** Results are picked, never typed — see the dialog's note. */
function Options({
  items,
  empty,
  onPick,
}: {
  items: { id: number; label: string }[]
  empty: string
  onPick: (id: number, label: string) => void
}) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        marginTop: 6,
        maxHeight: 160,
        overflowY: "auto",
      }}
    >
      {items.length === 0 ? (
        <div
          style={{ padding: "10px 13px", fontSize: 12, color: "var(--txt4)" }}
        >
          {empty}
        </div>
      ) : (
        items.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id, o.label)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "9px 13px",
              fontSize: 12.5,
              color: "var(--txt2)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {o.label}
          </button>
        ))
      )}
    </div>
  )
}
