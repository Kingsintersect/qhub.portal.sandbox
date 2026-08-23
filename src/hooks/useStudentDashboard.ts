"use client"

import { useMemo } from "react"
import { useMyStudentId } from "@/hooks/use-my-student-id"
import { useMyTimetable } from "@/modules/timetable/hooks/useTimetable"
import { useEnrollmentsByStudent } from "@/modules/enrollment/hooks/use-enrollments"
import { useAttendanceSummary } from "@/modules/enrollment/hooks/use-attendance"
import { useStudentTranscript } from "@/modules/student-grades/hooks/use-grades-data"
import type { DayOfWeek } from "@/modules/timetable/types/timetable.types"

const TODAY_KEY: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]

export function useStudentDashboardData() {
  const { studentId, isLoading: resolvingStudentId } = useMyStudentId()

  const { data: timetableData, isLoading: timetableLoading } = useMyTimetable()
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useEnrollmentsByStudent(studentId)
  const { data: attendance, isLoading: attendanceLoading } =
    useAttendanceSummary(studentId)
  const { data: transcript, loading: transcriptLoading } =
    useStudentTranscript(studentId)

  const slots = useMemo(
    () =>
      Array.isArray(timetableData)
        ? timetableData
        : Object.values(timetableData ?? {}).flat(),
    [timetableData]
  )
  const today = TODAY_KEY[new Date().getDay()]
  const todaysSessions = useMemo(
    () =>
      slots
        .filter((s) => s.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, today]
  )

  const activeEnrollments = (enrollments ?? []).filter(
    (e) => e.status === "ENROLLED"
  )
  const totalUnits = activeEnrollments.reduce((a, e) => a + e.creditUnits, 0)

  const overallAttendance = useMemo(() => {
    if (!attendance || attendance.length === 0) return null
    const totalSessions = attendance.reduce((a, s) => a + s.totalSessions, 0)
    const attended = attendance.reduce((a, s) => a + s.present + s.late, 0)
    return totalSessions > 0
      ? Math.round((attended / totalSessions) * 100)
      : null
  }, [attendance])

  return {
    studentId,
    todaysSessions,
    activeCourseCount: activeEnrollments.length,
    totalUnits,
    overallAttendance,
    currentCGPA: transcript?.currentCGPA ?? null,
    isLoading:
      resolvingStudentId ||
      timetableLoading ||
      enrollmentsLoading ||
      attendanceLoading ||
      transcriptLoading,
  }
}
