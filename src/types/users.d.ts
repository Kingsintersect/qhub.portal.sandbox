// ──────────────────────────────────────────────
// User Management Domain Types
// (derived from backend Prisma schema)
// ──────────────────────────────────────────────

export type Gender = "MALE" | "FEMALE";
export type EntryMode = "UTME" | "DIRECT_ENTRY" | "TRANSFER";
export type ModeOfStudy = "FULL_TIME" | "PART_TIME" | "SANDWICH" | "DISTANCE";
export type StudentStatus = "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "SUSPENDED" | "RUSTICATED" | "DEFERRED";

// ── User (core auth record) ─────────────────

export interface User {
   id: number;
   email: string;
   username: string;
   first_name: string | null;
   middle_name: string | null;
   last_name: string | null;
   phone_number: string | null;
   avatar: string | null;
   is_active: boolean;
   is_verified: boolean;
   last_login_at: string | null;
   created_at: string;
   updated_at: string;
   roles: { id: number; name: string; slug: string }[];
}

// ── Student ─────────────────────────────────

export interface Student {
   id: number;
   user_id: number;
   matric_number: string;
   program_id: number;
   program_name: string;
   department_name: string;
   faculty_name: string;
   current_level: number;
   entry_mode: EntryMode;
   mode_of_study: ModeOfStudy;
   admission_date: string;
   graduation_date: string | null;
   status: StudentStatus;
   current_cgpa: number | null;
   date_of_birth: string;
   gender: Gender;
   nationality: string;
   state_of_origin: string;
   lga_of_origin: string;
   permanent_address: string;
   contact_address: string;
   guardian_name: string;
   guardian_phone: string;
   guardian_email: string | null;
   passport_photo: string | null;
   created_at: string;
   updated_at: string;
   // Nested user info
   user: Pick<User, "id" | "email" | "username" | "first_name" | "middle_name" | "last_name" | "phone_number" | "avatar" | "is_active">;
}

// ── Lecturer ────────────────────────────────

export interface Lecturer {
   id: number;
   user_id: number;
   staff_number: string;
   department_id: number;
   department_name: string;
   faculty_name: string;
   designation: string;
   specialization: string | null;
   office_location: string | null;
   office_phone: string | null;
   qualifications: string | null;
   research_areas: string | null;
   bio: string | null;
   created_at: string;
   updated_at: string;
   user: Pick<User, "id" | "email" | "username" | "first_name" | "middle_name" | "last_name" | "phone_number" | "avatar" | "is_active">;
}

// ── Staff ───────────────────────────────────

export interface Staff {
   id: number;
   user_id: number;
   staff_number: string;
   department_id: number | null;
   department_name: string | null;
   designation: string;
   job_title: string;
   office_location: string | null;
   office_phone: string | null;
   created_at: string;
   updated_at: string;
   user: Pick<User, "id" | "email" | "username" | "first_name" | "middle_name" | "last_name" | "phone_number" | "avatar" | "is_active">;
}

// ── Payload types ───────────────────────────

export interface CreateLecturerPayload {
   user_id: number;
   first_name: string;
   middle_name?: string;
   last_name: string;
   phone_number?: string;
   staff_number: string;
   department_id: number;
   designation: string;
   specialization?: string;
   office_location?: string;
   office_phone?: string;
   date_of_birth?: string;
   gender?: Gender;
   nationality?: string;
   state_of_origin?: string;
   qualifications?: string;
   research_areas?: string;
   bio?: string;
}

export interface CreateStaffPayload {
   user_id: number;
   first_name: string;
   middle_name?: string;
   last_name: string;
   phone_number?: string;
   staff_number: string;
   department_id?: number;
   designation: string;
   job_title: string;
   role_id: number;             // selected staff role (e.g. Staff, Registrar, HOD, Bursary)
   office_location?: string;
   office_phone?: string;
   date_of_birth?: string;
   gender?: Gender;
   nationality?: string;
   state_of_origin?: string;
}

export interface UpdateStudentPayload {
   current_level?: number;
   mode_of_study?: ModeOfStudy;
   status?: StudentStatus;
   contact_address?: string;
   phone_number?: string;
}

export interface UpdateLecturerPayload {
   designation?: string;
   specialization?: string;
   office_location?: string;
   office_phone?: string;
   qualifications?: string;
   research_areas?: string;
   bio?: string;
}

export interface UpdateStaffPayload {
   designation?: string;
   job_title?: string;
   office_location?: string;
   office_phone?: string;
}

// ── Course Assignment ───────────────────────

export type CourseType = "GENERAL" | "FACULTY" | "DEPARTMENTAL" | "ELECTIVE";
export type CourseOfferingStatus = "PLANNED" | "OPEN" | "CLOSED" | "CANCELLED";
export type LecturerCourseRole = "primary" | "assistant" | "supervisor";

export interface Course {
   id: number;
   code: string;
   title: string;
   credit_units: number;
   course_type: CourseType;
   level_id: number;
   department_name: string | null;
   is_active: boolean;
}

export interface CourseOffering {
   id: number;
   course_id: number;
   course_code: string;
   course_title: string;
   credit_units: number;
   semester_name: string;
   session_name: string;
   status: CourseOfferingStatus;
}

export interface LecturerCourseAssignment {
   id: number;
   offering_id: number;
   lecturer_id: number;
   role: LecturerCourseRole;
   created_at: string;
   offering: CourseOffering;
}

export interface AssignCoursePayload {
   lecturer_id: number;
   offering_id: number;
   role?: LecturerCourseRole;
}

// ── Role eligible for staff/lecturer assignment ─

export interface EligibleRole {
   id: number;
   name: string;
   slug: string;
   description: string | null;
}

export interface UserQueryFilters {
   search?: string;
   is_active?: boolean;
   page?: number;
   limit?: number;
}

export interface StudentQueryFilters extends UserQueryFilters {
   status?: StudentStatus;
   program_id?: number;
   level?: number;
}

export interface UserStats {
   total_users: number;
   total_students: number;
   total_lecturers: number;
   total_staff: number;
   active_users: number;
}
