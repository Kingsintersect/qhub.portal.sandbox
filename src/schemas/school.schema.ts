import { z } from "zod";

// ── Academic Session ────────────────────────

export const academicSessionSchema = z.object({
    name: z.string().min(1, "Session name is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    is_active: z.boolean(),
}).refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
});

export type AcademicSessionFormValues = z.infer<typeof academicSessionSchema>;

// ── Semester ────────────────────────────────

export const semesterSchema = z.object({
    name: z.string().min(1, "Semester name is required"),
    sequence_no: z.number().int().min(1, "Sequence must be at least 1"),
});

export type SemesterFormValues = z.infer<typeof semesterSchema>;

// ── Fee Structure ───────────────────────────

export const feeStructureSchema = z.object({
    academic_session_id: z.string().min(1, "Academic session is required"),
    program_id: z.string().min(1, "Program is required"),
    level: z.number().int().min(100, "Level is required"),
    total_amount: z.number().positive("Amount must be greater than 0"),
    description: z.string(),
});

export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;

// ── Fresher Fee ─────────────────────────────

export const fresherFeeSchema = z.object({
    academic_session_id: z.string().min(1, "Academic session is required"),
    name: z.string().min(1, "Fee name is required"),
    amount: z.number().positive("Amount must be greater than 0"),
});

export type FresherFeeFormValues = z.infer<typeof fresherFeeSchema>;

// ── Other Fee ───────────────────────────────

export const otherFeeSchema = z.object({
    academic_session_id: z.string().min(1, "Academic session is required"),
    semester_id: z.string(), // "" = All Semesters
    level: z.number().int().min(0, "Level is required"), // 0 = All Levels
    name: z.string().min(1, "Fee name is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string(),
});

export type OtherFeeFormValues = z.infer<typeof otherFeeSchema>;

// ── Admission Cycle ─────────────────────────

export const admissionCycleSchema = z.object({
    academic_session_id: z.string().min(1, "Academic session is required"),
    application_start_date: z.string().min(1, "Start date is required"),
    application_end_date: z.string(), // "" = no deadline
    late_application_allowed: z.boolean(),
    late_application_fee: z.number().min(0, "Fee cannot be negative"),
    max_applications: z.number().int().min(0, "Must be 0 (unlimited) or positive"),
    require_documents: z.boolean(),
    required_documents: z.array(z.string()),
    notification_email: z.string().email("Must be a valid email"),
    instructions: z.string(),
});

export type AdmissionCycleFormValues = z.infer<typeof admissionCycleSchema>;

// ── Admission Requirement ───────────────────

export const admissionRequirementSchema = z.object({
    admission_cycle_id: z.string().min(1, "Admission cycle is required"),
    program_id: z.string(), // "" = all programs
    min_age: z.number().int().min(0),
    max_age: z.number().int().min(0),
    min_credits: z.number().int().min(0, "Credits must be 0 or more"),
    required_subjects: z.array(z.string()),
    description: z.string().min(1, "Description is required"),
});

export type AdmissionRequirementFormValues = z.infer<typeof admissionRequirementSchema>;
