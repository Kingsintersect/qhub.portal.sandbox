"use client"

import { AlertTriangle, BookOpen, GraduationCap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/EmptyState"
import { useMyStudentId } from "@/hooks/use-my-student-id"
import { useEnrollmentsByStudent } from "@/modules/enrollment/hooks/use-enrollments"
import { MyCourseLaunchCard } from "@/modules/enrollment/components/my-course-launch-card"

export default function StudentCoursesPage() {
  const {
    studentId,
    isLoading: resolvingStudentId,
    isError: studentIdErrored,
    refetch: retryStudentId,
  } = useMyStudentId()
  const { data, isLoading, isError } = useEnrollmentsByStudent(studentId, {
    status: "ENROLLED",
  })
  const courses = data ?? []
  const loading = resolvingStudentId || isLoading

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-background to-cyan-500/10 p-6">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Learning Hub
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          My Courses
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Course content lives on Moodle. Pick a course below to continue —
          you&apos;ll be signed in automatically.
        </p>
      </section>

      {studentId === null && !resolvingStudentId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
          <span>
            {studentIdErrored
              ? "Couldn't resolve your student record — this is usually a passing hiccup."
              : "Your student record couldn't be resolved yet, so your courses can't load — check back once that's available."}
          </span>
          {studentIdErrored && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => retryStudentId()}
            >
              <RefreshCw size={12} />
              Try again
            </Button>
          )}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle size={16} />
          Couldn&apos;t load your courses. Please try again shortly.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={studentId === null ? GraduationCap : BookOpen}
          title="No courses yet"
          description="Your enrolled courses will appear here once your registration for the semester is confirmed."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((enrollment, i) => (
            <MyCourseLaunchCard
              key={enrollment.id}
              enrollment={enrollment}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
