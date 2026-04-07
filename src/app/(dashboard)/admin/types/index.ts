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
