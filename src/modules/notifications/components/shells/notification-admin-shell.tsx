"use client"

import { useState } from "react"
import { Bell, ShieldOff } from "lucide-react"
import { PermissionGate } from "@/lib/permissions/PermissionGate"
import {
  NotificationAdminTabs,
  type NotificationAdminTab,
} from "../admin/notification-admin-tabs"
import { TemplatesPanel } from "../admin/templates-panel"
import { SendPanel } from "../admin/send-panel"

export function NotificationAdminShell() {
  const [activeTab, setActiveTab] = useState<NotificationAdminTab>("templates")

  return (
    <PermissionGate
      require={{ resource: "notifications", action: "manage" }}
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <ShieldOff size={32} className="mb-3 opacity-40" />
          <p className="text-sm">
            You don&apos;t have access to Notifications management.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Notifications
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage notification templates and send messages to users.
            </p>
          </div>
        </div>

        <NotificationAdminTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "templates" && <TemplatesPanel />}
        {activeTab === "send" && <SendPanel />}
      </div>
    </PermissionGate>
  )
}
