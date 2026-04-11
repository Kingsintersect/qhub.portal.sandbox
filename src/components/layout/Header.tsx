"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, Menu, X, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore, useNotificationStore, useAuthStore, useThemeStore } from "@/store";
import AnimatedLink from "../custom/AnimatedLink";

const typeIcon: Record<string, { bg: string; color: string; char: string }> = {
    success: { bg: "bg-emerald-500/10", color: "text-emerald-500", char: "✓" },
    warning: { bg: "bg-amber-500/10", color: "text-amber-500", char: "!" },
    info: { bg: "bg-blue-500/10", color: "text-blue-500", char: "i" },
    error: { bg: "bg-red-500/10", color: "text-red-500", char: "✕" },
};

function timeAgo(d: Date) {
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export default function Header() {
    const { user } = useAuthStore();
    const { theme, toggle: toggleTheme } = useThemeStore();
    const { toggleMobile } = useSidebarStore();
    const { notifications, markRead, markAllRead, unreadCount } = useNotificationStore();
    const [showNotif, setShowNotif] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const unread = unreadCount();

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-6 bg-background border-b border-border sticky top-0 z-10 backdrop-blur-sm">
            {/* Mobile menu */}
            <button
                onClick={toggleMobile}
                className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors text-foreground"
            >
                <Menu size={18} />
            </button>

            {/* <Logo
                href="/"
                showText={false}
                imageWidth={32}
                imageHeight={32}
                imageClassName="h-8 w-8 rounded-lg"
                className="items-center"
            /> */}

            {/* Search */}
            <div className="flex-1 max-w-sm relative">
                <Search
                    size={15}
                    className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
                        searchFocused ? "text-primary" : "text-muted-foreground"
                    )}
                />
                <input
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search courses, students…"
                    className={cn(
                        "w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-muted border border-transparent outline-none transition-all duration-200",
                        "placeholder:text-muted-foreground text-foreground",
                        searchFocused && "border-primary bg-background shadow-sm ring-2 ring-primary/20"
                    )}
                />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <AnimatedLink href="/" variant="gradient-underline">
                    Home
                </AnimatedLink>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={theme}
                            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                        </motion.div>
                    </AnimatePresence>
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotif((p) => !p)}
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Bell size={17} />
                        {unread > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
                            >
                                {unread > 9 ? "9+" : unread}
                            </motion.span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotif && (
                            <>
                                <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowNotif(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">Notifications</p>
                                            <p className="text-xs text-muted-foreground">{unread} unread</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {unread > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Mark all read"
                                                >
                                                    <CheckCheck size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowNotif(false)}
                                                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-[--border]">
                                        {notifications.map((n, i) => {
                                            const meta = typeIcon[n.type];
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    initial={{ opacity: 0, x: 8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onClick={() => markRead(n.id)}
                                                    className={cn(
                                                        "flex gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer",
                                                        !n.read && "bg-primary/5"
                                                    )}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", meta.bg, meta.color)}>
                                                        {meta.char}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
                                                    </div>
                                                    {!n.read ? (
                                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                    ) : (
                                                        <Check size={12} className="text-muted-foreground/40 shrink-0 mt-1" />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User */}
                {user && (
                    <div className="flex items-center gap-2.5 pl-1.5 border-l border-border ml-1">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold text-foreground leading-tight">
                                {greeting()}, {user.name.split(" ")[0]}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {user.department ?? user.role.replace("_", " ")}
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-background"
                        >
                            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </motion.div>
                    </div>
                )}
            </div>
        </header>
    );
}
