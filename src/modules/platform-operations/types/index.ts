export type CourseImportRow = {
  row: number
  code: string
  title: string
  creditUnits: number
  courseType: string
  level: string | null
  department: string | null
  valid: boolean
  errors: string[]
  /** create | update before committing; created | updated | failed after. */
  outcome: string
}

export type CourseImportPreview = {
  rows: CourseImportRow[]
  valid: number
  invalid: number
}

export type CourseImportResult = {
  created: number
  updated: number
  skipped: number
  rows: CourseImportRow[]
}

export type DirectoryPerson = {
  id: number
  identifier: string | null
  name: string
  email: string | null
  affiliation: string | null
  status: string | null

  /** Students only. Null on lecturers. */
  level: string | null
  cgpa: number | null

  /**
   * When they last signed in. Deliberately the only staff fact the console
   * shows beyond identity — employment status is the institution's business,
   * not the platform's.
   */
  lastActive: string | null

  /**
   * Lecturers only. Null on students, who have none of these — a student row
   * showing "0 courses" would be a claim about them rather than an absent
   * column.
   */
  faculty: string | null
  teachingCount: number | null
  teachingCodes: string[] | null
  studentLoad: number | null
  /** Library items crediting this instructor. */
  mediaCount: number | null
  /**
   * Days with any sign-in this calendar month.
   *
   * A count, never a percentage, and never coloured. "Engagement %" was cut
   * because nothing defines what "active" means — and a tinted percentage
   * against a named member of staff is a judgement rather than a fact.
   */
  daysSeenThisMonth: number | null
}

export type DirectoryResult = {
  data: DirectoryPerson[]
  total: number
  /** Set when the institution's database could not be read. */
  error?: string
}
