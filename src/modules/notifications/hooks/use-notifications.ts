"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationsOptions, getUnreadCountOptions } from "../services/notification.service";
import type { NotificationFilter } from "../types";

export function useNotifications(filters: NotificationFilter = {}) {
   return useQuery(getNotificationsOptions(filters));
}

export function useUnreadCount() {
   return useQuery(getUnreadCountOptions());
}
