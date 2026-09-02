/**
 * What the student app is looking at.
 *
 * The canvas keeps one MODS map and reads it from both the module accordion
 * and the module overview page, with a note that they must not drift. That is
 * a data-shape decision, not a rendering one, so the shape lives here and both
 * surfaces take it as a prop rather than each holding their own copy.
 */

/** The kinds of thing a module can contain. */
export type ContentKind =
  | "video"
  | "audio"
  | "pdf"
  | "quiz"
  | "disc"
  | "text"
  | "live"

/** Icon paths, verbatim from the canvas. */
export const KIND_ICON: Record<ContentKind, string> = {
  video: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z",
  audio:
    "M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 18V5l11-2v12M20 15a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  pdf: "M6 2h9l5 5v15H6zM15 2v5h5",
  quiz: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  disc: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  text: "M4 6h16M4 10h16M4 14h10",
  live: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z",
}

/** Tile background and stroke per kind: [background, stroke]. */
export const KIND_TONE: Record<ContentKind, [string, string]> = {
  video: ["var(--accent-soft)", "var(--accent)"],
  audio: ["var(--warn-bg)", "var(--series2)"],
  pdf: ["var(--neg-bg)", "var(--neg)"],
  quiz: ["var(--accent-soft)", "var(--accent)"],
  disc: ["var(--warn-bg)", "var(--series2)"],
  text: ["var(--panel)", "var(--txt3)"],
  live: ["var(--accent-soft)", "var(--accent)"],
}

export type ModuleItem = {
  kind: ContentKind
  title: string
  /** The line beneath: duration, section reached, marks, attempts left. */
  meta: string
  done: boolean
  /** A badge only when there is something to say — DUE 23:59, LOCKED. */
  badge?: { text: string; tone: string; background: string }
}

export type CourseModule = {
  /** The number in the ring, as drawn — a label, not an index. */
  n: string
  title: string
  meta: string
  percent: number
  items: ModuleItem[]
}

export type Course = {
  code: string
  title: string
  lecturer: string
  percent: number
  dot: string
  /** What is left to do, in words. */
  note: string
  meta: string
  modules: CourseModule[]
}
