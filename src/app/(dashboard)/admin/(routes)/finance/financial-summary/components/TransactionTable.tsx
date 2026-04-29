"use client";
import DataTable, { Column } from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/custom/StatusBadge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Transaction } from "../types/financialSummary";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default" | "purple" | "orange";

export interface TransactionTableProps {
   transactions: Transaction[];
   isLoading: boolean;
   onInvoiceClick: (invoice: Transaction) => void;
}

const statusVariantMap: Record<string, StatusVariant> = {
   PENDING: "warning",
   PARTIALLY_PAID: "info",
   PAID: "success",
   OVERDUE: "destructive",
   CANCELLED: "default",
};

export function TransactionTable({ transactions = [], isLoading, onInvoiceClick }: TransactionTableProps) {
   // DataTable expects Record<string, unknown>[]
   const rows: Record<string, unknown>[] = transactions.map((t) => ({ ...t }));
   const columns: Column<Record<string, unknown>>[] = [
      {
         key: "invoiceNumber",
         header: "Invoice #",
         render: (row) => (
            <Button variant="link" onClick={() => onInvoiceClick(row as unknown as Transaction)}>{row.invoiceNumber as string}</Button>
         ),
      },
      { key: "userName", header: "User" },
      { key: "program", header: "Program" },
      { key: "semester", header: "Semester" },
      { key: "academicYear", header: "Year" },
      { key: "amount", header: "Amount" },
      {
         key: "status",
         header: "Status",
         render: (row) => (
            <StatusBadge label={row.status as string} variant={statusVariantMap[row.status as string] || "default"} />
         ),
      },
      { key: "dueDate", header: "Due Date" },
   ];

   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
         <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            className={cn("rounded-lg bg-white dark:bg-neutral-900")}
         />
      </motion.div>
   );
}
