import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
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
   EligibleRole,
} from "@/types/users";
import type { ApiListResponse, ApiSingleResponse } from "@/types/school";

// ── helpers ─────────────────────────────────
let _nextId = 200;
const nid = () => ++_nextId;
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── seed: users ─────────────────────────────

const users: User[] = [
   {
      id: 1, email: "john.doe@student.edu.ng", username: "johndoe",
      first_name: "John", middle_name: null, last_name: "Doe",
      phone_number: "08012345678", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-10T09:00:00Z", created_at: "2025-09-01T00:00:00Z", updated_at: "2026-04-10T09:00:00Z",
      roles: [{ id: 1, name: "Student", slug: "student" }],
   },
   {
      id: 2, email: "amina.bello@student.edu.ng", username: "aminabello",
      first_name: "Amina", middle_name: "Fatima", last_name: "Bello",
      phone_number: "08098765432", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-12T14:30:00Z", created_at: "2025-09-01T00:00:00Z", updated_at: "2026-04-12T14:30:00Z",
      roles: [{ id: 1, name: "Student", slug: "student" }],
   },
   {
      id: 3, email: "dr.okafor@staff.edu.ng", username: "chineduokafor",
      first_name: "Chinedu", middle_name: null, last_name: "Okafor",
      phone_number: "08033445566", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-15T08:45:00Z", created_at: "2024-01-15T00:00:00Z", updated_at: "2026-04-15T08:45:00Z",
      roles: [{ id: 2, name: "Tutor", slug: "tutor" }],
   },
   {
      id: 4, email: "prof.adeyemi@staff.edu.ng", username: "funkeadeyemi",
      first_name: "Funke", middle_name: null, last_name: "Adeyemi",
      phone_number: "08077889900", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-14T11:00:00Z", created_at: "2023-06-01T00:00:00Z", updated_at: "2026-04-14T11:00:00Z",
      roles: [{ id: 2, name: "Tutor", slug: "tutor" }, { id: 3, name: "Head of Department", slug: "hod" }],
   },
   {
      id: 5, email: "admin@edu.ng", username: "ibrahimmusa",
      first_name: "Ibrahim", middle_name: null, last_name: "Musa",
      phone_number: "08011223344", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-16T07:00:00Z", created_at: "2022-01-01T00:00:00Z", updated_at: "2026-04-16T07:00:00Z",
      roles: [{ id: 6, name: "Super Admin", slug: "super-admin" }],
   },
   {
      id: 6, email: "grace.eze@student.edu.ng", username: "graceeze",
      first_name: "Grace", middle_name: null, last_name: "Eze",
      phone_number: "09012345678", avatar: null, is_active: false, is_verified: true,
      last_login_at: null, created_at: "2025-09-15T00:00:00Z", updated_at: "2025-12-01T00:00:00Z",
      roles: [{ id: 1, name: "Student", slug: "student" }],
   },
   {
      id: 7, email: "bursary.staff@edu.ng", username: "adaobi",
      first_name: "Adaobi", middle_name: null, last_name: "Nwankwo",
      phone_number: "08055667788", avatar: null, is_active: true, is_verified: true,
      last_login_at: "2026-04-13T16:00:00Z", created_at: "2024-03-01T00:00:00Z", updated_at: "2026-04-13T16:00:00Z",
      roles: [{ id: 5, name: "Bursary", slug: "bursary" }],
   },
   {
      id: 8, email: "tunde.james@staff.edu.ng", username: "tundejames",
      first_name: "Tunde", middle_name: "Ayodele", last_name: "James",
      phone_number: "07033221100", avatar: null, is_active: true, is_verified: false,
      last_login_at: null, created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z",
      roles: [],
   },
];

// ── seed: students ──────────────────────────

