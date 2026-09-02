/**
 * The canvas's seed data, ported exactly.
 *
 * The student roll is generated rather than typed out — 96 rows from a seeded
 * LCG, the same generator the chart lines use. Porting the algorithm rather
 * than a dump of its output keeps the roll identical to the canvas and keeps
 * it stable between server and client render.
 */

/**
 * The canvas's seeded draw, with two corrections agreed with the user after
 * the student roll came out 95-of-96 at Year 1 with no suspended or withdrawn
 * students.
 *
 * `h * 1103515245` passes 2^53 on the first iteration, so the product stops
 * being exact in a double and the low bits round to zero. Math.imul keeps the
 * multiply in exact 32-bit range.
 *
 * That alone is not enough — it makes the roll worse. In any
 * power-of-two-modulus LCG, bit i repeats with period 2^(i+1), so the bottom
 * bits cycle far too fast to read as a small remainder: `h % 4` off the raw
 * state pins every student to one level however exact the multiply is. Reading
 * from bit 16 up takes the long-period half, which is what makes it spread.
 *
 * Only small power-of-two moduli hit this. The gradebook's draws (%45, %12,
 * %58, %60) read enough high bits to look fine even uncorrected — they use
 * this anyway, so there is one generator in the codebase rather than two.
 */
export function seededDraw(seed: number): (m: number) => number {
  let h = seed
  return (m: number) => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    return Math.floor(h / 65536) % m
  }
}

export type Student = {
  matric: string
  name: string
  prog: string
  level: string
  status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN"
  last: string
}

export type Lecturer = {
  name: string
  email: string
  dept: string
  codes: string[]
  students: number
  status: "ACTIVE" | "INVITED"
  last: string
}

export const LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4"]

const FN = [
  "Adaeze",
  "Chinedu",
  "Folake",
  "Ibrahim",
  "Ngozi",
  "Oluwaseun",
  "Emeka",
  "Zainab",
  "Tunde",
  "Amara",
  "Yusuf",
  "Kemi",
  "Obinna",
  "Halima",
  "Segun",
  "Chioma",
  "Musa",
  "Bisi",
  "Ikenna",
  "Fatima",
]

const LN = [
  "Okafor",
  "Adeyemi",
  "Bello",
  "Eze",
  "Lawal",
  "Okonkwo",
  "Abubakar",
  "Ogunleye",
  "Nwachukwu",
  "Suleiman",
  "Adebayo",
  "Ibrahim",
  "Chukwu",
  "Ojo",
  "Danladi",
  "Umar",
  "Balogun",
  "Obi",
  "Yakubu",
  "Afolabi",
]

const PROGS = [
  "Computer Science",
  "Medicine & Surgery",
  "Law",
  "Electrical Engineering",
  "Accounting",
  "Economics",
  "Mass Communication",
  "Biochemistry",
  "Political Science",
  "Civil Engineering",
]

/** Department to faculty. A lecturer's row shows both. */
export const FACULTY: Record<string, string> = {
  "Computer Science": "Faculty of Physical Sciences",
  "Medicine & Surgery": "Faculty of Medicine",
  Law: "Faculty of Law",
  "Electrical Engineering": "Faculty of Engineering",
  "Civil Engineering": "Faculty of Engineering",
  Accounting: "Faculty of Management Sciences",
  Economics: "Faculty of Social Sciences",
  "Mass Communication": "Faculty of Arts",
  Biochemistry: "Faculty of Life Sciences",
  "Political Science": "Faculty of Social Sciences",
}

