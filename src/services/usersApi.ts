import apiClient, {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import type {
  User,
  Student,
  Tutor,
  Staff,
  UserStats,
  UserQueryFilters,
  StudentQueryFilters,
  CreateTutorPayload,
  CreateStaffPayload,
  UpdateStudentPayload,
  UpdateTutorPayload,
  UpdateStaffPayload,
  CourseOffering,
  TutorCourseAssignment,
  AssignCoursePayload,
  UnassignCoursePayload,
  EligibleRole,
} from "@/types/users"
import type {
  ApiListResponse,
  ApiSingleResponse,
  ApiPaginatedResponse,
} from "@/types/school"

// Real backend contract per bruno/user/*.bru and sandbox/user/user_README.md (source of
// truth — see CONVENTIONS.md §13). The backend uses camelCase field names throughout
// (firstName, isActive, departmentId, ...) while this module's existing frontend types
// stay snake_case to avoid touching every consuming component — each function below maps
// the real response onto those types. Two things are NOT confirmed by an example response
// body anywhere in bruno/the README (only request bodies and prose are documented for
// Students/Lecturers/Staff) and are inferred from schema.prisma's relation names instead:
//   1. Whether GET responses nest relations (department/program/currentLevel/faculty) or
//      just return raw FK ids — every mapper below reads relation fields defensively with
//      `??` fallbacks so a missing nested object shows "—" rather than throwing.
//   2. Whether `GET /users` list items include a `roles` array — the README's own example
//      response for this endpoint does NOT show one, so it's defaulted to `[]` here.
// Both are worth a live check against the real API; see MISSING_BACKEND_APIS.md.
const AUTH = { access_token: true } as const

// ── wire shapes (camelCase, as documented) ──

interface WireUserRef {
  id: number
  email: string
  username: string
  firstName: string | null
  middleName: string | null
  lastName: string | null
  phoneNumber: string | null
  avatar: string | null
  isActive: boolean
}

interface WireUser extends WireUserRef {
  isVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt?: string
  roles?: { id: number; name: string; slug: string }[]
}

interface WireRelationRef {
  id: number
  name: string
}

interface WireStudent {
  id: number
  userId: number
  matricNumber: string
  programId: number
  currentLevelId: number
  entryMode: Student["entry_mode"]
  modeOfStudy: Student["mode_of_study"]
  admissionDate: string
  graduationDate: string | null
  status: Student["status"]
  currentCGPA: number | string | null
  dateOfBirth: string
  gender: Student["gender"]
  nationality: string
  stateOfOrigin: string
  lgaOfOrigin: string
  permanentAddress: string
  contactAddress: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string | null
  passportPhoto: string | null
  createdAt: string
  updatedAt: string
  user: WireUserRef
  program?: WireRelationRef & {
    department?: WireRelationRef & { faculty?: WireRelationRef }
  }
  currentLevel?: WireRelationRef & { numericValue: number }
}

interface WireStaffProfile {
  id: number
  userId: number
  staffNumber: string
  departmentId: number | null
  designation: string
  officeLocation: string | null
  officePhone: string | null
  createdAt: string
  updatedAt: string
  user: WireUserRef
  department?: WireRelationRef & { faculty?: WireRelationRef }
}

interface WireLecturer extends WireStaffProfile {
  specialization: string | null
  qualifications: string | null
  researchAreas: string | null
  bio: string | null
}

interface WireStaff extends WireStaffProfile {
  jobTitle: string
}

// Contract this frontend requires from `GET /courses/offerings` (base shape) and its
// proposed `lecturerId` filter extension — see MISSING_BACKEND_APIS.md §"Course Offering
// — lecturerId filter" for the full spec handed to the backend team.
interface WireCourseOffering {
  id: number
  courseId: number
  course: { code: string; title: string; creditUnits: number }
  academicSessionId: number
  session: { name: string }
  semesterId: number
  semester: { name: string }
  maxCapacity: number | null
  status: CourseOffering["status"]
  role?: TutorCourseAssignment["role"]
  assignedAt?: string
}

const mapCourseOffering = (o: WireCourseOffering): CourseOffering => ({
  id: o.id,
  course_id: o.courseId,
  course_code: o.course.code,
  course_title: o.course.title,
  credit_units: o.course.creditUnits,
  semester_name: o.semester.name,
  session_name: o.session.name,
  status: o.status,
})

// ── mappers: wire (camelCase) → frontend (snake_case) ──

const mapUserRef = (u: WireUserRef): Student["user"] => ({
  id: u.id,
  email: u.email,
  username: u.username,
  first_name: u.firstName,
  middle_name: u.middleName,
  last_name: u.lastName,
  phone_number: u.phoneNumber,
  avatar: u.avatar,
  is_active: u.isActive,
})

const mapUser = (u: WireUser): User => ({
  id: u.id,
  email: u.email,
  username: u.username,
  first_name: u.firstName,
  middle_name: u.middleName,
  last_name: u.lastName,
  phone_number: u.phoneNumber,
  avatar: u.avatar,
  is_active: u.isActive,
  is_verified: u.isVerified,
  last_login_at: u.lastLoginAt,
  created_at: u.createdAt,
  updated_at: u.updatedAt ?? u.createdAt,
  roles: u.roles ?? [],
})

const mapStudent = (s: WireStudent): Student => ({
  id: s.id,
  user_id: s.userId,
  matric_number: s.matricNumber,
  program_id: s.programId,
  program_name: s.program?.name ?? "—",
  department_name: s.program?.department?.name ?? "—",
  faculty_name: s.program?.department?.faculty?.name ?? "—",
  current_level: s.currentLevel?.numericValue ?? 0,
  current_level_id: s.currentLevelId ?? s.currentLevel?.id ?? 0,
  entry_mode: s.entryMode,
  mode_of_study: s.modeOfStudy,
  admission_date: s.admissionDate,
  graduation_date: s.graduationDate,
  status: s.status,
  current_cgpa: s.currentCGPA != null ? Number(s.currentCGPA) : null,
  date_of_birth: s.dateOfBirth,
  gender: s.gender,
  nationality: s.nationality,
  state_of_origin: s.stateOfOrigin,
  lga_of_origin: s.lgaOfOrigin,
  permanent_address: s.permanentAddress,
  contact_address: s.contactAddress,
  guardian_name: s.guardianName,
  guardian_phone: s.guardianPhone,
  guardian_email: s.guardianEmail,
  passport_photo: s.passportPhoto,
  created_at: s.createdAt,
  updated_at: s.updatedAt,
  user: mapUserRef(s.user),
})

const mapTutor = (l: WireLecturer): Tutor => ({
  id: l.id,
  user_id: l.userId,
  staff_number: l.staffNumber,
  department_id: l.departmentId ?? 0,
  department_name: l.department?.name ?? "—",
  faculty_name: l.department?.faculty?.name ?? "—",
  designation: l.designation,
  specialization: l.specialization,
  office_location: l.officeLocation,
  office_phone: l.officePhone,
  qualifications: l.qualifications,
  research_areas: l.researchAreas,
  bio: l.bio,
  created_at: l.createdAt,
  updated_at: l.updatedAt,
  user: mapUserRef(l.user),
})

const mapStaff = (s: WireStaff): Staff => ({
  id: s.id,
  user_id: s.userId,
  staff_number: s.staffNumber,
  department_id: s.departmentId,
  department_name: s.department?.name ?? null,
  designation: s.designation,
  job_title: s.jobTitle,
  office_location: s.officeLocation,
  office_phone: s.officePhone,
  created_at: s.createdAt,
  updated_at: s.updatedAt,
  user: mapUserRef(s.user),
})

// ── API implementations ─────────────────────

export const usersApi = {
  /* ── Users ── */
  async listUsers(filters?: UserQueryFilters): Promise<ApiListResponse<User>> {
    const res = await apiClient.get<ApiPaginatedResponse<WireUser>>("/users", {
      ...AUTH,
      params: {
        search: filters?.search,
        isActive: filters?.is_active,
        page: filters?.page,
        limit: filters?.limit ?? 100,
      },
    })
    return { data: res.data.map(mapUser), total: res.meta.total }
  },

  async getUserById(id: number): Promise<ApiSingleResponse<User>> {
    const raw = await apiClient.get<WireUser>(`/users/${id}`, AUTH)
    return { data: mapUser(raw) }
  },

  // No dedicated "toggle" endpoint — read current state then flip it via PATCH.
  async toggleUserActive(id: number): Promise<ApiSingleResponse<User>> {
    const current = await apiClient.get<WireUser>(`/users/${id}`, AUTH)
    const updated = await apiClient.patch<WireUser>(
      `/users/${id}`,
      { isActive: !current.isActive },
      AUTH
    )
    return { data: mapUser(updated) }
  },

  /* ── Students ── */
  // `facultyName`/`departmentName`/`level` are proposed params — see
  // MISSING_BACKEND_APIS.md §2.8. The confirmed real filter for level is
  // `currentLevelId` (a Level FK), not the numeric value itself; sending
  // `level` directly (100/200/...) alongside it is the ask, so Director's
  // filter bar (which only has the numeric value, not the Level id) works
  // without an extra lookup once the backend adds support.
  async listStudents(
    filters?: StudentQueryFilters
  ): Promise<ApiListResponse<Student>> {
    const res = await apiClient.get<ApiPaginatedResponse<WireStudent>>(
      "/users/students",
      {
        ...AUTH,
        params: {
          search: filters?.search,
          status: filters?.status,
          programId: filters?.program_id,
          level: filters?.level,
          facultyName: filters?.faculty_name,
          departmentName: filters?.department_name,
          page: filters?.page,
          limit: filters?.limit ?? 100,
        },
      }
    )
    return { data: res.data.map(mapStudent), total: res.meta.total }
  },

  async getStudentById(id: number): Promise<ApiSingleResponse<Student>> {
    const raw = await apiClient.get<WireStudent>(`/users/students/${id}`, AUTH)
    return { data: mapStudent(raw) }
  },

  // Proposed — see MISSING_BACKEND_APIS.md §1.1. No endpoint today lets a
  // logged-in student resolve their own Student.id (`/auth/me` only returns
  // User fields, and `/users/students/:id` needs the id already known). Built
  // against this designed self-scoped contract so `useMyStudentId` — and
  // every student-facing "my own record" screen that depends on it — starts
  // working the moment the backend adds it; until then this 404s.
  async getMyStudent(): Promise<ApiSingleResponse<Student>> {
    const raw = await apiClient.get<WireStudent>("/users/students/me", AUTH)
    return { data: mapStudent(raw) }
  },

  async updateStudent(
    id: number,
    payload: UpdateStudentPayload
  ): Promise<ApiSingleResponse<Student>> {
    const raw = await apiClient.patch<WireStudent>(
      `/users/students/${id}`,
      {
        currentLevelId: payload.current_level_id,
        modeOfStudy: payload.mode_of_study,
        status: payload.status,
        contactAddress: payload.contact_address,
        phoneNumber: payload.phone_number,
      },
      AUTH
    )
    return { data: mapStudent(raw), message: "Student updated" }
  },

  /* ── Tutors (Lecturers) ── */
  // `facultyName` is a proposed param (only `departmentId` is confirmed real
  // today) — see MISSING_BACKEND_APIS.md §2.8.
  async listTutors(
    filters?: UserQueryFilters
  ): Promise<ApiListResponse<Tutor>> {
    const res = await apiClient.get<ApiPaginatedResponse<WireLecturer>>(
      "/users/lecturers",
      {
        ...AUTH,
        params: {
          search: filters?.search,
          isActive: filters?.is_active,
          facultyName: filters?.faculty_name,
          departmentName: filters?.department_name,
          page: filters?.page,
          limit: filters?.limit ?? 100,
        },
      }
    )
    return { data: res.data.map(mapTutor), total: res.meta.total }
  },

  async getTutorById(id: number): Promise<ApiSingleResponse<Tutor>> {
    const raw = await apiClient.get<WireLecturer>(
      `/users/lecturers/${id}`,
      AUTH
    )
    return { data: mapTutor(raw) }
  },

  // Proposed — see MISSING_BACKEND_APIS.md §"GET /users/lecturers/me". Mirrors
  // getMyStudent()'s gap: no endpoint today lets a logged-in tutor resolve
  // their own Lecturer.id (needed to look up "my assigned courses" via
  // getTutorCourses). Built against this designed self-scoped contract;
  // 404s until the backend adds it.
  async getMyLecturer(): Promise<ApiSingleResponse<Tutor>> {
    const raw = await apiClient.get<WireLecturer>("/users/lecturers/me", AUTH)
    return { data: mapTutor(raw) }
  },

  async createTutor(
    payload: CreateTutorPayload
  ): Promise<ApiSingleResponse<Tutor>> {
    const raw = await apiClient.post<WireLecturer>(
      "/users/lecturers",
      {
        userId: payload.user_id,
        firstName: payload.first_name,
        middleName: payload.middle_name,
        lastName: payload.last_name,
        phoneNumber: payload.phone_number,
        staffNumber: payload.staff_number,
        departmentId: payload.department_id,
        designation: payload.designation,
        specialization: payload.specialization,
        officeLocation: payload.office_location,
        officePhone: payload.office_phone,
        dateOfBirth: payload.date_of_birth,
        gender: payload.gender,
        nationality: payload.nationality,
        stateOfOrigin: payload.state_of_origin,
        qualifications: payload.qualifications,
        researchAreas: payload.research_areas,
        bio: payload.bio,
      },
      AUTH
    )
    return { data: mapTutor(raw), message: "Tutor created" }
  },

  async updateTutor(
    id: number,
    payload: UpdateTutorPayload
  ): Promise<ApiSingleResponse<Tutor>> {
    const raw = await apiClient.patch<WireLecturer>(
      `/users/lecturers/${id}`,
      {
        designation: payload.designation,
        specialization: payload.specialization,
        officeLocation: payload.office_location,
        officePhone: payload.office_phone,
        qualifications: payload.qualifications,
        researchAreas: payload.research_areas,
        bio: payload.bio,
      },
      AUTH
    )
    return { data: mapTutor(raw), message: "Tutor updated" }
  },

  /* ── Staff ── */
  async listStaff(filters?: UserQueryFilters): Promise<ApiListResponse<Staff>> {
    const res = await apiClient.get<ApiPaginatedResponse<WireStaff>>(
      "/users/staff",
      {
        ...AUTH,
        params: {
          search: filters?.search,
          isActive: filters?.is_active,
          page: filters?.page,
          limit: filters?.limit ?? 100,
        },
      }
    )
    return { data: res.data.map(mapStaff), total: res.meta.total }
  },

  async getStaffById(id: number): Promise<ApiSingleResponse<Staff>> {
    const raw = await apiClient.get<WireStaff>(`/users/staff/${id}`, AUTH)
    return { data: mapStaff(raw) }
  },

  // `roleId` is sent defensively — user_README.md's CreateStaffDto doesn't list it (the
  // backend "assigns the appropriate staff role" on its own per that doc), but the create
  // form lets an admin pick one via the real `/auth/roles` list (see getStaffEligibleRoles
  // below) since the mock this replaces always required a role choice. Confirm with
  // backend whether `roleId` is honored or ignored — see MISSING_BACKEND_APIS.md.
  async createStaff(
    payload: CreateStaffPayload
  ): Promise<ApiSingleResponse<Staff>> {
    const raw = await apiClient.post<WireStaff>(
      "/users/staff",
      {
        userId: payload.user_id,
        firstName: payload.first_name,
        middleName: payload.middle_name,
        lastName: payload.last_name,
        phoneNumber: payload.phone_number,
        staffNumber: payload.staff_number,
        departmentId: payload.department_id,
        designation: payload.designation,
        jobTitle: payload.job_title,
        roleId: payload.role_id,
        officeLocation: payload.office_location,
        officePhone: payload.office_phone,
        dateOfBirth: payload.date_of_birth,
        gender: payload.gender,
        nationality: payload.nationality,
        stateOfOrigin: payload.state_of_origin,
      },
      AUTH
    )
    return { data: mapStaff(raw), message: "Staff created" }
  },

  async updateStaff(
    id: number,
    payload: UpdateStaffPayload
  ): Promise<ApiSingleResponse<Staff>> {
    const raw = await apiClient.patch<WireStaff>(
      `/users/staff/${id}`,
      {
        designation: payload.designation,
        jobTitle: payload.job_title,
        officeLocation: payload.office_location,
        officePhone: payload.office_phone,
      },
      AUTH
    )
    return { data: mapStaff(raw), message: "Staff updated" }
  },

  /* ── Course Offerings / Tutor Course Assignment ──
   * Assign/remove are real, existing endpoints (bruno/course "Offering Lecturer -
   * Assign/Remove"). Listing "which offerings is this tutor assigned to" is not — it's
   * a proposed `lecturerId` filter on the existing `GET /courses/offerings` endpoint,
   * specified in full in MISSING_BACKEND_APIS.md. Built against that spec now so the UI
   * is ready the moment the filter ships; until then these calls will 200 with an
   * unfiltered list (harmless — the panel just won't show only-this-tutor's courses) or
   * 4xx depending on how the backend currently handles an unrecognized query param. */
  async listCourseOfferings(): Promise<ApiListResponse<CourseOffering>> {
    const res = await apiClient.get<ApiListResponse<WireCourseOffering>>(
      "/courses/offerings",
      AUTH
    )
    return { data: res.data.map(mapCourseOffering), total: res.total }
  },

  async getTutorCourses(
    tutorId: number
  ): Promise<ApiListResponse<TutorCourseAssignment>> {
    const res = await apiClient.get<ApiListResponse<WireCourseOffering>>(
      "/courses/offerings",
      {
        ...AUTH,
        params: { lecturerId: tutorId },
      }
    )
    const assignments = res.data.map((o) => ({
      id: o.id,
      offering_id: o.id,
      tutor_id: tutorId,
      role: o.role ?? "primary",
      created_at: o.assignedAt ?? new Date().toISOString(),
      offering: mapCourseOffering(o),
    }))
    return { data: assignments, total: assignments.length }
  },

  async assignCourse(
    payload: AssignCoursePayload
  ): Promise<ApiSingleResponse<TutorCourseAssignment>> {
    await apiClient.post(
      `/courses/offerings/${payload.offering_id}/lecturers`,
      {
        lecturerId: payload.tutor_id,
        role: payload.role ?? "primary",
      },
      AUTH
    )
    const offering = await apiClient.get<{ data: WireCourseOffering }>(
      `/courses/offerings/${payload.offering_id}`,
      AUTH
    )
    return {
      data: {
        id: payload.offering_id,
        offering_id: payload.offering_id,
        tutor_id: payload.tutor_id,
        role: payload.role ?? "primary",
        created_at: new Date().toISOString(),
        offering: mapCourseOffering(offering.data),
      },
      message: "Course assigned",
    }
  },

  async unassignCourse(
    payload: UnassignCoursePayload
  ): Promise<ApiSingleResponse<null>> {
    await apiClient.delete(
      `/courses/offerings/${payload.offering_id}/lecturers/${payload.tutor_id}`,
      AUTH
    )
    return { data: null, message: "Course unassigned" }
  },

  /* ── Stats ──
   * Proposed new endpoint — see MISSING_BACKEND_APIS.md §"GET /users/stats". Built
   * against that spec now; until it ships this 404s and `useUserStats` surfaces the
   * request error like any other failed query (no client-side fallback computation, per
   * the "don't fake it" convention used across this module). */
  async getStats(): Promise<ApiSingleResponse<UserStats>> {
    const res = await apiClient.get<{
      data: {
        totalUsers: number
        totalStudents: number
        totalTutors: number
        totalStaff: number
        activeUsers: number
        byFaculty?: {
          facultyId: number
          facultyName: string
          students: number
          tutors: number
        }[]
        studentsByLevel?: { level: number; count: number }[]
        studentsByGender?: { male: number; female: number }
        tutorsByDesignation?: { designation: string; count: number }[]
      }
    }>("/users/stats", AUTH)
    return {
      data: {
        total_users: res.data.totalUsers,
        total_students: res.data.totalStudents,
        total_tutors: res.data.totalTutors,
        total_staff: res.data.totalStaff,
        active_users: res.data.activeUsers,
        by_faculty: res.data.byFaculty?.map((f) => ({
          faculty_id: f.facultyId,
          faculty_name: f.facultyName,
          students: f.students,
          tutors: f.tutors,
        })),
        students_by_level: res.data.studentsByLevel,
        students_by_gender: res.data.studentsByGender,
        tutors_by_designation: res.data.tutorsByDesignation,
      },
    }
  },

  /* ── Eligible Roles (for staff creation) ──
   * Sourced from the real /auth/roles list, excluding roles assigned through their own
   * dedicated flow (student via admission, tutor via "Add Tutor" above). */
  async getStaffEligibleRoles(): Promise<ApiListResponse<EligibleRole>> {
    const res = await apiClient.get<
      ApiListResponse<{
        id: number
        name: string
        slug: string
        description: string | null
      }>
    >("/auth/roles", AUTH)
    const eligible = res.data.filter(
      (r) => r.slug !== "student" && r.slug !== "tutor"
    )
    return { data: eligible, total: eligible.length }
  },

  /* ── Bulk Import (super_admin/admin/hod) ──
   * Real endpoint, no UI built for it yet — see MISSING_BACKEND_APIS.md /
   * API_INTEGRATION_AUDIT.md ("worth flagging... as a sizeable available-but-unused
   * feature"). Wired here so the contract is ready when that UI is built. */
  async bulkImport(file: File): Promise<{
    data: {
      total: number
      succeeded: number
      failed: number
      results: Record<string, unknown>[]
    }
  }> {
    const form = new FormData()
    form.append("file", file)
    return apiClient.post("/users/bulk-import", form, {
      ...AUTH,
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

// ── Query keys ──────────────────────────────

export const usersKeys = {
  all: ["users"] as const,
  list: (filters?: UserQueryFilters) =>
    [...usersKeys.all, "list", filters ?? {}] as const,
  detail: (id: number) => [...usersKeys.all, "detail", id] as const,
  stats: () => [...usersKeys.all, "stats"] as const,
  students: {
    all: [...["users"], "students"] as const,
    list: (filters?: StudentQueryFilters) =>
      [...usersKeys.students.all, "list", filters ?? {}] as const,
    detail: (id: number) => [...usersKeys.students.all, "detail", id] as const,
    me: () => [...usersKeys.students.all, "me"] as const,
  },
  tutors: {
    all: [...["users"], "tutors"] as const,
    list: (filters?: UserQueryFilters) =>
      [...usersKeys.tutors.all, "list", filters ?? {}] as const,
    detail: (id: number) => [...usersKeys.tutors.all, "detail", id] as const,
    courses: (id: number) => [...usersKeys.tutors.all, "courses", id] as const,
    me: () => [...usersKeys.tutors.all, "me"] as const,
  },
  staff: {
    all: [...["users"], "staff"] as const,
    list: (filters?: UserQueryFilters) =>
      [...usersKeys.staff.all, "list", filters ?? {}] as const,
    detail: (id: number) => [...usersKeys.staff.all, "detail", id] as const,
  },
  eligibleRoles: () => [...usersKeys.all, "eligible-roles"] as const,
}

// ── Query options ───────────────────────────

export const usersQueryOptions = {
  list: (filters?: UserQueryFilters) =>
    createApiQueryOptions({
      queryKey: usersKeys.list(filters),
      queryFn: () => usersApi.listUsers(filters),
    }),
  detail: (id: number) =>
    createApiQueryOptions({
      queryKey: usersKeys.detail(id),
      queryFn: () => usersApi.getUserById(id),
    }),
  stats: () =>
    createApiQueryOptions({
      queryKey: usersKeys.stats(),
      queryFn: () => usersApi.getStats(),
    }),
  students: {
    list: (filters?: StudentQueryFilters) =>
      createApiQueryOptions({
        queryKey: usersKeys.students.list(filters),
        queryFn: () => usersApi.listStudents(filters),
      }),
    detail: (id: number) =>
      createApiQueryOptions({
        queryKey: usersKeys.students.detail(id),
        queryFn: () => usersApi.getStudentById(id),
      }),
  },
  tutors: {
    list: (filters?: UserQueryFilters) =>
      createApiQueryOptions({
        queryKey: usersKeys.tutors.list(filters),
        queryFn: () => usersApi.listTutors(filters),
      }),
    detail: (id: number) =>
      createApiQueryOptions({
        queryKey: usersKeys.tutors.detail(id),
        queryFn: () => usersApi.getTutorById(id),
      }),
    courses: (id: number) =>
      createApiQueryOptions({
        queryKey: usersKeys.tutors.courses(id),
        queryFn: () => usersApi.getTutorCourses(id),
      }),
  },
  courseOfferings: () =>
    createApiQueryOptions({
      queryKey: [...usersKeys.all, "course-offerings"] as const,
      queryFn: () => usersApi.listCourseOfferings(),
    }),
  staff: {
    list: (filters?: UserQueryFilters) =>
      createApiQueryOptions({
        queryKey: usersKeys.staff.list(filters),
        queryFn: () => usersApi.listStaff(filters),
      }),
    detail: (id: number) =>
      createApiQueryOptions({
        queryKey: usersKeys.staff.detail(id),
        queryFn: () => usersApi.getStaffById(id),
      }),
  },
  staffEligibleRoles: () =>
    createApiQueryOptions({
      queryKey: usersKeys.eligibleRoles(),
      queryFn: () => usersApi.getStaffEligibleRoles(),
    }),
}

// ── Mutation options ────────────────────────

export const usersMutationOptions = {
  toggleActive: () =>
    createApiMutationOptions<ApiSingleResponse<User>, number>({
      mutationKey: [...usersKeys.all, "toggle-active"],
      mutationFn: (id) => usersApi.toggleUserActive(id),
    }),
  updateStudent: () =>
    createApiMutationOptions<
      ApiSingleResponse<Student>,
      { id: number; payload: UpdateStudentPayload }
    >({
      mutationKey: [...usersKeys.students.all, "update"],
      mutationFn: ({ id, payload }) => usersApi.updateStudent(id, payload),
    }),
  createTutor: () =>
    createApiMutationOptions<ApiSingleResponse<Tutor>, CreateTutorPayload>({
      mutationKey: [...usersKeys.tutors.all, "create"],
      mutationFn: (payload) => usersApi.createTutor(payload),
    }),
  updateTutor: () =>
    createApiMutationOptions<
      ApiSingleResponse<Tutor>,
      { id: number; payload: UpdateTutorPayload }
    >({
      mutationKey: [...usersKeys.tutors.all, "update"],
      mutationFn: ({ id, payload }) => usersApi.updateTutor(id, payload),
    }),
  assignCourse: () =>
    createApiMutationOptions<
      ApiSingleResponse<TutorCourseAssignment>,
      AssignCoursePayload
    >({
      mutationKey: [...usersKeys.tutors.all, "assign-course"],
      mutationFn: (payload) => usersApi.assignCourse(payload),
    }),
  unassignCourse: () =>
    createApiMutationOptions<ApiSingleResponse<null>, UnassignCoursePayload>({
      mutationKey: [...usersKeys.tutors.all, "unassign-course"],
      mutationFn: (payload) => usersApi.unassignCourse(payload),
    }),
  createStaff: () =>
    createApiMutationOptions<ApiSingleResponse<Staff>, CreateStaffPayload>({
      mutationKey: [...usersKeys.staff.all, "create"],
      mutationFn: (payload) => usersApi.createStaff(payload),
    }),
  updateStaff: () =>
    createApiMutationOptions<
      ApiSingleResponse<Staff>,
      { id: number; payload: UpdateStaffPayload }
    >({
      mutationKey: [...usersKeys.staff.all, "update"],
      mutationFn: ({ id, payload }) => usersApi.updateStaff(id, payload),
    }),
}
