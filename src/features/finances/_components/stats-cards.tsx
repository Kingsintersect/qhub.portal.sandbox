"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
   TrendingUp, Clock, AlertTriangle,
   CheckCircle2, Activity, ArrowUpRight,
} from "lucide-react";
import type { FinancialSummaryStats } from "../types/finance.types";

interface StatsCardsProps {
   stats: FinancialSummaryStats;
   formatCurrency: (n: number) => string;
}

const CARD_CONFIG = [
   {
      key: "totalRevenue" as keyof FinancialSummaryStats,
      label: "Total Revenue",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
      isCurrency: true,
      trend: "+12.4%",
      trendUp: true,
   },
   {
      key: "totalPending" as keyof FinancialSummaryStats,
      label: "Pending Payments",
      icon: Clock,
      color: "from-amber-400 to-orange-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      borderColor: "border-amber-100 dark:border-amber-900/50",
      isCurrency: true,
      trend: "-3.1%",
      trendUp: false,
   },
   {
      key: "totalOverdue" as keyof FinancialSummaryStats,
      label: "Overdue Amount",
      icon: AlertTriangle,
      color: "from-red-400 to-rose-600",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      borderColor: "border-red-100 dark:border-red-900/50",
      isCurrency: true,
      trend: "+8.7%",
      trendUp: false,
   },
   {
      key: "collectionRate" as keyof FinancialSummaryStats,
      label: "Collection Rate",
      icon: CheckCircle2,
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/50",
      borderColor: "border-violet-100 dark:border-violet-900/50",
      isCurrency: false,
      trend: "+2.3%",
      trendUp: true,
   },
];

function AnimatedCounter({
   value,
   format,
}: {
   value: number;
   format: (n: number) => string;
}) {
   const ref = useRef<HTMLSpanElement>(null);

   useEffect(() => {
      if (!ref.current) return;
      const obj = { val: 0 };
      gsap.to(obj, {
         val: value,
         duration: 1.4,
         ease: "power2.out",
         onUpdate: () => {
            if (ref.current) ref.current.textContent = format(obj.val);
         },
      });
   }, [value, format]);

   return <span ref={ref}>0</span>;
}

const container = {
   hidden: {},
   show: { transition: { staggerChildren: 0.1 } },
};

const item = {
   hidden: { opacity: 0, y: 24, scale: 0.95 },
   show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, bounce: 0.3 } },
};

export function StatsCards({ stats, formatCurrency }: StatsCardsProps) {
   return (
      <motion.div
         variants={container}
         initial="hidden"
         animate="show"
         className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
         {CARD_CONFIG.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key] as number;

            return (
               <motion.div
                  key={card.key}
                  variants={item}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400 } }}
                  className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-card p-5 shadow-sm group cursor-default`}
               >
                  {/* Gradient orb background */}
                  <div
                     className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-linear-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  <div className="relative">
                     <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                           <Icon className={`w-5 h-5 ${card.textColor}`} />
                        </div>
                        <div
                           className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.trendUp
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-400"
                              }`}
                        >
                           <ArrowUpRight
                              className={`w-3 h-3 ${!card.trendUp ? "rotate-90" : ""}`}
                           />
                           {card.trend}
                        </div>
                     </div>

                     <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                           {card.label}
                        </p>
                        <p className={`text-2xl font-bold ${card.textColor} font-mono`}>
                           {card.isCurrency ? (
                              <AnimatedCounter value={value} format={formatCurrency} />
                           ) : (
                              <AnimatedCounter
                                 value={value}
                                 format={(n) => `${n.toFixed(1)}%`}
                              />
                           )}
                        </p>
                     </div>

                     {/* Progress bar for collection rate */}
                     {card.key === "collectionRate" && (
                        <div className="mt-3">
                           <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                 className={`h-full bg-linear-to-r ${card.color} rounded-full`}
                                 initial={{ width: 0 }}
                                 animate={{ width: `${value}%` }}
                                 transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                              />
                           </div>
                        </div>
                     )}

                     {/* Additional info */}
                     {card.key === "totalRevenue" && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                           <Activity className="w-3 h-3" />
                           {stats.paidCount} transactions collected
                        </p>
                     )}
                     {card.key === "totalPending" && (
                        <p className="text-xs text-muted-foreground mt-2">
                           {stats.pendingCount} awaiting payment
                        </p>
                     )}
                     {card.key === "totalOverdue" && (
                        <p className="text-xs text-red-400 mt-2 font-medium">
                           {stats.overdueCount} overdue invoices
                        </p>
                     )}
                  </div>
               </motion.div>
            );
         })}
      </motion.div>
   );
}
