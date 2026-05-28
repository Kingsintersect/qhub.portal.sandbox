// ─── Finance Domain Types ────────────────────────────────────────────────────

export type TransactionStatus = "paid" | "pending" | "overdue" | "cancelled" | "refunded";
export type TransactionType = "tuition" | "accommodation" | "library" | "lab" | "exam" | "other";
export type ExportFormat = "pdf" | "csv" | "excel";
export type GroupBy = "academic_year" | "semester" | "program";
export type Semester = "first" | "second" | "summer";

// ─── Academic Period ──────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  label: string; // e.g. "2023/2024"
  startDate: string;
  endDate: string;
}

export interface SemesterPeriod {
  id: string;
  label: string; // e.g. "First Semester"
  semester: Semester;
  academicYearId: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  faculty: string;
  level: "undergraduate" | "postgraduate" | "doctorate";
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programId: string;
  programName: string;
  academicYearId: string;
  academicYear: string;
  semesterId: string;
  semester: string;
  type: TransactionType;
  description: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: TransactionStatus;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Summary / Analytics ─────────────────────────────────────────────────────

export interface FinancialSummaryStats {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  totalRefunded: number;
  collectionRate: number; // percentage
  transactionCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  pending: number | null;
  overdue: number | null;
}

export interface RevenueByProgram {
  programName: string;
  programCode: string;
  revenue: number;
  percentage: number;
}

export interface RevenueByType {
  type: TransactionType;
  label: string;
  amount: number;
  percentage: number;
}

export interface GroupedFinancialData {
  groupKey: string;
  groupLabel: string;
  stats: FinancialSummaryStats;
  transactions: Transaction[];
  subGroups?: GroupedFinancialData[];
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface FinancialFilters {
  search: string;
  status: TransactionStatus | "all";
  type: TransactionType | "all";
  academicYearId: string | "all";
  semesterId: string | "all";
  programId: string | "all";
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  studentInfo: {
    id: string;
    name: string;
    email: string;
    program: string;
    academicYear: string;
    semester: string;
  };
  institutionInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
}

export interface FinancialDashboardData {
  stats: FinancialSummaryStats;
  revenueByMonth: RevenueByMonth[];
  revenueByProgram: RevenueByProgram[];
  revenueByType: RevenueByType[];
  recentTransactions: Transaction[];
}
