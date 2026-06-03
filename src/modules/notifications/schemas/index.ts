import { z } from "zod";

export const notificationChannelSchema = z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]);

export const notificationStatusSchema = z.enum(["PENDING", "SENT", "FAILED", "READ"]);

export const notificationItemSchema = z.object({
   id: z.number(),
   subject: z.string(),
   body: z.string(),
   channel: notificationChannelSchema,
   status: notificationStatusSchema,
   sentAt: z.string().nullable(),
   readAt: z.string().nullable(),
   createdAt: z.string(),
});

export const notificationListResponseSchema = z.object({
   data: z.array(notificationItemSchema),
   meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      unreadCount: z.number(),
   }),
});

export const unreadCountResponseSchema = z.object({
   unreadCount: z.number(),
});

export const markReadResponseSchema = z.object({
   id: z.number(),
   status: z.literal("READ"),
   readAt: z.string(),
});

export const notificationFilterSchema = z.object({
   status: notificationStatusSchema.optional(),
   channel: notificationChannelSchema.optional(),
   page: z.number().min(1).optional(),
   limit: z.number().min(1).max(100).optional(),
});
