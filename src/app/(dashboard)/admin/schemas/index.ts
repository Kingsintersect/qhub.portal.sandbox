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
