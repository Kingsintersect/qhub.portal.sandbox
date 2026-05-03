"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
   LayoutDashboard, TableProperties, Layers, Wallet,
} from "lucide-react";

// ─── Root level shared imports ────────────────────────────────────────────────
import {
   useFinancialDashboard,
   useTransactions,
   useGroupedData,
   useInvoice,
   useCurrencyFormatter,
} from "./hooks/use-financial-data";
import { useExport } from "./hooks/use-export";
import { financeService } from "./services/finance.service";
import type { GroupBy, FinancialFilters, InvoiceData, Transaction } from "./types/finance.types";

// ─── Module-level imports ─────────────────────────────────────────────────────
import { StatsCards } from "./_components/stats-cards";
import { RevenueAreaChart, ProgramBarChart, TypeDonutChart } from "./_components/charts/revenue-charts";
import { FiltersBar } from "./_components/filters-bar";
import { TransactionTable } from "./_components/transaction-table";
import { GroupedView } from "./_components/grouped-view";
import { InvoiceModal } from "./_components/modals/invoice-modal";
import { ExportToolbar } from "./_components/export-toolbar";

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "transactions" | "grouped";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
   { value: "overview", label: "Overview", icon: LayoutDashboard },
   { value: "transactions", label: "Transactions", icon: TableProperties },
   { value: "grouped", label: "Grouped View", icon: Layers },
];

const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
   { value: "academic_year", label: "Academic Year" },
   { value: "semester", label: "Semester" },
   { value: "program", label: "Programme" },
];