const students: Student[] = [
   {
      id: 1, user_id: 1, matric_number: "CSC/2025/001",
      program_id: 1, program_name: "B.Sc. Computer Science",
      department_name: "Computer Science", faculty_name: "Science",
      current_level: 100, entry_mode: "UTME", mode_of_study: "FULL_TIME",
      admission_date: "2025-09-01", graduation_date: null,
      status: "ACTIVE", current_cgpa: 4.21,
      date_of_birth: "2003-05-14", gender: "MALE",
      nationality: "Nigerian", state_of_origin: "Lagos", lga_of_origin: "Ikeja",
      permanent_address: "12 Allen Ave, Ikeja, Lagos",
      contact_address: "Room 204, Moremi Hall, UNILAG",
      guardian_name: "Mr. Emeka Doe", guardian_phone: "08099887766", guardian_email: "emeka.doe@gmail.com",
      passport_photo: null,
      created_at: "2025-09-01T00:00:00Z", updated_at: "2026-04-10T09:00:00Z",
      user: { id: 1, email: "john.doe@student.edu.ng", username: "johndoe", first_name: "John", middle_name: null, last_name: "Doe", phone_number: "08012345678", avatar: null, is_active: true },
   },
   {
      id: 2, user_id: 2, matric_number: "CSC/2025/045",
      program_id: 1, program_name: "B.Sc. Computer Science",
      department_name: "Computer Science", faculty_name: "Science",
      current_level: 100, entry_mode: "UTME", mode_of_study: "FULL_TIME",
      admission_date: "2025-09-01", graduation_date: null,
      status: "ACTIVE", current_cgpa: 3.87,
      date_of_birth: "2004-01-22", gender: "FEMALE",
      nationality: "Nigerian", state_of_origin: "Kano", lga_of_origin: "Municipal",
      permanent_address: "45 Maitama St, Kano",
      contact_address: "Room 115, Queens Hall, UNILAG",
      guardian_name: "Mrs. Halima Bello", guardian_phone: "08066554433", guardian_email: null,
      passport_photo: null,
      created_at: "2025-09-01T00:00:00Z", updated_at: "2026-04-12T14:30:00Z",
      user: { id: 2, email: "amina.bello@student.edu.ng", username: "aminabello", first_name: "Amina", middle_name: "Fatima", last_name: "Bello", phone_number: "08098765432", avatar: null, is_active: true },
   },
   {
      id: 3, user_id: 6, matric_number: "EEE/2025/018",
      program_id: 2, program_name: "B.Sc. Electrical Engineering",
      department_name: "Electrical Engineering", faculty_name: "Engineering",
      current_level: 100, entry_mode: "DIRECT_ENTRY", mode_of_study: "FULL_TIME",
      admission_date: "2025-09-15", graduation_date: null,
      status: "SUSPENDED", current_cgpa: null,
      date_of_birth: "2003-08-30", gender: "FEMALE",
      nationality: "Nigerian", state_of_origin: "Enugu", lga_of_origin: "Nsukka",
      permanent_address: "8 Trans Ekulu, Enugu",
      contact_address: "Room 302, Amina Hall, UNILAG",
      guardian_name: "Mr. Eze Okwu", guardian_phone: "09011223344", guardian_email: "eze.okwu@gmail.com",
      passport_photo: null,
      created_at: "2025-09-15T00:00:00Z", updated_at: "2025-12-01T00:00:00Z",
      user: { id: 6, email: "grace.eze@student.edu.ng", username: "graceeze", first_name: "Grace", middle_name: null, last_name: "Eze", phone_number: "09012345678", avatar: null, is_active: false },
   },
];

// ── seed: tutors ─────────────────────────

const tutors: Tutor[] = [
   {
      id: 1, user_id: 3, staff_number: "STF/2019/012",
      department_id: 1, department_name: "Computer Science", faculty_name: "Science",
      designation: "Senior Tutor", specialization: "Machine Learning & AI",
      office_location: "Block B, Room 210", office_phone: "01-4567890",
      qualifications: "Ph.D Computer Science (MIT), M.Sc (UNILAG), B.Sc (UNILAG)",
      research_areas: "Deep Learning, NLP, Computer Vision", bio: "Dr. Okafor is a leading researcher in AI/ML.",
      created_at: "2024-01-15T00:00:00Z", updated_at: "2026-04-15T08:45:00Z",
      user: { id: 3, email: "dr.okafor@staff.edu.ng", username: "chineduokafor", first_name: "Chinedu", middle_name: null, last_name: "Okafor", phone_number: "08033445566", avatar: null, is_active: true },
   },
   {
      id: 2, user_id: 4, staff_number: "STF/2015/003",
      department_id: 2, department_name: "Mechanical Engineering", faculty_name: "Engineering",
      designation: "Professor", specialization: "Thermodynamics & Energy Systems",
      office_location: "Engineering Block, Room 405", office_phone: "01-4567891",
      qualifications: "Ph.D Mechanical Engineering (Imperial College), M.Eng (UNILAG)",
      research_areas: "Renewable Energy, Heat Transfer", bio: "Prof. Adeyemi is the HOD of Mechanical Engineering.",
      created_at: "2023-06-01T00:00:00Z", updated_at: "2026-04-14T11:00:00Z",
      user: { id: 4, email: "prof.adeyemi@staff.edu.ng", username: "funkeadeyemi", first_name: "Funke", middle_name: null, last_name: "Adeyemi", phone_number: "08077889900", avatar: null, is_active: true },
   },
];