export const STUDENTS: Student[] = (() => {
  const out: Student[] = []
  const rnd = seededDraw(991)

  for (let i = 0; i < 96; i++) {
    // Six ACTIVE to one SUSPENDED to one WITHDRAWN, drawn rather than
    // computed, so the roll carries a realistic share of each.
    const status = (
      [
        "ACTIVE",
        "ACTIVE",
        "ACTIVE",
        "ACTIVE",
        "ACTIVE",
        "ACTIVE",
        "SUSPENDED",
        "WITHDRAWN",
      ] as const
    )[rnd(8)]!

    out.push({
      matric: `UNILAG/20${21 + rnd(4)}/${10000 + rnd(89999)}`,
      name: `${FN[rnd(20)]} ${LN[rnd(20)]}`,
      prog: PROGS[rnd(10)]!,
      level: LEVELS[rnd(4)]!,
      status,
      // A withdrawn student has no last-active date to show, and an em-dash
      // is the honest answer rather than a stale one.
      last:
        status === "ACTIVE"
          ? ["Today", "Yesterday", "2d ago", "This week"][rnd(4)]!
          : "—",
    })
  }

  return out
})()

export const LECTURERS: Lecturer[] = [
  {
    name: "Dr. Funmilayo Adeyemi",
    email: "f.adeyemi@unilag.edu.ng",
    dept: "Computer Science",
    codes: ["CSC 201", "CSC 305"],
    students: 2140,
    status: "ACTIVE",
    last: "Today",
  },
  {
    name: "Prof. Chukwuma Okonkwo",
    email: "c.okonkwo@unilag.edu.ng",
    dept: "Mass Communication",
    codes: ["GST 103"],
    students: 8320,
    status: "ACTIVE",
    last: "3h ago",
  },
  {
    name: "Dr. Bashir Lawal",
    email: "b.lawal@unilag.edu.ng",
    dept: "Economics",
    codes: ["MTH 110", "ECO 101"],
    students: 3160,
    status: "ACTIVE",
    last: "Yesterday",
  },
  {
    name: "Engr. Sani Danladi",
    email: "s.danladi@unilag.edu.ng",
    dept: "Electrical Engineering",
    codes: ["EEE 305"],
    students: 940,
    status: "ACTIVE",
    last: "2d ago",
  },
  {
    name: "Prof. Hauwa Yusuf",
    email: "h.yusuf@unilag.edu.ng",
    dept: "Law",
    codes: ["LAW 401"],
    students: 1210,
    status: "ACTIVE",
    last: "This week",
  },
  {
    name: "Dr. Ebele Nwachukwu",
    email: "e.nwachukwu@unilag.edu.ng",
    dept: "Biochemistry",
    codes: ["BIO 102"],
    students: 2870,
    status: "ACTIVE",
    last: "Today",
  },
]

