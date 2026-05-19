"use client";

import { useState, useMemo } from "react";
import { BellRing, Eye, CheckCheck, Search, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SectionCard from "@/components/custom/SectionCard";
import EmptyState from "@/components/custom/EmptyState";
import {
    useNotifications,
    useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import type { NotificationChannel, NotificationStatus } from "@/types/notifications";
import type { Notification } from "@/types/notifications";
import { ChannelBadge, NotificationStatusBadge } from "./NotificationBadges";
import { NotificationDetailModal } from "./NotificationDetailModal";

const STATUS_OPTIONS: { value: NotificationStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "SENT", label: "Sent" },
    { value: "FAILED", label: "Failed" },
    { value: "READ", label: "Read" },
];

const CHANNEL_OPTIONS: { value: NotificationChannel | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Channels" },
    { value: "EMAIL", label: "Email" },
    { value: "SMS", label: "SMS" },
    { value: "IN_APP", label: "In-App" },
    { value: "PUSH", label: "Push" },
];

export function NotificationsPanel() {
    const [statusFilter, setStatusFilter] = useState<NotificationStatus | "ALL">("ALL");
    const [channelFilter, setChannelFilter] = useState<NotificationChannel | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<Notification | null>(null);

    const { data, isLoading } = useNotifications({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        channel: channelFilter !== "ALL" ? channelFilter : undefined,
    });

    const markAllRead = useMarkAllNotificationsRead();

    const notifications = data?.data ?? [];
    const meta = data?.meta;

    const filtered = useMemo(() => {
        if (!search.trim()) return notifications;
        const q = search.toLowerCase();
        return notifications.filter(
            (n) =>
                n.subject.toLowerCase().includes(q) ||
                n.userName?.toLowerCase().includes(q) ||
                n.userEmail?.toLowerCase().includes(q)
        );
    }, [notifications, search]);

    const handleMarkAllRead = async () => {
        try {
            await markAllRead.mutateAsync();
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark notifications as read");
        }
    };

    const openDetail = (n: Notification) => {
        setSelected(n);
        setDetailOpen(true);
    };

    return (
        <>
            <SectionCard
                title="All Notifications"
                icon={BellRing}
                badge={
                    meta && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5">
                            {meta.total}
                        </span>
                    )
                }
                actions={
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleMarkAllRead}
                        disabled={markAllRead.isPending}
                    >
                        {markAllRead.isPending
                            ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                            : <CheckCheck className="size-4" data-icon="inline-start" />}
                        Mark all read
                    </Button>
                }
            >
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-8 h-8 w-48 text-sm"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                        <SelectTrigger className="h-8 w-36 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)}>
                        <SelectTrigger className="h-8 w-36 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CHANNEL_OPTIONS.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={BellRing}
                        title="No notifications found"
                        description="Adjust your filters or send a notification to get started."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipient</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-25">Channel</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-25">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-40">Sent at</th>
                                    <th className="w-12.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((n) => (
                                    <tr
                                        key={n.id}
                                        className="group/row hover:bg-accent/40 transition-colors cursor-pointer"
                                        onClick={() => openDetail(n)}
                                    >
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium text-foreground">{n.userName ?? `User #${n.userId}`}</p>
                                            {n.userEmail && <p className="text-xs text-muted-foreground">{n.userEmail}</p>}
                                        </td>
                                        <td className="py-3 px-4 max-w-65">
                                            <p className="text-sm text-foreground truncate" title={n.subject}>{n.subject}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <ChannelBadge channel={n.channel} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <NotificationStatusBadge status={n.status} />
                                        </td>
                                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {n.sentAt
                                                ? new Date(n.sentAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                                : "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button
                                                size="icon" variant="ghost" className="size-7 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); openDetail(n); }}
                                            >
                                                <Eye size={13} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <NotificationDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                notification={selected}
            />
        </>
    );
}
