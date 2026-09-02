"use client"

import { useState } from "react"

import {
  HomeBanner,
  type HomeStat,
} from "@/modules/learn/components/HomeBanner"
import {
  Assessments,
  type Assessment,
} from "@/modules/learn/components/Assessments"
import { CourseHub } from "@/modules/learn/components/CourseHub"
import {
  MediaLibrary,
  type MediaItem,
} from "@/modules/learn/components/MediaLibrary"
import { QuizRunner } from "@/modules/learn/components/QuizRunner"
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

const ASSESSMENTS: Assessment[] = [
  {
    kind: "QUIZ",
    title: "Quiz — Week 6, trees",
    meta: "12 questions · 24 pts · 30 min timer · closes today 23:59",
    attempts: "0 of 1 attempts used",
    mark: "—",
    marked: false,
    cta: "Start attempt",
  },
  {
    kind: "QUIZ",
    title: "Week 4 quiz — complexity",
    meta: "10 questions · 20 pts · closed Aug 22",
    attempts: "1 of 2 attempts used · best kept",
    mark: "13/20 · 65%",
    marked: true,
    badge: { text: "GRADED", tone: "accent" },
  },
  {
    kind: "QUIZ",
    title: "Module 1 check-in quiz",
    meta: "10 questions · 20 pts",
    attempts: "2 of 2 attempts used · best kept",
    mark: "16/20 · 80%",
    marked: true,
    badge: { text: "GRADED", tone: "accent" },
  },
  {
    kind: "EXAM",
    title: "Mid-semester exam",
    meta: "40 questions · 100 pts · 2h hard timer · exam week",
    attempts: "0 of 1 attempts",
    mark: "—",
    marked: false,
    badge: { text: "SCHEDULED", tone: "warn" },
  },
]

/* The canvas cycles four prompts across twelve questions. */
const PROMPTS = [
  {
    prompt:
      "Which traversal of a binary search tree yields keys in sorted order?",
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
  },
  {
    prompt: "A binary heap is always:",
    options: [
      "A complete binary tree",
      "A full binary tree",
      "Perfectly balanced",
      "Sorted in-order",
    ],
  },
  {
    prompt:
      "Inserting into an AVL tree may require at most how many rotations?",
    options: [
      "One single or one double rotation",
      "Two double rotations",
      "O(log n) rotations",
      "None — AVL trees never rotate on insert",
    ],
  },
  {
    prompt: "The height of a balanced BST with n nodes is:",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
  },
]

const QUIZ_QUESTIONS = Array.from({ length: 12 }, (_, i) => ({
  ...PROMPTS[i % PROMPTS.length]!,
  points: 2,
}))

const MEDIA: MediaItem[] = [
  {
    kind: "video",
    type: "Video",
    course: "CSC 201",
    title: "Trees and heaps — lecture recording",
    meta: "1h 42m · Dr. F. Adeyemi · Week 6",
    progress: "watched to 48:20",
    when: "Aug 24",
  },
  {
    kind: "video",
    type: "Video",
    course: "CSC 201",
    title: "Scheduling algorithms walkthrough",
    meta: "1h 10m · Dr. F. Adeyemi",
    progress: "not started",
    when: "Aug 9",
  },
  {
    kind: "audio",
    type: "Audio",
    course: "CSC 201",
    title: "Recursion clinic — audio recap",
    meta: "41m · plays inline",
    progress: "played",
    when: "Aug 27",
  },
  {
    kind: "pdf",
    type: "PDF",
    course: "CSC 201",
    title: "Worked examples — AVL rotations",
    meta: "12 pages · downloadable",
    progress: "page 12 of 12",
    when: "Aug 20",
  },
  {
    kind: "video",
    type: "Video",
    course: "GST 103",
    title: "Logic and critical thinking, week 4",
    meta: "58m · Prof. C. Okonkwo",
    progress: "watched",
    when: "Aug 22",
  },
  {
    kind: "video",
    type: "Video",
    course: "MTH 110",
    title: "Limits and continuity",
    meta: "1h 15m · Dr. B. Lawal",
    progress: "watched to 22:05",
    when: "Aug 21",
  },
  {
    kind: "pdf",
    type: "PDF",
    course: "BIO 102",
    title: "Cell biology practical briefing",
    meta: "34 pages · downloadable",
    progress: "page 21 of 34",
    when: "Aug 15",
  },
  {
    kind: "audio",
    type: "Audio",
    course: "GST 103",
    title: "Week 5 reflection prompts",
    meta: "24m · plays inline",
    progress: "not started",
    when: "Aug 25",
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
  const [quizOpen, setQuizOpen] = useState(false)

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

      {view === "medialib" && (
        <MediaLibrary items={MEDIA} courses={COURSES.map((c) => c.code)} />
      )}

      {view === "assess" && !quizOpen && (
        <Assessments rows={ASSESSMENTS} onStart={() => setQuizOpen(true)} />
      )}

      {view === "assess" && quizOpen && (
        <QuizRunner
          title="Quiz — Week 6, trees"
          courseMeta="CSC 201 · 12 questions · 24 pts · one attempt"
          questions={QUIZ_QUESTIONS}
          seconds={1800}
          onSubmit={() => setQuizOpen(false)}
        />
      )}

      {view !== "home" &&
        view !== "lessons" &&
        view !== "live" &&
        view !== "disc" &&
        view !== "assess" &&
        view !== "medialib" && (
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
