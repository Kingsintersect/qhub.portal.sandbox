"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
   X, Download, Printer, Building2, User, Calendar,
   CreditCard,
} from "lucide-react";
import type { InvoiceData, TransactionStatus } from "../../types/finance.types";
import StatusBadge from "@/components/custom/StatusBadge";
// import { StatusBadge } from "../../../components/ui/status-badge";

interface InvoiceModalProps {
   open: boolean;
   invoiceData: InvoiceData | null;
   loading: boolean;
   onClose: () => void;
   formatCurrency: (n: number) => string;
}

const STATUS_BADGE_MAP: Record<TransactionStatus, { label: string; variant: "success" | "warning" | "destructive" | "default" | "purple" }> = {
   paid: { label: "Paid", variant: "success" },
   pending: { label: "Pending", variant: "warning" },
   overdue: { label: "Overdue", variant: "destructive" },
   cancelled: { label: "Cancelled", variant: "default" },
   refunded: { label: "Refunded", variant: "purple" },
};

export function InvoiceModal({ open, invoiceData, loading, onClose, formatCurrency }: InvoiceModalProps) {
   const contentRef = useRef<HTMLDivElement>(null);

   // GSAP entrance for the invoice lines
   useEffect(() => {
      if (!open || !contentRef.current) return;
      const items = contentRef.current.querySelectorAll(".invoice-line");
      gsap.fromTo(
         items,
         { opacity: 0, x: -12 },
         { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: "power2.out", delay: 0.2 }
      );
   }, [open, invoiceData]);

   // ESC close
   useEffect(() => {
      const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
   }, [onClose]);

   const handlePrint = useCallback(() => {
      if (!invoiceData) return;
      const printArea = document.getElementById("invoice-print-area");
      if (!printArea) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #111827; font-size: 13px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
            .logo-area h1 { font-size: 22px; font-weight: 800; color: #1e3a5f; }
            .logo-area p { color: #6b7280; font-size: 11px; margin-top: 4px; }
            .invoice-meta { text-align: right; }
            .invoice-meta .inv-number { font-size: 20px; font-weight: 700; color: #1e3a5f; }
            .invoice-meta .inv-date { color: #6b7280; font-size: 11px; margin-top: 6px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
            .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: 8px; }
            .section-value { font-size: 14px; font-weight: 600; color: #111827; }
            .section-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #1e3a5f; color: white; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
            td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            tr:nth-child(even) td { background: #f9fafb; }
            .totals { margin-left: auto; width: 280px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .totals-row.total { border-top: 2px solid #1e3a5f; padding-top: 10px; font-weight: 700; font-size: 16px; color: #1e3a5f; }
            .totals-row.balance { font-weight: 700; color: #dc2626; }
            .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            .paid { background: #d1fae5; color: #065f46; }
            .pending { background: #fef3c7; color: #92400e; }
            .overdue { background: #fee2e2; color: #991b1b; }
            .notes { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 12px; color: #6b7280; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
   }, [invoiceData]);

   if (!open) return null;

   return (
      <AnimatePresence>
         {open && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center p-4"
               onClick={(e) => e.target === e.currentTarget && onClose()}
            >
               {/* Backdrop */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
               />

               {/* Modal */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
               >
                  {/* Modal header */}
                  <div className="flex items-center justify-between p-5 border-b border-border">
                     <div>
                        <h2 className="font-bold text-foreground">Invoice</h2>
                        {invoiceData && (
                           <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {invoiceData.invoiceNumber}
                           </p>
                        )}
                     </div>
                     <div className="flex items-center gap-2">
                        {invoiceData && (
                           <>
                              <button
                                 onClick={handlePrint}
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-xl hover:bg-muted text-foreground transition"
                              >
                                 <Printer className="w-3.5 h-3.5" />
                                 Print
                              </button>
                              <button
                                 onClick={handlePrint}
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-xl hover:opacity-90 transition"
                              >
                                 <Download className="w-3.5 h-3.5" />
                                 PDF
                              </button>
                           </>
                        )}
                        <button
                           onClick={onClose}
                           className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>

                  {/* Invoice content */}
                  <div className="overflow-y-auto flex-1 p-5">
                     {loading ? (
                        <div className="space-y-3">
                           {[75, 60, 85, 50, 70, 90, 65, 55].map((width, i) => (
                              <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${width}%` }} />
                           ))}
                        </div>
                     ) : invoiceData ? (
                        <div ref={contentRef} id="invoice-print-area">
                           {/* Institution header */}
                           <div className="header flex justify-between items-start mb-6 pb-5 border-b border-border">
                              <div className="logo-area invoice-line">
                                 <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                       <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                       <h3 className="font-bold text-foreground text-sm leading-tight">
                                          {invoiceData.institutionInfo.name}
                                       </h3>
                                       <p className="text-xs text-muted-foreground leading-tight">
                                          {invoiceData.institutionInfo.address}
                                       </p>
                                    </div>
                                 </div>
                                 <p className="text-xs text-muted-foreground mt-1">
                                    {invoiceData.institutionInfo.phone} · {invoiceData.institutionInfo.email}
                                 </p>
                              </div>
                              <div className="text-right invoice-line">
                                 <p className="text-2xl font-bold text-primary font-mono tracking-tight">
                                    {invoiceData.invoiceNumber}
                                 </p>
                                 <StatusBadge {...STATUS_BADGE_MAP[invoiceData.status]} className="mt-1" />
                              </div>
                           </div>

                           {/* Dates */}
                           <div className="grid grid-cols-2 gap-4 mb-5">
                              <div className="invoice-line">
                                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Issue Date
                                 </p>
                                 <p className="text-sm font-medium text-foreground">
                                    {new Date(invoiceData.issuedDate).toLocaleDateString("en-NG", { dateStyle: "long" })}
                                 </p>
                              </div>
                              <div className="invoice-line">
                                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Due Date
                                 </p>
                                 <p className="text-sm font-medium text-foreground">
                                    {new Date(invoiceData.dueDate).toLocaleDateString("en-NG", { dateStyle: "long" })}
                                 </p>
                              </div>
                           </div>

                           {/* Student info */}
                           <div className="bg-muted rounded-xl p-4 mb-5 invoice-line">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                                 <User className="w-3 h-3" /> Bill To
                              </p>
                              <p className="font-bold text-foreground">{invoiceData.studentInfo.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{invoiceData.studentInfo.email}</p>
                              <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                                 <span>
                                    <span className="font-medium text-foreground">ID:</span>{" "}
                                    {invoiceData.studentInfo.id}
                                 </span>
                                 <span>
                                    <span className="font-medium text-foreground">Programme:</span>{" "}
                                    {invoiceData.studentInfo.program}
                                 </span>
                              </div>
                              <div className="flex gap-4 mt-0.5 text-xs text-muted-foreground">
                                 <span>
                                    <span className="font-medium text-foreground">Year:</span>{" "}
                                    {invoiceData.studentInfo.academicYear}
                                 </span>
                                 <span>
                                    <span className="font-medium text-foreground">Semester:</span>{" "}
                                    {invoiceData.studentInfo.semester}
                                 </span>
                              </div>
                           </div>

                           {/* Line items */}
                           <table className="w-full text-sm mb-4 invoice-line">
                              <thead>
                                 <tr className="bg-primary text-white">
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold rounded-tl-lg">Description</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold">Type</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold">Qty</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold">Unit Price</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold rounded-tr-lg">Total</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {invoiceData.items.map((item, i) => (
                                    <tr key={i} className="border-b border-border">
                                       <td className="px-3 py-2.5 text-foreground">{item.description}</td>
                                       <td className="px-3 py-2.5 text-muted-foreground capitalize">{item.type}</td>
                                       <td className="px-3 py-2.5 text-right text-foreground">{item.quantity}</td>
                                       <td className="px-3 py-2.5 text-right font-mono text-foreground">
                                          {formatCurrency(item.unitPrice)}
                                       </td>
                                       <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                                          {formatCurrency(item.total)}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>

                           {/* Totals */}
                           <div className="flex justify-end invoice-line">
                              <div className="w-64 space-y-1.5">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-mono font-medium text-foreground">
                                       {formatCurrency(invoiceData.subtotal)}
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-mono text-foreground">
                                       {formatCurrency(invoiceData.tax)}
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
                                    <span className="text-foreground">Total</span>
                                    <span className="font-mono text-primary">
                                       {formatCurrency(invoiceData.total)}
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-emerald-600">Paid</span>
                                    <span className="font-mono font-semibold text-emerald-600">
                                       {formatCurrency(invoiceData.paidAmount)}
                                    </span>
                                 </div>
                                 {invoiceData.balance > 0 && (
                                    <div className="flex justify-between text-sm font-bold">
                                       <span className="text-red-500">Balance Due</span>
                                       <span className="font-mono text-red-500">
                                          {formatCurrency(invoiceData.balance)}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Notes */}
                           {invoiceData.notes && (
                              <div className="mt-4 p-3 bg-muted rounded-xl invoice-line">
                                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Notes
                                 </p>
                                 <p className="text-xs text-muted-foreground">{invoiceData.notes}</p>
                              </div>
                           )}

                           {/* Payment method */}
                           {invoiceData.paymentMethod && (
                              <div className="mt-3 invoice-line flex items-center gap-2 text-xs text-muted-foreground">
                                 <CreditCard className="w-3.5 h-3.5" />
                                 Payment received via <span className="font-medium text-foreground">{invoiceData.paymentMethod}</span>
                              </div>
                           )}
                        </div>
                     ) : null}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
}
