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
