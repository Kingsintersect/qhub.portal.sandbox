/** The levels a lecture can be aimed at — a fixed platform vocabulary. */
export const MEDIA_LEVELS = [
  { key: "YEAR_1", label: "Year 1" },
  { key: "YEAR_2", label: "Year 2" },
  { key: "YEAR_3", label: "Year 3" },
  { key: "YEAR_4", label: "Year 4" },
  { key: "YEAR_5", label: "Year 5" },
  { key: "YEAR_6", label: "Year 6" },
  { key: "POSTGRADUATE", label: "Postgraduate" },
] as const

export type MediaLevel = (typeof MEDIA_LEVELS)[number]["key"]

export type MediaKind = "VIDEO" | "AUDIO" | "PDF"

export type MediaStatus = "PROCESSING" | "READY" | "FAILED"

export interface MediaItem {
  id: number
  title: string
  kind: MediaKind
  status: MediaStatus
  /**
   * Null means every institution. Distinct from "no institution" — it is a
   * deliberate choice on upload, and the surface says so rather than showing
   * a blank.
   */
  institutionId: number | null
  institution: string | null
  estateWide: boolean
  levels: MediaLevel[]
  levelLabels: string[]
  course: string | null
  tutor: string | null
  bytes: number
  /** Why transcoding gave up. Null unless status is FAILED. */
  failedReason: string | null
  uploadedBy: string | null
  readyAt: string | null
  createdAt: string | null
}

export interface MediaStats {
  videos: number
  storageBytes: number
  processing: number
  institutionsCovered: number
  estateWide: number
}

export interface MediaList {
  data: MediaItem[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    stats: MediaStats
  }
}

/** A course from one school's own catalogue — searched, never typed. */
export interface CourseOption {
  id: number
  code: string | null
  title: string | null
  label: string
}

/** A lecturer from one school's own directory. */
export interface TutorOption {
  id: number
  staffNumber: string | null
  label: string
}
