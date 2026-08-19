import type {
  CategorySyncResponse,
  CoursesBulkPushPayload,
  CourseSyncResponse,
  EnrollmentSyncResponse,
  PushCategoryDto,
  UserSyncQueryFilters,
  UserSyncResponse,
  UsersBulkPushPayload,
  AssessmentResponse,
  GradeResponse,
  CalendarEventResponse,
} from "../types"

// ── Helpers ──────────────────────────────────────────────────────────────────
// Status: this entire service runs on an in-memory dummy store — there are no
// Bruno docs for moodle-sync yet. Every method carries a `// TODO: replace with →`
// comment naming the real endpoint from moodle_sync_README.md; flip those over
// once the backend ships, the hooks/components calling this service don't change.

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms))
let _idCounter = 1000
const uid = () => ++_idCounter
const now = () => new Date().toISOString()
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
const daysAhead = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString()

// ── Categories ────────────────────────────────────────────────────────────────
// The portal's academic hierarchy — some nodes already pushed to Moodle
// (moodleCategoryId set), some not yet (moodleCategoryId null, status PENDING).

let mockCategories: CategorySyncResponse[] = [
  {
    id: 1,
    entityType: "faculty",
    entityId: 1,
    entityName: "Faculty of Social Sciences",
    parentId: null,
    moodleCategoryId: 500,
    moodleCategoryName: "SOCIAL SCIENCES",
    parentMoodleCategoryId: null,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(30),
  },
  {
    id: 2,
    entityType: "program",
    entityId: 10,
    entityName: "Economics",
    parentId: 1,
    moodleCategoryId: 501,
    moodleCategoryName: "ECONOMICS",
    parentMoodleCategoryId: 500,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(30),
  },
  {
    id: 3,
    entityType: "level",
    entityId: 100,
    entityName: "Level 100",
    parentId: 10,
    moodleCategoryId: 502,
    moodleCategoryName: "LEVEL 100",
    parentMoodleCategoryId: 501,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(30),
  },
  {
    id: 4,
    entityType: "semester",
    entityId: 1000,
    entityName: "1st Semester",
    parentId: 100,
    moodleCategoryId: 503,
    moodleCategoryName: "1ST SEMESTER",
    parentMoodleCategoryId: 502,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(30),
  },
  {
    id: 5,
    entityType: "faculty",
    entityId: 2,
    entityName: "Faculty of Science",
    parentId: null,
    moodleCategoryId: 510,
    moodleCategoryName: "SCIENCE",
    parentMoodleCategoryId: null,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(6),
  },
  {
    id: 6,
    entityType: "program",
    entityId: 20,
    entityName: "Computer Science",
    parentId: 2,
    moodleCategoryId: 511,
    moodleCategoryName: "COMPUTER SCIENCE",
    parentMoodleCategoryId: 510,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(6),
  },
  {
    id: 7,
    entityType: "level",
    entityId: 200,
    entityName: "Level 300",
    parentId: 20,
    moodleCategoryId: 512,
    moodleCategoryName: "LEVEL 300",
    parentMoodleCategoryId: 511,
    syncStatus: "STALE",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(50),
  },
  {
    id: 8,
    entityType: "semester",
    entityId: 2000,
    entityName: "First Semester",
    parentId: 200,
    moodleCategoryId: null,
    moodleCategoryName: null,
    parentMoodleCategoryId: null,
    syncStatus: "PENDING",
    syncDirection: "PUSH",
    lastSyncAt: null,
  },
]

// ── Users ─────────────────────────────────────────────────────────────────────