// ── seed: staff ─────────────────────────────

const staffMembers: Staff[] = [
   {
      id: 1, user_id: 7, staff_number: "STF/2024/015",
      department_id: null, department_name: null,
      designation: "Bursary Officer", job_title: "Senior Accountant",
      office_location: "Admin Block, Room 102", office_phone: "01-4567892",
      created_at: "2024-03-01T00:00:00Z", updated_at: "2026-04-13T16:00:00Z",
      user: { id: 7, email: "bursary.staff@edu.ng", username: "adaobi", first_name: "Adaobi", middle_name: null, last_name: "Nwankwo", phone_number: "08055667788", avatar: null, is_active: true },
   },
   {
      id: 2, user_id: 5, staff_number: "STF/2010/001",
      department_id: null, department_name: null,
      designation: "System Administrator", job_title: "ICT Director",
      office_location: "ICT Building, Room 001", office_phone: "01-4567893",
      created_at: "2022-01-01T00:00:00Z", updated_at: "2026-04-16T07:00:00Z",
      user: { id: 5, email: "admin@edu.ng", username: "ibrahimmusa", first_name: "Ibrahim", middle_name: null, last_name: "Musa", phone_number: "08011223344", avatar: null, is_active: true },
   },
];

// ── seed: course offerings ──────────────────

const courseOfferings: CourseOffering[] = [
   { id: 1, course_id: 1, course_code: "CSC 301", course_title: "Data Structures & Algorithms", credit_units: 3, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 2, course_id: 2, course_code: "CSC 305", course_title: "Operating Systems", credit_units: 3, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 3, course_id: 3, course_code: "CSC 311", course_title: "Artificial Intelligence", credit_units: 3, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 4, course_id: 4, course_code: "CSC 302", course_title: "Database Management Systems", credit_units: 3, semester_name: "Second Semester", session_name: "2025/2026", status: "PLANNED" },
   { id: 5, course_id: 5, course_code: "MEE 401", course_title: "Thermodynamics II", credit_units: 3, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 6, course_id: 6, course_code: "MEE 405", course_title: "Fluid Mechanics", credit_units: 2, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 7, course_id: 7, course_code: "GST 101", course_title: "Use of English I", credit_units: 2, semester_name: "First Semester", session_name: "2025/2026", status: "OPEN" },
   { id: 8, course_id: 8, course_code: "CSC 201", course_title: "Computer Programming II", credit_units: 3, semester_name: "Second Semester", session_name: "2025/2026", status: "PLANNED" },
];

// ── seed: course assignments ────────────────

const courseAssignments: TutorCourseAssignment[] = [
   { id: 1, offering_id: 1, tutor_id: 1, role: "primary", created_at: "2026-01-10T00:00:00Z", offering: courseOfferings[0] },
   { id: 2, offering_id: 3, tutor_id: 1, role: "primary", created_at: "2026-01-10T00:00:00Z", offering: courseOfferings[2] },
   { id: 3, offering_id: 5, tutor_id: 2, role: "primary", created_at: "2026-01-10T00:00:00Z", offering: courseOfferings[4] },
   { id: 4, offering_id: 6, tutor_id: 2, role: "primary", created_at: "2026-01-10T00:00:00Z", offering: courseOfferings[5] },
];

// ── seed: roles eligible for staff/tutor assignment ──

