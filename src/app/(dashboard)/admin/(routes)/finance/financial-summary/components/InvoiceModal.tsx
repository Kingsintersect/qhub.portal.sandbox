"use client";
import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { InvoiceDetails } from "../types/financialSummary";

interface InvoiceModalProps {
    open: boolean;
    invoice?: InvoiceDetails;
    onClose: () => void;
}

export function InvoiceModal({ open, invoice, onClose }: InvoiceModalProps) {
    if (!open || !invoice) return null;
    return (
        <Modal open={open} onClose={onClose}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6">
                <h2 className="text-xl font-bold mb-2">Invoice #{invoice.invoiceNumber}</h2>
                {/* Render invoice details here */}
                <div className="mb-4">Amount: ₦{invoice.amount}</div>
                <div className="mb-4">Status: {invoice.status}</div>
                {/* Download as PDF button */}
                <Button onClick={() => {/* trigger download logic */}}>Download PDF</Button>
            </motion.div>
        </Modal>
    );
}
