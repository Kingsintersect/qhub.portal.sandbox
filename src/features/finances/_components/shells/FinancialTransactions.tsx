"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { TableProperties, Wallet, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

import {
    useTransactions,
    useInvoice,
    useCurrencyFormatter,
} from "../../hooks/use-financial-data";
import { useExport } from "../../hooks/use-export";
import { financeService } from "../../services/finance.service";
import type { FinancialFilters, InvoiceData, Transaction } from "../../types/finance.types";

import { FiltersBar } from "../filters-bar";
import { TransactionTable } from "../transaction-table";
import { InvoiceModal } from "../modals/invoice-modal";
import { ExportToolbar } from "../export-toolbar";

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

// ─── Mini stat card ───────────────────────────────────────────────────────────
function StatPill({
    icon: Icon,
    label,
    value,
    colorClass,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    colorClass: string;
}) {
    return (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-card ${colorClass}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground leading-none">{value}</p>
            </div>
        </div>
    );
}

interface FinancialTransactionsPageProps {
    canViewTransactions?: boolean;
    canManage?: boolean;
    canExport?: boolean;
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function FinancialTransactionsPage({
    canViewTransactions = false,
    canManage = false,
    canExport = false,
}: FinancialTransactionsPageProps) {
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!headerRef.current) return;
        gsap.from(headerRef.current, { y: -20, duration: 0.5, ease: "power3.out" });
    }, []);

    // ─── Hooks ──────────────────────────────────────────────────────────────────
    const {
        transactions,
        loading: txLoading,
        filters,
        pagination,
        updateFilters,
        resetFilters,
        goToPage,
    } = useTransactions(20);

    const {
        invoiceLoading,
        setInvoiceLoading,
        invoiceOpen,
        openInvoice,
        closeInvoice,
    } = useInvoice();

    const { exporting, exportCSV, exportExcel, exportPDF } = useExport();
    const formatCurrency = useCurrencyFormatter("NGN");

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

    // ─── Derived counts from current page ────────────────────────────────────
    const paidCount = transactions.filter((t) => t.status === "paid").length;
    const pendingCount = transactions.filter((t) => t.status === "pending").length;
    const overdueCount = transactions.filter((t) => t.status === "overdue").length;

    if (!canViewTransactions && !canManage) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-400 mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ─── Page Header ──────────────────────────────────────────────────── */}
                <div
                    ref={headerRef}
                    className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <TableProperties className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Transactions
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Admin · Finance Management
                            </p>
                        </div>
                    </div>

                    {canExport && (
                        <ExportToolbar
                            transactions={transactions}
                            exporting={exporting}
                            onExportCSV={exportCSV}
                            onExportExcel={exportExcel}
                            onExportPDF={exportPDF}
                            totalCount={pagination.total}
                        />
                    )}
                </div>

                {/* ─── Quick Stats ───────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {!txLoading && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                            <StatPill
                                icon={Wallet}
                                label="Total (this page)"
                                value={transactions.length}
                                colorClass="border-border"
                            />
                            <StatPill
                                icon={CheckCircle2}
                                label="Paid"
                                value={paidCount}
                                colorClass="border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                            />
                            <StatPill
                                icon={Clock}
                                label="Pending"
                                value={pendingCount}
                                colorClass="border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400"
                            />
                            <StatPill
                                icon={AlertTriangle}
                                label="Overdue"
                                value={overdueCount}
                                colorClass="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"
                            />
                        </motion.div>
                    )}
                    {txLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* ─── Filters ───────────────────────────────────────────────────────── */}
                <FiltersBar
                    filters={filters}
                    onChange={updateFilters}
                    onReset={resetFilters}
                    activeFilterCount={activeFilterCount}
                />

                {/* ─── Table ─────────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                >
                    <TransactionTable
                        transactions={transactions}
                        loading={txLoading}
                        pagination={pagination}
                        onPageChange={goToPage}
                        onViewInvoice={handleViewInvoice}
                        formatCurrency={formatCurrency}
                        canManage={canManage}
                    />
                </motion.div>

                {/* ─── Invoice Modal ─────────────────────────────────────────────────── */}
                <InvoiceModal
                    open={invoiceOpen}
                    invoiceData={invoiceData}
                    loading={invoiceLoading}
                    onClose={handleCloseInvoice}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    );
}
