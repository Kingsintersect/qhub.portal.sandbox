import type {
    AuditLog,
    AuditEntityLog,
    AuditStats,
    AuditAction,
    AuditEntityType,
    AuditUser,
} from "../types/audit.types";

// ─── Seed: users ─────────────────────────────────────────────────────────────

const USERS: Record<number, AuditUser> = {
    1: { firstName: "Chukwuemeka", lastName: "Okonkwo", email: "c.okonkwo@unilag.edu.ng" },
    2: { firstName: "Adaeze", lastName: "Nwachukwu", email: "a.nwachukwu@unilag.edu.ng" },
    3: { firstName: "Babatunde", lastName: "Adeyemi", email: "b.adeyemi@unilag.edu.ng" },
    4: { firstName: "Ngozi", lastName: "Okoye", email: "n.okoye@unilag.edu.ng" },
    5: { firstName: "Amaka", lastName: "Ezenwachi", email: "u21sc1234@unilag.edu.ng" },
    6: { firstName: "Emeka", lastName: "Nwosu", email: "u22cs0087@unilag.edu.ng" },
    7: { firstName: "Fatima", lastName: "Garba", email: "f.garba@unilag.edu.ng" },
    8: { firstName: "Yemi", lastName: "Ajayi", email: "y.ajayi@unilag.edu.ng" },
};

