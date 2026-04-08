// ──────────────────────────────────────────────
// Shared Admin Domain Types
// ──────────────────────────────────────────────

export interface AcademicSession {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface Semester {
    id: string;
    academic_session_id: string;
    name: string;
    sequence_no: number;
    is_active: boolean;
}

export interface FeeStructure {
    id: string;
    academic_session_id: string;
    semester_id: string;
    program_id: string;
    level: number;
    total_amount: number;
    description: string;
}

export interface StudentFeeAccount {
    id: string;
    student_id: string;
    academic_session_id: string;
    total_fee: number;
    paid_amount: number;
    balance: number;
    status: "pending" | "partially_paid" | "fully_paid" | "overdue";
}

export interface Program {
    id: string;
    name: string;
    code: string;
}

export interface FresherFeeItem {
    id: string;
    academic_session_id: string;
    name: string;
    amount: number;
}

export interface OtherFeeItem {
    id: string;
    academic_session_id: string;
    semester_id: string; // "" means "All Semesters"
    level: number;       // 0 means "All Levels"
    name: string;
    amount: number;
    description: string;
}

// ── Form / Payload types ────────────────────

export type CreateAcademicSessionPayload = Omit<AcademicSession, "id">;
export type UpdateAcademicSessionPayload = Partial<CreateAcademicSessionPayload>;

export type CreateSemesterPayload = Omit<Semester, "id">;

export type CreateFeeStructurePayload = Omit<FeeStructure, "id">;

export type CreateFresherFeePayload = Omit<FresherFeeItem, "id">;

export type CreateOtherFeePayload = Omit<OtherFeeItem, "id">;

// ── Admissions ──────────────────────────────

export type AdmissionStatus = "draft" | "open" | "closed";

export interface AdmissionCycle {
    id: string;
    academic_session_id: string;
    status: AdmissionStatus;
    application_start_date: string;
    application_end_date: string; // "" means no deadline (infinite)
    late_application_allowed: boolean;
    late_application_fee: number;
    max_applications: number; // 0 means unlimited
    require_documents: boolean;
    required_documents: string[];
    notification_email: string;
    instructions: string;
    created_at: string;
    updated_at: string;
}

export interface AdmissionRequirement {
    id: string;
    admission_cycle_id: string;
    program_id: string; // "" means all programs
    min_age: number; // 0 means no min
    max_age: number; // 0 means no max
    min_credits: number;
    required_subjects: string[];
    description: string;
}

export type CreateAdmissionCyclePayload = Omit<AdmissionCycle, "id" | "created_at" | "updated_at">;
export type UpdateAdmissionCyclePayload = Partial<CreateAdmissionCyclePayload>;
export type CreateAdmissionRequirementPayload = Omit<AdmissionRequirement, "id">;

export interface GenerateFeeAccountsPayload {
    academic_session_id: string;
}

export interface GenerateFeeAccountsResponse {
    generated_count: number;
    message: string;
}

// ── API response wrappers ───────────────────

export interface ApiListResponse<T> {
    data: T[];
    total: number;
}

export interface ApiSingleResponse<T> {
    data: T;
    message?: string;
}
