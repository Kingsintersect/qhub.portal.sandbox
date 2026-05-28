"use client";

import { cn } from "@/lib/utils";
import { LayoutTemplate, BellRing, Send } from "lucide-react";

export type NotificationTab = "templates" | "notifications" | "send";

const TABS: { value: NotificationTab; label: string; icon: React.ElementType }[] = [
    { value: "templates", label: "Templates", icon: LayoutTemplate },
    { value: "notifications", label: "All Notifications", icon: BellRing },
    { value: "send", label: "Send", icon: Send },
];

interface NotificationTabsProps {
    active: NotificationTab;
    onChange: (tab: NotificationTab) => void;
    counts?: Partial<Record<NotificationTab, number>>;
}

export function NotificationTabs({ active, onChange, counts }: NotificationTabsProps) {
    return (
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            {TABS.map(({ value, label, icon: Icon }) => {
                const isActive = active === value;
                const count = counts?.[value];
                return (
                    <button
                        key={value}
                        onClick={() => onChange(value)}
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon size={14} />
                        {label}
                        {count !== undefined && count > 0 && (
                            <span
                                className={cn(
                                    "inline-flex items-center justify-center min-w-4.5 h-4.5 rounded-full text-[10px] font-semibold px-1",
                                    isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
