/**
 * Shared in-memory mock database for the admin modules.
 * Every function returns a Promise with a simulated delay
 * so react-query behaves exactly like a real API.
 */
import type {
    AcademicSession,
    Semester,
    FeeStructure,
    FresherFeeItem,
    OtherFeeItem,
    AdmissionCycle,
    AdmissionRequirement,
    Program,
    CreateAcademicSessionPayload,
    UpdateAcademicSessionPayload,
    CreateSemesterPayload,
    CreateFeeStructurePayload,
    CreateFresherFeePayload,
    CreateOtherFeePayload,
    CreateAdmissionCyclePayload,
    UpdateAdmissionCyclePayload,
    CreateAdmissionRequirementPayload,
    GenerateFeeAccountsPayload,
    GenerateFeeAccountsResponse,
} from "../types";

// ── helpers ─────────────────────────────────
let _nextId = 100;
const uid = () => String(++_nextId);
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── seed data ───────────────────────────────

const sessions: AcademicSession[] = [
    {
        id: "ses-1",
        name: "2023/2024",
        start_date: "2023-09-01",
        end_date: "2024-08-31",
        is_active: false,
    },
    {
        id: "ses-2",
        name: "2024/2025",
        start_date: "2024-09-01",
        end_date: "2025-08-31",
        is_active: true,
    },
];

const semesters: Semester[] = [
    {
        id: "sem-1",
        academic_session_id: "ses-2",
        name: "1st Semester",
        sequence_no: 1,
        is_active: false,
    },
    {
        id: "sem-2",
        academic_session_id: "ses-2",
        name: "2nd Semester",
        sequence_no: 2,
        is_active: true,
    },
    {
        id: "sem-3",
        academic_session_id: "ses-1",
        name: "1st Semester",
        sequence_no: 1,
        is_active: false,
    },
    {
        id: "sem-4",
        academic_session_id: "ses-1",
        name: "2nd Semester",
        sequence_no: 2,
        is_active: false,
    },
];

const programs: Program[] = [
    { id: "prg-1", name: "B.Sc. Computer Science", code: "CSC" },
    { id: "prg-2", name: "B.Sc. Mechanical Engineering", code: "MEE" },
    { id: "prg-3", name: "B.A. Economics", code: "ECO" },
    { id: "prg-4", name: "B.Sc. Biochemistry", code: "BCH" },
];

const feeStructures: FeeStructure[] = [
    {
        id: "fs-1",
        academic_session_id: "ses-2",
        semester_id: "sem-1",
        program_id: "prg-1",
        level: 100,
        total_amount: 150000,
        description: "Fresh student fees – Comp Sci, 100L, 1st Sem",
    },
    {
        id: "fs-2",
        academic_session_id: "ses-2",
        semester_id: "sem-2",
        program_id: "prg-1",
        level: 100,
        total_amount: 120000,
        description: "Comp Sci, 100L, 2nd Sem",
    },
    {
        id: "fs-3",
        academic_session_id: "ses-2",
        semester_id: "sem-1",
        program_id: "prg-2",
        level: 100,
        total_amount: 180000,
        description: "Fresh student fees – Mech Eng, 100L, 1st Sem",
    },
    {
        id: "fs-4",
        academic_session_id: "ses-2",
        semester_id: "sem-2",
        program_id: "prg-2",
        level: 100,
        total_amount: 140000,
        description: "Mech Eng, 100L, 2nd Sem",
    },
];

// ── Academic Sessions API ───────────────────

