"use client";

import StatusBadge from "@/components/custom/StatusBadge";
import type { NotificationChannel, NotificationStatus } from "@/types/notifications";

// ── Channel badge ─────────────────────────────

const CHANNEL_CONFIG: Record<
   NotificationChannel,
   { label: string; variant: "info" | "success" | "purple" | "orange" }
> = {
   EMAIL: { label: "Email", variant: "info" },
   SMS: { label: "SMS", variant: "orange" },
   IN_APP: { label: "In-App", variant: "purple" },
   PUSH: { label: "Push", variant: "success" },
};

export function ChannelBadge({ channel }: { channel: NotificationChannel }) {
   const cfg = CHANNEL_CONFIG[channel];
   return <StatusBadge label={cfg.label} variant={cfg.variant} dot />;
}

// ── Status badge ─────────────────────────────

const STATUS_CONFIG: Record<
   NotificationStatus,
   { label: string; variant: "success" | "warning" | "destructive" | "default" }
> = {
   SENT: { label: "Sent", variant: "success" },
   PENDING: { label: "Pending", variant: "warning" },
   FAILED: { label: "Failed", variant: "destructive" },
   READ: { label: "Read", variant: "default" },
};

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
   const cfg = STATUS_CONFIG[status];
   return <StatusBadge label={cfg.label} variant={cfg.variant} dot />;
}
