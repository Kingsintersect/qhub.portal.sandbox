"use client";

import { useCallback, useState } from "react";
import type { Transaction, ExportFormat } from "../types/finance.types";
import { financeService } from "../services/finance.service";

export function useExport() {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = useCallback(async (transactions: Transaction[]) => {
    setExporting("csv");
    try {
      await new Promise((res) => setTimeout(res, 300));
      const csv = financeService.exportToCSV(transactions);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `financial-report-${new Date().toISOString().split("T")[0]}.csv`);
    } finally {
      setExporting(null);
    }
  }, []);

  const exportExcel = useCallback(async (transactions: Transaction[]) => {
    setExporting("excel");
    try {
      await new Promise((res) => setTimeout(res, 500));
      // In production: use xlsx library (SheetJS)
      // For now, export as CSV with .xlsx extension as placeholder
      const csv = financeService.exportToCSV(transactions);
      const blob = new Blob([csv], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, `financial-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    } finally {
      setExporting(null);
    }
  }, []);

  const exportPDF = useCallback(async (transactions: Transaction[]) => {
    setExporting("pdf");
    try {
      await new Promise((res) => setTimeout(res, 800));
      // In production: use jsPDF or puppeteer on the server
      // For demo: trigger print dialog of a formatted report
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const rows = transactions
        .map(
          (tx) => `
          <tr>
            <td>${tx.invoiceNumber}</td>
            <td>${tx.studentName}</td>
            <td>${tx.programName}</td>
            <td>${tx.type}</td>
            <td style="text-align:right">₦${tx.amount.toLocaleString()}</td>
            <td style="text-align:right">₦${tx.paidAmount.toLocaleString()}</td>
            <td><span class="badge ${tx.status}">${tx.status}</span></td>
            <td>${tx.dueDate}</td>
          </tr>`
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Financial Report</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #1a1a2e; }
              h1 { font-size: 22px; margin-bottom: 4px; }
              p.meta { color: #666; font-size: 12px; margin: 0 0 24px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { background: #1a1a2e; color: white; padding: 8px 12px; text-align: left; }
              td { padding: 8px 12px; border-bottom: 1px solid #eee; }
              tr:nth-child(even) { background: #f9f9f9; }
              .badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
              .paid { background: #d1fae5; color: #065f46; }
              .pending { background: #fef3c7; color: #92400e; }
              .overdue { background: #fee2e2; color: #991b1b; }
              .cancelled { background: #f3f4f6; color: #374151; }
              .refunded { background: #e0e7ff; color: #3730a3; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <h1>Financial Report — QHUB University</h1>
            <p class="meta">Generated: ${new Date().toLocaleString()} · Total records: ${transactions.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th><th>Student</th><th>Program</th><th>Type</th>
                  <th>Amount</th><th>Paid</th><th>Status</th><th>Due Date</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <script>setTimeout(() => window.print(), 500);</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setExporting(null);
    }
  }, []);

  return { exporting, exportCSV, exportExcel, exportPDF };
}