// ─── Count active filters ─────────────────────────────────────────────────────
function countActiveFilters(filters: FinancialFilters): number {
   let count = 0;
   if (filters.status && filters.status !== "all") count++;
   if (filters.type && filters.type !== "all") count++;
   if (filters.academicYearId && filters.academicYearId !== "all") count++;
   if (filters.semesterId && filters.semesterId !== "all") count++;
   if (filters.programId && filters.programId !== "all") count++;
   if (filters.dateFrom) count++;
   if (filters.dateTo) count++;
   return count;
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function FinancialSummaryPage() {
   const [activeTab, setActiveTab] = useState<Tab>("overview");
   const [groupBy, setGroupBy] = useState<GroupBy>("academic_year");

   // Header animation
   const headerRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
      if (!headerRef.current) return;
      gsap.from(headerRef.current, { y: -20, duration: 0.5, ease: "power3.out" });
   }, []);

   // ─── Hooks ──────────────────────────────────────────────────────────────────
   const { data: dashData, loading: dashLoading } = useFinancialDashboard();
   const {
      transactions, loading: txLoading, filters, pagination,
      updateFilters, resetFilters, goToPage,
   } = useTransactions(15);
   const { data: groupedData, loading: groupedLoading } = useGroupedData(groupBy);
   const {
      invoiceLoading, setInvoiceLoading,
      invoiceOpen, openInvoice, closeInvoice,
   } = useInvoice();
   const { exporting, exportCSV, exportExcel, exportPDF } = useExport();
   const formatCurrency = useCurrencyFormatter("NGN");

   // Invoice data state
   const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

   const handleViewInvoice = useCallback(
      async (tx: Transaction) => {
         openInvoice(tx);
         setInvoiceLoading(true);
         try {
            const data = await financeService.getInvoice(tx.id);
            setInvoiceData(data);
         } finally {
            setInvoiceLoading(false);
         }
      },
      [openInvoice, setInvoiceLoading]
   );

   const handleCloseInvoice = useCallback(() => {
      closeInvoice();
      setInvoiceData(null);
   }, [closeInvoice]);

   const activeFilterCount = countActiveFilters(filters);

   return (
      <div className="min-h-screen bg-background">
         <div className="max-w-400 mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* ─── Page Header ──────────────────────────────────────────────────── */}
            <div ref={headerRef} className="mb-10 bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
               <div>
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-primary/10">
                        <Wallet className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                           Financial Summary
                        </h1>
                        <p className="text-sm text-muted-foreground">
                           Admin · Finance Management
                        </p>
                     </div>
                  </div>
               </div>

               {/* Export toolbar */}
               <ExportToolbar
                  transactions={transactions}
                  exporting={exporting}
                  onExportCSV={exportCSV}
                  onExportExcel={exportExcel}
                  onExportPDF={exportPDF}
                  totalCount={pagination.total}
               />
            </div>

            {/* ─── Stats Cards ──────────────────────────────────────────────────── */}
            {dashData && (
               <StatsCards stats={dashData.stats} formatCurrency={formatCurrency} />
            )}
            {dashLoading && !dashData && (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
                  ))}
               </div>
            )}

            {/* ─── Tab Navigation ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl w-fit border border-border">
               {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                     <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                           ? "bg-card text-primary shadow-sm border border-border"
                           : "text-muted-foreground hover:text-foreground"
                           }`}
                     >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                     </button>
                  );
               })}
            </div>

            {/* ─── Tab Content ──────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
               {/* ── Overview Tab ─────────────────────────────────────────────── */}
               {activeTab === "overview" && dashData && (
                  <motion.div
                     key="overview"
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -8 }}
                     transition={{ duration: 0.25 }}
                     className="space-y-4"
                  >
                     {/* Charts grid */}
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <RevenueAreaChart
                           data={dashData.revenueByMonth}
                           formatCurrency={formatCurrency}
                        />
                        <ProgramBarChart
                           data={dashData.revenueByProgram}
                           formatCurrency={formatCurrency}
                        />
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <TypeDonutChart
                           data={dashData.revenueByType}
                           formatCurrency={formatCurrency}
                        />
                        {/* Recent transactions mini-list */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
                           <div className="flex items-center justify-between mb-4">
                              <div>
                                 <h3 className="font-semibold text-foreground text-sm">Recent Transactions</h3>
                                 <p className="text-xs text-muted-foreground mt-0.5">Latest 10 entries</p>
                              </div>
                              <button
                                 onClick={() => setActiveTab("transactions")}
                                 className="text-xs text-primary font-medium hover:opacity-70 transition"
                              >
                                 View All →
                              </button>
                           </div>
                           <div className="space-y-2">
                              {dashData.recentTransactions.map((tx) => (
                                 <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between py-2 border-b border-border last:border-0 group cursor-pointer hover:bg-muted px-2 rounded-lg transition"
                                    onClick={() => handleViewInvoice(tx)}
                                 >
                                    <div className="min-w-0 flex-1">
                                       <p className="text-xs font-medium text-foreground truncate">{tx.studentName}</p>
                                       <p className="text-xs text-muted-foreground font-mono">{tx.invoiceNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2 shrink-0">
                                       <span className="text-xs font-semibold font-mono text-foreground">
                                          {formatCurrency(tx.amount)}
                                       </span>
                                       <span
                                          className={`w-2 h-2 rounded-full ${tx.status === "paid"
                                             ? "bg-emerald-500"
                                             : tx.status === "pending"
                                                ? "bg-amber-500"
                                                : tx.status === "overdue"
                                                   ? "bg-red-500"
                                                   : "bg-slate-400"
                                             }`}
                                       />
                                    </div>
                                 </motion.div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* ── Transactions Tab ──────────────────────────────────────────── */}
               {activeTab === "transactions" && (
                  <motion.div
                     key="transactions"
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -8 }}
                     transition={{ duration: 0.25 }}
                     className="space-y-4"
                  >
                     <FiltersBar
                        filters={filters}
                        onChange={updateFilters}
                        onReset={resetFilters}
                        activeFilterCount={activeFilterCount}
                     />
                     <TransactionTable
                        transactions={transactions}
                        loading={txLoading}
                        pagination={pagination}
                        onPageChange={goToPage}
                        onViewInvoice={handleViewInvoice}
                        formatCurrency={formatCurrency}
                     />
                  </motion.div>
               )}

               {/* ── Grouped Tab ───────────────────────────────────────────────── */}
               {activeTab === "grouped" && (
                  <motion.div
                     key="grouped"
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -8 }}
                     transition={{ duration: 0.25 }}
                     className="space-y-4"
                  >
                     {/* Group by selector */}
                     <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground font-medium">Group by:</span>
                        <div className="flex gap-2">
                           {GROUP_BY_OPTIONS.map((opt) => (
                              <button
                                 key={opt.value}
                                 onClick={() => setGroupBy(opt.value)}
                                 className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${groupBy === opt.value
                                    ? "bg-primary text-white border-primary"
                                    : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                                    }`}
                              >
                                 {opt.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     <GroupedView
                        data={groupedData}
                        groupBy={groupBy}
                        loading={groupedLoading}
                        formatCurrency={formatCurrency}
                        onViewInvoice={handleViewInvoice}
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* ─── Invoice Modal ────────────────────────────────────────────────────── */}
         <InvoiceModal
            open={invoiceOpen}
            invoiceData={invoiceData}
            loading={invoiceLoading}
            onClose={handleCloseInvoice}
            formatCurrency={formatCurrency}
         />
      </div>
   );
}