const IPS: Array<string | null> = [
    "10.0.1.1", "10.0.1.5", "192.168.1.23", "192.168.2.10",
    "203.178.12.5", "196.219.4.8", "10.0.2.7", null,
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const UA_MOB = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Mobile Safari/537.36";

// ─── Builder ──────────────────────────────────────────────────────────────────

function mkLog(
    id: number,
    userId: number,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: number,
    createdAt: string,
    oldValues: Record<string, unknown> | null = null,
    newValues: Record<string, unknown> | null = null,
    ipIdx = 0,
    mobile = false,
): AuditLog {
    return {
        id,
        userId,
        user: USERS[userId],
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress: IPS[ipIdx] ?? null,
        userAgent: mobile ? UA_MOB : UA,
        createdAt,
    };
}

// ─── Raw log seed (60 records) ────────────────────────────────────────────────

export const ALL_AUDIT_LOGS: AuditLog[] = [
    // ── Oct 2024 – 1st Semester begins ───────────────────────────────────────
    mkLog(1, 1, "LOGIN", "User", 1, "2024-10-07T08:15:00Z", null, null, 0),
    mkLog(2, 2, "LOGIN", "User", 2, "2024-10-07T09:00:00Z", null, null, 1),
    mkLog(3, 2, "CREATE", "Course", 101, "2024-10-08T10:30:00Z", null, { code: "CS301", title: "Data Structures", creditUnits: 3, semester: "First" }, 1),
    mkLog(4, 2, "CREATE", "Course", 102, "2024-10-08T10:45:00Z", null, { code: "CS401", title: "Algorithm Design", creditUnits: 3, semester: "First" }, 1),
    mkLog(5, 2, "CREATE", "Course", 103, "2024-10-09T11:00:00Z", null, { code: "EEE201", title: "Electronics I", creditUnits: 2, semester: "First" }, 1),
    mkLog(6, 3, "LOGIN", "User", 3, "2024-10-10T08:00:00Z", null, null, 2),
    mkLog(7, 5, "LOGIN", "User", 5, "2024-10-10T09:30:00Z", null, null, 3, true),
    mkLog(8, 5, "ENROLL", "StudentEnrollment", 1001, "2024-10-10T09:45:00Z", null, { studentId: 5, courseId: 101, academicYear: "2024/2025", semester: "First" }, 3, true),
    mkLog(9, 5, "ENROLL", "StudentEnrollment", 1002, "2024-10-10T09:46:00Z", null, { studentId: 5, courseId: 102, academicYear: "2024/2025", semester: "First" }, 3, true),
    mkLog(10, 6, "LOGIN", "User", 6, "2024-10-11T10:00:00Z", null, null, 4, true),
    mkLog(11, 6, "ENROLL", "StudentEnrollment", 1003, "2024-10-11T10:05:00Z", null, { studentId: 6, courseId: 103, academicYear: "2024/2025", semester: "First" }, 4, true),

    // ── Nov 2024 – Grade entry ────────────────────────────────────────────────
    mkLog(12, 1, "UPDATE", "Setting", 1, "2024-11-01T08:30:00Z", { allowGradeEntry: false }, { allowGradeEntry: true }, 0),
    mkLog(13, 3, "CREATE", "Grade", 2001, "2024-11-15T14:00:00Z", null, { studentId: 5, courseId: 101, caScore: 22, examScore: 0 }, 2),
    mkLog(14, 3, "CREATE", "Grade", 2002, "2024-11-15T14:05:00Z", null, { studentId: 6, courseId: 101, caScore: 18, examScore: 0 }, 2),
    mkLog(15, 4, "CREATE", "Grade", 2003, "2024-11-16T11:00:00Z", null, { studentId: 5, courseId: 103, caScore: 25, examScore: 0 }, 2),
    mkLog(16, 4, "LOGIN", "User", 4, "2024-11-16T10:55:00Z", null, null, 2),
    mkLog(17, 7, "LOGIN", "User", 7, "2024-11-20T09:00:00Z", null, null, 5),
    mkLog(18, 7, "CREATE", "Invoice", 3001, "2024-11-20T09:15:00Z", null, { studentId: 5, type: "Tuition", amount: 195000, academicYear: "2024/2025" }, 5),
    mkLog(19, 7, "CREATE", "Invoice", 3002, "2024-11-20T09:18:00Z", null, { studentId: 6, type: "Tuition", amount: 195000, academicYear: "2024/2025" }, 5),

    // ── Dec 2024 – Exams ──────────────────────────────────────────────────────
    mkLog(20, 5, "PAYMENT", "Payment", 4001, "2024-12-02T11:00:00Z", null, { invoiceId: 3001, amount: 195000, method: "Remita", ref: "REM2024120001" }, 4, true),
    mkLog(21, 6, "PAYMENT", "Payment", 4002, "2024-12-03T13:00:00Z", null, { invoiceId: 3002, amount: 97500, method: "Remita", ref: "REM2024120002" }, 4, true),
    mkLog(22, 3, "UPDATE", "Grade", 2001, "2024-12-10T16:00:00Z", { caScore: 22, examScore: 0 }, { caScore: 22, examScore: 55 }, 2),
    mkLog(23, 3, "UPDATE", "Grade", 2002, "2024-12-10T16:05:00Z", { caScore: 18, examScore: 0 }, { caScore: 18, examScore: 47 }, 2),
    mkLog(24, 4, "UPDATE", "Grade", 2003, "2024-12-11T14:30:00Z", { caScore: 25, examScore: 0 }, { caScore: 25, examScore: 62 }, 2),
    mkLog(25, 2, "LOGOUT", "User", 2, "2024-12-20T17:00:00Z", null, null, 1),

    // ── Jan 2025 – Grade approval ─────────────────────────────────────────────
    mkLog(26, 1, "APPROVE", "Grade", 2001, "2025-01-08T10:00:00Z", null, { status: "approved", approvedBy: 1 }, 0),
    mkLog(27, 1, "APPROVE", "Grade", 2002, "2025-01-08T10:02:00Z", null, { status: "approved", approvedBy: 1 }, 0),
    mkLog(28, 1, "APPROVE", "Grade", 2003, "2025-01-08T10:04:00Z", null, { status: "approved", approvedBy: 1 }, 0),
    mkLog(29, 8, "LOGIN", "User", 8, "2025-01-10T08:00:00Z", null, null, 6),
    mkLog(30, 8, "CREATE", "Clearance", 5001, "2025-01-10T08:30:00Z", null, { studentId: 5, semester: "First", academicYear: "2024/2025" }, 6),
    mkLog(31, 1, "APPROVE", "Clearance", 5001, "2025-01-12T11:00:00Z", null, { status: "approved", approvedBy: 1 }, 0),
    mkLog(32, 2, "SYNC", "MoodleUser", 5, "2025-01-15T02:00:00Z", null, { moodleId: "u21sc1234", synced: true }, 1),
    mkLog(33, 2, "SYNC", "MoodleUser", 6, "2025-01-15T02:01:00Z", null, { moodleId: "u22cs0087", synced: true }, 1),

    // ── Feb 2025 – 2nd Semester ───────────────────────────────────────────────
    mkLog(34, 1, "UPDATE", "Setting", 1, "2025-02-03T09:00:00Z", { semesterActive: "First" }, { semesterActive: "Second" }, 0),
    mkLog(35, 2, "CREATE", "Course", 104, "2025-02-04T10:00:00Z", null, { code: "CS302", title: "Database Systems", creditUnits: 3, semester: "Second" }, 1),
    mkLog(36, 2, "CREATE", "Course", 105, "2025-02-04T10:10:00Z", null, { code: "EEE301", title: "Digital Electronics", creditUnits: 3, semester: "Second" }, 1),
    mkLog(37, 5, "ENROLL", "StudentEnrollment", 1004, "2025-02-05T09:00:00Z", null, { studentId: 5, courseId: 104, academicYear: "2024/2025", semester: "Second" }, 3, true),
    mkLog(38, 6, "ENROLL", "StudentEnrollment", 1005, "2025-02-05T09:05:00Z", null, { studentId: 6, courseId: 105, academicYear: "2024/2025", semester: "Second" }, 4, true),
    mkLog(39, 3, "UPDATE", "Lecturer", 3, "2025-02-10T14:00:00Z", { office: "Block C, Room 12" }, { office: "Block D, Room 05" }, 2),

    // ── Mar 2025 ──────────────────────────────────────────────────────────────
    mkLog(40, 7, "CREATE", "Invoice", 3003, "2025-03-01T09:00:00Z", null, { studentId: 5, type: "Acceptance", amount: 30000, academicYear: "2024/2025" }, 5),
    mkLog(41, 5, "PAYMENT", "Payment", 4003, "2025-03-03T14:00:00Z", null, { invoiceId: 3003, amount: 30000, method: "Remita", ref: "REM2025030001" }, 3, true),
    mkLog(42, 1, "DELETE", "Announcement", 601, "2025-03-15T11:00:00Z", { title: "Old Notice", body: "Outdated info" }, null, 0),
    mkLog(43, 2, "CREATE", "Announcement", 602, "2025-03-15T11:30:00Z", null, { title: "2nd Semester Timetable Released", body: "Check portal" }, 1),

    // ── Apr 2025 ──────────────────────────────────────────────────────────────
    mkLog(44, 3, "CREATE", "Grade", 2004, "2025-04-10T14:00:00Z", null, { studentId: 5, courseId: 104, caScore: 27, examScore: 0 }, 2),
    mkLog(45, 4, "CREATE", "Grade", 2005, "2025-04-10T14:30:00Z", null, { studentId: 6, courseId: 105, caScore: 20, examScore: 0 }, 2),
    mkLog(46, 6, "PAYMENT", "Payment", 4004, "2025-04-15T12:00:00Z", null, { invoiceId: 3002, amount: 97500, method: "Bank", ref: "BANK2025040001" }, 4, true),
    mkLog(47, 1, "REJECT", "Grade", 2004, "2025-04-20T10:00:00Z", null, { status: "rejected", reason: "CA score out of range" }, 0),
    mkLog(48, 3, "UPDATE", "Grade", 2004, "2025-04-21T15:00:00Z", { caScore: 27 }, { caScore: 24 }, 2),
    mkLog(49, 1, "APPROVE", "Grade", 2004, "2025-04-22T09:00:00Z", null, { status: "approved" }, 0),

    // ── May 2025 ──────────────────────────────────────────────────────────────
    mkLog(50, 4, "UPDATE", "Grade", 2005, "2025-05-02T14:00:00Z", { caScore: 20, examScore: 0 }, { caScore: 20, examScore: 58 }, 2),
    mkLog(51, 3, "UPDATE", "Grade", 2004, "2025-05-02T14:10:00Z", { caScore: 24, examScore: 0 }, { caScore: 24, examScore: 67 }, 2),
    mkLog(52, 1, "APPROVE", "Grade", 2005, "2025-05-05T10:00:00Z", null, { status: "approved" }, 0),
    mkLog(53, 2, "SYNC", "MoodleEnrollment", 1004, "2025-05-06T02:00:00Z", null, { synced: true, moodleCourseId: 304 }, 1),
    mkLog(54, 2, "SYNC", "MoodleEnrollment", 1005, "2025-05-06T02:01:00Z", null, { synced: true, moodleCourseId: 305 }, 1),

    // ── Oct 2025 – New academic year ──────────────────────────────────────────
    mkLog(55, 1, "UPDATE", "Setting", 1, "2025-10-01T09:00:00Z", { currentAcademicYear: "2024/2025" }, { currentAcademicYear: "2025/2026" }, 0),
    mkLog(56, 2, "CREATE", "Course", 106, "2025-10-02T10:00:00Z", null, { code: "CS501", title: "Machine Learning", creditUnits: 3, semester: "First" }, 1),
    mkLog(57, 5, "ENROLL", "StudentEnrollment", 1006, "2025-10-03T09:00:00Z", null, { studentId: 5, courseId: 106, academicYear: "2025/2026", semester: "First" }, 3, true),
    mkLog(58, 8, "CREATE", "Document", 701, "2025-10-10T14:00:00Z", null, { type: "Transcript", studentId: 5, generated: true }, 6),
    mkLog(59, 1, "DELETE", "User", 99, "2025-11-01T09:00:00Z", { email: "spam@fake.com", role: "Student" }, null, 0),
    mkLog(60, 2, "LOGIN", "User", 2, "2025-11-15T08:30:00Z", null, null, 1),

    // ── Recent (2025-12 → 2026-05) ────────────────────────────────────────────
    mkLog(61, 7, "CREATE", "Invoice", 3004, "2025-12-01T09:00:00Z", null, { studentId: 5, type: "Tuition", amount: 210000, academicYear: "2025/2026" }, 5),
    mkLog(62, 5, "PAYMENT", "Payment", 4005, "2025-12-05T11:00:00Z", null, { invoiceId: 3004, amount: 210000, method: "Remita", ref: "REM2025120001" }, 3, true),
    mkLog(63, 3, "CREATE", "Grade", 2006, "2026-01-20T14:00:00Z", null, { studentId: 5, courseId: 106, caScore: 28, examScore: 0 }, 2),
    mkLog(64, 1, "APPROVE", "Grade", 2006, "2026-02-10T10:00:00Z", null, { status: "approved" }, 0),
    mkLog(65, 2, "SYNC", "MoodleUser", 5, "2026-02-15T02:00:00Z", null, { synced: true, lastSync: "2026-02-15" }, 1),
    mkLog(66, 6, "LOGIN", "User", 6, "2026-03-01T08:00:00Z", null, null, 4, true),
    mkLog(67, 4, "UPDATE", "Grade", 2006, "2026-03-05T15:00:00Z", { examScore: 0 }, { examScore: 71 }, 2),
    mkLog(68, 1, "REJECT", "Clearance", 5002, "2026-03-10T09:00:00Z", null, { reason: "Outstanding library fine" }, 0),
    mkLog(69, 8, "UPDATE", "Clearance", 5002, "2026-03-11T10:00:00Z", { status: "rejected" }, { status: "pending", note: "Fine paid" }, 6),
    mkLog(70, 1, "APPROVE", "Clearance", 5002, "2026-03-12T09:00:00Z", null, { status: "approved" }, 0),
    mkLog(71, 5, "LOGIN", "User", 5, "2026-04-01T08:30:00Z", null, null, 3, true),
    mkLog(72, 7, "CREATE", "Invoice", 3005, "2026-04-15T09:00:00Z", null, { studentId: 6, type: "Tuition", amount: 210000, academicYear: "2025/2026" }, 5),
    mkLog(73, 6, "PAYMENT", "Payment", 4006, "2026-04-16T13:00:00Z", null, { invoiceId: 3005, amount: 210000, method: "Remita", ref: "REM2026040001" }, 4, true),
    mkLog(74, 3, "LOGIN", "User", 3, "2026-05-01T08:00:00Z", null, null, 2),
    mkLog(75, 1, "LOGIN", "User", 1, "2026-05-03T07:45:00Z", null, null, 0),
    mkLog(76, 2, "UPDATE", "Course", 106, "2026-05-03T09:30:00Z", { title: "Machine Learning" }, { title: "Machine Learning & AI" }, 1),
    mkLog(77, 1, "APPROVE", "Grade", 2006, "2026-05-03T10:00:00Z", null, { status: "final-approved" }, 0),
];

// ─── Filter helper ────────────────────────────────────────────────────────────

interface FilterOptions {
    action?: AuditAction | "";
    entityType?: AuditEntityType | "";
    userId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

function applyFilters(logs: AuditLog[], opts: FilterOptions): AuditLog[] {
    return logs.filter((log) => {
        if (opts.action && log.action !== opts.action) return false;
        if (opts.entityType && log.entityType !== opts.entityType) return false;
        if (opts.userId && log.userId !== opts.userId) return false;
        if (opts.startDate) {
            const start = new Date(opts.startDate);
            if (new Date(log.createdAt) < start) return false;
        }
        if (opts.endDate) {
            const end = new Date(opts.endDate);
            end.setHours(23, 59, 59, 999);
            if (new Date(log.createdAt) > end) return false;
        }
        if (opts.search) {
            const q = opts.search.toLowerCase();
            const fullName = `${log.user.firstName} ${log.user.lastName}`.toLowerCase();
            return (
                fullName.includes(q) ||
                log.user.email.toLowerCase().includes(q) ||
                log.action.toLowerCase().includes(q) ||
                log.entityType.toLowerCase().includes(q) ||
                String(log.entityId).includes(q)
            );
        }
        return true;
    });
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export function getDummyAuditLogs(
    page: number,
    limit: number,
    filters: FilterOptions = {},
): { data: AuditLog[]; meta: { total: number; page: number; limit: number } } {
    const sorted = [...ALL_AUDIT_LOGS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const filtered = applyFilters(sorted, filters);
    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    return {
        data: slice,
        meta: { total: filtered.length, page, limit },
    };
}

export function getDummyEntityLogs(
    entityType: string,
    entityId: number,
): { data: AuditEntityLog[] } {
    const logs = ALL_AUDIT_LOGS.filter(
        (l) => l.entityType === entityType && l.entityId === entityId,
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
        data: logs.map(({ id, userId, user, action, oldValues, newValues, createdAt }) => ({
            id,
            userId,
            user: { firstName: user.firstName, lastName: user.lastName },
            action,
            oldValues,
            newValues,
            createdAt,
        })),
    };
}

// ─── Stats (hardcoded for demo) ───────────────────────────────────────────────

export const DUMMY_AUDIT_STATS: AuditStats = {
    totalLogs: ALL_AUDIT_LOGS.length,
    todayLogs: 3,
    uniqueUsers: 8,
    criticalActions: ALL_AUDIT_LOGS.filter((l) =>
        (["DELETE", "REJECT", "APPROVE"] as AuditAction[]).includes(l.action),
    ).length,

    actionBreakdown: (
        [
            "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE",
            "APPROVE", "REJECT", "ENROLL", "PAYMENT", "SYNC",
        ] as AuditAction[]
    ).map((action) => {
        const count = ALL_AUDIT_LOGS.filter((l) => l.action === action).length;
        return {
            action,
            count,
            percentage: Math.round((count / ALL_AUDIT_LOGS.length) * 100),
        };
    }),

    entityBreakdown: (
        [
            "Grade", "User", "Course", "StudentEnrollment", "Payment",
            "Invoice", "Clearance", "MoodleUser", "MoodleEnrollment",
            "Setting", "Announcement", "Document", "Lecturer",
        ] as AuditEntityType[]
    )
        .map((entityType) => ({
            entityType,
            count: ALL_AUDIT_LOGS.filter((l) => l.entityType === entityType).length,
        }))
        .filter((e) => e.count > 0),

    // Last 14 days (relative to May 3, 2026 in context)
    dailyActivity: [
        { date: "2026-04-20", count: 4, logins: 2, mutations: 2 },
        { date: "2026-04-21", count: 2, logins: 1, mutations: 1 },
        { date: "2026-04-22", count: 3, logins: 1, mutations: 2 },
        { date: "2026-04-23", count: 1, logins: 0, mutations: 1 },
        { date: "2026-04-24", count: 5, logins: 2, mutations: 3 },
        { date: "2026-04-25", count: 0, logins: 0, mutations: 0 },
        { date: "2026-04-26", count: 0, logins: 0, mutations: 0 },
        { date: "2026-04-27", count: 6, logins: 3, mutations: 3 },
        { date: "2026-04-28", count: 4, logins: 2, mutations: 2 },
        { date: "2026-04-29", count: 3, logins: 1, mutations: 2 },
        { date: "2026-04-30", count: 7, logins: 3, mutations: 4 },
        { date: "2026-05-01", count: 5, logins: 2, mutations: 3 },
        { date: "2026-05-02", count: 4, logins: 2, mutations: 2 },
        { date: "2026-05-03", count: 3, logins: 2, mutations: 1 },
    ],

    // Hourly distribution (typical university working hours spike pattern)
    hourlyActivity: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        count:
            h < 7 || h > 21
                ? Math.floor(Math.random() * 2)
                : h === 2 // Moodle sync at 2 AM
                    ? 8
                    : h >= 8 && h <= 16
                        ? 10 + Math.floor(Math.sin(((h - 8) / 8) * Math.PI) * 15)
                        : 3 + Math.floor(Math.random() * 5),
    })),
};