const STAFF_ELIGIBLE_ROLES: EligibleRole[] = [
   { id: 7, name: "Staff", slug: "staff", description: "General non-academic staff member" },
   { id: 3, name: "Head of Department", slug: "hod", description: "Head of Department — inherits tutor privileges plus approval rights" },
   { id: 4, name: "Dean", slug: "dean", description: "Faculty Dean with oversight across departments" },
   { id: 5, name: "Bursary", slug: "bursary", description: "Finance/Bursary department staff" },
   { id: 8, name: "Registrar", slug: "registrar", description: "Academic registry staff with student records access" },
   { id: 9, name: "Admin", slug: "admin", description: "Administrative manager with user and department oversight" },
   { id: 6, name: "Super Admin", slug: "super-admin", description: "ICT/System Administrator with full platform access" },
];

const TUTOR_ROLE: EligibleRole = { id: 2, name: "Tutor", slug: "tutor", description: "Course tutor and academic advisor" };

// ── API implementations ─────────────────────

export const usersApi = {
   /* ── Users ── */
   async listUsers(filters?: UserQueryFilters): Promise<ApiListResponse<User>> {
      await delay();
      let result = [...users];
      if (filters?.search) {
         const q = filters.search.toLowerCase();
         result = result.filter((u) =>
            [u.email, u.username, u.first_name, u.last_name].some((v) => v?.toLowerCase().includes(q))
         );
      }
      if (filters?.is_active !== undefined) {
         result = result.filter((u) => u.is_active === filters.is_active);
      }
      return { data: result, total: result.length };
   },

   async getUserById(id: number): Promise<ApiSingleResponse<User>> {
      await delay(200);
      const u = users.find((x) => x.id === id);
      if (!u) throw new Error("User not found");
      return { data: u };
   },

   async toggleUserActive(id: number): Promise<ApiSingleResponse<User>> {
      await delay(300);
      const u = users.find((x) => x.id === id);
      if (!u) throw new Error("User not found");
      u.is_active = !u.is_active;
      return { data: { ...u } };
   },

   /* ── Students ── */
   async listStudents(filters?: StudentQueryFilters): Promise<ApiListResponse<Student>> {
      await delay();
      let result = [...students];
      if (filters?.search) {
         const q = filters.search.toLowerCase();
         result = result.filter((s) =>
            [s.matric_number, s.user.first_name, s.user.last_name, s.user.email, s.department_name].some((v) => v?.toLowerCase().includes(q))
         );
      }
      if (filters?.status) result = result.filter((s) => s.status === filters.status);
      if (filters?.program_id) result = result.filter((s) => s.program_id === filters.program_id);
      if (filters?.level) result = result.filter((s) => s.current_level === filters.level);
      return { data: result, total: result.length };
   },

   async getStudentById(id: number): Promise<ApiSingleResponse<Student>> {
      await delay(200);
      const s = students.find((x) => x.id === id);
      if (!s) throw new Error("Student not found");
      return { data: s };
   },

   async updateStudent(id: number, payload: UpdateStudentPayload): Promise<ApiSingleResponse<Student>> {
      await delay(500);
      const idx = students.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Student not found");
      students[idx] = { ...students[idx], ...payload, updated_at: new Date().toISOString() };
      return { data: { ...students[idx] }, message: "Student updated" };
   },

   /* ── Tutors ── */
   async listTutors(filters?: UserQueryFilters): Promise<ApiListResponse<Tutor>> {
      await delay();
      let result = [...tutors];
      if (filters?.search) {
         const q = filters.search.toLowerCase();
         result = result.filter((l) =>
            [l.staff_number, l.user.first_name, l.user.last_name, l.user.email, l.department_name, l.designation].some((v) => v?.toLowerCase().includes(q))
         );
      }
      return { data: result, total: result.length };
   },

   async getTutorById(id: number): Promise<ApiSingleResponse<Tutor>> {
      await delay(200);
      const l = tutors.find((x) => x.id === id);
      if (!l) throw new Error("Tutor not found");
      return { data: l };
   },

   async createTutor(payload: CreateTutorPayload): Promise<ApiSingleResponse<Tutor>> {
      await delay(600);
      const user = users.find((u) => u.id === payload.user_id);
      if (!user) throw new Error("User not found");
      if (tutors.some((l) => l.user_id === payload.user_id)) throw new Error("User already has a tutor record");
      user.first_name = payload.first_name;
      user.last_name = payload.last_name;
      if (payload.middle_name) user.middle_name = payload.middle_name;
      if (payload.phone_number) user.phone_number = payload.phone_number;
      // Assign "tutor" role via UserRole
      if (!user.roles.some((r) => r.id === TUTOR_ROLE.id)) {
         user.roles.push({ id: TUTOR_ROLE.id, name: TUTOR_ROLE.name, slug: TUTOR_ROLE.slug });
      }
      const newTutor: Tutor = {
         id: nid(), user_id: payload.user_id, staff_number: payload.staff_number,
         department_id: payload.department_id, department_name: "Computer Science", faculty_name: "Science",
         designation: payload.designation, specialization: payload.specialization ?? null,
         office_location: payload.office_location ?? null, office_phone: payload.office_phone ?? null,
         qualifications: payload.qualifications ?? null, research_areas: payload.research_areas ?? null,
         bio: payload.bio ?? null,
         created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
         user: { id: user.id, email: user.email, username: user.username, first_name: user.first_name, middle_name: user.middle_name, last_name: user.last_name, phone_number: user.phone_number, avatar: user.avatar, is_active: user.is_active },
      };
      tutors.push(newTutor);
      return { data: newTutor, message: "Tutor created" };
   },

   async updateTutor(id: number, payload: UpdateTutorPayload): Promise<ApiSingleResponse<Tutor>> {
      await delay(500);
      const idx = tutors.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Tutor not found");
      tutors[idx] = { ...tutors[idx], ...payload, updated_at: new Date().toISOString() };
      return { data: { ...tutors[idx] }, message: "Tutor updated" };
   },

   /* ── Staff ── */
   async listStaff(filters?: UserQueryFilters): Promise<ApiListResponse<Staff>> {
      await delay();
      let result = [...staffMembers];
      if (filters?.search) {
         const q = filters.search.toLowerCase();
         result = result.filter((s) =>
            [s.staff_number, s.user.first_name, s.user.last_name, s.user.email, s.designation, s.job_title].some((v) => v?.toLowerCase().includes(q))
         );
      }
      return { data: result, total: result.length };
   },

   async getStaffById(id: number): Promise<ApiSingleResponse<Staff>> {
      await delay(200);
      const s = staffMembers.find((x) => x.id === id);
      if (!s) throw new Error("Staff not found");
      return { data: s };
   },

   async createStaff(payload: CreateStaffPayload): Promise<ApiSingleResponse<Staff>> {
      await delay(600);
      const user = users.find((u) => u.id === payload.user_id);
      if (!user) throw new Error("User not found");
      if (staffMembers.some((s) => s.user_id === payload.user_id)) throw new Error("User already has a staff record");
      user.first_name = payload.first_name;
      user.last_name = payload.last_name;
      if (payload.middle_name) user.middle_name = payload.middle_name;
      if (payload.phone_number) user.phone_number = payload.phone_number;
      // Assign the selected staff role
      const selectedRole = STAFF_ELIGIBLE_ROLES.find((r) => r.id === payload.role_id);
      if (!selectedRole) throw new Error("Invalid role selected");
      if (!user.roles.some((r) => r.id === selectedRole.id)) {
         user.roles.push({ id: selectedRole.id, name: selectedRole.name, slug: selectedRole.slug });
      }
      const newStaff: Staff = {
         id: nid(), user_id: payload.user_id, staff_number: payload.staff_number,
         department_id: payload.department_id ?? null, department_name: payload.department_id ? "General" : null,
         designation: payload.designation, job_title: payload.job_title,
         office_location: payload.office_location ?? null, office_phone: payload.office_phone ?? null,
         created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
         user: { id: user.id, email: user.email, username: user.username, first_name: user.first_name, middle_name: user.middle_name, last_name: user.last_name, phone_number: user.phone_number, avatar: user.avatar, is_active: user.is_active },
      };
      staffMembers.push(newStaff);
      return { data: newStaff, message: "Staff created" };
   },

   async updateStaff(id: number, payload: UpdateStaffPayload): Promise<ApiSingleResponse<Staff>> {
      await delay(500);
      const idx = staffMembers.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error("Staff not found");
      staffMembers[idx] = { ...staffMembers[idx], ...payload, updated_at: new Date().toISOString() };
      return { data: { ...staffMembers[idx] }, message: "Staff updated" };
   },

   /* ── Course Offerings (available to assign) ── */
   async listCourseOfferings(): Promise<ApiListResponse<CourseOffering>> {
      await delay(300);
      return { data: [...courseOfferings], total: courseOfferings.length };
   },

   /* ── Course Assignments ── */
   async getTutorCourses(tutorId: number): Promise<ApiListResponse<TutorCourseAssignment>> {
      await delay(300);
      const result = courseAssignments.filter((a) => a.tutor_id === tutorId);
      return { data: result, total: result.length };
   },

   async assignCourse(payload: AssignCoursePayload): Promise<ApiSingleResponse<TutorCourseAssignment>> {
      await delay(500);
      const existing = courseAssignments.find(
         (a) => a.offering_id === payload.offering_id && a.tutor_id === payload.tutor_id,
      );
      if (existing) throw new Error("Course already assigned to this tutor");
      const offering = courseOfferings.find((o) => o.id === payload.offering_id);
      if (!offering) throw new Error("Course offering not found");
      const assignment: TutorCourseAssignment = {
         id: nid(),
         offering_id: payload.offering_id,
         tutor_id: payload.tutor_id,
         role: payload.role ?? "primary",
         created_at: new Date().toISOString(),
         offering,
      };
      courseAssignments.push(assignment);
      return { data: assignment, message: "Course assigned" };
   },

   async unassignCourse(assignmentId: number): Promise<ApiSingleResponse<null>> {
      await delay(400);
      const idx = courseAssignments.findIndex((a) => a.id === assignmentId);
      if (idx === -1) throw new Error("Assignment not found");
      courseAssignments.splice(idx, 1);
      return { data: null, message: "Course unassigned" };
   },

   /* ── Stats ── */
   async getStats(): Promise<ApiSingleResponse<UserStats>> {
      await delay(300);
      return {
         data: {
            total_users: users.length,
            total_students: students.length,
            total_tutors: tutors.length,
            total_staff: staffMembers.length,
            active_users: users.filter((u) => u.is_active).length,
         },
      };
   },

   /* ── Eligible Roles ── */
   async getStaffEligibleRoles(): Promise<ApiListResponse<EligibleRole>> {
      await delay(200);
      return { data: [...STAFF_ELIGIBLE_ROLES], total: STAFF_ELIGIBLE_ROLES.length };
   },
};

