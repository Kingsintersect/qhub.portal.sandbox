"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, Loader2, X, CalendarClock } from "lucide-react";
import Modal from "@/components/custom/Modal";
import type { AssignedCourse, ClassScheduleSlot, DayOfWeek } from "../types/course-assignment.types";

const DAYS: DayOfWeek[] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const EMPTY_SLOT: ClassScheduleSlot = {
    day: "Monday",
    startTime: "08:00",
    endTime: "10:00",
    venue: "",
};

interface ScheduleEditorModalProps {
    course: AssignedCourse;
    open: boolean;
    onClose: () => void;
    onSave: (slots: ClassScheduleSlot[]) => void;
    saving: boolean;
}

export function ScheduleEditorModal({
    course,
    open,
    onClose,
    onSave,
    saving,
}: ScheduleEditorModalProps) {
    const [slots, setSlots] = useState<ClassScheduleSlot[]>(() =>
        course.schedule.length > 0
            ? course.schedule.map((s) => ({ ...s }))
            : [{ ...EMPTY_SLOT }]
    );

    const addSlot = () =>
        setSlots((prev) => [...prev, { ...EMPTY_SLOT }]);

    const removeSlot = (i: number) =>
        setSlots((prev) => prev.filter((_, idx) => idx !== i));

    const updateSlot = (i: number, patch: Partial<ClassScheduleSlot>) =>
        setSlots((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
        );

    const isValid = slots.every(
        (s) => s.venue.trim() && s.startTime < s.endTime
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            title="Set Class Schedule"
            subtitle={`${course.courseCode} — ${course.courseTitle}`}
            footer={
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 text-xs font-medium border border-border rounded-xl text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSave(slots)}
                        disabled={saving || !isValid}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                Save Schedule
                            </>
                        )}
                    </motion.button>
                </div>
            }
        >
            <div className="p-5 space-y-4">
                <AnimatePresence initial={false}>
                    {slots.map((slot, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-end"
                        >
                            {/* Day */}
                            <div className="flex flex-col gap-1 min-w-27.5">
                                {i === 0 && (
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Day
                                    </label>
                                )}
                                <select
                                    value={slot.day}
                                    onChange={(e) =>
                                        updateSlot(i, { day: e.target.value as DayOfWeek })
                                    }
                                    className="px-2.5 py-2 text-xs border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    {DAYS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start time */}
                            <div className="flex flex-col gap-1">
                                {i === 0 && (
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Start
                                    </label>
                                )}
                                <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                        updateSlot(i, { startTime: e.target.value })
                                    }
                                    className="px-2.5 py-2 text-xs border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* End time */}
                            <div className="flex flex-col gap-1">
                                {i === 0 && (
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        End
                                    </label>
                                )}
                                <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                        updateSlot(i, { endTime: e.target.value })
                                    }
                                    className={`px-2.5 py-2 text-xs border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${slot.endTime <= slot.startTime
                                            ? "border-destructive focus:border-destructive"
                                            : "border-border"
                                        }`}
                                />
                            </div>

                            {/* Venue */}
                            <div className="flex flex-col gap-1">
                                {i === 0 && (
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Venue
                                    </label>
                                )}
                                <input
                                    type="text"
                                    value={slot.venue}
                                    onChange={(e) =>
                                        updateSlot(i, { venue: e.target.value })
                                    }
                                    placeholder="e.g. LT-A Block 1"
                                    className="px-2.5 py-2 text-xs border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* Remove */}
                            <div className={i === 0 ? "pt-5" : ""}>
                                <button
                                    onClick={() => removeSlot(i)}
                                    disabled={slots.length === 1}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button
                    onClick={addSlot}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add another slot
                </button>

                {!isValid && slots.some((s) => s.endTime <= s.startTime) && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        End time must be after start time in each slot.
                    </p>
                )}
                {!isValid && slots.some((s) => !s.venue.trim()) && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        All slots need a venue.
                    </p>
                )}

                {/* Delete all / clear */}
                {slots.length > 0 && (
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={() => setSlots([{ ...EMPTY_SLOT }])}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition"
                        >
                            <Trash2 className="w-3 h-3" />
                            Reset all slots
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
