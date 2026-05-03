"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
   ChevronLeft, ChevronRight, ArrowUpDown, Eye,
   FileText, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { Transaction, PaginationState, TransactionStatus } from "../types/finance.types";
import StatusBadge from "@/components/custom/StatusBadge";

interface TransactionTableProps {
   transactions: Transaction[];
   loading: boolean;
   pagination: PaginationState;
   onPageChange: (page: number) => void;
   onViewInvoice: (tx: Transaction) => void;
   formatCurrency: (n: number) => string;
}

const STATUS_BADGE_MAP: Record<TransactionStatus, { label: string; variant: "success" | "warning" | "destructive" | "default" | "purple" }> = {
   paid: { label: "Paid", variant: "success" },
   pending: { label: "Pending", variant: "warning" },
   overdue: { label: "Overdue", variant: "destructive" },
   cancelled: { label: "Cancelled", variant: "default" },
   refunded: { label: "Refunded", variant: "purple" },
};

function SortHeader({
   label,
   field,
   sortKey,
   onSort,
}: {
   label: string;
   field: keyof Transaction;
   sortKey: keyof Transaction | null;
   onSort: (key: keyof Transaction) => void;
}) {
   return (
      <th
         onClick={() => onSort(field)}
         className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none group whitespace-nowrap"
      >
         <span className="flex items-center gap-1 group-hover:text-foreground transition">
            {label}
            <ArrowUpDown
               className={`w-3 h-3 transition ${sortKey === field ? "text-primary" : "opacity-0 group-hover:opacity-60"
                  }`}
            />
         </span>
      </th>
   );
}

export function TransactionTable({
   transactions,
   loading,
   pagination,
   onPageChange,
   onViewInvoice,
   formatCurrency,
}: TransactionTableProps) {
   const [sortKey, setSortKey] = useState<keyof Transaction | null>(null);
   const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
   const tbodyRef = useRef<HTMLTableSectionElement>(null);

   // GSAP row entrance
   useEffect(() => {
      if (!tbodyRef.current || loading) return;
      const rows = tbodyRef.current.querySelectorAll("tr");
      gsap.fromTo(
         rows,
         { opacity: 0, y: 8 },
         { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: "power2.out", clearProps: "all" }
      );
   }, [transactions, loading]);

   const handleSort = (key: keyof Transaction) => {
      if (sortKey === key) {
         setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
         setSortKey(key);
         setSortDir("asc");
      }
   };

   const sorted = [...transactions].sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
         return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
         return sortDir === "asc" ? av - bv : bv - av;
      }
      return 0;
   });

   // Pagination controls
   const { page, totalPages, total } = pagination;
   const from = (page - 1) * pagination.pageSize + 1;
   const to = Math.min(page * pagination.pageSize, total);

   const pageNumbers = (() => {
      const pages: (number | "...")[] = [];
      if (totalPages <= 7) {
         return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
         pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
      return pages;
   })();

   return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full min-w-225">
               <thead>
                  <tr className="border-b border-border bg-muted">
                     <SortHeader label="Invoice" field="invoiceNumber" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Student" field="studentName" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Program" field="programName" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Semester" field="semester" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Type" field="type" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Amount" field="amount" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Balance" field="balance" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Status" field="status" sortKey={sortKey} onSort={handleSort} />
                     <SortHeader label="Due Date" field="dueDate" sortKey={sortKey} onSort={handleSort} />
                     <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody ref={tbodyRef}>
                  <AnimatePresence mode="wait">
                     {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                           <tr key={`skel-${i}`} className="border-b border-border">
                              {Array.from({ length: 10 }).map((_, j) => (
                                 <td key={j} className="px-4 py-3.5">
                                    <div
                                       className="h-3 bg-muted rounded animate-pulse"
                                       style={{ width: `${60 + ((i * 10 + j * 7) % 30)}%` }}
                                    />
                                 </td>
                              ))}
                           </tr>
                        ))
                     ) : sorted.length === 0 ? (
                        <tr>
                           <td colSpan={10} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                 <FileText className="w-10 h-10 opacity-30" />
                                 <p className="text-sm font-medium">No transactions found</p>
                                 <p className="text-xs opacity-70">Try adjusting your filters</p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        sorted.map((tx) => (
                           <tr
                              key={tx.id}
                              className="border-b border-border hover:bg-muted transition-colors duration-100 group"
                           >
                              <td className="px-4 py-3.5">
                                 <span className="text-xs font-mono font-semibold text-primary">
                                    {tx.invoiceNumber}
                                 </span>
                              </td>
                              <td className="px-4 py-3.5">
                                 <div>
                                    <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                       {tx.studentName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{tx.studentId}</p>
                                 </div>
                              </td>
                              <td className="px-4 py-3.5">
                                 <span className="text-xs text-foreground whitespace-nowrap">{tx.programName}</span>
                              </td>
                              <td className="px-4 py-3.5">
                                 <div>
                                    <p className="text-xs text-foreground">{tx.semester}</p>
                                    <p className="text-xs text-muted-foreground">{tx.academicYear}</p>
                                 </div>
                              </td>
                              <td className="px-4 py-3.5">
                                 <span className="capitalize text-xs text-muted-foreground">{tx.type}</span>
                              </td>
                              <td className="px-4 py-3.5 font-mono">
                                 <span className="text-sm font-semibold text-foreground">
                                    {formatCurrency(tx.amount)}
                                 </span>
                              </td>
                              <td className="px-4 py-3.5 font-mono">
                                 <span
                                    className={`text-sm font-semibold ${tx.balance > 0 ? "text-red-500" : "text-emerald-600"
                                       }`}
                                 >
                                    {tx.balance > 0 ? formatCurrency(tx.balance) : "—"}
                                 </span>
                              </td>
                              <td className="px-4 py-3.5">
                                 <StatusBadge {...STATUS_BADGE_MAP[tx.status]} />
                              </td>
                              <td className="px-4 py-3.5">
                                 <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(tx.dueDate).toLocaleDateString("en-NG", {
                                       day: "numeric",
                                       month: "short",
                                       year: "numeric",
                                    })}
                                 </span>
                              </td>
                              <td className="px-4 py-3.5">
                                 <div className="flex items-center justify-end gap-1">
                                    <button
                                       onClick={() => onViewInvoice(tx)}
                                       className="p-1.5 rounded-lg hover:bg-primary hover:text-white text-muted-foreground transition-all duration-150"
                                       title="View Invoice"
                                    >
                                       <Eye className="w-3.5 h-3.5" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">
               Showing <span className="font-semibold text-foreground">{from}–{to}</span>{" "}
               of <span className="font-semibold text-foreground">{total}</span> transactions
            </p>

            <div className="flex items-center gap-1.5">
               {/* First */}
               <button
                  onClick={() => onPageChange(1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
               >
                  <ChevronsLeft className="w-3.5 h-3.5" />
               </button>
               {/* Prev */}
               <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
               >
                  <ChevronLeft className="w-3.5 h-3.5" />
               </button>

               {/* Page numbers */}
               {pageNumbers.map((p, i) =>
                  p === "..." ? (
                     <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-xs">
                        …
                     </span>
                  ) : (
                     <button
                        key={p}
                        onClick={() => onPageChange(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${p === page
                           ? "bg-primary text-white border border-primary"
                           : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                           }`}
                     >
                        {p}
                     </button>
                  )
               )}

               {/* Next */}
               <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
               >
                  <ChevronRight className="w-3.5 h-3.5" />
               </button>
               {/* Last */}
               <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
               >
                  <ChevronsRight className="w-3.5 h-3.5" />
               </button>
            </div>
         </div>
      </div>
   );
}
