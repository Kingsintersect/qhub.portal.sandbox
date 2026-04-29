export interface FinancialSummaryChartData {
    revenueByStatus: Array<{ status: string; amount: number }>;
    paymentsTrend: Array<{ date: string; amount: number }>;
}

export interface Transaction {
    id: number;
    invoiceNumber: string;
    userName: string;
    program: string;
    semester: string;
    academicYear: string;
    amount: number;
    status: string;
    dueDate: string;
}

export interface Payment {
    id: number;
    amount: number;
    method: string;
    referenceNumber: string;
    status: string;
    paidAt: string;
}

export interface InvoiceDetails {
    id: number;
    invoiceNumber: string;
    userName: string;
    program: string;
    semester: string;
    academicYear: string;
    amount: number;
    status: string;
    dueDate: string;
    payments: Payment[];
}
