import { createApiQueryOptions, createApiMutationOptions } from "@/lib/clients/apiClient";
import type {
   NotificationFilter,
   NotificationItem,
   NotificationListResponse,
   UnreadCountResponse,
   MarkReadResponse,
} from "../types";

// ── Query key factory ─────────────────────────────────────────────────────────

export const notificationKeys = {
   all: ["notifications"] as const,
   lists: () => [...notificationKeys.all, "list"] as const,
   list: (filters: NotificationFilter) => [...notificationKeys.lists(), filters] as const,
   detail: (id: number) => [...notificationKeys.all, "detail", id] as const,
   unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

// ── Mock seed data ────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

const mockNotifications: NotificationItem[] = [
   {
      id: 1,
      subject: "Assignment deadline reminder",
      body: "Your assignment 'Data Structures Lab Report' is due in 24 hours. Please ensure you submit before the deadline.",
      channel: "IN_APP",
      status: "SENT",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readAt: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 2,
      subject: "New assessment published",
      body: "A new quiz 'Week 7: Sorting Algorithms' has been published for CSC301. It is available until Friday 23:59.",
      channel: "IN_APP",
      status: "SENT",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      readAt: null,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 3,
      subject: "Grade published: CSC301",
      body: "Your results for Data Structures & Algorithms (CSC301) have been published. Log in to view your grade.",
      channel: "EMAIL",
      status: "SENT",
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 4,
      subject: "Timetable change notice",
      body: "The CSC401 lecture scheduled for Monday 10:00–12:00 has been moved to Wednesday 14:00–16:00 in Hall B.",
      channel: "SMS",
      status: "SENT",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 5,
      subject: "Course registration opens tomorrow",
      body: "Course registration for the 2025/2026 First Semester opens tomorrow at 08:00 AM. Ensure your fee clearance is up to date.",
      channel: "IN_APP",
      status: "SENT",
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 6,
      subject: "Welcome to QHub Portal",
      body: "Your account has been verified. You can now access all academic resources, timetables, and course materials.",
      channel: "PUSH",
      status: "READ",
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
   },
   {
      id: 7,
      subject: "Exam timetable released",
      body: "The First Semester examination timetable for 2024/2025 has been released. Check the portal for your schedule.",
      channel: "IN_APP",
      status: "SENT",
      sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
   },
];

let _notifications = mockNotifications.map((n) => ({ ...n }));

// ── Service ───────────────────────────────────────────────────────────────────

const notificationService = {
   // GET /notifications
   getNotifications: async (filters: NotificationFilter = {}): Promise<NotificationListResponse> => {
      await delay();
      // TODO: replace with → return apiClient.get<NotificationListResponse>("/notifications", { params: filters });

      let items = [..._notifications];

      if (filters.status) {
         const statusMap: Record<string, string[]> = {
            READ: ["READ"],
            PENDING: ["PENDING"],
            SENT: ["SENT"],
            FAILED: ["FAILED"],
         };
         items = items.filter((n) => statusMap[filters.status!]?.includes(n.status));
      }

      if (filters.channel) {
         items = items.filter((n) => n.channel === filters.channel);
      }

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const start = (page - 1) * limit;
      const paginated = items.slice(start, start + limit);
      const unreadCount = _notifications.filter((n) => n.readAt === null && n.status === "SENT").length;

      return {
         data: paginated,
         meta: { total: items.length, page, limit, unreadCount },
      };
   },

   // GET /notifications/unread-count
   getUnreadCount: async (): Promise<UnreadCountResponse> => {
      await delay(200);
      // TODO: replace with → return apiClient.get<UnreadCountResponse>("/notifications/unread-count");
      const unreadCount = _notifications.filter((n) => n.readAt === null && n.status === "SENT").length;
      return { unreadCount };
   },

   // PATCH /notifications/:id/read
   markRead: async (id: number): Promise<MarkReadResponse> => {
      await delay(200);
      // TODO: replace with → return apiClient.patch<MarkReadResponse>(`/notifications/${id}/read`);
      const notification = _notifications.find((n) => n.id === id);
      if (!notification) throw new Error(`Notification ${id} not found`);
      const readAt = new Date().toISOString();
      notification.readAt = readAt;
      notification.status = "READ";
      return { id, status: "READ", readAt };
   },

   // PATCH /notifications/read-all
   markAllRead: async (): Promise<{ updated: number }> => {
      await delay(300);
      // TODO: replace with → return apiClient.patch<{ updated: number }>("/notifications/read-all");
      const readAt = new Date().toISOString();
      let count = 0;
      _notifications = _notifications.map((n) => {
         if (n.readAt === null) {
            count++;
            return { ...n, status: "READ" as const, readAt };
         }
         return n;
      });
      return { updated: count };
   },
};

// ── React Query option builders ───────────────────────────────────────────────

export const getNotificationsOptions = (filters: NotificationFilter = {}) =>
   createApiQueryOptions({
      queryKey: notificationKeys.list(filters),
      queryFn: () => notificationService.getNotifications(filters),
      staleTime: 30 * 1000,
   });

export const getUnreadCountOptions = () =>
   createApiQueryOptions({
      queryKey: notificationKeys.unreadCount(),
      queryFn: () => notificationService.getUnreadCount(),
      staleTime: 15 * 1000,
      refetchInterval: 60 * 1000, // poll every minute
   });

export const markReadMutationOptions = () =>
   createApiMutationOptions<MarkReadResponse, number>({
      mutationFn: (id) => notificationService.markRead(id),
   });

export const markAllReadMutationOptions = () =>
   createApiMutationOptions<{ updated: number }, void>({
      mutationFn: () => notificationService.markAllRead(),
   });

export { notificationService };
