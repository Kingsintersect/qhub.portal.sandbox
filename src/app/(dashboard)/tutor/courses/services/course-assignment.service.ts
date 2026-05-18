// ─── Lecturer Course Assignment Service (Mock) ────────────────────────────────

import type {
    AssignedCourse,
    ClassScheduleSlot,
    UpdateSchedulePayload,
} from "../types/course-assignment.types";

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

// ─── In-memory seed data ─────────────────────────────────────────────────────

const assignedCourses: AssignedCourse[] = [
    {
        id: "ac-1",
        courseCode: "CSC301",
        courseTitle: "Data Structures & Algorithms",
        creditUnits: 3,
        programName: "B.Sc. Computer Science",
        programCode: "CSC",
        level: 300,
        semesterId: "sem-6",
        semesterName: "Second Semester",
        academicYear: "2024/2025",
        registeredStudents: 68,
        schedule: [
            { day: "Monday", startTime: "08:00", endTime: "10:00", venue: "LT-A Block 1" },
            { day: "Wednesday", startTime: "12:00", endTime: "13:00", venue: "LT-A Block 1" },
        ],
    },
    {
        id: "ac-2",
        courseCode: "CSC303",
        courseTitle: "Operating Systems",
        creditUnits: 3,
        programName: "B.Sc. Computer Science",
        programCode: "CSC",
        level: 300,
        semesterId: "sem-6",
        semesterName: "Second Semester",
        academicYear: "2024/2025",
        registeredStudents: 61,
        schedule: [
            { day: "Tuesday", startTime: "10:00", endTime: "12:00", venue: "LT-B Block 2" },
        ],
    },
    {
        id: "ac-3",
        courseCode: "CSC201",
        courseTitle: "Discrete Mathematics",
        creditUnits: 2,
        programName: "B.Sc. Computer Science",
        programCode: "CSC",
        level: 200,
        semesterId: "sem-6",
        semesterName: "Second Semester",
        academicYear: "2024/2025",
        registeredStudents: 94,
        schedule: [],
    },
    {
        id: "ac-4",
        courseCode: "EEE305",
        courseTitle: "Electronic Devices",
        creditUnits: 2,
        programName: "B.Sc. Electrical & Electronics Eng.",
        programCode: "EEE",
        level: 300,
        semesterId: "sem-6",
        semesterName: "Second Semester",
        academicYear: "2024/2025",
        registeredStudents: 45,
        schedule: [
            { day: "Thursday", startTime: "14:00", endTime: "16:00", venue: "Eng. Lab 3" },
        ],
    },
    {
        id: "ac-5",
        courseCode: "CSC305",
        courseTitle: "Computer Organisation",
        creditUnits: 2,
        programName: "B.Sc. Computer Science",
        programCode: "CSC",
        level: 300,
        semesterId: "sem-6",
        semesterName: "Second Semester",
        academicYear: "2024/2025",
        registeredStudents: 58,
        schedule: [],
    },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export const courseAssignmentService = {
    /** Return all courses assigned to the authenticated lecturer for the current semester */
    async getAssignedCourses(): Promise<AssignedCourse[]> {
        await delay();
        // LIVE: return apiClient.get<AssignedCourse[]>("/lecturer/assigned-courses");
        return assignedCourses.map((c) => ({ ...c, schedule: [...c.schedule] }));
    },

    /** Persist an updated schedule for a single course */
    async updateSchedule(payload: UpdateSchedulePayload): Promise<AssignedCourse> {
        await delay(500);
        // LIVE: return apiClient.patch<AssignedCourse>(`/lecturer/assigned-courses/${payload.courseId}/schedule`, payload);
        const course = assignedCourses.find((c) => c.id === payload.courseId);
        if (!course) throw new Error("Course not found");
        course.schedule = payload.schedule.map((s) => ({ ...s } as ClassScheduleSlot));
        return { ...course, schedule: [...course.schedule] };
    },
};
