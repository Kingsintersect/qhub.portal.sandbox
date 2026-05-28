"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  FinancialFilters,
  Transaction,
  FinancialDashboardData,
  PaginationState,
  GroupBy,
  GroupedFinancialData,
} from "../types/finance.types";
import { financeService } from "../services/finance.service";

// ─── Default Filter State ─────────────────────────────────────────────────────

export const DEFAULT_FILTERS: FinancialFilters = {
  search: "",
  status: "all",
  type: "all",
  academicYearId: "all",
  semesterId: "all",
  programId: "all",
};

// ─── Dashboard Hook ───────────────────────────────────────────────────────────

export function useFinancialDashboard() {
  const [data, setData] = useState<FinancialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    financeService
      .getDashboardData()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ─── Transactions Hook ────────────────────────────────────────────────────────

export function useTransactions(initialPageSize = 15) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FinancialFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const fetchTransactions = useCallback(
    async (newFilters?: FinancialFilters, page = 1) => {
      setLoading(true);
      try {
        const result = await financeService.getTransactions(
          newFilters ?? filters,
          page,
          pagination.pageSize
        );
        setTransactions(result.data);
        setPagination(result.pagination);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.pageSize]
  );

  useEffect(() => {
    fetchTransactions();
  }, []);

  const updateFilters = useCallback(
    (updates: Partial<FinancialFilters>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
      fetchTransactions(newFilters, 1);
    },
    [filters, fetchTransactions]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    fetchTransactions(DEFAULT_FILTERS, 1);
  }, [fetchTransactions]);

  const goToPage = useCallback(
    (page: number) => {
      fetchTransactions(undefined, page);
    },
    [fetchTransactions]
  );

  return {
    transactions,
    loading,
    filters,
    pagination,
    updateFilters,
    resetFilters,
    goToPage,
    refetch: fetchTransactions,
  };
}

// ─── Grouped Data Hook ────────────────────────────────────────────────────────

export function useGroupedData(groupBy: GroupBy) {
  const [data, setData] = useState<GroupedFinancialData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    financeService
      .getGroupedData(groupBy)
      .then(setData)
      .finally(() => setLoading(false));
  }, [groupBy]);

  return { data, loading };
}

// ─── Invoice Hook ─────────────────────────────────────────────────────────────

export function useInvoice() {
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const openInvoice = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setInvoiceOpen(true);
  }, []);

  const closeInvoice = useCallback(() => {
    setInvoiceOpen(false);
    setSelectedTransaction(null);
  }, []);

  return {
    invoiceLoading,
    setInvoiceLoading,
    selectedTransaction,
    invoiceOpen,
    openInvoice,
    closeInvoice,
  };
}

// ─── Currency Formatter ───────────────────────────────────────────────────────

export function useCurrencyFormatter(currency = "NGN") {
  return useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount),
    [currency]
  );
}