// ── Query keys ──────────────────────────────

export const usersKeys = {
   all: ["users"] as const,
   list: (filters?: UserQueryFilters) => [...usersKeys.all, "list", filters ?? {}] as const,
   detail: (id: number) => [...usersKeys.all, "detail", id] as const,
   stats: () => [...usersKeys.all, "stats"] as const,
   students: {
      all: [...["users"], "students"] as const,
      list: (filters?: StudentQueryFilters) => [...usersKeys.students.all, "list", filters ?? {}] as const,
      detail: (id: number) => [...usersKeys.students.all, "detail", id] as const,
   },
   tutors: {
      all: [...["users"], "tutors"] as const,
      list: (filters?: UserQueryFilters) => [...usersKeys.tutors.all, "list", filters ?? {}] as const,
      detail: (id: number) => [...usersKeys.tutors.all, "detail", id] as const,
      courses: (id: number) => [...usersKeys.tutors.all, "courses", id] as const,
   },
   staff: {
      all: [...["users"], "staff"] as const,
      list: (filters?: UserQueryFilters) => [...usersKeys.staff.all, "list", filters ?? {}] as const,
      detail: (id: number) => [...usersKeys.staff.all, "detail", id] as const,
   },
   eligibleRoles: () => [...usersKeys.all, "eligible-roles"] as const,
};

