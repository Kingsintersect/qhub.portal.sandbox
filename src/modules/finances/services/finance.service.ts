import type {
  Transaction,
  FinancialDashboardData,
  FinancialFilters,
  PaginatedResponse,
  AcademicYear,
  SemesterPeriod,
  Program,
  InvoiceData,
  GroupedFinancialData,
  GroupBy,
} from "../types/finance.types";

// ─── Mock Reference Data ──────────────────────────────────────────────────────

export const ACADEMIC_YEARS: AcademicYear[] = [
  { id: "ay-2024", label: "2024/2025", startDate: "2024-09-01", endDate: "2025-08-31" },
  { id: "ay-2023", label: "2023/2024", startDate: "2023-09-01", endDate: "2024-08-31" },
  { id: "ay-2022", label: "2022/2023", startDate: "2022-09-01", endDate: "2023-08-31" },
];

export const SEMESTERS: SemesterPeriod[] = [
  { id: "sem-2024-1", label: "First Semester", semester: "first", academicYearId: "ay-2024" },
  { id: "sem-2024-2", label: "Second Semester", semester: "second", academicYearId: "ay-2024" },
  { id: "sem-2023-1", label: "First Semester", semester: "first", academicYearId: "ay-2023" },
  { id: "sem-2023-2", label: "Second Semester", semester: "second", academicYearId: "ay-2023" },
];

export const PROGRAMS: Program[] = [
  { id: "prog-cs", name: "Computer Science", code: "BSc CS", faculty: "Engineering", level: "undergraduate" },
  { id: "prog-ba", name: "Business Administration", code: "BBA", faculty: "Business", level: "undergraduate" },
  { id: "prog-med", name: "Medicine", code: "MBBS", faculty: "Medicine", level: "undergraduate" },
  { id: "prog-law", name: "Law", code: "LLB", faculty: "Law", level: "undergraduate" },
  { id: "prog-mba", name: "Master of Business Administration", code: "MBA", faculty: "Business", level: "postgraduate" },
  { id: "prog-mcs", name: "Master of Computer Science", code: "MSc CS", faculty: "Engineering", level: "postgraduate" },
];

// ─── Mock Transaction Generator ───────────────────────────────────────────────

const STUDENT_NAMES = [
  "Adaeze Okonkwo", "Emeka Nwosu", "Fatima Al-Hassan", "Chidi Okeke",
  "Amara Diallo", "Kofi Mensah", "Zainab Abdullahi", "Tobi Adeyemi",
  "Ngozi Eze", "Kwame Asante", "Aisha Bello", "Tunde Lawal",
  "Nkechi Okafor", "Seun Adebayo", "Halima Musa", "Ifeanyi Obi",
  "Sade Oluwole", "Babajide Fashola", "Chiamaka Nwachukwu", "Efe Ovie",
];

const DESCRIPTIONS: Record<string, string[]> = {
  tuition: ["Tuition fee - First Semester", "Tuition fee - Second Semester", "Full year tuition"],
  accommodation: ["Hostel accommodation", "Campus housing fee", "Room and board"],
  library: ["Library fee", "Library access & resources"],
  lab: ["Laboratory fee", "Practical fee", "Studio fee"],
  exam: ["Examination fee", "Assessment fee", "Certification exam"],
  other: ["Administrative fee", "Sports levy", "ID card fee"],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .split("T")[0];
}

let txCounter = 1000;

