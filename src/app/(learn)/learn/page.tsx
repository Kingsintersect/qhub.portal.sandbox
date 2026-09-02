"use client"

import { useMemo, useState } from "react"

import {
  HomeBanner,
  type HomeStat,
} from "@/modules/learn/components/HomeBanner"
import {
  Assessments,
  type Assessment,
} from "@/modules/learn/components/Assessments"
import {
  Announcements,
  type Announcement,
} from "@/modules/learn/components/Announcements"
import { CourseHub } from "@/modules/learn/components/CourseHub"
import {
  LessonViewer,
  type LessonPage,
} from "@/modules/learn/components/LessonViewer"
import { ModuleOverview } from "@/modules/learn/components/ModuleOverview"
import {
  Messages,
  type MessageThread,
  type Recipient,
} from "@/modules/learn/components/Messages"
import {
  Grades,
  type GradeRow,
  type GradeStat,
} from "@/modules/learn/components/Grades"
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

const GRADE_STATS: GradeStat[] = [
  { label: "Semester average", value: "64%", delta: "so far", tone: "txt" },
  { label: "Graded components", value: "9", delta: "of 16", tone: "txt" },
  {
    label: "Attendance overall",
    value: "84%",
    delta: "counts 10%",
    tone: "txt",
  },
  {
    label: "Awaiting grading",
    value: "2",
    delta: "you'll be notified",
    tone: "warn",
  },
]

const GRADE_ROWS: GradeRow[] = [
  {
    code: "CSC 201",
    title: "Data structures and algorithms",
    attendance: "82%",
    discussions: "8/15",
    quizzes: "64%",
    exam: "—",
    total: "—",
    grade: "—",
  },
  {
    code: "GST 103",
    title: "Logic and critical thinking",
    attendance: "91%",
    discussions: "12/15",
    quizzes: "78%",
    exam: "71%",
    total: "74%",
    grade: "A",
  },
  {
    code: "MTH 110",
    title: "Calculus I — limits and continuity",
    attendance: "74%",
    discussions: "6/15",
    quizzes: "52%",
    exam: "48%",
    total: "53%",
    grade: "C",
  },
  {
    code: "BIO 102",
    title: "Cell biology",
    attendance: "88%",
    discussions: "10/15",
    quizzes: "70%",
    exam: "—",
    total: "—",
    grade: "—",
  },
]

const ANNOUNCEMENTS: Announcement[] = [
  {
    kind: "GENERAL",
    title: "Second-semester registration closes Friday",
    when: "Aug 25",
    from: "Registry · University of Lagos · to Year 1, Year 2",
    body: "Students who have not completed course registration lose portal access until the add/drop window. Complete it on the student portal before Friday 16:00.",
    more: "If you registered but a course still shows as pending, the registry's help desk at the Senate building handles corrections until Friday 16:00 — bring your course form. Nothing is lost if you miss the window, but portal access pauses until add/drop.",
  },
  {
    kind: "MAINTENANCE",
    title: "Planned maintenance — Sunday 02:00–04:00 WAT",
    when: "Aug 28",
    from: "Qverse platform",
    body: "The platform pauses for up to two hours. Nothing is lost — quiz attempts in progress resume where they stopped, and no deadline falls inside the window.",
    more: "During the window the mobile app shows cached content read-only. Anything you submit in the final minutes before 02:00 is safe — submissions are acknowledged before the pause begins.",
  },
  {
    kind: "COURSE",
    title: "Week 6 slide corrected — AVL rotation",
    when: "Yesterday",
    from: "Dr. F. Adeyemi · CSC 201",
    body: "The week 6 slide showed a right rotation where the video (correctly) rotates left. The slide is replaced — for the exam: rotate left on a right-heavy imbalance.",
    more: "The corrected slide is already in the Week 6 lesson — if you downloaded the old deck, replace page 14. The quiz uses the corrected convention.",
  },
]

const THREADS_MSG: MessageThread[] = [
  {
    id: "th1",
    name: "Dr. F. Adeyemi",
    course: "CSC 201",
    when: "Yesterday",
    unread: true,
    messages: [
      {
        who: "You",
        mine: true,
        when: "Yesterday 21:14",
        text: "Good evening Dr. Adeyemi. In the week 6 video at 48:20 you rotate the AVL tree left, but the slide shows a right rotation — which is correct for the exam?",
      },
      {
        who: "Dr. F. Adeyemi",
        mine: false,
        when: "Yesterday 22:03",
        text: "Well spotted — the video is correct; the slide was from last session and I have replaced it. For the exam: rotate left on a right-heavy imbalance.",
      },
    ],
  },
  {
    id: "th2",
    name: "Prof. C. Okonkwo",
    course: "GST 103",
    when: "Aug 26",
    unread: false,
    messages: [
      {
        who: "You",
        mine: true,
        when: "Aug 26 09:40",
        text: "Prof, is the week 5 reflection graded on participation or on the argument itself?",
      },
      {
        who: "Prof. C. Okonkwo",
        mine: false,
        when: "Aug 26 14:02",
        text: "Participation — post something considered and you have the marks. The argument matters for the essay, not here.",
      },
    ],
  },
]

const RECIPIENTS: Recipient[] = [
  { name: "Dr. F. Adeyemi", sub: "CSC 201 · Data structures" },
  { name: "Prof. C. Okonkwo", sub: "GST 103 · Logic" },
  { name: "Dr. B. Lawal", sub: "MTH 110 · Calculus I" },
  { name: "Dr. E. Nwachukwu", sub: "BIO 102 · Cell biology" },
]

