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
}

export type DirectoryResult = {
  data: DirectoryPerson[]
  total: number
  /** Set when the institution's database could not be read. */
  error?: string
}