function generateTransaction(overrides?: Partial<Transaction>): Transaction {
  const program = randomFrom(PROGRAMS);
  const academicYear = randomFrom(ACADEMIC_YEARS);
  const semester = SEMESTERS.find((s) => s.academicYearId === academicYear.id) ?? SEMESTERS[0];
  const studentName = randomFrom(STUDENT_NAMES);
  const type = randomFrom(["tuition", "accommodation", "library", "lab", "exam", "other"] as const);
  const status = randomFrom(["paid", "paid", "paid", "pending", "overdue", "cancelled", "refunded"] as const);
  const amount = randomAmount(50_000, 850_000);
  const paidAmount = status === "paid" ? amount : 0;
  const dueDate = randomDate(new Date("2024-01-01"), new Date("2025-06-30"));

  txCounter++;

  return {
    id: `tx-${txCounter}`,
    invoiceNumber: `INV-${academicYear.label.replace("/", "")}-${txCounter}`,
    studentId: `STU-${Math.floor(Math.random() * 90000) + 10000}`,
    studentName,
    studentEmail: `${studentName.toLowerCase().replace(" ", ".")}@university.edu.ng`,
    programId: program.id,
    programName: program.name,
    academicYearId: academicYear.id,
    academicYear: academicYear.label,
    semesterId: semester.id,
    semester: semester.label,
    type,
    description: randomFrom(DESCRIPTIONS[type]),
    amount,
    paidAmount,
    balance: amount - paidAmount,
    status,
    dueDate,
    paymentDate: status === "paid" ? dueDate : undefined,
    paymentMethod: status === "paid" ? randomFrom(["Bank Transfer", "Online Payment", "POS", "Cash"]) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Generate 200 mock transactions
export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 200 }, () => generateTransaction());

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_DATA: FinancialDashboardData = {
  stats: {
    totalRevenue: 48_750_000,
    totalPending: 12_300_000,
    totalOverdue: 4_850_000,
    totalRefunded: 1_200_000,
    collectionRate: 78.4,
    transactionCount: 200,
    paidCount: 140,
    pendingCount: 42,
    overdueCount: 18,
  },
  revenueByMonth: [
    { month: "Sep", revenue: 8_200_000, pending: 1_200_000, overdue: 400_000 },
    { month: "Oct", revenue: 6_800_000, pending: 1_800_000, overdue: 600_000 },
    { month: "Nov", revenue: 5_400_000, pending: 2_100_000, overdue: 750_000 },
    { month: "Dec", revenue: 4_200_000, pending: 1_600_000, overdue: 500_000 },
    { month: "Jan", revenue: 7_100_000, pending: 2_400_000, overdue: 900_000 },
    { month: "Feb", revenue: 5_900_000, pending: 1_900_000, overdue: 650_000 },
    { month: "Mar", revenue: 4_750_000, pending: 1_300_000, overdue: 1_050_000 },
    { month: "Apr", revenue: 6_400_000, pending: null, overdue: null },
  ],
  revenueByProgram: [
    { programName: "Medicine", programCode: "MBBS", revenue: 18_500_000, percentage: 37.9 },
    { programName: "Computer Science", programCode: "BSc CS", revenue: 11_200_000, percentage: 23.0 },
    { programName: "Business Administration", programCode: "BBA", revenue: 9_800_000, percentage: 20.1 },
    { programName: "Law", programCode: "LLB", revenue: 5_400_000, percentage: 11.1 },
    { programName: "MBA", programCode: "MBA", revenue: 2_850_000, percentage: 5.8 },
    { programName: "MSc CS", programCode: "MSc CS", revenue: 1_000_000, percentage: 2.1 },
  ],
  revenueByType: [
    { type: "tuition", label: "Tuition", amount: 31_200_000, percentage: 64.0 },
    { type: "accommodation", label: "Accommodation", amount: 9_100_000, percentage: 18.7 },
    { type: "lab", label: "Laboratory", amount: 4_200_000, percentage: 8.6 },
    { type: "exam", label: "Examination", amount: 2_400_000, percentage: 4.9 },
    { type: "library", label: "Library", amount: 1_150_000, percentage: 2.4 },
    { type: "other", label: "Other", amount: 700_000, percentage: 1.4 },
  ],
  recentTransactions: MOCK_TRANSACTIONS.slice(0, 10),
};

// ─── Finance Service ──────────────────────────────────────────────────────────

class FinanceService {
  private delay(ms = 400): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  async getDashboardData(): Promise<FinancialDashboardData> {
    await this.delay();
    return MOCK_DASHBOARD_DATA;
  }

