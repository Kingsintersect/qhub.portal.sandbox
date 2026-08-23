"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Plus, XCircle, GraduationCap } from "lucide-react"
import { useMyStudentId } from "@/hooks/use-my-student-id"
import { useEnrollmentsByStudent } from "../hooks/use-enrollments"
import { SelfEnrollDialog } from "./self-enroll-dialog"
import { DropEnrollmentDialog } from "./drop-enrollment-dialog"
import StatusBadge from "@/components/custom/StatusBadge"
import EmptyState from "@/components/custom/EmptyState"
import { Button } from "@/components/ui/button"
import type { EnrollmentRecord, EnrollmentStatus } from "../types"

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default"
const STATUS_BADGE: Record<
  EnrollmentStatus,
  { label: string; variant: StatusVariant }
> = {
  ENROLLED: { label: "Enrolled", variant: "success" },
  DROPPED: { label: "Dropped", variant: "default" },
  WITHDRAWN: { label: "Withdrawn", variant: "warning" },
}

export function MyCoursesList() {
  const { studentId, isLoading: resolvingStudentId } = useMyStudentId()
  const { data, isLoading, isError } = useEnrollmentsByStudent(studentId)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [dropping, setDropping] = useState<EnrollmentRecord | null>(null)

  const enrollments = data ?? []
  const active = enrollments.filter((e) => e.status === "ENROLLED")
  const totalUnits = active.reduce((a, e) => a + e.creditUnits, 0)

  if (studentId === null && !resolvingStudentId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Your student record couldn't be resolved"
        description="This page needs the backend to support resolving your own student profile — check back once that's available."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {active.length} course{active.length !== 1 ? "s" : ""} ·{" "}
              {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Your registered courses this semester
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setRegisterOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Register for a Course
        </Button>
      </div>

      {isError && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          Couldn&apos;t load your enrollment records.
        </p>
      )}

      {isLoading || resolvingStudentId ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses registered yet"
          description="Use “Register for a Course” to enroll in an open course offering."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {enrollments.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="space-y-2 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-primary">
                    {e.courseCode}
                  </p>
                  <h3 className="text-sm leading-snug font-bold text-foreground">
                    {e.courseTitle}
                  </h3>
                </div>
                <StatusBadge {...STATUS_BADGE[e.status]} dot />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {e.creditUnits} unit{e.creditUnits !== 1 ? "s" : ""}
                </span>
                {e.lecturerName && <span>· {e.lecturerName}</span>}
              </div>
              {e.status === "ENROLLED" && (
                <div className="flex justify-end border-t border-border/50 pt-1">
                  <button
                    onClick={() => setDropping(e)}
                    className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Drop
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {studentId !== null && (
        <SelfEnrollDialog
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          studentId={studentId}
          alreadyEnrolledOfferingIds={enrollments
            .filter((e) => e.status === "ENROLLED")
            .map((e) => e.offeringId)}
        />
      )}
      <DropEnrollmentDialog
        enrollment={dropping}
        onClose={() => setDropping(null)}
      />
    </div>
  )
}