// ── Query options ───────────────────────────

export const usersQueryOptions = {
   list: (filters?: UserQueryFilters) =>
      createApiQueryOptions({ queryKey: usersKeys.list(filters), queryFn: () => usersApi.listUsers(filters) }),
   detail: (id: number) =>
      createApiQueryOptions({ queryKey: usersKeys.detail(id), queryFn: () => usersApi.getUserById(id) }),
   stats: () =>
      createApiQueryOptions({ queryKey: usersKeys.stats(), queryFn: () => usersApi.getStats() }),
   students: {
      list: (filters?: StudentQueryFilters) =>
         createApiQueryOptions({ queryKey: usersKeys.students.list(filters), queryFn: () => usersApi.listStudents(filters) }),
      detail: (id: number) =>
         createApiQueryOptions({ queryKey: usersKeys.students.detail(id), queryFn: () => usersApi.getStudentById(id) }),
   },
   tutors: {
      list: (filters?: UserQueryFilters) =>
         createApiQueryOptions({ queryKey: usersKeys.tutors.list(filters), queryFn: () => usersApi.listTutors(filters) }),
      detail: (id: number) =>
         createApiQueryOptions({ queryKey: usersKeys.tutors.detail(id), queryFn: () => usersApi.getTutorById(id) }),
      courses: (id: number) =>
         createApiQueryOptions({ queryKey: usersKeys.tutors.courses(id), queryFn: () => usersApi.getTutorCourses(id) }),
   },
   courseOfferings: () =>
      createApiQueryOptions({ queryKey: [...usersKeys.all, "course-offerings"] as const, queryFn: () => usersApi.listCourseOfferings() }),
   staff: {
      list: (filters?: UserQueryFilters) =>
         createApiQueryOptions({ queryKey: usersKeys.staff.list(filters), queryFn: () => usersApi.listStaff(filters) }),
      detail: (id: number) =>
         createApiQueryOptions({ queryKey: usersKeys.staff.detail(id), queryFn: () => usersApi.getStaffById(id) }),
   },
   staffEligibleRoles: () =>
      createApiQueryOptions({ queryKey: usersKeys.eligibleRoles(), queryFn: () => usersApi.getStaffEligibleRoles() }),
};

