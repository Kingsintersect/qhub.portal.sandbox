/**
 * The canvas's seed data, ported exactly.
 *
 * The student roll is generated rather than typed out — 96 rows from a seeded
 * LCG, the same generator the chart lines use. Porting the algorithm rather
 * than a dump of its output keeps the roll identical to the canvas and keeps
 * it stable between server and client render.
 */

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
  let h = 991
  // Two corrections to the canvas's generator, agreed with the user after the
  // roll came out 95-of-96 at Year 1 with no suspended or withdrawn students.
  //
  // `h * 1103515245` passes 2^53 on the first iteration, so the product stops
  // being exact in a double and the low bits round to zero. Math.imul keeps
  // the multiply in exact 32-bit range.
  //
  // That alone is not enough: in any power-of-two-modulus LCG, bit i repeats
  // with period 2^(i+1), so the bottom bits cycle far too fast to be read as
  // a small remainder — taking `h % 4` straight off the state pins every
  // student to one level. Reading from bit 16 up gives the long-period half
  // of the state, which is what makes the draw spread.
  const rnd = (m: number) => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    return Math.floor(h / 65536) % m
  }

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
