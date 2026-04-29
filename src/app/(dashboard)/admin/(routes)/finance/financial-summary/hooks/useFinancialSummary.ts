import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchFinancialSummary, exportFinancialData, fetchInvoice } from '../services/financialSummaryApi';
import type { FinancialSummaryFilters } from '../schemas/filters.schema';
import type { Transaction, InvoiceDetails } from '../types/financialSummary';

export function useFinancialSummary() {
    const [filters, setFilters] = useState<FinancialSummaryFilters & {
        academicYears?: { value: string | number; label: string }[];
        semesters?: { value: string | number; label: string }[];
        programs?: { value: string | number; label: string }[];
    }>({});
    const [groupBy, setGroupBy] = useState<string>('Academic Year');
    const [pagination, setPagination] = useState<{ page: number; pageSize: number }>({ page: 1, pageSize: 20 });
    const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; invoice?: InvoiceDetails }>({ open: false });

    const { data, isLoading } = useQuery({
        queryKey: ['financial-summary', filters, groupBy, pagination],
        queryFn: () => fetchFinancialSummary({ filters, groupBy, pagination }),
    });

    const exportData = async (type: string) => {
        const blob = await exportFinancialData({ filters, groupBy, type });
        // Determine file extension and MIME type
        let ext = type === 'pdf' ? 'pdf' : type === 'excel' ? 'xlsx' : 'csv';
        let mime =
            type === 'pdf' ? 'application/pdf'
            : type === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv';
        const url = window.URL.createObjectURL(new Blob([blob], { type: mime }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-summary.${ext}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    };

    const openInvoice = async (invoice: Transaction) => {
        const details = await fetchInvoice(invoice.id);
        setInvoiceModal({ open: true, invoice: details });
    };
    const closeInvoiceModal = () => setInvoiceModal({ open: false });

    return {
        data,
        isLoading,
        filters,
        setFilters,
        groupBy,
        setGroupBy,
        exportData,
        openInvoice,
        invoiceModal,
        closeInvoiceModal,
        pagination,
        setPagination,
    };
}
