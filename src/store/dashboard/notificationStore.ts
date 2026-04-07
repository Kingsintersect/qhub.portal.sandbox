import { create } from "zustand";

export interface Notification {
    id: string;
    type: "success" | "warning" | "info" | "error";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    role?: string[];
}

interface NotificationState {
    notifications: Notification[];
    markRead: (id: string) => void;
    markAllRead: () => void;
    addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
    unreadCount: () => number;
}

const INITIAL: Notification[] = [
    {
        id: "n1",
        type: "success",
        title: "Result Published",
        message: "CSC 401 results are now available for viewing",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false,
    },
    {
        id: "n2",
        type: "warning",
        title: "Fee Deadline Approaching",
        message: "School fees due in 3 days — pay to avoid late surcharge",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
    },
    {
        id: "n3",
        type: "info",
        title: "Timetable Updated",
        message: "CSC 405 has been moved to Thursday 10:00 AM, Room LT-6",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: false,
    },
    {
        id: "n4",
        type: "info",
        title: "New Course Material",
        message: "Week 9 lecture slides for CSC 403 have been uploaded",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: true,
    },
    {
        id: "n5",
        type: "success",
        title: "Payment Confirmed",
        message: "Your school fee payment of ₦185,000 has been received",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
    },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: INITIAL,
    markRead: (id) =>
        set((s) => ({
            notifications: s.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),
    markAllRead: () =>
        set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    addNotification: (n) =>
        set((s) => ({
            notifications: [
                {
                    ...n,
                    id: `n-${Date.now()}`,
                    timestamp: new Date(),
                    read: false,
                },
                ...s.notifications,
            ],
        })),
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));