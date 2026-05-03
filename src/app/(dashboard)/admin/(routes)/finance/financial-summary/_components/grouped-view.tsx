"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
   ChevronRight, TrendingUp, Users, AlertTriangle,
   CheckCircle2, BarChart3,
} from "lucide-react";
import type { GroupedFinancialData, GroupBy, Transaction, TransactionStatus } from "../types/finance.types";
import StatusBadge from "@/components/custom/StatusBadge";

const STATUS_BADGE_MAP: Record<TransactionStatus, { label: string; variant: "success" | "warning" | "destructive" | "default" | "purple" }> = {
   paid: { label: "Paid", variant: "success" },
   pending: { label: "Pending", variant: "warning" },
   overdue: { label: "Overdue", variant: "destructive" },
   cancelled: { label: "Cancelled", variant: "default" },
   refunded: { label: "Refunded", variant: "purple" },
};

interface GroupedViewProps {
   data: GroupedFinancialData[];
   groupBy: GroupBy;
   loading: boolean;
   formatCurrency: (n: number) => string;
   onViewInvoice: (tx: Transaction) => void;
}

function StatChip({
   icon: Icon,
   label,
   value,
   color,
}: {
   icon: React.ElementType;
   label: string;
   value: string;
   color: string;
}) {
   return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${color}`}>
         <Icon className="w-3 h-3" />
         <span className="text-xs font-semibold">{value}</span>
         <span className="text-xs opacity-70 hidden sm:inline">{label}</span>
      </div>
   );
}

function GroupRow({
   group,
   depth = 0,
   formatCurrency,
   onViewInvoice,
}: {
   group: GroupedFinancialData;
   depth?: number;
   formatCurrency: (n: number) => string;
   onViewInvoice: (tx: Transaction) => void;
}) {
   const [open, setOpen] = useState(depth === 0);
   const [showTx, setShowTx] = useState(false);
   const headerRef = useRef<HTMLDivElement>(null);
   const { stats } = group;

   const handleToggle = () => {
      setOpen((o) => !o);
      if (headerRef.current) {
         gsap.fromTo(
            headerRef.current,
            { scale: 0.99 },
            { scale: 1, duration: 0.15, ease: "power2.out" }
         );
      }
   };

   return (
      <div
         className={`border border-border rounded-2xl overflow-hidden ${depth === 0 ? "bg-card" : "bg-muted border-dashed"
            }`}
         style={{ marginLeft: depth * 16 }}
      >
         {/* Group header */}
         <div
            ref={headerRef}
            onClick={handleToggle}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted transition-colors group select-none"
         >
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
               <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 flex-wrap">
                  <h4
                     className={`font-semibold text-foreground truncate ${depth === 0 ? "text-sm" : "text-xs"
                        }`}
                  >
                     {group.groupLabel}
                  </h4>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                     {stats.transactionCount} transactions
                  </span>
               </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
               <StatChip
                  icon={TrendingUp}
                  label="Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  color="bg-emerald-50 text-emerald-700"
               />
               {stats.totalPending > 0 && (
                  <StatChip
                     icon={CheckCircle2}
                     label="Pending"
                     value={formatCurrency(stats.totalPending)}
                     color="bg-amber-50 text-amber-700"
                  />
               )}
               {stats.totalOverdue > 0 && (
                  <StatChip
                     icon={AlertTriangle}
                     label="Overdue"
                     value={formatCurrency(stats.totalOverdue)}
                     color="bg-red-50 text-red-600"
                  />
               )}
               <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary bg-opacity-10">
                  <BarChart3 className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold text-primary">
                     {stats.collectionRate.toFixed(0)}%
                  </span>
               </div>
            </div>
         </div>

         {/* Expanded content */}
         <AnimatePresence>
            {open && (
               <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border"
               >
                  <div className="p-4 space-y-3">
                     {/* Sub-groups */}
                     {group.subGroups?.map((sub) => (
                        <GroupRow
                           key={sub.groupKey}
                           group={sub}
                           depth={depth + 1}
                           formatCurrency={formatCurrency}
                           onViewInvoice={onViewInvoice}
                        />
                     ))}

                     {/* Transactions toggle */}
                     {group.transactions.length > 0 && !group.subGroups?.length && (
                        <div>
                           <button
                              onClick={() => setShowTx((s) => !s)}
                              className="text-xs font-medium text-primary flex items-center gap-1 hover:opacity-70 transition mb-2"
                           >
                              <Users className="w-3 h-3" />
                              {showTx ? "Hide" : "Show"} {group.transactions.length} transactions
                           </button>

                           <AnimatePresence>
                              {showTx && (
                                 <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                 >
                                    <div className="rounded-xl border border-border overflow-hidden">
                                       <table className="w-full text-xs">
                                          <thead>
                                             <tr className="bg-muted border-b border-border">
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Invoice</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Student</th>
                                                <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status</th>
                                                <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Action</th>
                                             </tr>
                                          </thead>
                                          <tbody>
                                             {group.transactions.slice(0, 20).map((tx) => (
                                                <tr key={tx.id} className="border-b border-border hover:bg-muted transition">
                                                   <td className="px-3 py-2 font-mono text-primary">{tx.invoiceNumber}</td>
                                                   <td className="px-3 py-2 text-foreground">{tx.studentName}</td>
                                                   <td className="px-3 py-2 text-right font-mono text-foreground font-semibold">
                                                      {formatCurrency(tx.amount)}
                                                   </td>
                                                   <td className="px-3 py-2">
                                                      <StatusBadge {...STATUS_BADGE_MAP[tx.status]} />
                                                   </td>
                                                   <td className="px-3 py-2 text-right">
                                                      <button
                                                         onClick={() => onViewInvoice(tx)}
                                                         className="text-primary hover:underline text-xs font-medium"
                                                      >
                                                         Invoice
                                                      </button>
                                                   </td>
                                                </tr>
                                             ))}
                                          </tbody>
                                       </table>
                                       {group.transactions.length > 20 && (
                                          <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border">
                                             +{group.transactions.length - 20} more — use the Transactions tab to view all
                                          </div>
                                       )}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     )}

                     {/* If group has sub-groups, show transactions in those */}
                     {group.subGroups && group.transactions.length > 0 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                           Expand semesters above to view individual transactions
                        </div>
                     )}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

export function GroupedView({
   data,
   loading,
   formatCurrency,
   onViewInvoice,
}: GroupedViewProps) {
   if (loading) {
      return (
         <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
            ))}
         </div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="space-y-3"
      >
         {data.map((group) => (
            <GroupRow
               key={group.groupKey}
               group={group}
               depth={0}
               formatCurrency={formatCurrency}
               onViewInvoice={onViewInvoice}
            />
         ))}
      </motion.div>
   );
}
