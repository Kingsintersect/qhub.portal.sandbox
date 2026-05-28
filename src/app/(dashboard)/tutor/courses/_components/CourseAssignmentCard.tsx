"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, Users, Award, CalendarClock, Edit3, CheckCircle2, AlertCircle,
} from "lucide-react";
import { ScheduleEditorModal } from "./ScheduleEditorModal";
import type { AssignedCourse, ClassScheduleSlot } from "../types/course-assignment.types";
import { useUpdateSchedule } from "../hooks/use-course-assignment";

interface CourseAssignmentCardProps {
    course: AssignedCourse;
    onUpdated: (updated: AssignedCourse) => void;
    index: number;
}

function SchedulePills({ schedule }: { schedule: ClassScheduleSlot[] }) {
    if (schedule.length === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" />
                No schedule set
            </span>
        );
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {schedule.map((s, i) => (
                <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15"
                >
                    {s.day.slice(0, 3)} {s.startTime}–{s.endTime}
                    <span className="text-muted-foreground">· {s.venue}</span>
                </span>
            ))}
        </div>
    );
}

export function CourseAssignmentCard({ course, onUpdated, index }: CourseAssignmentCardProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const { updateSchedule, saving, error: saveError } = useUpdateSchedule();

    const handleSave = async (slots: ClassScheduleSlot[]) => {
        await updateSchedule(
            { courseId: course.id, schedule: slots },
            (updated) => {
                onUpdated(updated);
                setModalOpen(false);
            }
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow space-y-4"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-mono font-semibold text-primary">
                                {course.courseCode}
                            </p>
                            <h3 className="text-sm font-bold text-foreground leading-snug">
                                {course.courseTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {course.programName} · Level {course.level}
                            </p>
                        </div>
                    </div>

                    {/* Schedule status badge */}
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold border shrink-0 ${course.schedule.length > 0
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                                : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                            }`}
                    >
                        {course.schedule.length > 0 ? (
                            <>
                                <CheckCircle2 className="w-3 h-3" />
                                Scheduled
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-3 h-3" />
                                Unscheduled
                            </>
                        )}
                    </span>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Award className="w-3.5 h-3.5" />
                        <span>
                            {course.creditUnits} credit unit{course.creditUnits !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="w-px h-3.5 bg-border" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{course.registeredStudents} students registered</span>
                    </div>
                    <div className="w-px h-3.5 bg-border" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>{course.semesterName} · {course.academicYear}</span>
                    </div>
                </div>

                {/* Schedule display */}
                <div className="pt-0.5">
                    <SchedulePills schedule={course.schedule} />
                </div>

                {/* Save error */}
                {saveError && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {saveError}
                    </p>
                )}

                {/* Footer action */}
                <div className="flex justify-end pt-1 border-t border-border/50">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        {course.schedule.length > 0 ? "Edit Schedule" : "Set Schedule"}
                    </button>
                </div>
            </motion.div>

            {/* Schedule editor */}
            {modalOpen && (
                <ScheduleEditorModal
                    course={course}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </>
    );
}