/** A lesson's pages, keyed by the lesson title the accordion opens. */
const LESSON_PAGES: Record<string, LessonPage[]> = {
  "Week 6: Trees, worked examples": [
    {
      kind: "video",
      label: "Lecture video",
      body: "Trees and heaps — 1h 42m. Your position is kept; the page counts as read once the video reaches the end or you scrub past 90%.",
    },
    {
      kind: "audio",
      label: "Audio recap",
      body: "A 12-minute recap of rotations and heap-order — plays inline; listen while commuting.",
    },
    {
      kind: "text",
      label: "Reading — AVL invariants",
      body: "An AVL tree maintains, at every node, a balance factor of −1, 0 or +1. Insertion may break this locally; a single or double rotation restores it. The discipline: identify the pivot (the lowest unbalanced node), classify the imbalance (LL, LR, RL, RR), then apply exactly one rotation pattern. Work both examples before the quiz — the exam reuses their shape.",
    },
    {
      kind: "quiz",
      label: "Check-in",
      body: "Two questions — ungraded, instant feedback. They unlock the week 6 quiz badge on your progress.",
    },
  ],
  "Week 4: Complexity in practice": [
    {
      kind: "text",
      label: "Reading — sections 1–2",
      body: "Big-O describes growth, not speed. Section 1 builds intuition with real measurements from the lab machines; section 2 formalises it.",
    },
    {
      kind: "text",
      label: "Reading — sections 3–5",
      body: "Amortised analysis, with the dynamic array as the worked example. Section 5 closes with the cost model the quiz assumes.",
    },
    {
      kind: "pdf",
      label: "Handout",
      body: "The complexity cheat-sheet — 12 pages, downloadable, allowed in the exam.",
    },
  ],
  "Week 1: Why data structures exist": [
    {
      kind: "video",
      label: "Lecture video",
      body: "58 minutes — why the same data, structured differently, changes what a program can afford to do.",
    },
    {
      kind: "text",
      label: "Reading",
      body: "Arrays, lists and memory — the mental model everything else in this course builds on.",
    },
  ],
}

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
  const [lesson, setLesson] = useState<string | null>(null)
  const [moduleTitle, setModuleTitle] = useState<string | null>(null)
  // Lessons finished in this session. The canvas ticks the item AND posts a
  // notice on finish — a completion nobody is told about is one the student
  // will re-check the list for.
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [notices, setNotices] = useState(NOTICES)

  const courses = useMemo(
    () =>
      COURSES.map((c) => ({
        ...c,
        modules: c.modules.map((m) => ({
          ...m,
          items: m.items.map((i) =>
            done[i.title] === true ? { ...i, done: true } : i
          ),
        })),
      })),
    [done]
  )

  const finishLesson = (title: string) => {
    setDone((d) => ({ ...d, [title]: true }))
    setNotices((n) => [
      { text: `Lesson complete — “${title}” · progress recorded`, when: "Now" },
      ...n,
    ])
    setLesson(null)
    // The canvas returns to the course hub on finish, not to the module page
    // — a finished lesson is a good moment to see the course move.
    setModuleTitle(null)
  }

  // A course is always selected in the hub; the rail's null just means the
  // sidebar is not highlighting one.
  // From the derived list, not the seed — otherwise a lesson finished in this
  // session ticks nowhere, because the hub renders this object.
  const selected = courses.find((c) => c.code === courseCode) ?? courses[0]!

  // Read back off the derived course, so a lesson finished from inside the
  // module page ticks there too.
  const openModule =
    selected.modules.find((m) => m.title === moduleTitle) ?? null

  return (
    <LearnShell
      view={view}
      onNavigate={(next) => {
        setView(next)
        setCourseCode(null)
        setModuleTitle(null)
        setLesson(null)
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
      notices={notices}
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

      {view === "lessons" && lesson !== null && (
        <LessonViewer
          title={lesson}
          context={`${selected.code} · ${
            openModule?.title.split(" — ")[0] ?? "Module"
          }`}
          pages={
            LESSON_PAGES[lesson] ?? [
              {
                kind: "text",
                label: "Content",
                body: "This lesson's content.",
              },
            ]
          }
          onBack={() => setLesson(null)}
          onComplete={() => finishLesson(lesson)}
        />
      )}

      {view === "lessons" && lesson === null && openModule !== null && (
        <ModuleOverview
          module={openModule}
          courseCode={selected.code}
          onBack={() => setModuleTitle(null)}
          onOpenItem={(item) => {
            if (item.kind === "quiz") setQuizOpen(true)
            else setLesson(item.title)
          }}
        />
      )}

      {view === "lessons" && lesson === null && openModule === null && (
        <CourseHub
          courses={courses}
          selected={selected}
          onSelect={setCourseCode}
          onOpenModule={(m) => setModuleTitle(m.title)}
          onOpenItem={(item) => {
            // A quiz opens the runner; anything else opens as a lesson.
            if (item.kind === "quiz") setQuizOpen(true)
            else setLesson(item.title)
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

      {view === "announce" && <Announcements items={ANNOUNCEMENTS} />}

      {view === "msgs" && (
        <Messages threads={THREADS_MSG} recipients={RECIPIENTS} />
      )}

      {view === "grades" && (
        <Grades
          stats={GRADE_STATS}
          rows={GRADE_ROWS}
          term="Grades — 2026/2027 · 1st semester"
        />
      )}

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
    </LearnShell>
  )
}
