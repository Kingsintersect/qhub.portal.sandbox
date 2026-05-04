// ─── Audit Log Types ───────────────────────────────────────────────────────

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "ENROLL"
  | "PAYMENT"
  | "SYNC";

export type AuditEntityType =
  | "Student"
  | "Grade"
  | "Invoice"
  | "Course"
  | "Lecturer"
  | "Clearance"
  | "Payment"
  | "MoodleUser"
  | "MoodleEnrollment"
  | "Announcement"
  | "Document"
  | "User"
  | "Setting"
  | "StudentEnrollment";

export interface AuditUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  user: AuditUser;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogDetail extends AuditLog {
  academicYear?: string;
  semester?: "First" | "Second";
  program?: string;
}

// ─── Entity-specific audit log (lighter) ───────────────────────────────────

export interface AuditEntityLog {
  id: number;
  userId: number;
  user: Pick<AuditUser, "firstName" | "lastName">;
  action: AuditAction;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
}

// ─── API Query Params ───────────────────────────────────────────────────────

export interface AuditQueryParams {
  userId?: number;
  action?: AuditAction | "";
  entityType?: AuditEntityType | "";
  entityId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  academicYear?: string;
  semester?: "First" | "Second" | "";
  program?: string;
  search?: string;
}

// ─── API Response ───────────────────────────────────────────────────────────

export interface AuditMeta {
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: AuditMeta;
}

export interface AuditEntityLogsResponse {
  data: AuditEntityLog[];
}

// ─── Stats / Chart Data ─────────────────────────────────────────────────────

export interface AuditActionCount {
  action: AuditAction;
  count: number;
  percentage: number;
}

export interface AuditEntityCount {
  entityType: AuditEntityType;
  count: number;
}

export interface AuditDailyActivity {
  date: string;
  count: number;
  logins: number;
  mutations: number;
}

export interface AuditHourlyActivity {
  hour: number;
  count: number;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  uniqueUsers: number;
  criticalActions: number;
  actionBreakdown: AuditActionCount[];
  entityBreakdown: AuditEntityCount[];
  dailyActivity: AuditDailyActivity[];
  hourlyActivity: AuditHourlyActivity[];
}

// ─── Grouping ───────────────────────────────────────────────────────────────

export interface AuditGroupKey {
  academicYear: string;
  semester: "First" | "Second";
  program?: string;
}

export interface AuditGroup {
  key: AuditGroupKey;
  label: string;
  logs: AuditLog[];
  count: number;
}

// ─── Export ─────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeValues?: boolean;
}
