"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AcademicCalendarBanner } from "@/modules/timetable/components/AcademicCalendarBanner";
import { CalendarDays, Clock, List } from "lucide-react";

const TAB_LINKS = [
    { href: "/timetable", label: "My Timetable", icon: CalendarDays, exact: true },
    { href: "/timetable/calendar", label: "Calendar", icon: List, exact: false },
    { href: "/timetable/upcoming", label: "Upcoming", icon: Clock, exact: false },
];

export default function TimetableLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Banner */}
            <AcademicCalendarBanner />

            {/* Tab nav */}
            <div className="flex items-center gap-1 border-b border-border pb-0">
                {TAB_LINKS.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href) && pathname !== "/timetable";
                    const isRootActive = href === "/timetable" && pathname === "/timetable";
                    const isActive = isRootActive || (!exact && pathname.startsWith(href) && href !== "/timetable");
                    const finalActive = href === "/timetable" ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-1.5 text-sm px-3 py-2.5 border-b-2 transition-colors -mb-px",
                                finalActive
                                    ? "border-primary text-primary font-medium"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    );
                })}
            </div>

            {/* Page content */}
            {children}
        </div>
    );
}