  async getTransactions(
    filters: FinancialFilters,
    page = 1,
    pageSize = 15
  ): Promise<PaginatedResponse<Transaction>> {
    await this.delay(300);

    let filtered = [...MOCK_TRANSACTIONS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.studentName.toLowerCase().includes(q) ||
          tx.invoiceNumber.toLowerCase().includes(q) ||
          tx.studentId.toLowerCase().includes(q) ||
          tx.programName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    if (filters.academicYearId && filters.academicYearId !== "all") {
      filtered = filtered.filter((tx) => tx.academicYearId === filters.academicYearId);
    }

    if (filters.semesterId && filters.semesterId !== "all") {
      filtered = filtered.filter((tx) => tx.semesterId === filters.semesterId);
    }

    if (filters.programId && filters.programId !== "all") {
      filtered = filtered.filter((tx) => tx.programId === filters.programId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((tx) => tx.dueDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((tx) => tx.dueDate <= filters.dateTo!);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
      data,
      pagination: { page, pageSize, total, totalPages },
    };
  }

  async getGroupedData(groupBy: GroupBy): Promise<GroupedFinancialData[]> {
    await this.delay(500);

    if (groupBy === "academic_year") {
      return ACADEMIC_YEARS.map((year) => {
        const txs = MOCK_TRANSACTIONS.filter((tx) => tx.academicYearId === year.id);
        return {
          groupKey: year.id,
          groupLabel: year.label,
          stats: this.computeStats(txs),
          transactions: txs,
          subGroups: SEMESTERS.filter((s) => s.academicYearId === year.id).map((sem) => {
            const semTxs = txs.filter((tx) => tx.semesterId === sem.id);
            return {
              groupKey: sem.id,
              groupLabel: sem.label,
              stats: this.computeStats(semTxs),
              transactions: semTxs,
            };
          }),
        };
      });
    }

    if (groupBy === "semester") {
      return SEMESTERS.map((sem) => {
        const txs = MOCK_TRANSACTIONS.filter((tx) => tx.semesterId === sem.id);
        return {
          groupKey: sem.id,
          groupLabel: `${sem.label} (${ACADEMIC_YEARS.find((y) => y.id === sem.academicYearId)?.label})`,
          stats: this.computeStats(txs),
          transactions: txs,
        };
      });
    }

    // program
    return PROGRAMS.map((prog) => {
      const txs = MOCK_TRANSACTIONS.filter((tx) => tx.programId === prog.id);
      return {
        groupKey: prog.id,
        groupLabel: `${prog.name} (${prog.code})`,
        stats: this.computeStats(txs),
        transactions: txs,
      };
    });
  }

  async getInvoice(transactionId: string): Promise<InvoiceData> {
    await this.delay(200);
    const tx = MOCK_TRANSACTIONS.find((t) => t.id === transactionId) ?? MOCK_TRANSACTIONS[0];

    return {
      invoiceNumber: tx.invoiceNumber,
      issuedDate: tx.createdAt.split("T")[0],
      dueDate: tx.dueDate,
      studentInfo: {
        id: tx.studentId,
        name: tx.studentName,
        email: tx.studentEmail,
        program: tx.programName,
        academicYear: tx.academicYear,
        semester: tx.semester,
      },
      institutionInfo: {
        name: "QHUB University",
        address: "12 University Boulevard, Victoria Island, Lagos, Nigeria",
        phone: "+234 (0)1 234 5678",
        email: "finance@nexusuniversity.edu.ng",
      },
      items: [
        {
          description: tx.description,
          type: tx.type,
          quantity: 1,
          unitPrice: tx.amount,
          total: tx.amount,
        },
      ],
      subtotal: tx.amount,
      tax: 0,
      total: tx.amount,
      paidAmount: tx.paidAmount,
      balance: tx.balance,
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      notes: "Payment should be made to the university finance department. Late payments attract a 5% penalty.",
    };
  }

  private computeStats(transactions: Transaction[]) {
    const paid = transactions.filter((t) => t.status === "paid");
    const pending = transactions.filter((t) => t.status === "pending");
    const overdue = transactions.filter((t) => t.status === "overdue");
    const refunded = transactions.filter((t) => t.status === "refunded");
    const totalRevenue = paid.reduce((sum, t) => sum + t.paidAmount, 0);
    const totalPending = pending.reduce((sum, t) => sum + t.balance, 0);
    const totalOverdue = overdue.reduce((sum, t) => sum + t.balance, 0);
    const totalRefunded = refunded.reduce((sum, t) => sum + t.paidAmount, 0);

    return {
      totalRevenue,
      totalPending,
      totalOverdue,
      totalRefunded,
      collectionRate: transactions.length ? (paid.length / transactions.length) * 100 : 0,
      transactionCount: transactions.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }

  // ─── Export ──────────────────────────────────────────────────────────────────

  exportToCSV(transactions: Transaction[]): string {
    const headers = [
      "Invoice No", "Student Name", "Student ID", "Program", "Academic Year",
      "Semester", "Type", "Description", "Amount", "Paid Amount", "Balance",
      "Status", "Due Date", "Payment Date", "Payment Method",
    ];

    const rows = transactions.map((tx) => [
      tx.invoiceNumber, tx.studentName, tx.studentId, tx.programName,
      tx.academicYear, tx.semester, tx.type, tx.description,
      tx.amount, tx.paidAmount, tx.balance, tx.status,
      tx.dueDate, tx.paymentDate ?? "", tx.paymentMethod ?? "",
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  }
}

export const financeService = new FinanceService();
