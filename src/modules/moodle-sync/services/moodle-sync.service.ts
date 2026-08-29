import apiClient from "@/lib/clients/apiClient"
import { academicUnitsApi } from "@/services/academicStructureApi"
import type {
  CategorySyncResponse,
  CoursesBulkPushPayload,
  CourseSyncResponse,
  EnrollmentSyncResponse,
  PushCategoryDto,
  ResolveCategoryMappingDto,
  UserSyncQueryFilters,
  UserSyncResponse,
  UsersBulkPushPayload,
  PullUsersResult,
  AssessmentResponse,
  AssessmentFilter,
  PaginatedAssessments,
  UpdateVisibilityPayload,
  VisibilityResponse,
  AssessmentSyncResult,
  AssessmentSyncStatusResult,
  CaPreviewResponse,
  GradeResponse,
  CalendarEventResponse,
} from "../types"

// Real backend contract per bruno/moodle-sync/*.bru (the sole source of truth
// for this module — see CLAUDE.md §13). List/detail GETs are wrapped in a
// `{ data: ... }` envelope (confirmed by every List .bru's
// `res.body.data[0].id` post-response script); push/pull actions that return
// a single sync record respond with the raw object (confirmed by the Push
// .bru files reading `res.body.id` directly) — unwrapped here so callers
// keep receiving the plain shapes they already expect.
const BASE = "/moodle-sync"
const AUTH = { access_token: true } as const

// Raw wire shape for category-sync rows — the real backend only returns the
// mapping row itself (academicUnitId + Moodle-side fields); `unitName`/
// `unitTypeCode`/`parentId` on CategorySyncResponse are enriched client-side
// by joining against the AcademicUnit tree (mapCategorySync below), the same
// "Frontend Contract Additions" pattern the old entityType/entityId scheme
// used. See sandbox/schema-moodel-sync-refactor/api-v2.md §"Moodle Category
// Sync" and MISSING_BACKEND_APIS.md §2.16.
interface RawCategorySync {
  id: number
  academicUnitId: number
  moodleCategoryId: number | null
  moodleCategoryName: string | null
  parentMoodleCategoryId: number | null
  syncStatus: CategorySyncResponse["syncStatus"]
  syncDirection: CategorySyncResponse["syncDirection"]
  needsMapping: boolean
  syncError: string | null
  lastSyncAt: string | null
}

function mapCategorySync(
  raw: RawCategorySync,
  unitsById: Map<
    number,
    { name: string; typeCode: string; parentId: number | null }
  >
): CategorySyncResponse {
  const unit = unitsById.get(raw.academicUnitId)
  return {
    id: raw.id,
    academicUnitId: raw.academicUnitId,
    unitName: unit?.name ?? `Unit #${raw.academicUnitId}`,
    unitTypeCode: unit?.typeCode ?? "UNKNOWN",
    parentId: unit?.parentId ?? null,
    moodleCategoryId: raw.moodleCategoryId,
    moodleCategoryName: raw.moodleCategoryName,
    parentMoodleCategoryId: raw.parentMoodleCategoryId,
    syncStatus: raw.syncStatus,
    syncDirection: raw.syncDirection,
    needsMapping: raw.needsMapping,
    syncError: raw.syncError,
    lastSyncAt: raw.lastSyncAt,
  }
}

async function buildUnitLookup(): Promise<
  Map<number, { name: string; typeCode: string; parentId: number | null }>
> {
  const res = await academicUnitsApi.list()
  return new Map(
    res.data.map((u) => [
      u.id,
      { name: u.name, typeCode: u.typeCode, parentId: u.parentId },
    ])
  )
}