// ── Mutation options ────────────────────────

export const usersMutationOptions = {
   toggleActive: () =>
      createApiMutationOptions<ApiSingleResponse<User>, number>({
         mutationKey: [...usersKeys.all, "toggle-active"],
         mutationFn: (id) => usersApi.toggleUserActive(id),
      }),
   updateStudent: () =>
      createApiMutationOptions<ApiSingleResponse<Student>, { id: number; payload: UpdateStudentPayload }>({
         mutationKey: [...usersKeys.students.all, "update"],
         mutationFn: ({ id, payload }) => usersApi.updateStudent(id, payload),
      }),
   createTutor: () =>
      createApiMutationOptions<ApiSingleResponse<Tutor>, CreateTutorPayload>({
         mutationKey: [...usersKeys.tutors.all, "create"],
         mutationFn: (payload) => usersApi.createTutor(payload),
      }),
   updateTutor: () =>
      createApiMutationOptions<ApiSingleResponse<Tutor>, { id: number; payload: UpdateTutorPayload }>({
         mutationKey: [...usersKeys.tutors.all, "update"],
         mutationFn: ({ id, payload }) => usersApi.updateTutor(id, payload),
      }),
   assignCourse: () =>
      createApiMutationOptions<ApiSingleResponse<TutorCourseAssignment>, AssignCoursePayload>({
         mutationKey: [...usersKeys.tutors.all, "assign-course"],
         mutationFn: (payload) => usersApi.assignCourse(payload),
      }),
   unassignCourse: () =>
      createApiMutationOptions<ApiSingleResponse<null>, number>({
         mutationKey: [...usersKeys.tutors.all, "unassign-course"],
         mutationFn: (id) => usersApi.unassignCourse(id),
      }),
   createStaff: () =>
      createApiMutationOptions<ApiSingleResponse<Staff>, CreateStaffPayload>({
         mutationKey: [...usersKeys.staff.all, "create"],
         mutationFn: (payload) => usersApi.createStaff(payload),
      }),
   updateStaff: () =>
      createApiMutationOptions<ApiSingleResponse<Staff>, { id: number; payload: UpdateStaffPayload }>({
         mutationKey: [...usersKeys.staff.all, "update"],
         mutationFn: ({ id, payload }) => usersApi.updateStaff(id, payload),
      }),
};
