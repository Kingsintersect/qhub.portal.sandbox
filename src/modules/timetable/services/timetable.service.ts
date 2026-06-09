import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
// To switch to real API: import apiClient from "@/lib/clients/apiClient"; const AUTH = { access_token: true };
import type {
   AcademicCalendarMeta,
   CalendarEvent,
   CalendarEventFilter,
   CreateScheduleDto,
   DayOfWeek,
   PaginatedResponse,
   ScheduleFilter,
   Semester,
   TimetableGrouped,
   TimetableSlot,
   UpdateScheduleDto,
   VenueAvailability,
} from "../types/timetable.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));
let _idCounter = 200;
const uid = () => ++_idCounter;

// ── Mock schedule seed data ───────────────────────────────────────────────────

const mockSchedules: TimetableSlot[] = [
   {
      id: 1,
      dayOfWeek: "MONDAY",
      startTime: "08:00",
      endTime: "10:00",
      venue: "LT-1",
      classType: "LECTURE",
      courseCode: "CSC301",
      courseTitle: "Data Structures & Algorithms",
      creditUnits: 3,
      tutorName: "Dr. Aisha Bello",
      offeringId: 55,
   },
   {
      id: 2,
      dayOfWeek: "MONDAY",
      startTime: "14:00",
      endTime: "16:00",
      venue: "Lab-A",
      classType: "LAB",
      courseCode: "CSC303",
      courseTitle: "Operating Systems",
      creditUnits: 3,
      tutorName: "Dr. Emeka Chukwu",
      offeringId: 56,
   },
   {
      id: 3,
      dayOfWeek: "TUESDAY",
      startTime: "10:00",
      endTime: "12:00",
      venue: "LT-2",
      classType: "LECTURE",
      courseCode: "CSC303",
      courseTitle: "Operating Systems",
      creditUnits: 3,
      tutorName: "Dr. Emeka Chukwu",
      offeringId: 56,
   },
   {
      id: 4,
      dayOfWeek: "WEDNESDAY",
      startTime: "08:00",
      endTime: "10:00",
      venue: "LT-1",
      classType: "TUTORIAL",
      courseCode: "CSC301",
      courseTitle: "Data Structures & Algorithms",
      creditUnits: 3,
      tutorName: "Dr. Aisha Bello",
      offeringId: 55,
   },
   {
      id: 5,
      dayOfWeek: "WEDNESDAY",
      startTime: "14:00",
      endTime: "16:00",
      venue: "LT-3",
      classType: "LECTURE",
      courseCode: "MTH201",
      courseTitle: "Mathematical Methods I",
      creditUnits: 4,
      tutorName: "Prof. Amaka Nwosu",
      offeringId: 57,
   },
   {
      id: 6,
      dayOfWeek: "THURSDAY",
      startTime: "10:00",
      endTime: "12:00",
      venue: "Seminar-1",
      classType: "SEMINAR",
      courseCode: "CSC301",
      courseTitle: "Data Structures & Algorithms",
      creditUnits: 3,
      tutorName: "Dr. Aisha Bello",
      offeringId: 55,
   },
   {
      id: 7,
      dayOfWeek: "FRIDAY",
      startTime: "08:00",
      endTime: "10:00",
      venue: "Lab-B",
      classType: "LAB",
      courseCode: "MTH201",
      courseTitle: "Mathematical Methods I",
      creditUnits: 4,
      tutorName: "Prof. Amaka Nwosu",
      offeringId: 57,
   },
   {
      id: 8,
      dayOfWeek: "FRIDAY",
      startTime: "12:00",
      endTime: "14:00",
      venue: "LT-2",
      classType: "TUTORIAL",
      courseCode: "CSC303",
      courseTitle: "Operating Systems",
      creditUnits: 3,
      tutorName: "Dr. Emeka Chukwu",
      offeringId: 56,
   },
];

// ── Mock calendar event seed data ─────────────────────────────────────────────

