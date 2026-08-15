import {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import apiClient from "@/lib/clients/apiClient"
import {
  dummyFeeAccountApi,
  dummyFeeStructureApi,
  dummyFresherFeeApi,
  dummyOtherFeeApi,
  dummyProgramApi,
  dummySemesterApi,
  dummySessionApi,
} from "@/services/dummyData"
import type {
  AcademicSession,
  Semester,
  FeeStructure,
  FresherFeeItem,
  OtherFeeItem,
  Program,
  CreateAcademicSessionPayload,
  UpdateAcademicSessionPayload,
  CreateSemesterPayload,
  CreateFeeStructurePayload,
  CreateFresherFeePayload,
  CreateOtherFeePayload,
  GenerateFeeAccountsPayload,
  GenerateFeeAccountsResponse,
  ApiListResponse,
  ApiSingleResponse,
} from "@/types/school"

const AUTH = { access_token: true }

// ── Academic Sessions ───────────────────────

export const academicSessionApi = {
  list: async () => {
    //   return dummySessionApi.list();
    return apiClient.get<ApiListResponse<AcademicSession>>(
      "/academic/sessions",
      AUTH
    )
  },

  getById: async (id: string) => {
    //   return dummySessionApi.getById(id);
    return apiClient.get<ApiSingleResponse<AcademicSession>>(
      `/academic/sessions/${id}`,
      AUTH
    )
  },

  create: async (payload: CreateAcademicSessionPayload) => {
    //   return dummySessionApi.create(payload);
    return apiClient.post<
      ApiSingleResponse<AcademicSession>,
      CreateAcademicSessionPayload
    >("/academic/sessions", payload, AUTH)
  },

  update: async (id: string, payload: UpdateAcademicSessionPayload) => {
    //   return dummySessionApi.update(id, payload);
    return apiClient.patch<
      ApiSingleResponse<AcademicSession>,
      UpdateAcademicSessionPayload
    >(`/academic/sessions/${id}`, payload, AUTH)
  },

  delete: async (id: string) => {
    //   return dummySessionApi.remove(id);
    return apiClient.delete<{ message: string }>(
      `/academic/sessions/${id}`,
      AUTH
    )
  },

  activate: async (id: string) => {
    //   return dummySessionApi.activate(id);
    return apiClient.patch<
      ApiSingleResponse<AcademicSession>,
      Record<string, never>
    >(`/academic/sessions/${id}/activate`, {}, AUTH)
  },
}

// ── Semesters ───────────────────────────────

export const semesterApi = {
  listBySession: async (sessionId: string) => {
    //  return dummySemesterApi.listBySession(sessionId)
    return apiClient.get<ApiListResponse<Semester>>(
      `/academic/semesters?sessionId=${sessionId}`,
      AUTH
    )
  },

  create: async (payload: CreateSemesterPayload) => {
    //  return dummySemesterApi.create(payload)
    return apiClient.post<ApiSingleResponse<Semester>, CreateSemesterPayload>(
      "/academic/semesters",
      payload,
      AUTH
    )
  },

  update: (id: string, payload: Partial<CreateSemesterPayload>) =>
    apiClient.patch<
      ApiSingleResponse<Semester>,
      Partial<CreateSemesterPayload>
    >(`/academic/semesters/${id}`, payload, AUTH),

  delete: async (id: string) => {
    //  return dummySemesterApi.remove(id)
    return apiClient.delete<{ message: string }>(
      `/academic/semesters/${id}`,
      AUTH
    )
  },

  activate: async (id: string) => {
    //  return dummySemesterApi.activate(id)
    return apiClient.patch<ApiSingleResponse<Semester>, Record<string, never>>(
      `/academic/semesters/${id}/activate`,
      {},
      AUTH
    )
  },
}

// ── Fee Structures ──────────────────────────

export const feeStructureApi = {
  listBySession: async (sessionId: string) => {
    return dummyFeeStructureApi.listBySession(sessionId)
    // return apiClient.get<ApiListResponse<FeeStructure>>(`/academic/sessions/${sessionId}/fee-structures`, AUTH)
  },

  create: async (payload: CreateFeeStructurePayload) => {
    return dummyFeeStructureApi.create(payload)
    // return apiClient.post<ApiSingleResponse<FeeStructure>, CreateFeeStructurePayload>("/fee-structures", payload, AUTH)
  },

  update: (id: string, payload: Partial<CreateFeeStructurePayload>) =>
    apiClient.put<
      ApiSingleResponse<FeeStructure>,
      Partial<CreateFeeStructurePayload>
    >(`/fee-structures/${id}`, payload, AUTH),

  delete: async (id: string) => {
    return dummyFeeStructureApi.remove(id)
    // return apiClient.delete<{ message: string }>(`/fee-structures/${id}`, AUTH)
  },
}

// ── Programs (lookup) ───────────────────────

export const programApi = {
  list: async () => {
    return dummyProgramApi.list()
    // return apiClient.get<ApiListResponse<Program>>("/programs", AUTH)
  },
}

// ── Student Fee Account Generation ──────────

export const feeAccountApi = {
  generate: async (payload: GenerateFeeAccountsPayload) => {
    return dummyFeeAccountApi.generate(payload)
    // return apiClient.post<GenerateFeeAccountsResponse, GenerateFeeAccountsPayload>("/fee-accounts/generate", payload, AUTH)
  },
}

export const fresherFeeApi = {
  listBySession: async (sessionId: string) => {
    return dummyFresherFeeApi.listBySession(sessionId)
    // return apiClient.get<ApiListResponse<FresherFeeItem>>(`/academic/sessions/${sessionId}/fresher-fees`, AUTH)
  },

  create: async (payload: CreateFresherFeePayload) => {
    return dummyFresherFeeApi.create(payload)
    // return apiClient.post<ApiSingleResponse<FresherFeeItem>, CreateFresherFeePayload>("/fresher-fees", payload, AUTH)
  },

  delete: async (id: string) => {
    return dummyFresherFeeApi.remove(id)
    // return apiClient.delete<{ message: string }>(`/fresher-fees/${id}`, AUTH)
  },
}

export const otherFeeApi = {
  listBySession: async (sessionId: string) => {
    return dummyOtherFeeApi.listBySession(sessionId)
    // return apiClient.get<ApiListResponse<OtherFeeItem>>(`/academic/sessions/${sessionId}/other-fees`, AUTH)
  },

  create: async (payload: CreateOtherFeePayload) => {
    return dummyOtherFeeApi.create(payload)
    // return apiClient.post<ApiSingleResponse<OtherFeeItem>, CreateOtherFeePayload>("/other-fees", payload, AUTH)
  },

  delete: async (id: string) => {
    return dummyOtherFeeApi.remove(id)
    // return apiClient.delete<{ message: string }>(`/other-fees/${id}`, AUTH)
  },
}

export const feeManagementKeys = {
  all: ["fee-management"] as const,
  sessions: () => [...feeManagementKeys.all, "sessions"] as const,
  sessionDetail: (id: string) =>
    [...feeManagementKeys.all, "sessions", id] as const,
  semestersBySession: (sessionId: string) =>
    [...feeManagementKeys.all, "semesters", sessionId] as const,
  feeStructuresBySession: (sessionId: string) =>
    [...feeManagementKeys.all, "fee-structures", sessionId] as const,
  programs: () => [...feeManagementKeys.all, "programs"] as const,
  fresherFeesBySession: (sessionId: string) =>
    [...feeManagementKeys.all, "fresher-fees", sessionId] as const,
  otherFeesBySession: (sessionId: string) =>
    [...feeManagementKeys.all, "other-fees", sessionId] as const,
  feeAccounts: () => [...feeManagementKeys.all, "fee-accounts"] as const,
}

export const feeManagementQueryOptions = {
  sessions: () =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.sessions(),
      queryFn: async () => (await academicSessionApi.list()).data,
    }),

  sessionDetail: (id: string) =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.sessionDetail(id),
      queryFn: async () => (await academicSessionApi.getById(id)).data,
    }),

  semestersBySession: (sessionId: string) =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.semestersBySession(sessionId),
      queryFn: async () => (await semesterApi.listBySession(sessionId)).data,
    }),

  feeStructuresBySession: (sessionId: string) =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.feeStructuresBySession(sessionId),
      queryFn: async () =>
        (await feeStructureApi.listBySession(sessionId)).data,
    }),

  programs: () =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.programs(),
      queryFn: async () => (await programApi.list()).data,
    }),

  fresherFeesBySession: (sessionId: string) =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.fresherFeesBySession(sessionId),
      queryFn: async () => (await fresherFeeApi.listBySession(sessionId)).data,
    }),

  otherFeesBySession: (sessionId: string) =>
    createApiQueryOptions({
      queryKey: feeManagementKeys.otherFeesBySession(sessionId),
      queryFn: async () => (await otherFeeApi.listBySession(sessionId)).data,
    }),
}

