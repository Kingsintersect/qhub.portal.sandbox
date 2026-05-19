"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { NotificationTabs, type NotificationTab } from "./components/NotificationTabs";
import { TemplatesPanel } from "./components/TemplatesPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { SendPanel } from "./components/SendPanel";

export default function NotificationPage() {
   const [activeTab, setActiveTab] = useState<NotificationTab>("templates");
   const { data: unreadCount = 0 } = useUnreadCount();

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                  <Bell size={20} className="text-primary" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                     Manage notification templates, view sent notifications, and send new messages.
                  </p>
               </div>
            </div>
            {unreadCount > 0 && (
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  {unreadCount} unread
               </span>
            )}
         </div>

         {/* Tabs */}
         <NotificationTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{ notifications: unreadCount || undefined }}
         />

         {/* Panels */}
         {activeTab === "templates" && <TemplatesPanel />}
         {activeTab === "notifications" && <NotificationsPanel />}
         {activeTab === "send" && <SendPanel />}
      </div>
   );
}