const mockCalendarEvents: CalendarEvent[] = [
   {
      id: 1,
      eventType: "zoom",
      name: "CSC301 Live Lecture: Binary Search Trees",
      description: "Join via Zoom for the weekly live session covering BST insertions, deletions and rotations.",
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      meetingUrl: "https://zoom.us/j/mock-csc301",
      isVisible: true,
      courseCode: "CSC301",
      courseTitle: "Data Structures & Algorithms",
   },
   {
      id: 2,
      eventType: "course",
      name: "CSC303 Assignment 2 Due",
      description: "Deadline for the OS lab report on process scheduling. Submit via Moodle.",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: null,
      meetingUrl: null,
      isVisible: true,
      courseCode: "CSC303",
      courseTitle: "Operating Systems",
   },
   {
      id: 3,
      eventType: "site",
      name: "Faculty Academic Board Meeting",
      description: "All staff and student representatives are invited to attend the quarterly board meeting.",
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      meetingUrl: null,
      isVisible: true,
   },
   {
      id: 4,
      eventType: "zoom",
      name: "MTH201 Zoom Tutorial: Integration by Parts",
      description: "Extended tutorial session. Link expires 15 min after start.",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
      meetingUrl: "https://zoom.us/j/mock-mth201",
      isVisible: true,
      courseCode: "MTH201",
      courseTitle: "Mathematical Methods I",
   },
   {
      id: 5,
      eventType: "site",
      name: "First Semester Examination Schedule Released",
      description: "The official examination timetable for First Semester 2024/2025 is now available on the portal.",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: null,
      meetingUrl: null,
      isVisible: true,
   },
   {
      id: 6,
      eventType: "course",
      name: "CSC301 Lab Practical: Graph Algorithms",
      description: "In-lab practical. Bring student ID. Lab-A.",
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      meetingUrl: null,
      isVisible: false,
      courseCode: "CSC301",
      courseTitle: "Data Structures & Algorithms",
   },
];

// ── Mock academic calendar ────────────────────────────────────────────────────

const mockAcademicCalendar: AcademicCalendarMeta = {
   session: {
      id: 1,
      name: "2024/2025",
      startDate: "2024-10-07T00:00:00Z",
      endDate: "2025-07-31T00:00:00Z",
   },
   semesters: [
      {
         id: 1,
         name: "First Semester",
         startDate: "2024-10-07T00:00:00Z",
         endDate: "2025-02-28T00:00:00Z",
         isActive: true,
         registrationStart: "2024-09-16T00:00:00Z",
         registrationEnd: "2024-10-04T00:00:00Z",
      },
      {
         id: 2,
         name: "Second Semester",
         startDate: "2025-03-10T00:00:00Z",
         endDate: "2025-07-31T00:00:00Z",
         isActive: false,
         registrationStart: "2025-02-17T00:00:00Z",
         registrationEnd: "2025-03-07T00:00:00Z",
      },
   ],
   currentSemester: {
      id: 1,
      name: "First Semester",
      startDate: "2024-10-07T00:00:00Z",
      endDate: "2025-02-28T00:00:00Z",
      isActive: true,
      registrationStart: "2024-09-16T00:00:00Z",
      registrationEnd: "2024-10-04T00:00:00Z",
   },
};

// ── Mock offering lookup ──────────────────────────────────────────────────────

export const mockOfferings = [
   { id: 55, courseCode: "CSC301", courseTitle: "Data Structures & Algorithms", tutorId: 1, tutorName: "Dr. Aisha Bello" },
   { id: 56, courseCode: "CSC303", courseTitle: "Operating Systems", tutorId: 2, tutorName: "Dr. Emeka Chukwu" },
   { id: 57, courseCode: "MTH201", courseTitle: "Mathematical Methods I", tutorId: 3, tutorName: "Prof. Amaka Nwosu" },
];

// ── Sort helper ───────────────────────────────────────────────────────────────

