"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
   markReadMutationOptions,
   markAllReadMutationOptions,
   notificationKeys,
} from "../services/notification.service";

export function useMarkRead() {
   const queryClient = useQueryClient();

   return useMutation({
      ...markReadMutationOptions(),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
         queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      },
   });
}

export function useMarkAllRead() {
   const queryClient = useQueryClient();

   return useMutation({
      ...markAllReadMutationOptions(),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
         queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      },
   });
}
