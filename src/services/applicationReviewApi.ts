import apiClient, {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
// import { dummyAdmissionApplicationApi } from "@/services/dummyData";
import type {
  AdmissionApplication,
  ApiPaginatedResponse,
  ApiSingleResponse,
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
    // return dummyAdmissionApplicationApi.list(filters);
  },

  getById: async (id: string) => {
    // Real API: GET /admissions/applications/:id — Bruno: admission/Applications - Get.bru
    return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/${id}`,
      AUTH
    )
    // return dummyAdmissionApplicationApi.getById(id);
  },

  getMine: async () => {
    // Real API: GET /admissions/applications/my — Bruno: admission/Applications - My.bru
    // Replaces the old getByApplicantId(applicantId) — there is no real "by applicant id"
    // admin lookup endpoint; the applicant's own application is resolved from the JWT.
    return apiClient.get<ApiSingleResponse<AdmissionApplication>>(
      `/admissions/applications/my`,
      AUTH
    )
    // return dummyAdmissionApplicationApi.getByApplicantId(CURRENT_APPLICANT_ID); // old dummy-only lookup
  },

  update: async (id: string, payload: UpdateApplicationPayload) => {
    // Real API: PATCH /admissions/applications/:id — Bruno: admission/Applications - Update.bru
    // Auth: applicant only (own application), only while status is SUBMITTED — see admission_README.md.
    return apiClient.patch<
      ApiSingleResponse<AdmissionApplication>,
      UpdateApplicationPayload
    >(`/admissions/applications/${id}`, payload, AUTH)
    // return dummyAdmissionApplicationApi.update(id, payload);
  },

  review: async (id: string, payload: ReviewApplicationPayload) => {
    // Real API: PATCH /admissions/applications/:id/review — Bruno: admission/Applications - Review.bru
    return apiClient.patch<
      ApiSingleResponse<AdmissionApplication>,
      ReviewApplicationPayload
    >(`/admissions/applications/${id}/review`, payload, AUTH)
    // return dummyAdmissionApplicationApi.review(id, payload);
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
}