const mockUsers: UserSyncResponse[] = [
  {
    id: 1,
    userId: 501,
    name: "Chidera Okafor",
    email: "chidera.okafor@students.qhub.edu",
    portalRole: "STUDENT",
    moodleUserId: 9001,
    moodleUsername: "chidera.okafor",
    moodleRole: "student",
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(12),
  },
  {
    id: 2,
    userId: 502,
    name: "Amaka Bello",
    email: "amaka.bello@students.qhub.edu",
    portalRole: "STUDENT",
    moodleUserId: null,
    moodleUsername: null,
    moodleRole: "student",
    syncStatus: "PENDING",
    syncDirection: "PUSH",
    lastSyncAt: null,
  },
  {
    id: 3,
    userId: 503,
    name: "Tunde Afolabi",
    email: "tunde.afolabi@students.qhub.edu",
    portalRole: "STUDENT",
    moodleUserId: 9002,
    moodleUsername: "tunde.afolabi",
    moodleRole: "student",
    syncStatus: "FAILED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(3),
  },
  {
    id: 4,
    userId: 601,
    name: "Dr. Ifeoma Nwosu",
    email: "ifeoma.nwosu@qhub.edu",
    portalRole: "TUTOR",
    moodleUserId: 8001,
    moodleUsername: "ifeoma.nwosu",
    moodleRole: "editingteacher",
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(80),
  },
  {
    id: 5,
    userId: 602,
    name: "Dr. Segun Adeyemi",
    email: "segun.adeyemi@qhub.edu",
    portalRole: "TUTOR",
    moodleUserId: null,
    moodleUsername: null,
    moodleRole: "editingteacher",
    syncStatus: "PENDING",
    syncDirection: "PUSH",
    lastSyncAt: null,
  },
  {
    id: 6,
    userId: 701,
    name: "Grace Eze",
    email: "grace.eze@qhub.edu",
    portalRole: "STAFF",
    moodleUserId: 7001,
    moodleUsername: "grace.eze",
    moodleRole: "manager",
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(100),
  },
]

// ── Courses ───────────────────────────────────────────────────────────────────

let mockCourses: CourseSyncResponse[] = [
  {
    id: 1,
    courseOfferingId: 55,
    courseCode: "CSC301",
    courseTitle: "Data Structures & Algorithms",
    moodleCourseId: 201,
    moodleCategoryId: 512,
    moodleShortName: "CSC301-2024",
    moodleFullName: "Data Structures & Algorithms",
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(2),
  },
  {
    id: 2,
    courseOfferingId: 56,
    courseCode: "CSC303",
    courseTitle: "Operating Systems",
    moodleCourseId: 202,
    moodleCategoryId: 512,
    moodleShortName: "CSC303-2024",
    moodleFullName: "Operating Systems",
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(3),
  },
  {
    id: 3,
    courseOfferingId: 57,
    courseCode: "MTH201",
    courseTitle: "Mathematical Methods I",
    moodleCourseId: 203,
    moodleCategoryId: 503,
    moodleShortName: "MTH201-2024",
    moodleFullName: "Mathematical Methods I",
    syncStatus: "STALE",
    syncDirection: "PUSH",
    lastSyncAt: hoursAgo(40),
  },
  {
    id: 4,
    courseOfferingId: 58,
    courseCode: "ECO205",
    courseTitle: "Microeconomics II",
    moodleCourseId: null,
    moodleCategoryId: null,
    moodleShortName: null,
    moodleFullName: null,
    syncStatus: "PENDING",
    syncDirection: "PUSH",
    lastSyncAt: null,
  },
]

// ── Enrollments ───────────────────────────────────────────────────────────────

let mockEnrollments: EnrollmentSyncResponse[] = [
  {
    id: 1,
    studentEnrollmentId: 9001,
    studentName: "Chidera Okafor",
    courseCode: "CSC301",
    moodleCourseId: 201,
    moodleUserId: 9001,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    syncError: null,
    lastSyncAt: hoursAgo(12),
  },
  {
    id: 2,
    studentEnrollmentId: 9002,
    studentName: "Chidera Okafor",
    courseCode: "CSC303",
    moodleCourseId: 202,
    moodleUserId: 9001,
    syncStatus: "SYNCED",
    syncDirection: "PUSH",
    syncError: null,
    lastSyncAt: hoursAgo(12),
  },
  {
    id: 3,
    studentEnrollmentId: 9003,
    studentName: "Tunde Afolabi",
    courseCode: "CSC301",
    moodleCourseId: 201,
    moodleUserId: 9002,
    syncStatus: "FAILED",
    syncDirection: "PUSH",
    syncError:
      "Moodle user 9002 not found — user sync must complete before enrollment sync.",
    lastSyncAt: hoursAgo(3),
  },
  {
    id: 4,
    studentEnrollmentId: 9004,
    studentName: "Amaka Bello",
    courseCode: "MTH201",
    moodleCourseId: null,
    moodleUserId: null,
    syncStatus: "PENDING",
    syncDirection: "PUSH",
    syncError: null,
    lastSyncAt: null,
  },
]