export const feeManagementMutationOptions = {
  createSession: () =>
    createApiMutationOptions<
      ApiSingleResponse<AcademicSession>,
      CreateAcademicSessionPayload
    >({
      mutationKey: [...feeManagementKeys.sessions(), "create"],
      mutationFn: academicSessionApi.create,
    }),

  updateSession: () =>
    createApiMutationOptions<
      ApiSingleResponse<AcademicSession>,
      { id: string; payload: UpdateAcademicSessionPayload }
    >({
      mutationKey: [...feeManagementKeys.sessions(), "update"],
      mutationFn: ({ id, payload }) => academicSessionApi.update(id, payload),
    }),

  deleteSession: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...feeManagementKeys.sessions(), "delete"],
      mutationFn: academicSessionApi.delete,
    }),

  activateSession: () =>
    createApiMutationOptions<ApiSingleResponse<AcademicSession>, string>({
      mutationKey: [...feeManagementKeys.sessions(), "activate"],
      mutationFn: academicSessionApi.activate,
    }),

  createSemester: () =>
    createApiMutationOptions<
      ApiSingleResponse<Semester>,
      CreateSemesterPayload
    >({
      mutationKey: [...feeManagementKeys.all, "semesters", "create"],
      mutationFn: semesterApi.create,
    }),

  deleteSemester: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...feeManagementKeys.all, "semesters", "delete"],
      mutationFn: semesterApi.delete,
    }),

  activateSemester: () =>
    createApiMutationOptions<ApiSingleResponse<Semester>, string>({
      mutationKey: [...feeManagementKeys.all, "semesters", "activate"],
      mutationFn: semesterApi.activate,
    }),

  createFeeStructure: () =>
    createApiMutationOptions<
      ApiSingleResponse<FeeStructure>,
      CreateFeeStructurePayload
    >({
      mutationKey: [...feeManagementKeys.all, "fee-structures", "create"],
      mutationFn: feeStructureApi.create,
    }),

  deleteFeeStructure: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...feeManagementKeys.all, "fee-structures", "delete"],
      mutationFn: feeStructureApi.delete,
    }),

  generateFeeAccounts: () =>
    createApiMutationOptions<
      GenerateFeeAccountsResponse,
      GenerateFeeAccountsPayload
    >({
      mutationKey: [...feeManagementKeys.feeAccounts(), "generate"],
      mutationFn: feeAccountApi.generate,
    }),

  createFresherFee: () =>
    createApiMutationOptions<
      ApiSingleResponse<FresherFeeItem>,
      CreateFresherFeePayload
    >({
      mutationKey: [...feeManagementKeys.all, "fresher-fees", "create"],
      mutationFn: fresherFeeApi.create,
    }),

  deleteFresherFee: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...feeManagementKeys.all, "fresher-fees", "delete"],
      mutationFn: fresherFeeApi.delete,
    }),

  createOtherFee: () =>
    createApiMutationOptions<
      ApiSingleResponse<OtherFeeItem>,
      CreateOtherFeePayload
    >({
      mutationKey: [...feeManagementKeys.all, "other-fees", "create"],
      mutationFn: otherFeeApi.create,
    }),

  deleteOtherFee: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...feeManagementKeys.all, "other-fees", "delete"],
      mutationFn: otherFeeApi.delete,
    }),
}
