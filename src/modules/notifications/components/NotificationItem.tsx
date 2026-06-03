"use client";

import { Bell, Mail, MessageSquare, Smartphone, Bell as BellIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMarkRead } from "../hooks/use-notification-mutations";
import type { NotificationItem, NotificationChannel } from "../types";

// ── Channel config ────────────────────────────────────────────────────────────

const channelConfig: Record<NotificationChannel, { icon: React.ElementType; label: string; colour: string }> = {
   IN_APP: { icon: BellIcon, label: "In-App", colour: "text-blue-500" },
   EMAIL: { icon: Mail, label: "Email", colour: "text-purple-500" },
   SMS: { icon: MessageSquare, label: "SMS", colour: "text-green-500" },
   PUSH: { icon: Smartphone, label: "Push", colour: "text-orange-500" },
};

function formatRelativeTime(dateStr: string): string {
   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
   if (diff < 1) return "Just now";
   if (diff < 60) return `${diff}m ago`;
   if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
   if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
   return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NotificationItemProps {
   notification: NotificationItem;
}

export function NotificationItemCard({ notification }: NotificationItemProps) {
   const isUnread = notification.readAt === null && notification.status === "SENT";
   const { icon: ChannelIcon, label: channelLabel, colour } = channelConfig[notification.channel];
   const markRead = useMarkRead();

   const handleClick = () => {
      if (isUnread) {
         markRead.mutate(notification.id);
      }
   };

   return (
      <div
         role="button"
         tabIndex={0}
         onClick={handleClick}
         onKeyDown={(e) => e.key === "Enter" && handleClick()}
         className={cn(
            "group flex gap-4 px-5 py-4 border-b border-border/60 last:border-none transition-colors cursor-pointer",
            isUnread
               ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
               : "hover:bg-muted/30"
         )}
      >
         {/* Channel icon */}
         <div className={cn("mt-0.5 shrink-0", colour)}>
            <ChannelIcon size={18} />
         </div>

         {/* Content */}
         <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
               <span className={cn("text-sm leading-snug line-clamp-1", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                  {notification.subject}
               </span>
               <div className="flex items-center gap-1.5 shrink-0">
                  {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread" />}
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                     {formatRelativeTime(notification.createdAt)}
                  </span>
               </div>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
               {notification.body}
            </p>

            <div className="mt-1.5">
               <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-1 font-normal">
                  <ChannelIcon size={9} />
                  {channelLabel}
               </Badge>
            </div>
         </div>
      </div>
   );
}
