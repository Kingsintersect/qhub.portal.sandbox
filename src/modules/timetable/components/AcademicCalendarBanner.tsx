"use client";

import { format } from "date-fns";
import { CalendarDays, BookOpen, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcademicCalendar } from "../hooks/useAcademicCalendar";

export function AcademicCalendarBanner() {
    const { data, isLoading } = useAcademicCalendar();

    if (isLoading) {
        return <Skeleton className="h-14 w-full rounded-xl" />;
    }

    if (!data) return null;

    const active = data.semesters?.find((s: { isActive: boolean }) => s.isActive);

    return (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
            {/* Session */}
            <span className="flex items-center gap-1.5 font-medium text-foreground">
                <GraduationCap size={15} className="text-primary" />
                {data.session}
            </span>

            {/* Current semester */}
            {active && (
                <>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen size={13} />
                        {active.name}
                    </span>

                    {/* Dates */}
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays size={13} />
                        {format(new Date(active.startDate), "d MMM")} – {format(new Date(active.endDate), "d MMM yyyy")}
                    </span>

                    {/* Registration window */}
                    {active.registrationStart && active.registrationEnd && (
                        <>
                            <div className="h-4 w-px bg-border hidden sm:block" />
                            <span className="text-xs text-muted-foreground">
                                Registration: {format(new Date(active.registrationStart), "d MMM")} – {format(new Date(active.registrationEnd), "d MMM")}
                            </span>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
