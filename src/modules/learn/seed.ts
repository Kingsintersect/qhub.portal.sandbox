import type { Course } from "@/modules/learn/types"

/**
 * The canvas's own course data, kept while the API for this surface is built.
 *
 * One source, read by the module accordion and the module overview alike —
 * the canvas is explicit that those two must not drift, and two copies of a
 * list are how they drift. When this becomes a real response, the shape is
 * what the endpoint has to return.
 */

const DUE: NonNullable<Course["modules"][number]["items"][number]["badge"]> = {
  text: "DUE 23:59",
  tone: "var(--neg)",
  background: "var(--neg-bg)",
}

const LOCKED = {
  text: "LOCKED",
  tone: "var(--txt4)",
  background: "var(--panel)",
}

export const COURSES: Course[] = [
  {
    code: "CSC 201",
    title: "Data structures and algorithms",
    lecturer: "Dr. F. Adeyemi",
    percent: 62,
    dot: "#4A84D6",
    meta: "Dr. F. Adeyemi · 3 modules",
    note: "Every page of every lesson read · quiz submitted today still counts toward Module 2",
    modules: [
      {
        n: "1",
        title: "Module 1 — Foundations",
        meta: "4 lessons · complete",
        percent: 100,
        items: [
          {
            kind: "video",
            title: "Week 1: Why data structures exist",
            meta: "Video lesson · 58m",
            done: true,
          },
          {
            kind: "text",
            title: "Week 2: Arrays, lists and memory",
            meta: "Reading · 5 sections",
            done: true,
          },
          {
            kind: "quiz",
            title: "Module 1 check-in quiz",
            meta: "10 questions · scored 16/20",
            done: true,
          },
        ],
      },
      {
        n: "2",
        title: "Module 2 — Trees and complexity",
        meta: "6 lessons · quiz due today",
        percent: 58,
        items: [
          {
            kind: "text",
            title: "Week 4: Complexity in practice",
            meta: "Reading · section 3 of 5",
            done: false,
          },
          {
            kind: "video",
            title: "Week 6: Trees, worked examples",
            meta: "Mixed media · video at 48:20 · audio + notes",
            done: false,
          },
          {
            kind: "pdf",
            title: "Worked examples — AVL rotations",
            meta: "PDF · 12 pages",
            done: true,
          },
          {
            kind: "quiz",
            title: "Quiz — Week 6, trees",
            meta: "12 questions · 30 min · one attempt",
            done: false,
            badge: DUE,
          },
          {
            kind: "disc",
            title: "Discussion — quicksort vs mergesort",
            meta: "Graded · 10 pts · closes Fri · you posted",
            done: true,
          },
        ],
      },
      {
        n: "3",
        title: "Module 3 — B-trees and disk structures",
        meta: "opens next week",
        percent: 0,
        items: [
          {
            kind: "video",
            title: "Week 7: B-trees intro",
            meta: "Locked until Sep 8",
            done: false,
            badge: LOCKED,
          },
        ],
      },
    ],
  },
  {
    code: "GST 103",
    title: "Logic and critical thinking",
    lecturer: "Prof. C. Okonkwo",
    percent: 88,
    dot: "#E8853D",
    meta: "Prof. C. Okonkwo · 2 modules",
    note: "One audio recap left in Module 2",
    modules: [
      {
        n: "1",
        title: "Module 1 — Foundations of reasoning",
        meta: "3 lessons · complete",
        percent: 100,
        items: [
          {
            kind: "video",
            title: "Week 1: What logic is for",
            meta: "Video lesson · 48m",
            done: true,
          },
          {
            kind: "text",
            title: "Week 2: Arguments and fallacies",
            meta: "Reading · 4 sections",
            done: true,
          },
          {
            kind: "quiz",
            title: "Foundations check-in",
            meta: "8 questions · scored 15/16",
            done: true,
          },
        ],
      },
      {
        n: "2",
        title: "Module 2 — Applied critical thinking",
        meta: "week 4 of 5",
        percent: 74,
        items: [
          {
            kind: "video",
            title: "Week 4: Logic and critical thinking",
            meta: "Video · 58m",
            done: true,
          },
          {
            kind: "audio",
            title: "Week 5 reflection prompts",
            meta: "Audio · 24m",
            done: false,
          },
          {
            kind: "disc",
            title: "Reflection discussion",
            meta: "Participation · feeds the discussion component",
            done: true,
          },
        ],
      },
    ],
  },
  {
    code: "MTH 110",
    title: "Calculus I — limits and continuity",
    lecturer: "Dr. B. Lawal",
    percent: 41,
    dot: "#0E2A55",
    meta: "Dr. B. Lawal · 2 modules",
    note: "Module 2 unlocks after the mid-semester exam",
    modules: [
      {
        n: "1",
        title: "Module 1 — Limits",
        meta: "4 lessons",
        percent: 55,
        items: [
          {
            kind: "video",
            title: "Limits and continuity",
            meta: "Video · 1h 15m · watched to 22:05",
            done: false,
          },
          {
            kind: "pdf",
            title: "Problem set 3",
            meta: "PDF · returned 9/20 — worth a second read",
            done: true,
          },
        ],
      },
      {
        n: "2",
        title: "Module 2 — Derivatives",
        meta: "opens after the mid-semester exam",
        percent: 0,
        items: [
          {
            kind: "video",
            title: "The derivative as a limit",
            meta: "Locked",
            done: false,
            badge: LOCKED,
          },
        ],
      },
    ],
  },
  {
    code: "BIO 102",
    title: "Cell biology",
    lecturer: "Dr. E. Nwachukwu",
    percent: 75,
    dot: "#4A9C77",
    meta: "Dr. E. Nwachukwu · 2 modules",
    note: "Finish the practical briefing to close Module 1",
    modules: [
      {
        n: "1",
        title: "Module 1 — The cell",
        meta: "5 lessons",
        percent: 75,
        items: [
          {
            kind: "video",
            title: "Cell structure and organelles",
            meta: "Video · 1h 02m",
            done: true,
          },
          {
            kind: "pdf",
            title: "Cell biology practical briefing",
            meta: "PDF · page 21 of 34",
            done: false,
          },
          {
            kind: "quiz",
            title: "Practical readiness quiz",
            meta: "6 questions · scored 10/12",
            done: true,
          },
        ],
      },
      {
        n: "2",
        title: "Module 2 — Membranes and transport",
        meta: "starts week 8",
        percent: 0,
        items: [
          {
            kind: "video",
            title: "Membrane transport",
            meta: "Locked until week 8",
            done: false,
            badge: LOCKED,
          },
        ],
      },
    ],
  },
]
