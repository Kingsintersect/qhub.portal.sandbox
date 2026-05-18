// ─── Lecturer Course Assignment Types ────────────────────────────────────────

export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";

export interface ClassScheduleSlot {
    day: DayOfWeek;
    startTime: string; // "HH:MM" 24-hour
    endTime: string;
    venue: string;
}

export interface AssignedCourse {
    id: string;
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    programName: string;
    programCode: string;
    level: number;
    semesterId: string;
    semesterName: string;
    academicYear: string;
    registeredStudents: number;
    schedule: ClassScheduleSlot[];
}

export interface UpdateSchedulePayload {
    courseId: string;
    schedule: ClassScheduleSlot[];
}
