import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    notificationKeys,
    notificationMutationOptions,
    notificationQueryOptions,
} from "@/services/notificationApi";
import type {
    NotificationsQueryParams,
    UpdateTemplatePayload,
} from "@/types/notifications";

// ── Templates ────────────────────────────────

export function useNotificationTemplates() {
    return useQuery({
        ...notificationQueryOptions.templates(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useNotificationTemplateDetail(id: number) {
    return useQuery({
        ...notificationQueryOptions.templateDetail(id),
        enabled: id > 0,
    });
}

export function useCreateTemplate() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.createTemplate(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.templates() });
        },
    });
}

export function useUpdateTemplate() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.updateTemplate(),
        onSuccess: async (_, variables: { id: number; payload: UpdateTemplatePayload }) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: notificationKeys.templates() }),
                qc.invalidateQueries({ queryKey: notificationKeys.templateDetail(variables.id) }),
            ]);
        },
    });
}

export function useDeleteTemplate() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.deleteTemplate(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.templates() });
        },
    });
}

// ── Notifications ────────────────────────────

export function useNotifications(params?: NotificationsQueryParams) {
    return useQuery({
        ...notificationQueryOptions.notifications(params),
        staleTime: 1000 * 60 * 2,
    });
}

export function useUnreadCount() {
    return useQuery({
        ...notificationQueryOptions.unreadCount(),
    });
}

export function useSendNotification() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.send(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useSendBulkNotification() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.sendBulk(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.markRead(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient();
    return useMutation({
        ...notificationMutationOptions.markAllRead(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