// ── Assessments (read-only) ────────────────────────────────────────────────────

const mockAssessments: AssessmentResponse[] = [
  {
    id: 1,
    assessmentType: "assignment",
    name: "Programming Assignment 1: Linked Lists",
    description:
      "Implement a singly-linked list with insert, delete, and search operations in C++.",
    dueDate: daysAhead(3),
    maxGrade: 100,
    course: {
      moodleShortName: "CSC301-2024",
      moodleFullName: "Data Structures & Algorithms",
      courseOffering: {
        course: { code: "CSC301", title: "Data Structures & Algorithms" },
      },
    },
  },
  {
    id: 2,
    assessmentType: "quiz",
    name: "Week 5 Quiz: Trees & Graphs",
    description:
      "Multiple choice quiz covering binary trees, BST operations, and graph representations.",
    dueDate: daysAhead(1),
    maxGrade: 20,
    course: {
      moodleShortName: "CSC301-2024",
      moodleFullName: "Data Structures & Algorithms",
      courseOffering: {
        course: { code: "CSC301", title: "Data Structures & Algorithms" },
      },
    },
  },
  {
    id: 3,
    assessmentType: "forum",
    name: "Discussion: Virtualisation vs Containerisation",
    description:
      "Participate in a structured debate comparing virtual machines to containers.",
    dueDate: null,
    maxGrade: null,
    course: {
      moodleShortName: "CSC303-2024",
      moodleFullName: "Operating Systems",
      courseOffering: {
        course: { code: "CSC303", title: "Operating Systems" },
      },
    },
  },
  {
    id: 4,
    assessmentType: "assignment",
    name: "Integration Techniques Assignment",
    description:
      "Solve 15 integration problems covering substitution, by-parts, and partial fractions.",
    dueDate: daysAhead(14),
    maxGrade: 100,
    course: {
      moodleShortName: "MTH201-2024",
      moodleFullName: "Mathematical Methods I",
      courseOffering: {
        course: { code: "MTH201", title: "Mathematical Methods I" },
      },
    },
  },
]

// ── Grades (read-only) ─────────────────────────────────────────────────────────

const mockGrades: GradeResponse[] = [
  {
    id: 1,
    itemName: "Programming Assignment 1: Linked Lists",
    grade: 88,
    maxGrade: 100,
    feedback: "Solid implementation — watch edge cases on empty-list deletion.",
    gradedAt: hoursAgo(20),
    course: {
      moodleShortName: "CSC301-2024",
      moodleFullName: "Data Structures & Algorithms",
      courseOffering: {
        course: { code: "CSC301", title: "Data Structures & Algorithms" },
      },
    },
  },
  {
    id: 2,
    itemName: "Week 3 Quiz: Stacks & Queues",
    grade: 18,
    maxGrade: 20,
    feedback: null,
    gradedAt: hoursAgo(90),
    course: {
      moodleShortName: "CSC301-2024",
      moodleFullName: "Data Structures & Algorithms",
      courseOffering: {
        course: { code: "CSC301", title: "Data Structures & Algorithms" },
      },
    },
  },
  {
    id: 3,
    itemName: "OS Lab Report: Process Scheduling",
    grade: null,
    maxGrade: 50,
    feedback: null,
    gradedAt: null,
    course: {
      moodleShortName: "CSC303-2024",
      moodleFullName: "Operating Systems",
      courseOffering: {
        course: { code: "CSC303", title: "Operating Systems" },
      },
    },
  },
]

// ── Calendar & Zoom (read-only) ────────────────────────────────────────────────

