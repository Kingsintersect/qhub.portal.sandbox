"use client";

import { motion } from "framer-motion";
import { CalendarDays, ShieldOff } from "lucide-react";
import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { CalendarEventList } from "@/modules/timetable/components/CalendarEventList";
import { EventVisibilityToggle } from "@/modules/timetable/components/EventVisibilityToggle";
import { useAllCalendarEvents } from "@/modules/timetable/hooks/useCalendarEvents";
import type { CalendarEvent } from "@/modules/timetable/types/timetable.types";

export default function AdminCalendarPage() {
    const { data, isLoading } = useAllCalendarEvents();
    const events = data?.data ?? [];
    const total = data?.meta?.total ?? 0;

    function visibilityToggle(event: CalendarEvent) {
        return (
            <PermissionGate require={{ resource: "calendar", action: "manage" }}>
                <EventVisibilityToggle eventId={event.id} isVisible={event.isVisible} />
            </PermissionGate>
        );
    }

    return (
        <PermissionGate
            require={{ resource: "calendar", action: "view.all" }}
            fallback={
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                    <ShieldOff size={40} className="opacity-40" />
                    <p className="text-sm">You do not have permission to view all calendar events.</p>
                </div>
            }
        >
            <div className="space-y-6 p-6">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between gap-4 flex-wrap"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CalendarDays size={18} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Calendar Events</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage event visibility for students and staff
                            </p>
                        </div>
                    </div>
                    {total > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted/50 border border-border px-2.5 py-1 rounded-full">
                            {total} event{total !== 1 ? "s" : ""}
                        </span>
                    )}
                </motion.div>

                <CalendarEventList
                    events={events}
                    isLoading={isLoading}
                    visibilityToggle={visibilityToggle}
                />
            </div>
        </PermissionGate>
    );
}