const DAY_ORDER: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function groupByDay(slots: TimetableSlot[]): TimetableGrouped {
   const grouped: TimetableGrouped = {};
   for (const slot of slots) {
      if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
      grouped[slot.dayOfWeek]!.push(slot);
   }
   for (const day of DAY_ORDER) {
      if (grouped[day]) {
         grouped[day]!.sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
   }
   return grouped;
}

// ── timetableService ──────────────────────────────────────────────────────────

export const timetableService = {
   async getMyTimetable(params: { semesterId?: number; groupByDay?: boolean } = {}): Promise<TimetableSlot[] | TimetableGrouped> {
      // Real API: return apiClient.get<{ slots: TimetableSlot[] }>("/api/v1/timetable/me", { access_token: true, params });
      await delay();
      // Mock: student enrolled in offerings 55 (CSC301) and 56 (CSC303)
      const enrolledOfferingIds = [55, 56];
      const slots = mockSchedules.filter((s) => enrolledOfferingIds.includes(s.offeringId));
      if (params.groupByDay) return groupByDay(slots);
      return slots.sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
   },

   async getTutorTimetable(tutorId: number, _params: { semesterId?: number } = {}): Promise<TimetableSlot[] | TimetableGrouped> {
      // Real API: return apiClient.get<{ slots: TimetableSlot[] }>(`/api/v1/timetable/tutor/${tutorId}`, { access_token: true, params: _params });
      await delay();
      // Mock: tutor ID 1 = Dr. Aisha Bello (CSC301), ID 2 = Dr. Emeka Chukwu (CSC303)
      const slots = mockSchedules.filter((s) => {
         const offering = mockOfferings.find((o) => o.id === s.offeringId);
         return offering?.tutorId === tutorId;
      });
      return slots.sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
   },

   async getStudentTimetable(studentId: string, _params: { semesterId?: number } = {}): Promise<TimetableSlot[]> {
      // Real API: return apiClient.get<{ slots: TimetableSlot[] }>(`/api/v1/timetable/student/${studentId}`, { access_token: true, params: _params });
      await delay();
      const enrolledOfferingIds = [55, 56];
      return mockSchedules
         .filter((s) => enrolledOfferingIds.includes(s.offeringId))
         .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
   },

   async getAllSchedules(filters: ScheduleFilter = {}): Promise<PaginatedResponse<TimetableSlot>> {
      // Real API: return apiClient.get<PaginatedResponse<TimetableSlot>>("/api/v1/timetable", { access_token: true, params: filters });
      await delay();
      let items = [...mockSchedules];
      if (filters.dayOfWeek) items = items.filter((s) => s.dayOfWeek === filters.dayOfWeek);
      if (filters.classType) items = items.filter((s) => s.classType === filters.classType);
      if (filters.venue) items = items.filter((s) => s.venue.toLowerCase().includes(filters.venue!.toLowerCase()));
      if (filters.offeringId) items = items.filter((s) => s.offeringId === filters.offeringId);
      items.sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total = items.length;
      const totalPages = Math.ceil(total / limit);
      return { data: items.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages } };
   },

   async getScheduleById(id: number): Promise<TimetableSlot> {
      // Real API: return apiClient.get<TimetableSlot>(`/api/v1/timetable/${id}`, AUTH);
      await delay(200);
      const s = mockSchedules.find((s) => s.id === id);
      if (!s) throw new Error("Schedule not found");
      return { ...s };
   },

   async getSchedulesByOffering(offeringId: number): Promise<TimetableSlot[]> {
      // Real API: return apiClient.get<TimetableSlot[]>(`/api/v1/timetable/offering/${offeringId}`, AUTH);
      await delay();
      return mockSchedules.filter((s) => s.offeringId === offeringId);
   },

   async createSchedule(dto: CreateScheduleDto): Promise<TimetableSlot> {
      // Real API: return apiClient.post<TimetableSlot, CreateScheduleDto>("/api/v1/timetable", dto, AUTH);
      await delay(600);
      const offering = mockOfferings.find((o) => o.id === dto.offeringId);
      if (!offering) throw new Error("Course offering not found");
      const newSlot: TimetableSlot = {
         id: uid(),
         dayOfWeek: dto.dayOfWeek,
         startTime: dto.startTime,
         endTime: dto.endTime,
         venue: dto.venue,
         classType: dto.classType,
         courseCode: offering.courseCode,
         courseTitle: offering.courseTitle,
         creditUnits: 3,
         tutorName: offering.tutorName,
         offeringId: dto.offeringId,
      };
      mockSchedules.push(newSlot);
      return newSlot;
   },

   async updateSchedule(id: number, dto: UpdateScheduleDto): Promise<TimetableSlot> {
      // Real API: return apiClient.patch<TimetableSlot, UpdateScheduleDto>(`/api/v1/timetable/${id}`, dto, AUTH);
      await delay(500);
      const idx = mockSchedules.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Schedule not found");
      mockSchedules[idx] = { ...mockSchedules[idx], ...dto } as TimetableSlot;
      return { ...mockSchedules[idx] };
   },

   async deleteSchedule(id: number): Promise<{ message: string }> {
      // Real API: return apiClient.delete<{ message: string }>(`/api/v1/timetable/${id}`, AUTH);
      await delay(400);
      const idx = mockSchedules.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Schedule not found");
      mockSchedules.splice(idx, 1);
      return { message: "Schedule deleted." };
   },

   async getVenues(): Promise<string[]> {
      // Real API: return apiClient.get<string[]>("/api/v1/timetable/venues", AUTH);
      await delay(200);
      return [...new Set(mockSchedules.map((s) => s.venue))].sort();
   },

   async getVenueAvailability(params: {
      venue: string;
      dayOfWeek: DayOfWeek;
      semesterId: number;
      excludeScheduleId?: number;
   }): Promise<VenueAvailability> {
      // Real API: return apiClient.get<VenueAvailability>("/api/v1/timetable/venues/availability", { access_token: true, params });
      await delay(300);
      const busySlots = mockSchedules
         .filter(
            (s) =>
               s.venue.toLowerCase() === params.venue.toLowerCase() &&
               s.dayOfWeek === params.dayOfWeek &&
               s.id !== params.excludeScheduleId
         )
         .sort((a, b) => a.startTime.localeCompare(b.startTime))
         .map((s) => ({ startTime: s.startTime, endTime: s.endTime, courseCode: s.courseCode, tutorName: s.tutorName }));

      // Compute free windows (08:00–20:00 working day)
      const workStart = "08:00";
      const workEnd = "20:00";
      const freeWindows: { startTime: string; endTime: string }[] = [];
      let cursor = workStart;
      for (const busy of busySlots) {
         if (cursor < busy.startTime) freeWindows.push({ startTime: cursor, endTime: busy.startTime });
         if (busy.endTime > cursor) cursor = busy.endTime;
      }
      if (cursor < workEnd) freeWindows.push({ startTime: cursor, endTime: workEnd });

      return { venue: params.venue, dayOfWeek: params.dayOfWeek, busySlots, freeWindows };
   },
};

