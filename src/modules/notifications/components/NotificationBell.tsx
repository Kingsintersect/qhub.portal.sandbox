"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "../hooks/use-notifications";
import { useAppStore } from "@/store";
import { roleDashboardPath, UserRole } from "@/config/nav.config";

// ── Resolve the notifications href per role ───────────────────────────────────

const notificationsPath: Partial<Record<UserRole, string>> = {
    [UserRole.TUTOR]: "/tutor/notifications",
    [UserRole.HOD]: "/tutor/notifications",
    [UserRole.STUDENT]: "/student/notifications",
};

function useNotificationsHref() {
    const activeRole = useAppStore((s) => s.activeRole);
    return (activeRole && notificationsPath[activeRole]) ?? "/notifications";
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NotificationBellProps {
    className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
    const { data } = useUnreadCount();
    const href = useNotificationsHref();
    const count = data?.unreadCount ?? 0;

    return (
        <Link
            href={href}
            aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
            className={cn("relative inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors", className)}
        >
            <Bell size={20} />
            {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold tabular-nums leading-none">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}