export const moodleSyncService = {
  // ---------- Categories ----------

  async listCategories(): Promise<CategorySyncResponse[]> {
    const [res, unitsById] = await Promise.all([
      apiClient.get<{ data: RawCategorySync[] }>(`${BASE}/categories`, AUTH),
      buildUnitLookup(),
    ])
    return res.data.map((r) => mapCategorySync(r, unitsById))
  },

  async getCategoriesNeedingMapping(): Promise<CategorySyncResponse[]> {
    const [res, unitsById] = await Promise.all([
      apiClient.get<{ data: RawCategorySync[] }>(
        `${BASE}/categories/needs-mapping`,
        AUTH
      ),
      buildUnitLookup(),
    ])
    return res.data.map((r) => mapCategorySync(r, unitsById))
  },

  async getCategory(id: number): Promise<CategorySyncResponse> {
    const [res, unitsById] = await Promise.all([
      apiClient.get<{ data: RawCategorySync }>(
        `${BASE}/categories/${id}`,
        AUTH
      ),
      buildUnitLookup(),
    ])
    return mapCategorySync(res.data, unitsById)
  },

  pushCategory: (dto: PushCategoryDto) =>
    apiClient.post<RawCategorySync>(`${BASE}/categories/push`, dto, AUTH),

  // Replaces the old faculty-only pushHierarchy — any AcademicUnit can be a
  // subtree root now (a whole Faculty, or just one Program's Level/Semester
  // branch), pushed breadth-first. See api-v2.md
  // §"POST /moodle-sync/categories/push-subtree/{rootUnitId}".
  pushSubtree: (rootUnitId: number) =>
    apiClient.post<RawCategorySync[]>(
      `${BASE}/categories/push-subtree/${rootUnitId}`,
      undefined,
      AUTH
    ),

  pullCategories: () =>
    apiClient.post<{
      matchedByIdnumber: number
      updated: number
      needsMapping: number
    }>(`${BASE}/categories/pull`, undefined, AUTH),

  pullCategory: (moodleCategoryId: number) =>
    apiClient.post<RawCategorySync>(
      `${BASE}/categories/pull/${moodleCategoryId}`,
      undefined,
      AUTH
    ),

  resolveCategoryMapping: (id: number, dto: ResolveCategoryMappingDto) =>
    apiClient.post<RawCategorySync>(
      `${BASE}/categories/${id}/resolve`,
      dto,
      AUTH
    ),

  deleteCategoryMapping: (id: number) =>
    apiClient.delete<{ message: string }>(`${BASE}/categories/${id}`, AUTH),

  // ---------- Users ----------

  async listUsers(
    filters: UserSyncQueryFilters = {}
  ): Promise<UserSyncResponse[]> {
    const res = await apiClient.get<{ data: UserSyncResponse[] }>(
      `${BASE}/users`,
      { ...AUTH, params: filters as Record<string, unknown> }
    )
    return res.data
  },

  async getUserMapping(id: number): Promise<UserSyncResponse> {
    const res = await apiClient.get<{ data: UserSyncResponse }>(
      `${BASE}/users/${id}`,
      AUTH
    )
    return res.data
  },

  async getUserMappingByUserId(userId: number): Promise<UserSyncResponse> {
    const res = await apiClient.get<{ data: UserSyncResponse }>(
      `${BASE}/users/user/${userId}`,
      AUTH
    )
    return res.data
  },

  pushUser: (userId: number) =>
    apiClient.post<UserSyncResponse>(
      `${BASE}/users/push/${userId}`,
      undefined,
      AUTH
    ),

  pushUsersBulk: ({ userIds }: UsersBulkPushPayload) =>
    apiClient.post<{ pushed: number; skipped: number }>(
      `${BASE}/users/push-bulk`,
      { userIds },
      AUTH
    ),

  // Unlike single-record push/pull actions, this bulk summary IS wrapped in
  // a `{ data: ... }` envelope — confirmed via a live capture of
  // `POST /users/pull`'s response, which included the `unmatched` list of
  // Moodle users with no matching portal account.
  async pullUsers(): Promise<PullUsersResult> {
    const res = await apiClient.post<{ data: PullUsersResult }>(
      `${BASE}/users/pull`,
      undefined,
      AUTH
    )
    return res.data
  },

  pullUser: (moodleUserId: number) =>
    apiClient.post<UserSyncResponse>(
      `${BASE}/users/pull/${moodleUserId}`,
      undefined,
      AUTH
    ),

  // ---------- Courses ----------

  async listCourses(): Promise<CourseSyncResponse[]> {
    const res = await apiClient.get<{ data: CourseSyncResponse[] }>(
      `${BASE}/courses`,
      AUTH
    )
    return res.data
  },

  async getCourse(id: number): Promise<CourseSyncResponse> {
    const res = await apiClient.get<{ data: CourseSyncResponse }>(
      `${BASE}/courses/${id}`,
      AUTH
    )
    return res.data
  },

  pushCourse: (courseOfferingId: number) =>
    apiClient.post<CourseSyncResponse>(
      `${BASE}/courses/push/${courseOfferingId}`,
      undefined,
      AUTH
    ),

  // Bruno's body field is `offeringIds`, not `courseOfferingIds` — translated
  // here so the frontend-facing payload type can keep its clearer name.
  pushCoursesBulk: ({ courseOfferingIds }: CoursesBulkPushPayload) =>
    apiClient.post<{ pushed: number }>(
      `${BASE}/courses/push-bulk`,
      { offeringIds: courseOfferingIds },
      AUTH
    ),

  pullCourses: () =>
    apiClient.post<{ pulled: number; created: number }>(
      `${BASE}/courses/pull`,
      undefined,
      AUTH
    ),

  pullCourse: (moodleCourseId: number) =>
    apiClient.post<CourseSyncResponse>(
      `${BASE}/courses/pull/${moodleCourseId}`,
      undefined,
      AUTH
    ),

  // ---------- Enrollments ----------

  async listEnrollments(
    filters: { status?: string } = {}
  ): Promise<EnrollmentSyncResponse[]> {
    const res = await apiClient.get<{ data: EnrollmentSyncResponse[] }>(
      `${BASE}/enrollments`,
      { ...AUTH, params: filters as Record<string, unknown> }
    )
    return res.data
  },

  async listEnrollmentErrors(): Promise<EnrollmentSyncResponse[]> {
    const res = await apiClient.get<{ data: EnrollmentSyncResponse[] }>(
      `${BASE}/enrollments/errors`,
      AUTH
    )
    return res.data
  },

  pushEnrollment: (enrollmentId: number) =>
    apiClient.post<EnrollmentSyncResponse>(
      `${BASE}/enrollments/push/${enrollmentId}`,
      undefined,
      AUTH
    ),

  pushAllEnrollments: () =>
    apiClient.post<{ pushed: number; failed: number }>(
      `${BASE}/enrollments/push-all`,
      undefined,
      AUTH
    ),

  pullEnrollments: (moodleCourseId: number) =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/enrollments/pull/${moodleCourseId}`,
      undefined,
      AUTH
    ),

  // ---------- Assessments ----------
  // Bruno's query/path param is `offeringId` — the frontend keeps `courseId`
  // as the filter name for consistency with the rest of this module's hooks.
  //
  // listAssessments/listAssessmentsByCourse/listUpcomingAssessments/
  // pullAssessments/pullAllAssessments were already real. Everything below
  // the "-- confirmed live --" marker was the set of additions needed to
  // fully replace this module's old duplicate, fully-mock frontend surface
  // (which was wired to a separate real `/assessments/*` route namespace) —
  // per MISSING_BACKEND_APIS.md, now shipped by the backend team.

  listAssessments: (filters: { courseId?: number; type?: string } = {}) =>
    apiClient.get<{ data: AssessmentResponse[] }>(`${BASE}/assessments`, {
      ...AUTH,
      params: { offeringId: filters.courseId, type: filters.type },
    }),

  listAssessmentsByCourse: (courseOfferingId: number) =>
    apiClient.get<{ data: AssessmentResponse[] }>(
      `${BASE}/assessments/course/${courseOfferingId}`,
      AUTH
    ),

  listUpcomingAssessments: () =>
    apiClient.get<{ data: AssessmentResponse[] }>(
      `${BASE}/assessments/upcoming`,
      AUTH
    ),

  pullAssessments: (moodleCourseId: number) =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/assessments/pull/${moodleCourseId}`,
      undefined,
      AUTH
    ),

  pullAllAssessments: () =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/assessments/pull-all`,
      undefined,
      AUTH
    ),

  // -- confirmed live (MISSING_BACKEND_APIS.md), now shipped by the backend team --

  async listAssessmentsPaginated(
    filters: Partial<AssessmentFilter> = {}
  ): Promise<PaginatedAssessments> {
    const res = await apiClient.get<{
      data: AssessmentResponse[]
      meta?: { total: number; page: number; limit: number }
    }>(`${BASE}/assessments`, {
      ...AUTH,
      params: {
        type: filters.type,
        offeringId: filters.courseOfferingId,
        isVisible: filters.isVisible,
        upcoming: filters.upcoming,
        page: filters.page,
        limit: filters.limit,
      },
    })
    // `meta`/pagination per MISSING_BACKEND_APIS.md, now shipped — kept the
    // `res.meta ??` fallback regardless, so callers never crash on
    // `res.meta.total` even if a given response omits it.
    return {
      data: res.data,
      meta: res.meta ?? {
        total: res.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? res.data.length,
      },
    }
  },

  async getAssessment(id: number): Promise<AssessmentResponse> {
    const res = await apiClient.get<{ data: AssessmentResponse }>(
      `${BASE}/assessments/${id}`,
      AUTH
    )
    return res.data
  },

  async getMyAssessments(
    filters: Partial<
      Pick<AssessmentFilter, "type" | "upcoming" | "page" | "limit">
    > = {}
  ): Promise<PaginatedAssessments> {
    // /assessments/my per MISSING_BACKEND_APIS.md, now shipped by the
    // backend team. Kept the same `meta` envelope fallback as
    // listAssessmentsPaginated in case a given response omits it.
    const res = await apiClient.get<{
      data: AssessmentResponse[]
      meta?: { total: number; page: number; limit: number }
    }>(`${BASE}/assessments/my`, { ...AUTH, params: filters })
    return {
      data: res.data,
      meta: res.meta ?? {
        total: res.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? res.data.length,
      },
    }
  },

  async updateAssessmentVisibility(
    id: number,
    payload: UpdateVisibilityPayload
  ): Promise<VisibilityResponse> {
    return apiClient.patch<VisibilityResponse, UpdateVisibilityPayload>(
      `${BASE}/assessments/${id}/visibility`,
      payload,
      AUTH
    )
  },

  async deleteAssessmentMapping(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${BASE}/assessments/${id}`,
      AUTH
    )
  },

  async getAssessmentSyncStatus(): Promise<AssessmentSyncStatusResult> {
    return apiClient.get<AssessmentSyncStatusResult>(
      `${BASE}/assessments/sync-status`,
      AUTH
    )
  },

  // "Retry" is just re-running the real pull for that course — no separate
  // retry endpoint is needed since pulls are upsert-based (idempotent).
  retryAssessmentSync(moodleCourseId: number): Promise<AssessmentSyncResult> {
    return apiClient.post<AssessmentSyncResult>(
      `${BASE}/assessments/pull/${moodleCourseId}`,
      undefined,
      AUTH
    )
  },

  // CA pipeline bridge — aggregates a student's Moodle assignment/quiz grades
  // for one course offering into a proportional CA score (this app's
  // convention: CA out of 40, Exam out of 60 — see grade-detail-modal.tsx —
  // `caMax` lets a lecturer override the ceiling per course). Read-only: the
  // frontend applies the previewed scores via the already-real
  // POST /results/grades/bulk (gradesService.bulkCreateGrades), not a new
  // write endpoint here — one path writes Grade.caScore.
  async getCaPreview(
    offeringId: number,
    params: { semesterId: number; caMax?: number }
  ): Promise<CaPreviewResponse> {
    const res = await apiClient.get<{ data: CaPreviewResponse }>(
      `${BASE}/assessments/ca-preview/${offeringId}`,
      { ...AUTH, params }
    )
    return res.data
  },

  // ---------- Grades (read-only) ----------

  listGrades: (filters: { courseId?: number; userId?: number } = {}) =>
    apiClient.get<{ data: GradeResponse[] }>(`${BASE}/grades`, {
      ...AUTH,
      params: { offeringId: filters.courseId, userId: filters.userId },
    }),

  listGradesByStudent: (userId: number) =>
    apiClient.get<{ data: GradeResponse[] }>(
      `${BASE}/grades/student/${userId}`,
      AUTH
    ),

  listGradesByCourse: (courseOfferingId: number) =>
    apiClient.get<{ data: GradeResponse[] }>(
      `${BASE}/grades/course/${courseOfferingId}`,
      AUTH
    ),

  getMyGrades: () =>
    apiClient.get<{ data: GradeResponse[] }>(`${BASE}/grades/my`, AUTH),

  pullGrades: (moodleCourseId: number) =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/grades/pull/${moodleCourseId}`,
      undefined,
      AUTH
    ),

  pullAllGrades: () =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/grades/pull-all`,
      undefined,
      AUTH
    ),

  // ---------- Calendar & Zoom (read-only) ----------

  listCalendarEvents: () =>
    apiClient.get<{ data: CalendarEventResponse[] }>(`${BASE}/calendar`, AUTH),

  listCalendarEventsByCourse: (courseOfferingId: number) =>
    apiClient.get<{ data: CalendarEventResponse[] }>(
      `${BASE}/calendar/course/${courseOfferingId}`,
      AUTH
    ),

  listUpcomingEvents: () =>
    apiClient.get<{ data: CalendarEventResponse[] }>(
      `${BASE}/calendar/upcoming`,
      AUTH
    ),

  async getCalendarEvent(id: number): Promise<CalendarEventResponse> {
    const res = await apiClient.get<{ data: CalendarEventResponse }>(
      `${BASE}/calendar/${id}`,
      AUTH
    )
    return res.data
  },

  pullCalendar: () =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/calendar/pull`,
      undefined,
      AUTH
    ),

  pullCalendarForCourse: (moodleCourseId: number) =>
    apiClient.post<{ pulled: number }>(
      `${BASE}/calendar/pull/${moodleCourseId}`,
      undefined,
      AUTH
    ),
}
