"use client";

import { ShieldOff } from "lucide-react";
import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { CalendarEventList } from "@/modules/timetable/components/CalendarEventList";
import { useMyCalendarEvents } from "@/modules/timetable/hooks/useCalendarEvents";

export default function MyCalendarPage() {
    const { data, isLoading } = useMyCalendarEvents();
    const events = data?.data ?? [];

    return (
        <PermissionGate
            require={{ resource: "calendar", action: "view.own" }}
            fallback={
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                    <ShieldOff size={40} className="opacity-40" />
                    <p className="text-sm">You do not have permission to view calendar events.</p>
                </div>
            }
        >
            <div className="space-y-4">
                <h1 className="text-lg font-semibold text-foreground">Calendar &amp; Events</h1>
                <CalendarEventList events={events} isLoading={isLoading} />
            </div>
        </PermissionGate>
    );
}
