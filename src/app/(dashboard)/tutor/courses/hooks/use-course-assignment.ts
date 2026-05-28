"use client";

import { useState, useEffect, useCallback } from "react";
import type { AssignedCourse, UpdateSchedulePayload } from "../types/course-assignment.types";
import { courseAssignmentService } from "../services/course-assignment.service";

// ─── Assigned courses list ────────────────────────────────────────────────────

export function useAssignedCourses() {
    const [courses, setCourses] = useState<AssignedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await courseAssignmentService.getAssignedCourses();
                setCourses(data);
            } catch {
                setError("Failed to load assigned courses.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    return { courses, loading, error };
}

// ─── Update schedule for a single course ─────────────────────────────────────

export function useUpdateSchedule() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSchedule = useCallback(
        async (
            payload: UpdateSchedulePayload,
            onSuccess: (updated: AssignedCourse) => void
        ) => {
            setSaving(true);
            setError(null);
            try {
                const updated = await courseAssignmentService.updateSchedule(payload);
                onSuccess(updated);
            } catch {
                setError("Failed to save schedule. Please try again.");
            } finally {
                setSaving(false);
            }
        },
        []
    );

    return { updateSchedule, saving, error };
}
