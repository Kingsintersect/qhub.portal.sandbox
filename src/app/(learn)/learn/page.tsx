"use client"

import { useState } from "react"

import {
  HomeBanner,
  type HomeStat,
} from "@/modules/learn/components/HomeBanner"
import {
  LearnShell,
  type LearnCourse,
  type LearnView,
} from "@/modules/learn/components/LearnShell"

/**
 * The student app.
 *
 * One authenticated shell with the view in state, as the canvas has it — the
 * sidebar swaps the panel rather than navigating, so a lesson keeps its place
 * when you glance at Grades and come back.
 *
 * The data below is the canvas's own seed, kept while the API for this surface
 * is built. It is here rather than in the components so that swapping it for
 * real responses touches one file.
 */

const COURSES: LearnCourse[] = [
  { code: "CSC 201", percent: 62, dot: "#4A84D6" },
  { code: "GST 103", percent: 88, dot: "#E8853D" },
  { code: "MTH 110", percent: 41, dot: "#0E2A55" },
  { code: "BIO 102", percent: 75, dot: "#4A9C77" },
]

const STATS: HomeStat[] = [
  {
    label: "Semester progress",
    value: "62%",
    delta: "week 6 of 13",
    tone: "txt",
  },
  { label: "Due this week", value: "3", delta: "1 today", tone: "neg" },
  { label: "Attendance", value: "84%", delta: "counts 10%", tone: "txt" },
  {
    label: "Semester average",
    value: "64%",
    delta: "9 of 16 graded",
    tone: "txt",
  },
  {
    label: "Unread",
    value: "3",
    delta: "2 messages · 1 notice",
    tone: "series2",
  },
]

const NOTICES = [
  {
    text: "Quiz — Week 6, trees closes tonight 23:59 · CSC 201",
    when: "Today 08:00",
  },
  { text: "Dr. F. Adeyemi replied to your message", when: "Yesterday" },
  {
    text: "New lesson published — Week 6: Trees, worked examples",
    when: "Aug 28",
  },
]

/** The breadcrumb per view, from the canvas's own map. */
const CRUMB: Record<LearnView, string> = {
  home: "Home",
  lessons: "Courses",
  live: "Live classes",
  disc: "Discussions",
  assess: "Quizzes & exams",
  medialib: "Media library",
  grades: "Grades",
  announce: "Announcements",
  msgs: "Messages",
}

export default function LearnPage() {
  const [view, setView] = useState<LearnView>("home")
  const [courseCode, setCourseCode] = useState<string | null>(null)

  return (
    <LearnShell
      view={view}
      onNavigate={(next) => {
        setView(next)
        setCourseCode(null)
      }}
      crumb={CRUMB[view]}
      identity={{
        school: "UNILAG Learning",
        host: "lms.learn.unilag.edu.ng",
        schoolInitials: "UL",
        name: "Adaeze Okafor",
        initials: "AO",
        matric: "UNILAG/2023/41207",
        year: "Year 2",
      }}
      courses={COURSES}
      courseCode={courseCode}
      onCourse={(code) => {
        setCourseCode(code)
        setView("lessons")
      }}
      notices={NOTICES}
      badges={{ assess: 3, msgs: 2, announce: 1 }}
    >
      {view === "home" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <HomeBanner
            greeting="Good morning"
            name="Adaeze Okafor"
            initials="AO"
            matric="UNILAG/2023/41207"
            standing="Year 2 · Computer Science · Monday, Aug 31 · week 6 of 13"
            stats={STATS}
          />
        </div>
      )}

      {view !== "home" && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
            padding: "26px 28px",
            fontSize: 13,
            color: "var(--txt3)",
          }}
        >
          {CRUMB[view]} — not lifted yet.
        </div>
      )}
    </LearnShell>
  )
}
