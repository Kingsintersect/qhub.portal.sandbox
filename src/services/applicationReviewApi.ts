import apiClient, {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import type {
  AdmissionApplication,
  ApiPaginatedResponse,
  ApiSingleResponse,
  ApplicantDocument,
  UpdateApplicationPayload,
  ReviewApplicationPayload,
} from "@/types/school"

const AUTH = { access_token: true }

export const applicationReviewApi = {
  list: async (filters?: { status?: string }) => {
    // Real API: GET /admissions/applications — Bruno: admission/Applications - List.bru
    return apiClient.get<ApiPaginatedResponse<AdmissionApplication>>(
      `/admissions/applications`,
      { ...AUTH, params: filters }
    )
  },

  getById: async (id: string) => {
    // Real API: GET /admissions/applications/:id — Bruno: admission/Applications - Get.bru
    return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${id}`,
      AUTH
    )
  },

  getMine: async () => {
    // Real API: GET /admissions/applications/my — Bruno: admission/Applications - My.bru
    // Replaces the old getByApplicantId(applicantId) — there is no real "by applicant id"
    // admin lookup endpoint; the applicant's own application is resolved from the JWT.
    return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/my`,
      AUTH
    )
  },

  update: async (id: string, payload: UpdateApplicationPayload) => {
    // Real API: PATCH /admissions/applications/:id — Bruno: admission/Applications - Update.bru
    // Auth: applicant only (own application), only while status is SUBMITTED — see admission_README.md.
    return apiClient.patch<
      ApiSingleResponse<AdmissionApplication>,
      UpdateApplicationPayload
    >(`/admissions/applications/${id}`, payload, AUTH)
  },

  review: async (id: string, payload: ReviewApplicationPayload) => {
    // Real API: PATCH /admissions/applications/:id/review — Bruno: admission/Applications - Review.bru
    return apiClient.patch<
      ApiSingleResponse<AdmissionApplication>,
      ReviewApplicationPayload
    >(`/admissions/applications/${id}/review`, payload, AUTH)
  },

  addDocument: async (applicationId: string, file: File, type: string) => {
    // Real API: POST /admissions/applications/:applicationId/documents
    // Bruno: admission/Application Documents - Add.bru — "Frontend Contract Changes Required" addendum §5.
    // Auth: applicant, own application, status = "pending".
    const form = new FormData()
    form.append("type", type)
    form.append("file", file)
    return apiClient.post<ApiSingleResponse<ApplicantDocument>>(
      `/admissions/applications/${applicationId}/documents`,
      form,
      AUTH
    )
  },

  replaceDocument: async (applicationId: string, docId: string, file: File) => {
    // Real API: PATCH /admissions/applications/:applicationId/documents/:docId
    // Bruno: admission/Application Documents - Replace.bru — sent as POST with a
    // `_method: PATCH` field (Laravel method-override spoof) since PHP doesn't
    // populate $_FILES for a genuine PATCH multipart body.
    const form = new FormData()
    form.append("_method", "PATCH")
    form.append("file", file)
    return apiClient.post<ApiSingleResponse<ApplicantDocument>>(
      `/admissions/applications/${applicationId}/documents/${docId}`,
      form,
      AUTH
    )
  },

  deleteDocument: async (applicationId: string, docId: string) => {
    // Real API: DELETE /admissions/applications/:applicationId/documents/:docId
    // Bruno: admission/Application Documents - Delete.bru — auth: applicant, own application
    // (the README's "Public" label is a documented spec typo, per that file's docs block).
    return apiClient.delete<void>(
      `/admissions/applications/${applicationId}/documents/${docId}`,
      AUTH
    )
  },
}

export const applicationReviewKeys = {
  all: ["admission-applications"] as const,
  list: (filters?: { status?: string }) =>
    [...applicationReviewKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...applicationReviewKeys.all, "detail", id] as const,
  mine: () => [...applicationReviewKeys.all, "mine"] as const,
}

export const applicationReviewQueryOptions = {
  list: (filters?: { status?: string }) =>
    createApiQueryOptions({
      queryKey: applicationReviewKeys.list(filters),
      queryFn: async () => (await applicationReviewApi.list(filters)).data,
    }),

  detail: (id: string) =>
    createApiQueryOptions({
      queryKey: applicationReviewKeys.detail(id),
      queryFn: async () => (await applicationReviewApi.getById(id)).data,
    }),

  mine: () =>
    createApiQueryOptions({
      queryKey: applicationReviewKeys.mine(),
      queryFn: async () => (await applicationReviewApi.getMine()).data,
    }),
}

export const applicationReviewMutationOptions = {
  update: () =>
    createApiMutationOptions<
      ApiSingleResponse<AdmissionApplication>,
      { id: string; payload: UpdateApplicationPayload }
    >({
      mutationKey: [...applicationReviewKeys.all, "update"],
      mutationFn: ({ id, payload }) => applicationReviewApi.update(id, payload),
    }),

  review: () =>
    createApiMutationOptions<
      ApiSingleResponse<AdmissionApplication>,
      { id: string; payload: ReviewApplicationPayload }
    >({
      mutationKey: [...applicationReviewKeys.all, "review"],
      mutationFn: ({ id, payload }) => applicationReviewApi.review(id, payload),
    }),

  addDocument: () =>
    createApiMutationOptions<
      ApiSingleResponse<ApplicantDocument>,
      { applicationId: string; file: File; type: string }
    >({
      mutationKey: [...applicationReviewKeys.all, "documents", "add"],
      mutationFn: ({ applicationId, file, type }) =>
        applicationReviewApi.addDocument(applicationId, file, type),
    }),

  replaceDocument: () =>
    createApiMutationOptions<
      ApiSingleResponse<ApplicantDocument>,
      { applicationId: string; docId: string; file: File }
    >({
      mutationKey: [...applicationReviewKeys.all, "documents", "replace"],
      mutationFn: ({ applicationId, docId, file }) =>
        applicationReviewApi.replaceDocument(applicationId, docId, file),
    }),

  deleteDocument: () =>
    createApiMutationOptions<void, { applicationId: string; docId: string }>({
      mutationKey: [...applicationReviewKeys.all, "documents", "delete"],
      mutationFn: ({ applicationId, docId }) =>
        applicationReviewApi.deleteDocument(applicationId, docId),
    }),
}
