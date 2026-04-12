"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Key, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: "roles" | "permissions" | "users" | "modules";
    trend?: string;
    delay?: number;
}

const iconMap = {
    roles: ShieldCheck,
    permissions: Key,
    users: Users,
    modules: TrendingUp,
};

const colorMap = {
    roles: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    permissions: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    users: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
    modules: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
};

export default function StatsCard({ title, value, icon, trend, delay = 0 }: StatsCardProps) {
    const Icon = iconMap[icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1.5">{value}</p>
                    {trend && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            {trend}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl bg-linear-to-br flex items-center justify-center",
                        colorMap[icon]
                    )}
                >
                    <Icon size={18} />
                </div>
            </div>
        </motion.div>
    );
}