// ── calendarService ───────────────────────────────────────────────────────────

export const calendarService = {
   async getMyEvents(params: CalendarEventFilter = {}): Promise<PaginatedResponse<CalendarEvent>> {
      // Real API: return apiClient.get<PaginatedResponse<CalendarEvent>>("/api/v1/calendar/events/me", { access_token: true, params });
      await delay();
      const enrolledCourseCodes = ["CSC301", "CSC303"];
      let items = mockCalendarEvents.filter(
         (e) =>
            e.isVisible &&
            (!e.courseCode || enrolledCourseCodes.includes(e.courseCode))
      );
      if (params.eventType) items = items.filter((e) => e.eventType === params.eventType);
      items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const total = items.length;
      return { data: items.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
   },

   async getMyUpcomingEvents(): Promise<CalendarEvent[]> {
      // Real API: return apiClient.get<CalendarEvent[]>("/api/v1/calendar/events/me/upcoming", AUTH);
      await delay();
      const now = new Date();
      const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const enrolledCourseCodes = ["CSC301", "CSC303"];
      return mockCalendarEvents
         .filter(
            (e) =>
               e.isVisible &&
               new Date(e.startDate) >= now &&
               new Date(e.startDate) <= cutoff &&
               (!e.courseCode || enrolledCourseCodes.includes(e.courseCode))
         )
         .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
   },

   async getUpcomingEvents(days = 14): Promise<CalendarEvent[]> {
      // Real API: return apiClient.get<CalendarEvent[]>("/api/v1/calendar/events/upcoming", { access_token: true, params: { days } });
      await delay();
      const now = new Date();
      const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return mockCalendarEvents
         .filter((e) => e.isVisible && new Date(e.startDate) >= now && new Date(e.startDate) <= cutoff)
         .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
   },

   async getAllEvents(filters: CalendarEventFilter = {}): Promise<PaginatedResponse<CalendarEvent>> {
      // Real API: return apiClient.get<PaginatedResponse<CalendarEvent>>("/api/v1/calendar/events", { access_token: true, params: filters });
      await delay();
      let items = [...mockCalendarEvents];
      if (filters.eventType) items = items.filter((e) => e.eventType === filters.eventType);
      if (filters.isVisible !== undefined) items = items.filter((e) => e.isVisible === filters.isVisible);
      if (filters.courseOfferingId) {
         const code = mockOfferings.find((o) => o.id === filters.courseOfferingId)?.courseCode;
         if (code) items = items.filter((e) => e.courseCode === code);
      }
      items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total = items.length;
      return { data: items.slice((page - 1) * limit, page * limit), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
   },

   async getEventById(id: number): Promise<CalendarEvent> {
      // Real API: return apiClient.get<CalendarEvent>(`/api/v1/calendar/events/${id}`, AUTH);
      await delay(200);
      const e = mockCalendarEvents.find((e) => e.id === id);
      if (!e) throw new Error("Calendar event not found");
      return { ...e };
   },

   async toggleEventVisibility(id: number): Promise<CalendarEvent> {
      // Real API: return apiClient.patch<CalendarEvent, Record<string, never>>(`/api/v1/calendar/events/${id}/visibility`, {}, AUTH);
      await delay(300);
      const idx = mockCalendarEvents.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Calendar event not found");
      mockCalendarEvents[idx] = { ...mockCalendarEvents[idx], isVisible: !mockCalendarEvents[idx].isVisible };
      return { ...mockCalendarEvents[idx] };
   },
};

// ── academicCalendarService ────────────────────────────────────────────────────

export const academicCalendarService = {
   async getCurrent(): Promise<AcademicCalendarMeta> {
      // Real API: return apiClient.get<AcademicCalendarMeta>("/api/v1/academic-calendar/current", AUTH);
      await delay(300);
      return { ...mockAcademicCalendar };
   },

   async getActiveSemester(): Promise<Semester | null> {
      // Real API: return apiClient.get<Semester | null>("/api/v1/academic-calendar/active-semester", AUTH);
      await delay(200);
      return mockAcademicCalendar.currentSemester;
   },

   async getSessions(): Promise<{ id: number; name: string }[]> {
      // Real API: return apiClient.get<{ id: number; name: string }[]>("/api/v1/academic-calendar/sessions", AUTH);
      await delay(200);
      return [{ id: mockAcademicCalendar.session.id, name: mockAcademicCalendar.session.name }];
   },
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const timetableKeys = {
   all: ["timetable"] as const,
   my: (params?: object) => ["timetable", "my", params] as const,
   student: (id: string, params?: object) => ["timetable", "student", id, params] as const,
   tutor: (id: number, params?: object) => ["timetable", "tutor", id, params] as const,
   byOffering: (offeringId: number) => ["timetable", "offering", offeringId] as const,
   admin: (filters?: object) => ["timetable", "admin", filters] as const,
   detail: (id: number) => ["timetable", "detail", id] as const,
   venues: () => ["timetable", "venues"] as const,
   venueAvail: (params?: object) => ["timetable", "venue-availability", params] as const,
};

export const calendarKeys = {
   all: ["calendar"] as const,
   my: (params?: object) => ["calendar", "my", params] as const,
   myUpcoming: () => ["calendar", "my-upcoming"] as const,
   upcoming: (days?: number) => ["calendar", "upcoming", days] as const,
   admin: (filters?: object) => ["calendar", "admin", filters] as const,
   byId: (id: number) => ["calendar", "events", id] as const,
};

export const academicCalendarKeys = {
   current: () => ["academic-calendar", "current"] as const,
   activeSemester: () => ["academic-calendar", "active-semester"] as const,
   sessions: () => ["academic-calendar", "sessions"] as const,
};

// ── Query options ─────────────────────────────────────────────────────────────

export const timetableQueryOptions = {
   my: (params?: { semesterId?: number; groupByDay?: boolean }) =>
      createApiQueryOptions({
         queryKey: timetableKeys.my(params),
         queryFn: () => timetableService.getMyTimetable(params),
      }),

   tutor: (tutorId: number, params?: { semesterId?: number }) =>
      createApiQueryOptions({
         queryKey: timetableKeys.tutor(tutorId, params),
         queryFn: () => timetableService.getTutorTimetable(tutorId, params),
      }),

   student: (studentId: string, params?: { semesterId?: number }) =>
      createApiQueryOptions({
         queryKey: timetableKeys.student(studentId, params),
         queryFn: () => timetableService.getStudentTimetable(studentId, params),
      }),

   admin: (filters?: ScheduleFilter) =>
      createApiQueryOptions({
         queryKey: timetableKeys.admin(filters),
         queryFn: () => timetableService.getAllSchedules(filters),
      }),

   detail: (id: number) =>
      createApiQueryOptions({
         queryKey: timetableKeys.detail(id),
         queryFn: () => timetableService.getScheduleById(id),
      }),

   byOffering: (offeringId: number) =>
      createApiQueryOptions({
         queryKey: timetableKeys.byOffering(offeringId),
         queryFn: () => timetableService.getSchedulesByOffering(offeringId),
      }),

   venues: () =>
      createApiQueryOptions({
         queryKey: timetableKeys.venues(),
         queryFn: () => timetableService.getVenues(),
      }),

   venueAvailability: (params: { venue: string; dayOfWeek: DayOfWeek; semesterId: number; excludeScheduleId?: number }) =>
      createApiQueryOptions({
         queryKey: timetableKeys.venueAvail(params),
         queryFn: () => timetableService.getVenueAvailability(params),
      }),
};

export const calendarQueryOptions = {
   my: (params?: CalendarEventFilter) =>
      createApiQueryOptions({
         queryKey: calendarKeys.my(params),
         queryFn: () => calendarService.getMyEvents(params),
      }),

   myUpcoming: () =>
      createApiQueryOptions({
         queryKey: calendarKeys.myUpcoming(),
         queryFn: () => calendarService.getMyUpcomingEvents(),
      }),

   upcoming: (days?: number) =>
      createApiQueryOptions({
         queryKey: calendarKeys.upcoming(days),
         queryFn: () => calendarService.getUpcomingEvents(days),
      }),

   admin: (filters?: CalendarEventFilter) =>
      createApiQueryOptions({
         queryKey: calendarKeys.admin(filters),
         queryFn: () => calendarService.getAllEvents(filters),
      }),

   byId: (id: number) =>
      createApiQueryOptions({
         queryKey: calendarKeys.byId(id),
         queryFn: () => calendarService.getEventById(id),
      }),
};

export const academicCalendarQueryOptions = {
   current: () =>
      createApiQueryOptions({
         queryKey: academicCalendarKeys.current(),
         queryFn: () => academicCalendarService.getCurrent(),
      }),

   activeSemester: () =>
      createApiQueryOptions({
         queryKey: academicCalendarKeys.activeSemester(),
         queryFn: () => academicCalendarService.getActiveSemester(),
      }),
};

// ── Mutation options ──────────────────────────────────────────────────────────

export const timetableMutationOptions = {
   create: () =>
      createApiMutationOptions<TimetableSlot, CreateScheduleDto>({
         mutationFn: (dto) => timetableService.createSchedule(dto),
      }),

   update: () =>
      createApiMutationOptions<TimetableSlot, { id: number; dto: UpdateScheduleDto }>({
         mutationFn: ({ id, dto }) => timetableService.updateSchedule(id, dto),
      }),

   delete: () =>
      createApiMutationOptions<{ message: string }, number>({
         mutationFn: (id) => timetableService.deleteSchedule(id),
      }),
};

export const calendarMutationOptions = {
   toggleVisibility: () =>
      createApiMutationOptions<CalendarEvent, number>({
         mutationFn: (id) => calendarService.toggleEventVisibility(id),
      }),
};
