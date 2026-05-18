"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users, Award, AlertCircle, Search, X, CheckCircle2 } from "lucide-react";
import { CourseAssignmentCard } from "./_components/CourseAssignmentCard";
import { useAssignedCourses } from "./hooks/use-course-assignment";
import type { AssignedCourse } from "./types/course-assignment.types";

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({
    label,
    value,
    colour,
}: {
    label: string;
    value: string | number;
    colour: string;
}) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${colour}`}
        >
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold text-foreground">{value}</span>
        </div>
    );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/60 rounded w-20" />
                    <div className="h-4 bg-muted/60 rounded w-48" />
                    <div className="h-3 bg-muted/60 rounded w-36" />
                </div>
            </div>
            <div className="flex gap-3">
                <div className="h-3 bg-muted/40 rounded w-24" />
                <div className="h-3 bg-muted/40 rounded w-32" />
            </div>
            <div className="h-3 bg-muted/40 rounded w-40" />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseAssignmentPage() {
    const { courses: rawCourses, loading, error } = useAssignedCourses();
    const [courses, setCourses] = useState<AssignedCourse[]>([]);
    const [initialised, setInitialised] = useState(false);
    const [search, setSearch] = useState("");

    // Sync loaded courses into local state (so updates propagate)
    if (!loading && !initialised && rawCourses.length > 0) {
        setCourses(rawCourses);
        setInitialised(true);
    }

    const handleUpdated = useCallback((updated: AssignedCourse) => {
        setCourses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
        );
    }, []);

    const filtered = courses.filter(
        (c) =>
            !search ||
            c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
            c.programName.toLowerCase().includes(search.toLowerCase())
    );

    const totalStudents = courses.reduce((a, c) => a + c.registeredStudents, 0);
    const totalCredits = courses.reduce((a, c) => a + c.creditUnits, 0);
    const scheduledCount = courses.filter((c) => c.schedule.length > 0).length;

    return (
        <div className="space-y-4">
            {/* Page header */}
            <div className="bg-card border border-border rounded-2xl px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground">My Assigned Courses</h2>
                            <p className="text-xs text-muted-foreground">
                                Courses assigned to you this semester · set your class schedule below
                            </p>
                        </div>
                    </div>

                    {/* Summary pills */}
                    {!loading && courses.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <SummaryPill
                                label="Courses"
                                value={courses.length}
                                colour="border-border"
                            />
                            <SummaryPill
                                label="Total Credits"
                                value={totalCredits}
                                colour="border-blue-200 dark:border-blue-900/50"
                            />
                            <SummaryPill
                                label="Students"
                                value={totalStudents}
                                colour="border-violet-200 dark:border-violet-900/50"
                            />
                            <SummaryPill
                                label="Scheduled"
                                value={`${scheduledCount}/${courses.length}`}
                                colour={
                                    scheduledCount === courses.length
                                        ? "border-emerald-200 dark:border-emerald-900/50"
                                        : "border-amber-200 dark:border-amber-900/50"
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Unscheduled courses notice */}
            <AnimatePresence>
                {!loading && courses.length > 0 && scheduledCount < courses.length && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-xs"
                    >
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-amber-700 dark:text-amber-400">
                            <span className="font-semibold">
                                {courses.length - scheduledCount} course
                                {courses.length - scheduledCount !== 1 ? "s" : ""}
                            </span>{" "}
                            {courses.length - scheduledCount !== 1 ? "have" : "has"} no schedule set. Click{" "}
                            <strong>Set Schedule</strong> on each card to add days, times, and venues.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* All scheduled notice */}
            <AnimatePresence>
                {!loading && courses.length > 0 && scheduledCount === courses.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400"
                    >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        All courses have a schedule set for this semester.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Search */}
            {!loading && courses.length > 0 && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search course code, title or program…"
                        className="w-full pl-8 pr-8 py-2 text-xs border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* Course cards grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((course, i) => (
                        <CourseAssignmentCard
                            key={course.id}
                            course={course}
                            onUpdated={handleUpdated}
                            index={i}
                        />
                    ))}
                </div>
            )}

            {/* Empty search state */}
            {!loading && courses.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                        <Search className="w-4.5 h-4.5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No courses match</p>
                    <p className="text-xs text-muted-foreground">
                        Try a different course code or title.
                    </p>
                </div>
            )}

            {/* Empty no-assignment state */}
            {!loading && !error && courses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No courses assigned yet</p>
                    <p className="text-xs text-muted-foreground max-w-72">
                        Course assignments will appear here at the start of each semester once the
                        academic office processes allocations.
                    </p>
                </div>
            )}

            {/* Footer summary */}
            {!loading && courses.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {courses.length} course{courses.length !== 1 ? "s" : ""} this semester
                    </span>
                    <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {totalCredits} credit units total
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {totalStudents} students across all courses
                    </span>
                </div>
            )}
        </div>
    );
}
