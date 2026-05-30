import type { z } from "zod";
import type {
    CreateScheduleSchema,
    UpdateScheduleSchema,
    ScheduleFilterSchema,
} from "../schemas/schedule.schema";
import type { CalendarEventFilterSchema } from "../schemas/calendar-event.schema";

// ── Inferred from schemas ──────────────────────────────────────────────────────

export type CreateScheduleDto = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleDto = z.infer<typeof UpdateScheduleSchema>;
export type ScheduleFilter = z.infer<typeof ScheduleFilterSchema>;
export type CalendarEventFilter = z.infer<typeof CalendarEventFilterSchema>;

// ── Enum literals ─────────────────────────────────────────────────────────────

export type DayOfWeek =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export type ClassType = "LECTURE" | "LAB" | "TUTORIAL" | "SEMINAR";
export type EventType = "course" | "site" | "user" | "zoom";

// ── Response interfaces ────────────────────────────────────────────────────────

export interface TimetableSlot {
    id: number;
    dayOfWeek: DayOfWeek;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    venue: string;
    classType: ClassType;
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    lecturerName: string;
    offeringId: number;
}

export type TimetableGrouped = Partial<Record<DayOfWeek, TimetableSlot[]>>;

export interface CalendarEvent {
    id: number;
    eventType: EventType;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    meetingUrl: string | null;
    isVisible: boolean;
    courseCode?: string;
    courseTitle?: string;
}

export interface Semester {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    registrationStart: string | null;
    registrationEnd: string | null;
}

export interface AcademicCalendarMeta {
    session: { id: number; name: string; startDate: string; endDate: string };
    semesters: Semester[];
    currentSemester: Semester | null;
}

export interface BusySlot {
    startTime: string;
    endTime: string;
    courseCode: string;
    lecturerName: string;
}

export interface TimeWindow {
    startTime: string;
    endTime: string;
}

export interface VenueAvailability {
    venue: string;
    dayOfWeek: DayOfWeek;
    busySlots: BusySlot[];
    freeWindows: TimeWindow[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
