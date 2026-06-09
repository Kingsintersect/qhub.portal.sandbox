import { createApiMutationOptions, createApiQueryOptions } from "@/lib/clients/apiClient";
import type {
   AssessmentDetail,
   AssessmentFilter,
   AssessmentItem,
   PaginatedAssessments,
   SyncAllResult,
   SyncResult,
   SyncStatusResult,
   UpdateVisibilityPayload,
   VisibilityResponse,
} from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));
let _idCounter = 100;
const uid = () => ++_idCounter;

// ── Mock seed data ────────────────────────────────────────────────────────────

const mockAssessments: AssessmentDetail[] = [
   {
      id: 1,
      moodleSyncCourseId: 10,
      moodleAssessmentId: 1001,
      assessmentType: "assignment",
      name: "Programming Assignment 1: Linked Lists",
      description: "Implement a singly-linked list with insert, delete, and search operations in C++.",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      maxGrade: 100,
      isVisible: true,
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 10,
         moodleCourseId: 201,
         moodleShortName: "CSC301-2024",
         moodleFullName: "Data Structures & Algorithms",
         courseOffering: {
            id: 55,
            course: { code: "CSC301", title: "Data Structures & Algorithms" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
   {
      id: 2,
      moodleSyncCourseId: 10,
      moodleAssessmentId: 1002,
      assessmentType: "quiz",
      name: "Week 5 Quiz: Trees & Graphs",
      description: "Multiple choice quiz covering binary trees, BST operations, and graph representations.",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      maxGrade: 20,
      isVisible: true,
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 10,
         moodleCourseId: 201,
         moodleShortName: "CSC301-2024",
         moodleFullName: "Data Structures & Algorithms",
         courseOffering: {
            id: 55,
            course: { code: "CSC301", title: "Data Structures & Algorithms" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
   {
      id: 3,
      moodleSyncCourseId: 11,
      moodleAssessmentId: 1003,
      assessmentType: "assignment",
      name: "OS Lab Report: Process Scheduling",
      description: "Write a report analysing Round-Robin, FCFS, and SJF scheduling algorithms.",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      maxGrade: 50,
      isVisible: true,
      lastSyncAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 11,
         moodleCourseId: 202,
         moodleShortName: "CSC303-2024",
         moodleFullName: "Operating Systems",
         courseOffering: {
            id: 56,
            course: { code: "CSC303", title: "Operating Systems" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
   {
      id: 4,
      moodleSyncCourseId: 11,
      moodleAssessmentId: 1004,
      assessmentType: "forum",
      name: "Discussion: Virtualisation vs Containerisation",
      description: "Participate in a structured debate comparing virtual machines to containers.",
      dueDate: null,
      maxGrade: null,
      isVisible: true,
      lastSyncAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 11,
         moodleCourseId: 202,
         moodleShortName: "CSC303-2024",
         moodleFullName: "Operating Systems",
         courseOffering: {
            id: 56,
            course: { code: "CSC303", title: "Operating Systems" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
   {
      id: 5,
      moodleSyncCourseId: 12,
      moodleAssessmentId: 1005,
      assessmentType: "quiz",
      name: "MTH201 Mid-Semester Quiz",
      description: null,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      maxGrade: 30,
      isVisible: false,
      lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 12,
         moodleCourseId: 203,
         moodleShortName: "MTH201-2024",
         moodleFullName: "Mathematical Methods I",
         courseOffering: {
            id: 57,
            course: { code: "MTH201", title: "Mathematical Methods I" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
   {
      id: 6,
      moodleSyncCourseId: 12,
      moodleAssessmentId: 1006,
      assessmentType: "assignment",
      name: "Integration Techniques Assignment",
      description: "Solve 15 integration problems covering substitution, by-parts, and partial fractions.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      maxGrade: 100,
      isVisible: true,
      lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      course: {
         id: 12,
         moodleCourseId: 203,
         moodleShortName: "MTH201-2024",
         moodleFullName: "Mathematical Methods I",
         courseOffering: {
            id: 57,
            course: { code: "MTH201", title: "Mathematical Methods I" },
            semester: { name: "First Semester" },
            academicSession: { name: "2024/2025" },
         },
      },
   },
];

// ── Normalise detail → list item ──────────────────────────────────────────────

function toListItem(d: AssessmentDetail): AssessmentItem {
   return {
      id: d.id,
      assessmentType: d.assessmentType,
      name: d.name,
      description: d.description,
      dueDate: d.dueDate,
      maxGrade: d.maxGrade,
      isVisible: d.isVisible,
      course: {
         code: d.course.courseOffering.course.code,
         title: d.course.courseOffering.course.title,
         semesterName: d.course.courseOffering.semester.name,
      },
   };
}

// ── assessmentsApi ────────────────────────────────────────────────────────────

export const assessmentsApi = {
   async list(filters: Partial<AssessmentFilter> = {}): Promise<PaginatedAssessments> {
      await delay();
      const now = new Date();
      let items = mockAssessments.filter((a) => {
         if (filters.type && a.assessmentType !== filters.type) return false;
         if (filters.courseOfferingId && a.course.courseOffering.id !== filters.courseOfferingId) return false;
         if (filters.semesterId && a.course.courseOffering.id !== filters.semesterId) return false;
         if (filters.isVisible !== undefined && a.isVisible !== filters.isVisible) return false;
         if (filters.upcoming && (!a.dueDate || new Date(a.dueDate) <= now)) return false;
         return true;
      });
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total = items.length;
      items = items.slice((page - 1) * limit, page * limit);
      return { data: items.map(toListItem), meta: { total, page, limit } };
   },

   async getById(id: number): Promise<AssessmentDetail> {
      await delay(200);
      const item = mockAssessments.find((a) => a.id === id);
      if (!item) throw new Error("Assessment not found");
      return { ...item };
   },

   async getMyAssessments(filters: Partial<Pick<AssessmentFilter, "type" | "upcoming" | "semesterId" | "page" | "limit">> = {}): Promise<PaginatedAssessments> {
      // Scoped to the mock student's enrolled course offerings (IDs 55 & 56)
      await delay();
      const now = new Date();
      const enrolledOfferingIds = [55, 56];
      let items = mockAssessments.filter((a) => {
         if (!enrolledOfferingIds.includes(a.course.courseOffering.id)) return false;
         if (!a.isVisible) return false;
         if (filters.type && a.assessmentType !== filters.type) return false;
         if (filters.upcoming && (!a.dueDate || new Date(a.dueDate) <= now)) return false;
         return true;
      });
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const total = items.length;
      items = items.slice((page - 1) * limit, page * limit);
      return { data: items.map(toListItem), meta: { total, page, limit } };
   },

   async getUpcoming(limit = 10): Promise<PaginatedAssessments> {
      await delay();
      const now = new Date();
      const enrolledOfferingIds = [55, 56];
      const items = mockAssessments
         .filter(
            (a) =>
               enrolledOfferingIds.includes(a.course.courseOffering.id) &&
               a.isVisible &&
               a.dueDate &&
               new Date(a.dueDate) > now
         )
         .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
         .slice(0, limit);
      return { data: items.map(toListItem), meta: { total: items.length, page: 1, limit } };
   },

   async getByCourseOffering(courseOfferingId: number): Promise<PaginatedAssessments> {
      await delay();
      const items = mockAssessments.filter(
         (a) => a.course.courseOffering.id === courseOfferingId
      );
      return { data: items.map(toListItem), meta: { total: items.length, page: 1, limit: 100 } };
   },

   async updateVisibility(id: number, payload: UpdateVisibilityPayload): Promise<VisibilityResponse> {
      await delay(300);
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Assessment not found");
      mockAssessments[idx] = { ...mockAssessments[idx], isVisible: payload.isVisible, updatedAt: new Date().toISOString() };
      return { id, isVisible: payload.isVisible, updatedAt: mockAssessments[idx].updatedAt };
   },

   async syncCourse(moodleCourseId: number): Promise<SyncResult> {
      await delay(1200);
      return {
         moodleCourseId,
         pulled: 6,
         created: 2,
         updated: 4,
         failed: 0,
         errors: [],
         syncedAt: new Date().toISOString(),
      };
   },

   async syncAll(): Promise<SyncAllResult> {
      await delay(400);
      return {
         jobId: `job-${uid()}`,
         message: "Sync job queued. Check /assessments/sync/status for progress.",
      };
   },

   async getSyncStatus(): Promise<SyncStatusResult> {
      await delay(500);
      return {
         summary: {
            totalCourses: 3,
            totalAssessments: mockAssessments.length,
            byStatus: { SYNCED: 2, PENDING: 0, FAILED: 0, STALE: 1 },
         },
         courses: [
            {
               courseOfferingId: 55,
               courseCode: "CSC301",
               moodleCourseId: 201,
               assessmentCount: mockAssessments.filter((a) => a.course.courseOffering.id === 55).length,
               lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
               failedCount: 0,
            },
            {
               courseOfferingId: 56,
               courseCode: "CSC303",
               moodleCourseId: 202,
               assessmentCount: mockAssessments.filter((a) => a.course.courseOffering.id === 56).length,
               lastSyncAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
               failedCount: 0,
            },
            {
               courseOfferingId: 57,
               courseCode: "MTH201",
               moodleCourseId: 203,
               assessmentCount: mockAssessments.filter((a) => a.course.courseOffering.id === 57).length,
               lastSyncAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
               failedCount: 0,
            },
         ],
      };
   },

   async retrySyncCourse(moodleCourseId: number): Promise<SyncResult> {
      return assessmentsApi.syncCourse(moodleCourseId);
   },

   async deleteAssessment(id: number): Promise<{ message: string }> {
      await delay(300);
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Assessment not found");
      mockAssessments.splice(idx, 1);
      return { message: "Assessment removed from portal." };
   },
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const assessmentKeys = {
   all: ["assessments"] as const,
   list: (filters?: Partial<AssessmentFilter>) => [...assessmentKeys.all, "list", filters] as const,
   detail: (id: number) => [...assessmentKeys.all, "detail", id] as const,
   my: (filters?: object) => [...assessmentKeys.all, "my", filters] as const,
   upcoming: (limit?: number) => [...assessmentKeys.all, "upcoming", limit] as const,
   byCourse: (courseOfferingId: number) => [...assessmentKeys.all, "course", courseOfferingId] as const,
   syncStatus: () => [...assessmentKeys.all, "sync-status"] as const,
};

// ── Query options ─────────────────────────────────────────────────────────────

export const assessmentQueryOptions = {
   list: (filters?: Partial<AssessmentFilter>) =>
      createApiQueryOptions({
         queryKey: assessmentKeys.list(filters),
         queryFn: () => assessmentsApi.list(filters),
      }),

   detail: (id: number) =>
      createApiQueryOptions({
         queryKey: assessmentKeys.detail(id),
         queryFn: () => assessmentsApi.getById(id),
      }),

   my: (filters?: Partial<Pick<AssessmentFilter, "type" | "upcoming" | "semesterId" | "page" | "limit">>) =>
      createApiQueryOptions({
         queryKey: assessmentKeys.my(filters),
         queryFn: () => assessmentsApi.getMyAssessments(filters),
      }),

   upcoming: (limit = 10) =>
      createApiQueryOptions({
         queryKey: assessmentKeys.upcoming(limit),
         queryFn: () => assessmentsApi.getUpcoming(limit),
      }),

   byCourse: (courseOfferingId: number) =>
      createApiQueryOptions({
         queryKey: assessmentKeys.byCourse(courseOfferingId),
         queryFn: () => assessmentsApi.getByCourseOffering(courseOfferingId),
      }),

   syncStatus: () =>
      createApiQueryOptions({
         queryKey: assessmentKeys.syncStatus(),
         queryFn: () => assessmentsApi.getSyncStatus(),
      }),
};

// ── Mutation options ──────────────────────────────────────────────────────────

export const assessmentMutationOptions = {
   updateVisibility: () =>
      createApiMutationOptions<VisibilityResponse, { id: number; payload: UpdateVisibilityPayload }>({
         mutationKey: [...assessmentKeys.all, "update-visibility"],
         mutationFn: ({ id, payload }) => assessmentsApi.updateVisibility(id, payload),
      }),

   syncCourse: () =>
      createApiMutationOptions<SyncResult, number>({
         mutationKey: [...assessmentKeys.all, "sync-course"],
         mutationFn: (moodleCourseId) => assessmentsApi.syncCourse(moodleCourseId),
      }),

   retrySyncCourse: () =>
      createApiMutationOptions<SyncResult, number>({
         mutationKey: [...assessmentKeys.all, "retry-sync"],
         mutationFn: (moodleCourseId) => assessmentsApi.retrySyncCourse(moodleCourseId),
      }),

   syncAll: () =>
      createApiMutationOptions<SyncAllResult, void>({
         mutationKey: [...assessmentKeys.all, "sync-all"],
         mutationFn: () => assessmentsApi.syncAll(),
      }),

   deleteAssessment: () =>
      createApiMutationOptions<{ message: string }, number>({
         mutationKey: [...assessmentKeys.all, "delete"],
         mutationFn: (id) => assessmentsApi.deleteAssessment(id),
      }),
};
