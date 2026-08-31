import apiClient from "@/lib/clients/apiClient"
import type {
  CourseOption,
  MediaItem,
  MediaList,
  TutorOption,
} from "@/modules/platform-media/types"

const AUTH = { access_token: true } as const

export const mediaService = {
  list: (
    params: {
      institution?: number | ""
      kind?: string
      search?: string
      perPage?: number
    } = {}
  ) => apiClient.get<MediaList>("/platform/media", { ...AUTH, params }),

  /**
   * Upload a lecture.
   *
   * FormData rather than JSON because the file goes with it; apiClient strips
   * its own Content-Type for FormData so the multipart boundary survives.
   *
   * `institutionId` is sent as "*" for every institution — an explicit choice
   * rather than an omitted field, so the server can tell the two apart.
   */
  upload: async (payload: {
    title: string
    institutionId: number | "*"
    levels: string[]
    courseId?: number | null
    tutorId?: number | null
    file: File
  }): Promise<MediaItem> => {
    const body = new FormData()

    body.append("title", payload.title)
    body.append("institutionId", String(payload.institutionId))
    payload.levels.forEach((l) => body.append("levels[]", l))

    if (payload.courseId != null)
      body.append("courseId", String(payload.courseId))
    if (payload.tutorId != null) body.append("tutorId", String(payload.tutorId))

    body.append("file", payload.file)

    return (
      await apiClient.post<{ data: MediaItem }, FormData>(
        "/platform/media",
        body,
        AUTH
      )
    ).data
  },

  /** One school's catalogue. Read live — a mirror would offer dead courses. */
  courses: async (tenantId: number, search: string): Promise<CourseOption[]> =>
    (
      await apiClient.get<{ data: CourseOption[] }>(
        `/platform/media/institutions/${tenantId}/courses`,
        { ...AUTH, params: { search } }
      )
    ).data,

  tutors: async (tenantId: number, search: string): Promise<TutorOption[]> =>
    (
      await apiClient.get<{ data: TutorOption[] }>(
        `/platform/media/institutions/${tenantId}/tutors`,
        { ...AUTH, params: { search } }
      )
    ).data,
}
