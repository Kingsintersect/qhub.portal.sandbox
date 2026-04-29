// import apiClient from "@/lib/clients/apiClient";
import type { FinancialSummaryFilters } from "../schemas/filters.schema";
import type { Transaction, InvoiceDetails, FinancialSummaryChartData } from "../types/financialSummary";

interface FetchFinancialSummaryArgs {
   filters: FinancialSummaryFilters & {
      academicYears?: { value: string | number; label: string }[];
      semesters?: { value: string | number; label: string }[];
      programs?: { value: string | number; label: string }[];
   };
   groupBy: string;
   pagination: { page: number; pageSize: number };
}

interface ExportFinancialDataArgs {
   filters: FinancialSummaryFilters;
   groupBy: string;
   type: string;
}

// Dummy data for academic sessions, semesters, and programs (replace with zustand selectors in consuming code)
export const dummyAcademicSessions = [
   { value: "2025/2026", label: "2025/2026" },
   { value: "2024/2025", label: "2024/2025" },
];
export const dummySemesters = [
   { value: "1", label: "First Semester" },
   { value: "2", label: "Second Semester" },
];
export const dummyPrograms = [
   { value: "BSc Computer Science", label: "BSc Computer Science" },
   { value: "BSc Physics", label: "BSc Physics" },
];

// Dummy transactions and chart data
const dummyTransactions: Transaction[] = [
   {
      id: 1,
      invoiceNumber: "INV-001",
      userName: "John Doe",
      program: "BSc Computer Science",
      semester: "First Semester",
      academicYear: "2025/2026",
      amount: 150000,
      status: "Paid",
      dueDate: "2026-05-01",
   },
   {
      id: 2,
      invoiceNumber: "INV-002",
      userName: "Jane Smith",
      program: "BSc Physics",
      semester: "Second Semester",
      academicYear: "2024/2025",
      amount: 120000,
      status: "Pending",
      dueDate: "2026-06-01",
   },
];

const dummyCharts: FinancialSummaryChartData = {
   revenueByStatus: [
      { status: "Paid", amount: 150000 },
      { status: "Pending", amount: 120000 },
   ],
   paymentsTrend: [
      { date: "2026-04-01", amount: 100000 },
      { date: "2026-04-15", amount: 170000 },
   ],
};

const dummyInvoice: InvoiceDetails = {
   id: 1,
   invoiceNumber: "INV-001",
   userName: "John Doe",
   program: "BSc Computer Science",
   semester: "First Semester",
   academicYear: "2025/2026",
   amount: 150000,
   status: "Paid",
   dueDate: "2026-05-01",
   payments: [
      {
         id: 1,
         amount: 150000,
         method: "Bank Transfer",
         referenceNumber: "REF-123",
         status: "Paid",
         paidAt: "2026-04-10",
      },
   ],
};

// Use dummy data for now; comment out live API requests
export async function fetchFinancialSummary({ filters, groupBy, pagination }: FetchFinancialSummaryArgs): Promise<{ transactions: Transaction[]; charts: FinancialSummaryChartData; total: number }> {
   // const params = { ...filters, groupBy, ...pagination };
   // return await apiClient.get<{ transactions: Transaction[]; charts: FinancialSummaryChartData; total: number }>(
   //   '/payments/financial-summary',
   //   { params }
   // );
   return {
      transactions: dummyTransactions,
      charts: dummyCharts,
      total: dummyTransactions.length,
   };
}

export async function exportFinancialData({ filters, groupBy, type }: ExportFinancialDataArgs): Promise<Blob> {
   // const params = { ...filters, groupBy, type };
   // return await apiClient.get<Blob>('/payments/financial-summary/export', { params });
   let blob: Blob;
   if (type === "csv") {
      blob = new Blob([
         'Invoice Number,User Name,Program,Semester,Academic Year,Amount,Status,Due Date\n',
         ...dummyTransactions.map(t => `${t.invoiceNumber},${t.userName},${t.program},${t.semester},${t.academicYear},${t.amount},${t.status},${t.dueDate}\n`)
      ], { type: 'text/csv' });
   } else if (type === "excel" || type === "xlsx") {
      // Simulate Excel by using CSV with .xlsx extension (for demo)
      blob = new Blob([
         'Invoice Number,User Name,Program,Semester,Academic Year,Amount,Status,Due Date\n',
         ...dummyTransactions.map(t => `${t.invoiceNumber},${t.userName},${t.program},${t.semester},${t.academicYear},${t.amount},${t.status},${t.dueDate}\n`)
      ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   } else if (type === "pdf") {
      // Simulate PDF by using plain text (for demo)
      blob = new Blob([
         'Financial Summary (PDF Export)\n',
         'Invoice Number | User Name | Program | Semester | Academic Year | Amount | Status | Due Date\n',
         ...dummyTransactions.map(t => `${t.invoiceNumber} | ${t.userName} | ${t.program} | ${t.semester} | ${t.academicYear} | ${t.amount} | ${t.status} | ${t.dueDate}\n`)
      ], { type: 'application/pdf' });
   } else {
      // Default to CSV
      blob = new Blob([
         'Invoice Number,User Name,Program,Semester,Academic Year,Amount,Status,Due Date\n',
         ...dummyTransactions.map(t => `${t.invoiceNumber},${t.userName},${t.program},${t.semester},${t.academicYear},${t.amount},${t.status},${t.dueDate}\n`)
      ], { type: 'text/csv' });
   }
   return blob;
}

export async function fetchInvoice(invoiceId: number): Promise<InvoiceDetails> {
   // return await apiClient.get<InvoiceDetails>(`/payments/invoices/${invoiceId}`);
   return dummyInvoice;
}