const mockCalendarEvents: CalendarEventResponse[] = [
  {
    id: 1,
    eventType: "zoom",
    name: "CSC301 Live Session: Balanced Trees",
    description: "Weekly live walkthrough with Q&A.",
    startDate: daysAhead(2),
    endDate: null,
    meetingUrl: "https://zoom.us/j/1234567890",
    course: {
      moodleShortName: "CSC301-2024",
      courseOffering: {
        course: { code: "CSC301", title: "Data Structures & Algorithms" },
      },
    },
  },
  {
    id: 2,
    eventType: "course",
    name: "CSC303 Assignment Window Opens",
    description: "Submission window for the OS lab report opens.",
    startDate: daysAhead(1),
    endDate: null,
    meetingUrl: null,
    course: {
      moodleShortName: "CSC303-2024",
      courseOffering: {
        course: { code: "CSC303", title: "Operating Systems" },
      },
    },
  },
  {
    id: 3,
    eventType: "site",
    name: "Semester Registration Deadline",
    description:
      "Last day to register or drop courses for the current semester.",
    startDate: daysAhead(5),
    endDate: null,
    meetingUrl: null,
    course: null,
  },
]

// ── moodleSyncService ─────────────────────────────────────────────────────────

export const moodleSyncService = {
  // ---------- Categories ----------
  // TODO: replace with → apiClient.get<CategorySyncResponse[]>('/moodle-sync/categories')
  async listCategories(): Promise<CategorySyncResponse[]> {
    await delay()
    return [...mockCategories]
  },

  // TODO: replace with → apiClient.get<CategorySyncResponse>(`/moodle-sync/categories/${id}`)
  async getCategory(id: number): Promise<CategorySyncResponse> {
    await delay(200)
    const item = mockCategories.find((c) => c.id === id)
    if (!item) throw new Error("Category mapping not found")
    return { ...item }
  },

  // TODO: replace with → apiClient.post<CategorySyncResponse>('/moodle-sync/categories/push', dto)
  async pushCategory(dto: PushCategoryDto): Promise<CategorySyncResponse> {
    await delay(700)
    const existing = mockCategories.find(
      (c) => c.entityType === dto.entityType && c.entityId === dto.entityId
    )
    const moodleCategoryId =
      existing?.moodleCategoryId ?? 500 + mockCategories.length + 1
    const updated: CategorySyncResponse = {
      id: existing?.id ?? uid(),
      entityType: dto.entityType,
      entityId: dto.entityId,
      entityName: existing?.entityName ?? `${dto.entityType} #${dto.entityId}`,
      parentId: existing?.parentId ?? null,
      moodleCategoryId,
      moodleCategoryName: (
        existing?.entityName ?? `${dto.entityType} #${dto.entityId}`
      ).toUpperCase(),
      parentMoodleCategoryId:
        dto.parentMoodleCategoryId ?? existing?.parentMoodleCategoryId ?? null,
      syncStatus: "SYNCED",
      syncDirection: "PUSH",
      lastSyncAt: now(),
    }
    const idx = mockCategories.findIndex((c) => c.id === updated.id)
    if (idx === -1) mockCategories.push(updated)
    else mockCategories[idx] = updated
    return { ...updated }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/categories/push-hierarchy/${facultyId}`)
  async pushHierarchy(facultyId: number): Promise<{ pushed: number }> {
    await delay(1500)
    let pushed = 0
    mockCategories = mockCategories.map((c) => {
      if (c.entityType === "faculty" && c.entityId !== facultyId) return c
      pushed += 1
      return {
        ...c,
        syncStatus: "SYNCED",
        lastSyncAt: now(),
        moodleCategoryId: c.moodleCategoryId ?? 500 + pushed,
      }
    })
    return { pushed }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/categories/pull')
  async pullCategories(): Promise<{ pulled: number; created: number }> {
    await delay(1200)
    mockCategories = mockCategories.map((c) =>
      c.syncStatus === "STALE"
        ? { ...c, syncStatus: "SYNCED", lastSyncAt: now() }
        : c
    )
    return { pulled: mockCategories.length, created: 0 }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/categories/pull/${moodleCategoryId}`)
  async pullCategory(moodleCategoryId: number): Promise<CategorySyncResponse> {
    await delay(600)
    const idx = mockCategories.findIndex(
      (c) => c.moodleCategoryId === moodleCategoryId
    )
    if (idx === -1) throw new Error("Moodle category not found")
    mockCategories[idx] = {
      ...mockCategories[idx],
      syncStatus: "SYNCED",
      lastSyncAt: now(),
    }
    return { ...mockCategories[idx] }
  },

  // TODO: replace with → apiClient.delete(`/moodle-sync/categories/${id}`)
  async deleteCategoryMapping(id: number): Promise<{ message: string }> {
    await delay(300)
    const idx = mockCategories.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Category mapping not found")
    mockCategories[idx] = {
      ...mockCategories[idx],
      syncStatus: "PENDING",
      moodleCategoryId: null,
      moodleCategoryName: null,
      lastSyncAt: null,
    }
    return {
      message:
        "Mapping removed locally. The Moodle category itself is untouched.",
    }
  },

  // ---------- Users ----------
  // TODO: replace with → apiClient.get<UserSyncResponse[]>('/moodle-sync/users', { params: filters })
  async listUsers(
    filters: UserSyncQueryFilters = {}
  ): Promise<UserSyncResponse[]> {
    await delay()
    return mockUsers.filter((u) => {
      if (filters.role && u.moodleRole !== filters.role) return false
      if (filters.status && u.syncStatus !== filters.status) return false
      return true
    })
  },

  // TODO: replace with → apiClient.get<UserSyncResponse>(`/moodle-sync/users/${id}`)
  async getUserMapping(id: number): Promise<UserSyncResponse> {
    await delay(200)
    const item = mockUsers.find((u) => u.id === id)
    if (!item) throw new Error("User mapping not found")
    return { ...item }
  },

  // TODO: replace with → apiClient.post<UserSyncResponse>(`/moodle-sync/users/push/${userId}`)
  async pushUser(userId: number): Promise<UserSyncResponse> {
    await delay(700)
    const idx = mockUsers.findIndex((u) => u.userId === userId)
    if (idx === -1) throw new Error("Portal user not found")
    if (mockUsers[idx].portalRole === "STUDENT") {
      throw new Error(
        "Students are synced automatically on tuition payment verification — they can't be pushed manually."
      )
    }
    mockUsers[idx] = {
      ...mockUsers[idx],
      moodleUserId: mockUsers[idx].moodleUserId ?? 8000 + idx,
      moodleUsername:
        mockUsers[idx].moodleUsername ??
        mockUsers[idx].name.toLowerCase().replace(/\s+/g, "."),
      syncStatus: "SYNCED",
      lastSyncAt: now(),
    }
    return { ...mockUsers[idx] }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/users/push-bulk', { userIds })
  async pushUsersBulk({
    userIds,
  }: UsersBulkPushPayload): Promise<{ pushed: number; skipped: number }> {
    await delay(1500)
    let pushed = 0
    let skipped = 0
    for (const userId of userIds) {
      const idx = mockUsers.findIndex((u) => u.userId === userId)
      if (idx === -1 || mockUsers[idx].portalRole === "STUDENT") {
        skipped += 1
        continue
      }
      mockUsers[idx] = {
        ...mockUsers[idx],
        moodleUserId: mockUsers[idx].moodleUserId ?? 8000 + idx,
        moodleUsername:
          mockUsers[idx].moodleUsername ??
          mockUsers[idx].name.toLowerCase().replace(/\s+/g, "."),
        syncStatus: "SYNCED",
        lastSyncAt: now(),
      }
      pushed += 1
    }
    return { pushed, skipped }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/users/pull')
  async pullUsers(): Promise<{ matched: number; created: number }> {
    await delay(1200)
    return {
      matched: mockUsers.filter((u) => u.syncStatus === "SYNCED").length,
      created: 0,
    }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/users/pull/${moodleUserId}`)
  async pullUser(moodleUserId: number): Promise<UserSyncResponse> {
    await delay(600)
    const idx = mockUsers.findIndex((u) => u.moodleUserId === moodleUserId)
    if (idx === -1) throw new Error("Moodle user not found")
    mockUsers[idx] = {
      ...mockUsers[idx],
      syncStatus: "SYNCED",
      lastSyncAt: now(),
    }
    return { ...mockUsers[idx] }
  },

  // ---------- Courses ----------
  // TODO: replace with → apiClient.get<CourseSyncResponse[]>('/moodle-sync/courses')
  async listCourses(): Promise<CourseSyncResponse[]> {
    await delay()
    return [...mockCourses]
  },

  // TODO: replace with → apiClient.get<CourseSyncResponse>(`/moodle-sync/courses/${id}`)
  async getCourse(id: number): Promise<CourseSyncResponse> {
    await delay(200)
    const item = mockCourses.find((c) => c.id === id)
    if (!item) throw new Error("Course mapping not found")
    return { ...item }
  },

  // TODO: replace with → apiClient.post<CourseSyncResponse>(`/moodle-sync/courses/push/${courseOfferingId}`)
  async pushCourse(courseOfferingId: number): Promise<CourseSyncResponse> {
    await delay(700)
    const idx = mockCourses.findIndex(
      (c) => c.courseOfferingId === courseOfferingId
    )
    if (idx === -1) throw new Error("Course offering not found")
    mockCourses[idx] = {
      ...mockCourses[idx],
      moodleCourseId: mockCourses[idx].moodleCourseId ?? 200 + idx,
      moodleShortName:
        mockCourses[idx].moodleShortName ??
        `${mockCourses[idx].courseCode}-2024`,
      moodleFullName:
        mockCourses[idx].moodleFullName ?? mockCourses[idx].courseTitle,
      syncStatus: "SYNCED",
      lastSyncAt: now(),
    }
    return { ...mockCourses[idx] }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/courses/push-bulk', { courseOfferingIds })
  async pushCoursesBulk({
    courseOfferingIds,
  }: CoursesBulkPushPayload): Promise<{ pushed: number }> {
    await delay(1500)
    let pushed = 0
    for (const courseOfferingId of courseOfferingIds) {
      const idx = mockCourses.findIndex(
        (c) => c.courseOfferingId === courseOfferingId
      )
      if (idx === -1) continue
      mockCourses[idx] = {
        ...mockCourses[idx],
        moodleCourseId: mockCourses[idx].moodleCourseId ?? 200 + idx,
        moodleShortName:
          mockCourses[idx].moodleShortName ??
          `${mockCourses[idx].courseCode}-2024`,
        moodleFullName:
          mockCourses[idx].moodleFullName ?? mockCourses[idx].courseTitle,
        syncStatus: "SYNCED",
        lastSyncAt: now(),
      }
      pushed += 1
    }
    return { pushed }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/courses/pull')
  async pullCourses(): Promise<{ pulled: number; created: number }> {
    await delay(1200)
    mockCourses = mockCourses.map((c) =>
      c.syncStatus === "STALE"
        ? { ...c, syncStatus: "SYNCED", lastSyncAt: now() }
        : c
    )
    return { pulled: mockCourses.length, created: 0 }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/courses/pull/${moodleCourseId}`)
  async pullCourse(moodleCourseId: number): Promise<CourseSyncResponse> {
    await delay(600)
    const idx = mockCourses.findIndex(
      (c) => c.moodleCourseId === moodleCourseId
    )
    if (idx === -1) throw new Error("Moodle course not found")
    mockCourses[idx] = {
      ...mockCourses[idx],
      syncStatus: "SYNCED",
      lastSyncAt: now(),
    }
    return { ...mockCourses[idx] }
  },

  // ---------- Enrollments ----------
  // TODO: replace with → apiClient.get<EnrollmentSyncResponse[]>('/moodle-sync/enrollments', { params: filters })
  async listEnrollments(
    filters: { status?: string } = {}
  ): Promise<EnrollmentSyncResponse[]> {
    await delay()
    return mockEnrollments.filter(
      (e) => !filters.status || e.syncStatus === filters.status
    )
  },

  // TODO: replace with → apiClient.get<EnrollmentSyncResponse[]>('/moodle-sync/enrollments/errors')
  async listEnrollmentErrors(): Promise<EnrollmentSyncResponse[]> {
    await delay()
    return mockEnrollments.filter((e) => e.syncStatus === "FAILED")
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/enrollments/push/${enrollmentId}`)
  async pushEnrollment(enrollmentId: number): Promise<EnrollmentSyncResponse> {
    await delay(700)
    const idx = mockEnrollments.findIndex(
      (e) => e.studentEnrollmentId === enrollmentId
    )
    if (idx === -1) throw new Error("Enrollment not found")
    mockEnrollments[idx] = {
      ...mockEnrollments[idx],
      moodleCourseId: mockEnrollments[idx].moodleCourseId ?? 200,
      moodleUserId: mockEnrollments[idx].moodleUserId ?? 9000,
      syncStatus: "SYNCED",
      syncError: null,
      lastSyncAt: now(),
    }
    return { ...mockEnrollments[idx] }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/enrollments/push-all')
  async pushAllEnrollments(): Promise<{ pushed: number; failed: number }> {
    await delay(1800)
    let pushed = 0
    mockEnrollments = mockEnrollments.map((e) => {
      if (e.syncStatus === "SYNCED") return e
      pushed += 1
      return {
        ...e,
        syncStatus: "SYNCED",
        syncError: null,
        lastSyncAt: now(),
        moodleCourseId: e.moodleCourseId ?? 200,
        moodleUserId: e.moodleUserId ?? 9000,
      }
    })
    return { pushed, failed: 0 }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/enrollments/pull/${moodleCourseId}`)
  async pullEnrollments(moodleCourseId: number): Promise<{ pulled: number }> {
    await delay(1000)
    const affected = mockEnrollments.filter(
      (e) => e.moodleCourseId === moodleCourseId
    )
    return { pulled: affected.length }
  },

  // ---------- Assessments (read-only) ----------
  // TODO: replace with → apiClient.get<{ data: AssessmentResponse[] }>('/moodle-sync/assessments', { params: filters })
  async listAssessments(
    filters: { courseId?: number; type?: string } = {}
  ): Promise<{ data: AssessmentResponse[] }> {
    await delay()
    const data = mockAssessments.filter(
      (a) => !filters.type || a.assessmentType === filters.type
    )
    return { data }
  },

  // TODO: replace with → apiClient.get<{ data: AssessmentResponse[] }>(`/moodle-sync/assessments/course/${courseOfferingId}`)
  async listAssessmentsByCourse(
    courseOfferingId: number
  ): Promise<{ data: AssessmentResponse[] }> {
    await delay()
    const course = mockCourses.find(
      (c) => c.courseOfferingId === courseOfferingId
    )
    const data = course
      ? mockAssessments.filter(
          (a) => a.course.courseOffering.course.code === course.courseCode
        )
      : []
    return { data }
  },

  // TODO: replace with → apiClient.get<{ data: AssessmentResponse[] }>('/moodle-sync/assessments/upcoming')
  async listUpcomingAssessments(): Promise<{ data: AssessmentResponse[] }> {
    await delay()
    const nowMs = Date.now()
    const data = mockAssessments
      .filter((a) => a.dueDate && new Date(a.dueDate).getTime() > nowMs)
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      )
    return { data }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/assessments/pull/${moodleCourseId}`)
  async pullAssessments(moodleCourseId: number): Promise<{ pulled: number }> {
    await delay(1000)
    const course = mockCourses.find((c) => c.moodleCourseId === moodleCourseId)
    const pulled = course
      ? mockAssessments.filter(
          (a) => a.course.moodleShortName === course.moodleShortName
        ).length
      : 0
    return { pulled }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/assessments/pull-all')
  async pullAllAssessments(): Promise<{ pulled: number }> {
    await delay(1800)
    return { pulled: mockAssessments.length }
  },

  // ---------- Grades (read-only) ----------
  // TODO: replace with → apiClient.get<{ data: GradeResponse[] }>('/moodle-sync/grades', { params: filters })
  async listGrades(
    filters: { courseId?: number; userId?: number } = {}
  ): Promise<{ data: GradeResponse[] }> {
    await delay()
    void filters
    return { data: [...mockGrades] }
  },

  // TODO: replace with → apiClient.get<{ data: GradeResponse[] }>(`/moodle-sync/grades/student/${userId}`)
  async listGradesByStudent(
    userId: number
  ): Promise<{ data: GradeResponse[] }> {
    await delay()
    void userId
    return { data: [...mockGrades] }
  },

  // TODO: replace with → apiClient.get<{ data: GradeResponse[] }>(`/moodle-sync/grades/course/${courseOfferingId}`)
  async listGradesByCourse(
    courseOfferingId: number
  ): Promise<{ data: GradeResponse[] }> {
    await delay()
    const course = mockCourses.find(
      (c) => c.courseOfferingId === courseOfferingId
    )
    const data = course
      ? mockGrades.filter(
          (g) => g.course.courseOffering.course.code === course.courseCode
        )
      : []
    return { data }
  },

  // TODO: replace with → apiClient.get<{ data: GradeResponse[] }>('/moodle-sync/grades/my')
  async getMyGrades(): Promise<{ data: GradeResponse[] }> {
    await delay()
    return { data: [...mockGrades] }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/grades/pull/${moodleCourseId}`)
  async pullGrades(moodleCourseId: number): Promise<{ pulled: number }> {
    await delay(1000)
    void moodleCourseId
    return { pulled: mockGrades.length }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/grades/pull-all')
  async pullAllGrades(): Promise<{ pulled: number }> {
    await delay(1800)
    return { pulled: mockGrades.length }
  },

  // ---------- Calendar & Zoom (read-only) ----------
  // TODO: replace with → apiClient.get<{ data: CalendarEventResponse[] }>('/moodle-sync/calendar')
  async listCalendarEvents(): Promise<{ data: CalendarEventResponse[] }> {
    await delay()
    return { data: [...mockCalendarEvents] }
  },

  // TODO: replace with → apiClient.get<{ data: CalendarEventResponse[] }>(`/moodle-sync/calendar/course/${courseOfferingId}`)
  async listCalendarEventsByCourse(
    courseOfferingId: number
  ): Promise<{ data: CalendarEventResponse[] }> {
    await delay()
    const course = mockCourses.find(
      (c) => c.courseOfferingId === courseOfferingId
    )
    const data = course
      ? mockCalendarEvents.filter(
          (e) => e.course?.moodleShortName === course.moodleShortName
        )
      : []
    return { data }
  },

  // TODO: replace with → apiClient.get<{ data: CalendarEventResponse[] }>('/moodle-sync/calendar/upcoming')
  async listUpcomingEvents(): Promise<{ data: CalendarEventResponse[] }> {
    await delay()
    const nowMs = Date.now()
    const data = mockCalendarEvents
      .filter((e) => new Date(e.startDate).getTime() > nowMs)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    return { data }
  },

  // TODO: replace with → apiClient.get<CalendarEventResponse>(`/moodle-sync/calendar/${id}`)
  async getCalendarEvent(id: number): Promise<CalendarEventResponse> {
    await delay(200)
    const item = mockCalendarEvents.find((e) => e.id === id)
    if (!item) throw new Error("Calendar event not found")
    return { ...item }
  },

  // TODO: replace with → apiClient.post('/moodle-sync/calendar/pull')
  async pullCalendar(): Promise<{ pulled: number }> {
    await delay(1500)
    return { pulled: mockCalendarEvents.length }
  },

  // TODO: replace with → apiClient.post(`/moodle-sync/calendar/pull/${moodleCourseId}`)
  async pullCalendarForCourse(
    moodleCourseId: number
  ): Promise<{ pulled: number }> {
    await delay(900)
    const course = mockCourses.find((c) => c.moodleCourseId === moodleCourseId)
    const pulled = course
      ? mockCalendarEvents.filter(
          (e) => e.course?.moodleShortName === course.moodleShortName
        ).length
      : 0
    return { pulled }
  },
}
