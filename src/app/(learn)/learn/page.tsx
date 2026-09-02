"use client"

import { useState } from "react"

import {
  HomeBanner,
  type HomeStat,
} from "@/modules/learn/components/HomeBanner"
import { CourseHub } from "@/modules/learn/components/CourseHub"
import {
  Discussions,
  type Discussion,
} from "@/modules/learn/components/Discussions"
import {
  LiveClasses,
  type LiveClass,
} from "@/modules/learn/components/LiveClasses"
import {
  LearnShell,
  type LearnCourse,
  type LearnView,
} from "@/modules/learn/components/LearnShell"
import { COURSES } from "@/modules/learn/seed"

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

/* The sidebar rail reads the same list as the hub, so the two cannot show
   different progress for the same course. */
const RAIL: LearnCourse[] = COURSES.map((c) => ({
  code: c.code,
  percent: c.percent,
  dot: c.dot,
}))

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

/**
 * The heading above each section, and the line under it.
 *
 * The subtitle is where the rule lives — that a lesson only counts once every
 * page is read, that a timer auto-submits at 00:00. Somebody arriving at the
 * section is the person who needs telling.
 */
const SECTION: Partial<Record<LearnView, { title: string; sub: string }>> = {
  lessons: {
    title: "Courses",
    sub: "Module by module — every page of a lesson must be read before it counts complete",
  },
  live: {
    title: "Live classes",
    sub: "Every scheduled and past class · attendance counts 10% of each course grade",
  },
  disc: {
    title: "Discussions",
    sub: "Open and closed threads — graded ones land in the gradebook at their deadline",
  },
  assess: {
    title: "Quizzes & exams",
    sub: "Every quiz and exam · timers are hard — attempts auto-submit at 00:00",
  },
}

const LIVE: LiveClass[] = [
  {
    title: "GST 103 revision hour",
    meta: "LIVE NOW · started 09:00 · Prof. C. Okonkwo · attendance counting",
    badge: "LIVE NOW",
    join: { label: "Join on Zoom", open: true },
  },
  {
    title: "Trees and heaps — live walkthrough",
    meta: "Tomorrow · 10:00 WAT · 1h · Dr. F. Adeyemi",
    badge: "UPCOMING",
    join: { label: "Join opens 09:45", open: false },
  },
  {
    title: "Recursion clinic",
    meta: "Aug 26 · you attended · 52 min in the room",
    badge: "PRESENT",
    recording: true,
  },
  {
    title: "Week 5 review",
    meta: "Aug 19 · you missed it — the recording does not count as attendance",
    badge: "ABSENT",
    recording: true,
  },
]

const THREADS: Discussion[] = [
  {
    id: "d1",
    title: "Compare quicksort vs mergesort trade-offs",
    meta: "Graded · 10 pts · closes Fri · 1,842 posts",
    badge: "YOU POSTED",
    tone: "accent",
    prompt:
      "When would you pick quicksort over mergesort in a real system, and what does that cost you? Cite at least one property (stability, locality, worst case).",
    posts: [
      {
        name: "You",
        initials: "AO",
        when: "2h ago · 3 replies",
        isYou: true,
        text: "Quicksort wins on cache locality since it partitions in place, but you give up stability — for a leaderboard where ties must keep insertion order, mergesort is the honest choice even at 2x memory.",
      },
      {
        name: "Ibrahim Lawal",
        initials: "IL",
        when: "5h ago",
        text: "Nobody ships textbook quicksort — introsort exists because the O(n²) worst case is adversarially reachable. The real trade-off is engineered-quicksort vs mergesort, which mostly reduces to memory.",
      },
    ],
  },
  {
    id: "d2",
    title: "Introduce yourself + your build setup",
    meta: "Ungraded · closed · 2,203 posts",
    badge: "CLOSED",
    tone: "muted",
    closed: true,
    prompt:
      "Say hello — what machine, OS and editor are you working on this semester?",
    posts: [
      {
        name: "Chioma Obi",
        initials: "CO",
        when: "Aug 12",
        text: "Chioma, Year 2. A hand-me-down ThinkPad on Ubuntu, VS Code, and a lot of patience for NEPA.",
      },
    ],
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

  // A course is always selected in the hub; the rail's null just means the
  // sidebar is not highlighting one.
  const selected = COURSES.find((c) => c.code === courseCode) ?? COURSES[0]!

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
      courses={RAIL}
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

      {SECTION[view] !== undefined && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            {SECTION[view]?.title}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
            {SECTION[view]?.sub}
          </div>
        </div>
      )}

      {view === "lessons" && (
        <CourseHub
          courses={COURSES}
          selected={selected}
          onSelect={setCourseCode}
          onOpenModule={() => {
            /* The module overview page is the next slice. */
          }}
          onOpenItem={() => {
            /* The lesson viewer and quiz runner are later slices. */
          }}
        />
      )}

      {view === "live" && (
        <LiveClasses
          classes={LIVE}
          attendancePercent={82}
          attendanceNote="9 of 11 classes · counts 10% of your grade"
        />
      )}

      {view === "disc" && <Discussions threads={THREADS} />}

      {view !== "home" &&
        view !== "lessons" &&
        view !== "live" &&
        view !== "disc" && (
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
