import type {
  ClassType,
  DayOfWeek,
  TimetableSlot,
} from "@/modules/timetable/types/timetable.types"

// A slot being edited in the schedule form — `id` present means it's an
// existing real ClassSchedule row (PUT on save), absent means it's new
// (POST on save). Slots removed from the array entirely are DELETEd.
export interface ScheduleSlotDraft {
  id?: number
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  venue: string
  classType: ClassType
}

export interface AssignedCourse {
  id: number // CourseOffering id
  courseCode: string
  courseTitle: string
  creditUnits: number
  semesterName: string
  academicYear: string
  registeredStudents: number | null
  schedule: TimetableSlot[]
}