export const dummySessionApi = {
    async list() {
        await delay();
        return { data: [...sessions], total: sessions.length };
    },

    async getById(id: string) {
        await delay(200);
        const s = sessions.find((x) => x.id === id);
        if (!s) throw new Error("Session not found");
        return { data: s };
    },

    async create(payload: CreateAcademicSessionPayload) {
        await delay(500);
        const item: AcademicSession = { id: uid(), ...payload };
        sessions.push(item);
        return { data: item, message: "Session created" };
    },

    async update(id: string, payload: UpdateAcademicSessionPayload) {
        await delay(500);
        const idx = sessions.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Session not found");
        sessions[idx] = { ...sessions[idx], ...payload };
        return { data: sessions[idx], message: "Session updated" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = sessions.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Session not found");
        sessions.splice(idx, 1);
        return { message: "Session deleted" };
    },

    async activate(id: string) {
        await delay(500);
        // Deactivate all, then activate the one
        sessions.forEach((s) => (s.is_active = false));
        const s = sessions.find((x) => x.id === id);
        if (!s) throw new Error("Session not found");
        s.is_active = true;
        return { data: s, message: "Session activated" };
    },
};

// ── Semesters API ───────────────────────────

export const dummySemesterApi = {
    async listBySession(sessionId: string) {
        await delay();
        const filtered = semesters.filter(
            (s) => s.academic_session_id === sessionId
        );
        return { data: filtered, total: filtered.length };
    },

    async create(payload: CreateSemesterPayload) {
        await delay(500);
        const item: Semester = { id: uid(), ...payload };
        semesters.push(item);
        return { data: item, message: "Semester created" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = semesters.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Semester not found");
        semesters.splice(idx, 1);
        return { message: "Semester deleted" };
    },

    async activate(id: string) {
        await delay(500);
        // Deactivate all semesters in the same session, activate this one
        const target = semesters.find((x) => x.id === id);
        if (!target) throw new Error("Semester not found");
        semesters
            .filter((s) => s.academic_session_id === target.academic_session_id)
            .forEach((s) => (s.is_active = false));
        target.is_active = true;
        return { data: target, message: "Semester activated" };
    },
};

// ── Fee Structures API ──────────────────────

export const dummyFeeStructureApi = {
    async listBySession(sessionId: string) {
        await delay();
        const filtered = feeStructures.filter(
            (f) => f.academic_session_id === sessionId
        );
        return { data: filtered, total: filtered.length };
    },

    async create(payload: CreateFeeStructurePayload) {
        await delay(500);
        const item: FeeStructure = { id: uid(), ...payload };
        feeStructures.push(item);
        return { data: item, message: "Fee structure created" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = feeStructures.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Fee structure not found");
        feeStructures.splice(idx, 1);
        return { message: "Fee structure deleted" };
    },
};

// ── Programs API (read-only lookup) ─────────

export const dummyProgramApi = {
    async list() {
        await delay(200);
        return { data: [...programs], total: programs.length };
    },
};

// ── Fee Account Generation ──────────────────

export const dummyFeeAccountApi = {
    async generate(
        payload: GenerateFeeAccountsPayload
    ): Promise<GenerateFeeAccountsResponse> {
        await delay(1500); // Simulate heavy operation

        // Count how many fee structures exist for this session
        const structureCount = feeStructures.filter(
            (f) => f.academic_session_id === payload.academic_session_id
        ).length;

        // Simulate: 47 students × however many structures matched
        const studentsEnrolled = 47;
        const generated = studentsEnrolled * Math.max(structureCount, 1);

        return {
            generated_count: generated,
            message: `Successfully generated fee accounts for ${studentsEnrolled} enrolled students across ${structureCount} fee structure(s).`,
        };
    },
};

// ── Fresher Fee Items ───────────────────────

const fresherFees: FresherFeeItem[] = [
    { id: "ff-1", academic_session_id: "ses-2", name: "Application Fee", amount: 10000 },
    { id: "ff-2", academic_session_id: "ses-2", name: "Acceptance Fee", amount: 30000 },
    { id: "ff-3", academic_session_id: "ses-2", name: "Matriculation Fee", amount: 5000 },
    { id: "ff-4", academic_session_id: "ses-1", name: "Application Fee", amount: 10000 },
    { id: "ff-5", academic_session_id: "ses-1", name: "Acceptance Fee", amount: 25000 },
];

export const dummyFresherFeeApi = {
    async listBySession(sessionId: string) {
        await delay();
        const filtered = fresherFees.filter(
            (f) => f.academic_session_id === sessionId
        );
        return { data: filtered, total: filtered.length };
    },

    async create(payload: CreateFresherFeePayload) {
        await delay(500);
        const item: FresherFeeItem = { id: uid(), ...payload };
        fresherFees.push(item);
        return { data: item, message: "Fresher fee created" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = fresherFees.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Fresher fee not found");
        fresherFees.splice(idx, 1);
        return { message: "Fresher fee deleted" };
    },
};

// ── Other Fee Items ─────────────────────────

const otherFees: OtherFeeItem[] = [
    {
        id: "of-1",
        academic_session_id: "ses-2",
        semester_id: "",
        level: 0,
        name: "Library Fee",
        amount: 5000,
        description: "Annual library access for all students",
    },
    {
        id: "of-2",
        academic_session_id: "ses-2",
        semester_id: "sem-1",
        level: 100,
        name: "Lab Coat & Safety Kit",
        amount: 3500,
        description: "Required for science students, 1st semester only",
    },
    {
        id: "of-3",
        academic_session_id: "ses-2",
        semester_id: "",
        level: 0,
        name: "Sports & Recreation Fee",
        amount: 2000,
        description: "Covers gym and sports facilities",
    },
];

export const dummyOtherFeeApi = {
    async listBySession(sessionId: string) {
        await delay();
        const filtered = otherFees.filter(
            (f) => f.academic_session_id === sessionId
        );
        return { data: filtered, total: filtered.length };
    },

    async create(payload: CreateOtherFeePayload) {
        await delay(500);
        const item: OtherFeeItem = { id: uid(), ...payload };
        otherFees.push(item);
        return { data: item, message: "Other fee created" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = otherFees.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Other fee not found");
        otherFees.splice(idx, 1);
        return { message: "Other fee deleted" };
    },
};

// ── Admission Cycles ────────────────────────

const now = new Date().toISOString();

const admissionCycles: AdmissionCycle[] = [
    {
        id: "adc-1",
        academic_session_id: "ses-2",
        status: "open",
        application_start_date: "2024-06-01",
        application_end_date: "2024-09-30",
        late_application_allowed: true,
        late_application_fee: 5000,
        max_applications: 0,
        require_documents: true,
        required_documents: ["O'Level Result", "Birth Certificate", "Passport Photograph"],
        notification_email: "admissions@qhub.edu.ng",
        instructions: "All applicants must upload valid O'Level results and a recent passport photograph. Late applications attract an additional fee.",
        created_at: now,
        updated_at: now,
    },
    {
        id: "adc-2",
        academic_session_id: "ses-1",
        status: "closed",
        application_start_date: "2023-06-01",
        application_end_date: "2023-09-15",
        late_application_allowed: false,
        late_application_fee: 0,
        max_applications: 500,
        require_documents: true,
        required_documents: ["O'Level Result", "Birth Certificate"],
        notification_email: "admissions@qhub.edu.ng",
        instructions: "Admission for the 2023/2024 session is now closed.",
        created_at: now,
        updated_at: now,
    },
];

const admissionRequirements: AdmissionRequirement[] = [
    {
        id: "ar-1",
        admission_cycle_id: "adc-1",
        program_id: "",
        min_age: 16,
        max_age: 0,
        min_credits: 5,
        required_subjects: ["Mathematics", "English Language"],
        description: "General minimum requirement for all programs",
    },
    {
        id: "ar-2",
        admission_cycle_id: "adc-1",
        program_id: "prg-1",
        min_age: 16,
        max_age: 0,
        min_credits: 5,
        required_subjects: ["Mathematics", "English Language", "Physics"],
        description: "Computer Science requires Physics in addition to general requirements",
    },
    {
        id: "ar-3",
        admission_cycle_id: "adc-1",
        program_id: "prg-2",
        min_age: 16,
        max_age: 0,
        min_credits: 5,
        required_subjects: ["Mathematics", "English Language", "Physics", "Chemistry"],
        description: "Mechanical Engineering requires Physics and Chemistry",
    },
];

export const dummyAdmissionCycleApi = {
    async listBySession(sessionId: string) {
        await delay();
        const filtered = admissionCycles.filter(
            (c) => c.academic_session_id === sessionId
        );
        return { data: filtered, total: filtered.length };
    },

    async getById(id: string) {
        await delay(200);
        const c = admissionCycles.find((x) => x.id === id);
        if (!c) throw new Error("Admission cycle not found");
        return { data: c };
    },

    async create(payload: CreateAdmissionCyclePayload) {
        await delay(500);
        const item: AdmissionCycle = {
            id: uid(),
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        admissionCycles.push(item);
        return { data: item, message: "Admission cycle created" };
    },

    async update(id: string, payload: UpdateAdmissionCyclePayload) {
        await delay(500);
        const idx = admissionCycles.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Admission cycle not found");
        admissionCycles[idx] = {
            ...admissionCycles[idx],
            ...payload,
            updated_at: new Date().toISOString(),
        };
        return { data: admissionCycles[idx], message: "Admission cycle updated" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = admissionCycles.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Admission cycle not found");
        admissionCycles.splice(idx, 1);
        // also remove related requirements
        for (let i = admissionRequirements.length - 1; i >= 0; i--) {
            if (admissionRequirements[i].admission_cycle_id === id) {
                admissionRequirements.splice(i, 1);
            }
        }
        return { message: "Admission cycle deleted" };
    },

    async updateStatus(id: string, status: "draft" | "open" | "closed") {
        await delay(500);
        const cycle = admissionCycles.find((x) => x.id === id);
        if (!cycle) throw new Error("Admission cycle not found");
        cycle.status = status;
        cycle.updated_at = new Date().toISOString();
        return { data: cycle, message: `Admission ${status === "open" ? "opened" : status === "closed" ? "closed" : "set to draft"}` };
    },
};

export const dummyAdmissionRequirementApi = {
    async listByCycle(cycleId: string) {
        await delay();
        const filtered = admissionRequirements.filter(
            (r) => r.admission_cycle_id === cycleId
        );
        return { data: filtered, total: filtered.length };
    },

    async create(payload: CreateAdmissionRequirementPayload) {
        await delay(500);
        const item: AdmissionRequirement = { id: uid(), ...payload };
        admissionRequirements.push(item);
        return { data: item, message: "Requirement created" };
    },

    async remove(id: string) {
        await delay(300);
        const idx = admissionRequirements.findIndex((x) => x.id === id);
        if (idx === -1) throw new Error("Requirement not found");
        admissionRequirements.splice(idx, 1);
        return { message: "Requirement deleted" };
    },
};
