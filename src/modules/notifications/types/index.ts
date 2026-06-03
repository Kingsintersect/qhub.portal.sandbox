import type { z } from "zod";
import type {
   notificationItemSchema,
   notificationListResponseSchema,
   unreadCountResponseSchema,
   markReadResponseSchema,
   notificationFilterSchema,
   notificationChannelSchema,
   notificationStatusSchema,
} from "../schemas";

export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;
export type MarkReadResponse = z.infer<typeof markReadResponseSchema>;
export type NotificationFilter = z.infer<typeof notificationFilterSchema>;

export type PaginationMeta = {
   total: number;
   page: number;
   limit: number;
   unreadCount: number;
};
