"use client";

import { useQuery } from "@tanstack/react-query";
import { academicCalendarQueryOptions } from "../services/timetable.service";

export function useAcademicCalendar() {
    return useQuery(academicCalendarQueryOptions.current());
}

export function useActiveSemester() {
    return useQuery(academicCalendarQueryOptions.activeSemester());
}