/** Two letters, dropping any title — "Dr. Bashir Lawal" reads as BL. */
export function initialsOf(name: string): string {
  return name
    .replace(/^(Dr|Prof|Engr|Mr|Mrs)\. /, "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export type Course = {
  code: string
  title: string
  dept: string
  level: string
  lect: string
  students: number
  media: number
}

/** The codes the seeded lecturer teaches. */
export const MY_CODES = ["CSC 201", "CSC 305"]

export const COURSES: Course[] = [
  {
    code: "CSC 201",
    title: "Data structures and algorithms",
    dept: "Computer Science",
    level: "Year 2",
    lect: "Dr. F. Adeyemi",
    students: 1180,
    media: 3,
  },
  {
    code: "CSC 305",
    title: "Operating systems",
    dept: "Computer Science",
    level: "Year 3",
    lect: "Dr. F. Adeyemi",
    students: 960,
    media: 1,
  },
  {
    code: "GST 103",
    title: "Logic and critical thinking",
    dept: "General Studies",
    level: "Year 1",
    lect: "Prof. C. Okonkwo",
    students: 8320,
    media: 2,
  },
  {
    code: "MTH 110",
    title: "Calculus I — limits and continuity",
    dept: "Mathematics",
    level: "Year 1",
    lect: "Dr. B. Lawal",
    students: 2210,
    media: 1,
  },
  {
    code: "ECO 101",
    title: "Principles of economics",
    dept: "Economics",
    level: "Year 1",
    lect: "Dr. B. Lawal",
    students: 950,
    media: 0,
  },
  {
    code: "EEE 305",
    title: "Control systems engineering",
    dept: "Electrical Engineering",
    level: "Year 3",
    lect: "Engr. S. Danladi",
    students: 940,
    media: 1,
  },
  {
    code: "LAW 401",
    title: "Law of evidence",
    dept: "Law",
    level: "Year 4",
    lect: "Prof. H. Yusuf",
    students: 1210,
    media: 1,
  },
  {
    code: "BIO 102",
    title: "Cell biology",
    dept: "Biochemistry",
    level: "Year 1",
    lect: "Dr. E. Nwachukwu",
    students: 2870,
    media: 2,
  },
]

export type MediaType = "Video" | "Audio" | "PDF"

export type MediaItem = {
  id: string
  type: MediaType
  title: string
  by: string
  course: string
  /** The level it reaches — follows the course's own level. */
  target: string
  sizeLen: string
  when: string
  /** PLATFORM was delivered by Qverse; PORTAL was uploaded here. */
  src: "PLATFORM" | "PORTAL"
}

export const TYPE_META: Record<
  MediaType,
  { d: string; tone: string; bg: string }
> = {
  Video: {
    d: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
    tone: "var(--accent)",
    bg: "var(--accent-soft)",
  },
  Audio: {
    d: "M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 18V5l11-2v12M20 15a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
    tone: "var(--series2)",
    bg: "var(--warn-bg)",
  },
  PDF: {
    d: "M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6",
    tone: "var(--neg)",
    bg: "var(--neg-bg)",
  },
}

export const MEDIA: MediaItem[] = [
  {
    id: "m1",
    type: "Video",
    title: "CSC 201 — Data structures: trees and heaps",
    by: "Dr. F. Adeyemi",
    course: "CSC 201",
    target: "Year 2",
    sizeLen: "1.8 GB · 1h 42m",
    when: "Aug 24",
    src: "PLATFORM",
  },
  {
    id: "m2",
    type: "Video",
    title: "GST 103 — Logic and critical thinking, week 4",
    by: "Prof. C. Okonkwo",
    course: "GST 103",
    target: "Year 1",
    sizeLen: "940 MB · 58m",
    when: "Aug 22",
    src: "PLATFORM",
  },
  {
    id: "m3",
    type: "PDF",
    title: "BIO 102 — Cell biology practical briefing",
    by: "Dr. E. Nwachukwu",
    course: "BIO 102",
    target: "Year 1",
    sizeLen: "8.2 MB · 34 pages",
    when: "Aug 15",
    src: "PLATFORM",
  },
  {
    id: "m4",
    type: "Audio",
    title: "LAW 401 — Evidence: burden of proof, recap",
    by: "Prof. H. Yusuf",
    course: "LAW 401",
    target: "Year 4",
    sizeLen: "88 MB · 1h 02m",
    when: "Aug 12",
    src: "PORTAL",
  },
  {
    id: "m5",
    type: "Video",
    title: "CSC 305 — Scheduling algorithms walkthrough",
    by: "Dr. F. Adeyemi",
    course: "CSC 305",
    target: "Year 3",
    sizeLen: "1.2 GB · 1h 10m",
    when: "Aug 9",
    src: "PORTAL",
  },
  {
    id: "m6",
    type: "Video",
    title: "MTH 110 — Limits and continuity",
    by: "Dr. B. Lawal",
    course: "MTH 110",
    target: "Year 1",
    sizeLen: "1.2 GB · 1h 15m",
    when: "Aug 21",
    src: "PLATFORM",
  },
]

export type Announcement = {
  kind: "MAINTENANCE" | "FEATURE" | "GENERAL"
  title: string
  when: string
  body: string
  /** Provenance and reach — "From Qverse · shown to staff only". */
  meta: string
}

/** Qverse's own notices. They reach staff, never students. */
export const PLATFORM_ANNOUNCEMENTS: Announcement[] = [
  {
    kind: "MAINTENANCE",
    title: "Scheduled maintenance — Sunday 02:00–04:00 WAT",
    when: "Aug 28",
    body: "The platform pauses for up to two hours. Nothing is lost; sessions resume where they stopped.",
    meta: "From Qverse · shown to staff only",
  },
  {
    kind: "FEATURE",
    title: "Media library now supports audio and PDF",
    when: "Aug 22",
    body: "Lecture recordings and course documents can be targeted per level, the same way video already is.",
    meta: "From Qverse · shown to staff only",
  },
]

/** What the institution has sent. */
export const OUR_ANNOUNCEMENTS: Announcement[] = [
  {
    kind: "GENERAL",
    title: "Second-semester registration closes Friday",
    when: "Aug 25",
    body: "Students who have not completed course registration lose portal access until the add/drop window.",
    meta: "Sent by R. Osei · Year 1, Year 2 · read by 64%",
  },
]

export type TicketMessage = { who: string; when: string; text: string }

export type Ticket = {
  ref: string
  pri: string
  subject: string
  status: "OPEN" | "RESOLVED"
  thread: TicketMessage[]
}

export const TICKETS: Ticket[] = [
  {
    ref: "TKT-5102",
    pri: "P2",
    subject: "Result upload validation rejecting a whole faculty",
    status: "OPEN",
    thread: [
      {
        who: "R. Osei (you)",
        when: "Yesterday 14:20",
        text: "Every CSV from the Faculty of Arts fails validation with a level mismatch since the session rolled over.",
      },
      {
        who: "Qverse support",
        when: "Yesterday 16:05",
        text: "We can see the runs. The new session's levels were applied but Arts' sheets still carry last session's headers — we are preparing a mapping fix and will re-run the failed batches. Nothing was lost.",
      },
    ],
  },
  {
    ref: "TKT-5079",
    pri: "P3",
    subject: "Request: extend media storage quota",
    status: "RESOLVED",
    thread: [
      {
        who: "R. Osei (you)",
        when: "Aug 20",
        text: "We are at 62% of the media pool and expect exam-week recordings to push past it.",
      },
      {
        who: "Qverse support",
        when: "Aug 21",
        text: "Quota raised from 10 GB to 15 GB effective immediately. The commercial side lands on next session's invoice as agreed with your bursary.",
      },
    ],
  },
]

export type LiveClass = {
  course: string
  title: string
  when: string
  dur: string
  host: string
  status: "SCHEDULED" | "LIVE" | "ENDED"
  /** Null until the class has happened — never a zero. */
  att: number | null
  present: string
}

export const LIVE_CLASSES: LiveClass[] = [
  {
    course: "CSC 201",
    title: "Trees and heaps — live walkthrough",
    when: "Tomorrow · 10:00",
    dur: "1h",
    host: "Dr. F. Adeyemi",
    status: "SCHEDULED",
    att: null,
    present: "",
  },
  {
    course: "CSC 305",
    title: "Scheduling algorithms Q&A",
    when: "Thu · 14:00",
    dur: "45m",
    host: "Dr. F. Adeyemi",
    status: "SCHEDULED",
    att: null,
    present: "",
  },
  {
    course: "CSC 201",
    title: "Recursion clinic",
    when: "Aug 26 · 10:00",
    dur: "1h",
    host: "Dr. F. Adeyemi",
    status: "ENDED",
    att: 82,
    present: "968 of 1,180",
  },
  {
    course: "CSC 305",
    title: "Deadlock detection lab brief",
    when: "Aug 21 · 14:00",
    dur: "1h",
    host: "Dr. F. Adeyemi",
    status: "ENDED",
    att: 69,
    present: "662 of 960",
  },
  {
    course: "CSC 201",
    title: "Week 5 review",
    when: "Aug 19 · 10:00",
    dur: "45m",
    host: "Dr. F. Adeyemi",
    status: "ENDED",
    att: 74,
    present: "873 of 1,180",
  },
]

export type LessonBlock = { kind: string; label: string }

export type Lesson = {
  course: string
  module: string
  title: string
  layout: string
  blocks: string[]
  /** An em-dash on a draft — nobody has worked through it yet. */
  done: string
  status: "PUBLISHED" | "DRAFT"
}

/** Block-kind colours, shared by the lesson table and the builder. */
export const BLOCK_TONE: Record<string, [string, string]> = {
  VIDEO: ["var(--accent)", "var(--accent-soft)"],
  AUDIO: ["var(--series2)", "var(--warn-bg)"],
  PDF: ["var(--neg)", "var(--neg-bg)"],
  TEXT: ["var(--txt3)", "var(--panel)"],
  QUIZ: ["var(--accent)", "var(--accent-soft)"],
  SLIDES: ["var(--txt3)", "var(--panel)"],
}

export const LESSONS: Lesson[] = [
  {
    course: "CSC 201",
    module: "Module 1",
    title: "Week 1: Why data structures exist",
    layout: "Video lesson",
    blocks: ["VIDEO", "TEXT", "QUIZ"],
    done: "91%",
    status: "PUBLISHED",
  },
  {
    course: "CSC 201",
    module: "Module 2",
    title: "Week 4: Complexity in practice",
    layout: "Reading",
    blocks: ["TEXT", "PDF"],
    done: "74%",
    status: "PUBLISHED",
  },
  {
    course: "CSC 201",
    module: "Module 2",
    title: "Week 6: Trees, worked examples",
    layout: "Mixed media",
    blocks: ["VIDEO", "AUDIO", "TEXT"],
    done: "38%",
    status: "PUBLISHED",
  },
  {
    course: "CSC 305",
    module: "Module 1",
    title: "Week 2: Processes vs threads",
    layout: "Video lesson",
    blocks: ["VIDEO", "TEXT"],
    done: "83%",
    status: "PUBLISHED",
  },
  {
    course: "CSC 305",
    module: "Module 3",
    title: "Week 7: B-trees draft",
    layout: "Reading",
    blocks: ["TEXT"],
    done: "—",
    status: "DRAFT",
  },
]

export type DiscussionPost = {
  name: string
  matric: string
  meta: string
  text: string
}

export type Discussion = {
  title: string
  course: string
  graded: boolean
  pts: number
  /** A string, because the seed carries "1,842" already grouped. */
  posts: string
  inv: number
  due: string
  status: "OPEN" | "CLOSED"
  prompt: string
  postList: DiscussionPost[]
}

export const DISCUSSIONS: Discussion[] = [
  {
    title: "Compare quicksort vs mergesort trade-offs",
    course: "CSC 201",
    graded: true,
    pts: 10,
    posts: "1,842",
    inv: 61,
    due: "Fri",
    status: "OPEN",
    prompt:
      "When would you pick quicksort over mergesort in a real system, and what does that cost you? Cite at least one property (stability, locality, worst case) in your answer.",
    postList: [
      {
        name: "Adaeze Okafor",
        matric: "UNILAG/2023/41207",
        meta: "posted 2h ago · 3 replies",
        text: "Quicksort wins on cache locality since it partitions in place, but you give up stability — for a leaderboard where ties must keep insertion order, mergesort is the honest choice even at 2x memory.",
      },
      {
        name: "Ibrahim Lawal",
        matric: "UNILAG/2024/50331",
        meta: "posted 5h ago · 1 reply",
        text: "Nobody ships textbook quicksort — introsort exists because the O(n²) worst case is adversarially reachable. So the real trade-off is engineered-quicksort vs mergesort, which mostly reduces to memory.",
      },
      {
        name: "Ngozi Eze",
        matric: "UNILAG/2023/44890",
        meta: "replied to Adaeze · 1h ago",
        text: "Adding to the locality point: on linked lists the picture flips completely — mergesort needs no random access, so quicksort's advantage evaporates.",
      },
      {
        name: "Tunde Balogun",
        matric: "UNILAG/2024/51002",
        meta: "posted yesterday",
        text: "Quicksort is faster.",
      },
    ],
  },
  {
    title: "Is round-robin fair? Argue both ways",
    course: "CSC 305",
    graded: true,
    pts: 5,
    posts: "704",
    inv: 48,
    due: "Sep 5",
    status: "OPEN",
    prompt:
      "Round-robin gives every process an equal slice. Make the case that this is fair, then make the case that it is unfair — both from the same definition of fairness.",
    postList: [
      {
        name: "Kemi Adebayo",
        matric: "UNILAG/2023/42115",
        meta: "posted 1d ago · 2 replies",
        text: "Equal slices are fair by opportunity but unfair by outcome: an interactive process that yields early is punished relative to a CPU hog. Fair-share schedulers exist precisely because equal ≠ equitable.",
      },
      {
        name: "Musa Danladi",
        matric: "UNILAG/2024/49877",
        meta: "posted 2d ago",
        text: "It is fair in the only sense a scheduler can promise: no starvation, bounded wait. Any outcome-based fairness needs to know what the process deserves, which the kernel cannot know.",
      },
    ],
  },
  {
    title: "Introduce yourself + your build setup",
    course: "CSC 201",
    graded: false,
    pts: 0,
    posts: "2,203",
    inv: 88,
    due: "—",
    status: "CLOSED",
    prompt:
      "Say hello — what machine, OS and editor are you working on this semester?",
    postList: [
      {
        name: "Chioma Obi",
        matric: "UNILAG/2024/50441",
        meta: "posted Aug 12",
        text: "Chioma, Year 2. A hand-me-down ThinkPad on Ubuntu, VS Code, and a lot of patience for NEPA.",
      },
    ],
  },
]

/** The score buttons offered, by the discussion's points. */
export function scoreSteps(pts: number): number[] {
  if (pts === 5) return [1, 2, 3, 4, 5]
  if (pts === 20) return [4, 8, 12, 16, 20]
  return [2, 4, 6, 8, 10]
}

export type Assessment = {
  id: string
  kind: "QUIZ" | "EXAM"
  title: string
  course: string
  q: number
  pts: number
  window: string
  timer?: string
  status: "SCHEDULED" | "GRADED" | "GRADING" | "DRAFT"
  sub: string
  avg: string
}

export const ASSESSMENTS: Assessment[] = [
  {
    id: "as1",
    kind: "QUIZ",
    title: "Week 6 quiz — trees",
    course: "CSC 201",
    q: 12,
    pts: 24,
    window: "Sep 3 · 10:00 · 30 min",
    status: "SCHEDULED",
    sub: "—",
    avg: "—",
  },
  {
    id: "as2",
    kind: "QUIZ",
    title: "Week 4 quiz — complexity",
    course: "CSC 201",
    q: 10,
    pts: 20,
    window: "Closed Aug 22",
    status: "GRADED",
    sub: "1,104 of 1,180",
    avg: "64%",
  },
  {
    id: "as3",
    kind: "EXAM",
    title: "Mid-semester exam",
    course: "CSC 305",
    q: 40,
    pts: 100,
    window: "Exam week",
    timer: "2h",
    status: "DRAFT",
    sub: "—",
    avg: "—",
  },
]

export type BuilderQuestion = {
  type: string
  prompt: string
  pts: number
  opts: string[]
  correct: Record<number, boolean>
}

/** What the OCR pass claims to have found, with its confidence. */
export const OCR_FOUND: {
  prompt: string
  type: string
  pts: number
  conf: number
  opts?: string[]
}[] = [
  {
    prompt: "Define a binary search tree and state its ordering invariant.",
    type: "Short answer",
    pts: 5,
    conf: 96,
  },
  {
    prompt: "Which traversal of a BST yields keys in sorted order?",
    type: "Multiple choice",
    pts: 2,
    conf: 94,
    opts: ["Pre-order", "In-order", "Post-order", "Level-order"],
  },
  {
    prompt:
      "A heap is a complete binary tree. True or false — justify in one line.",
    type: "Short answer",
    pts: 3,
    conf: 88,
  },
  {
    prompt:
      "Insert 42 into the AVL tree shown in figure 3 and give the rotations performed.",
    type: "Essay",
    pts: 10,
    conf: 61,
  },
]

/** A choice question with nothing marked correct cannot auto-mark. */
export function missingKey(q: BuilderQuestion): boolean {
  const choice = q.type === "Multiple choice" || q.type === "Multi-select"
  return choice && Object.values(q.correct).filter(Boolean).length === 0
}

export type PendingGrade = {
  id: string
  student: string
  matric: string
  assess: string
  submitted: string
  suggested: number
  max: number
}

export const PENDING_GRADES: PendingGrade[] = [
  {
    id: "gp1",
    student: "Adaeze Okafor",
    matric: "UNILAG/2023/41207",
    assess: "Week 4 quiz · Q9 — short answer",
    submitted: "Aug 22",
    suggested: 8,
    max: 10,
  },
  {
    id: "gp2",
    student: "Ibrahim Lawal",
    matric: "UNILAG/2024/50331",
    assess: "Week 4 quiz · Q9 — short answer",
    submitted: "Aug 22",
    suggested: 6,
    max: 10,
  },
]

export type GradebookRow = {
  name: string
  matric: string
  course: string
  att: number
  disc: number
  quiz: number
  /** Null until the exam is sat — the total and grade wait on it. */
  exam: number | null
  total: number
  grade: string
  status: "GRADED" | "PENDING"
}

/** The grade boundaries, stated on the screen as well as applied here. */
function gradeOf(total: number): string {
  if (total >= 70) return "A"
  if (total >= 60) return "B"
  if (total >= 50) return "C"
  if (total >= 45) return "D"
  if (total >= 40) return "E"
  return "F"
}

export const GRADEBOOK: GradebookRow[] = (() => {
  const rnd = seededDraw(313)
  const out: GradebookRow[] = []

  for (let i = 0; i < 9; i++) {
    const att = 55 + rnd(45)
    const disc = 4 + rnd(12)
    const quiz = 40 + rnd(58)
    // Every third student has not sat the exam, so the screen always shows
    // the incomplete case rather than only the tidy one.
    const exam = i % 3 === 2 ? null : 35 + rnd(60)
    const total = Math.round(
      att * 0.1 +
        (disc / 15) * 100 * 0.15 +
        quiz * 0.25 +
        (exam === null ? 0 : exam * 0.5)
    )

    out.push({
      name: `${FN[rnd(20)]} ${LN[rnd(20)]}`,
      matric: `UNILAG/202${3 + rnd(2)}/${40000 + rnd(19999)}`,
      course: i % 2 === 0 ? "CSC 201" : "CSC 305",
      att,
      disc,
      quiz,
      exam,
      total,
      grade: exam === null ? "—" : gradeOf(total),
      status: exam === null ? "PENDING" : "GRADED",
    })
  }

  return out
})()

export const GRADE_WEIGHTS = [
  { k: "Attendance", v: "10%" },
  { k: "Discussions", v: "15%" },
  { k: "Quizzes", v: "25%" },
  { k: "Exam", v: "50%" },
]

export const GRADE_SCALE =
  "A ≥70 · B 60–69 · C 50–59 · D 45–49 · E 40–44 · F <40"
