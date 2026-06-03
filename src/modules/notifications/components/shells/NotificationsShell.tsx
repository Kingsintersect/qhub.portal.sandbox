"use client";

import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { NotificationList } from "../NotificationList";

const fallback = (
    <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="text-sm text-muted-foreground">You do not have permission to view notifications.</p>
    </div>
);

export function NotificationsShell() {
    return (
        <PermissionGate
            require={{ resource: "notifications", action: "view.own" }}
            fallback={fallback}
        >
            <NotificationList />
        </PermissionGate>
    );
}
