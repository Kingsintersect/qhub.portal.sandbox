"use client";

import Modal from "@/components/custom/Modal";
import type { Notification } from "@/types/notifications";
import { ChannelBadge, NotificationStatusBadge } from "./NotificationBadges";

interface NotificationDetailModalProps {
   open: boolean;
   onClose: () => void;
   notification: Notification | null;
}

export function NotificationDetailModal({
   open,
   onClose,
   notification,
}: NotificationDetailModalProps) {
   if (!notification) return null;

   return (
      <Modal
         open={open}
         onClose={onClose}
         title="Notification Detail"
         subtitle={`ID #${notification.id}`}
         size="md"
      >
         <div className="p-5 space-y-4">
            {/* Meta row */}
            <div className="flex flex-wrap gap-2">
               <ChannelBadge channel={notification.channel} />
               <NotificationStatusBadge status={notification.status} />
            </div>

            {/* Recipient */}
            <div>
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Recipient</p>
               <p className="text-sm font-medium text-foreground">
                  {notification.userName ?? `User #${notification.userId}`}
               </p>
               {notification.userEmail && (
                  <p className="text-xs text-muted-foreground">{notification.userEmail}</p>
               )}
            </div>

            {/* Subject */}
            <div>
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Subject</p>
               <p className="text-sm text-foreground">{notification.subject}</p>
            </div>

            {/* Body */}
            <div>
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Body</p>
               <pre className="text-sm text-foreground whitespace-pre-wrap font-sans bg-muted/50 rounded-xl p-3 leading-relaxed">
                  {notification.body}
               </pre>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-xs">
               <div>
                  <p className="text-muted-foreground">Sent at</p>
                  <p className="text-foreground font-medium">
                     {notification.sentAt
                        ? new Date(notification.sentAt).toLocaleString("en-GB")
                        : "—"}
                  </p>
               </div>
               <div>
                  <p className="text-muted-foreground">Read at</p>
                  <p className="text-foreground font-medium">
                     {notification.readAt
                        ? new Date(notification.readAt).toLocaleString("en-GB")
                        : "—"}
                  </p>
               </div>
            </div>
         </div>
      </Modal>
   );
}
