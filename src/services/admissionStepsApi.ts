/* ------------------------------------------------------------------ */
/*  Admission Step Registry — API Service                              */
/*                                                                     */
/*  Full CRUD on the step definitions that drive:                      */
/*    - src/app/(admission)/(routes)/process-admission/page.tsx        */
/*    - src/app/(admission)/(routes)/admission-application-form/       */
/*  Real backend contract per sandbox/admission/admission_features_    */
/*  workflow.md — no bruno collection exists for this yet (a genuinely */
/*  new, additive endpoint set), so this is built directly against     */
/*  that doc's spec. Until the backend ships it, every call here 404s  */
/*  and the consuming pages surface that as a normal failed query —    */
/*  no client-side mock fallback, per this module's "don't fake it"    */
/*  convention (see admissionSetupApi.ts for the matching approach on  */
/*  Admission Cycles).                                                 */
/* ------------------------------------------------------------------ */

import apiClient, {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import type {
  AdmissionConfig,
  AdmissionStepDefinition,
  AdmissionStepGroup,
  CreateAdmissionStepPayload,
  UpdateAdmissionStepPayload,
} from "@/types/admissionConfig"

const AUTH = { access_token: true } as const

export const admissionStepsApi = {
  async list(group?: AdmissionStepGroup): Promise<AdmissionStepDefinition[]> {
    const res = await apiClient.get<{ data: AdmissionStepDefinition[] }>(
      "/admissions/config/steps",
      { ...AUTH, params: { group } }
    )
    return res.data
  },

  /** Composes both groups into the shape process-admission / useAdmissionForm consume. */
  async config(): Promise<AdmissionConfig> {
    const [processSteps, formSteps] = await Promise.all([
      admissionStepsApi.list("PROCESS"),
      admissionStepsApi.list("FORM"),
    ])
    return { processSteps, formSteps }
  },

  async create(
    payload: CreateAdmissionStepPayload
  ): Promise<AdmissionStepDefinition> {
    const res = await apiClient.post<{ data: AdmissionStepDefinition }>(
      "/admissions/config/steps",
      payload,
      AUTH
    )
    return res.data
  },

  async update(
    id: number,
    payload: UpdateAdmissionStepPayload
  ): Promise<AdmissionStepDefinition> {
    const res = await apiClient.patch<{ data: AdmissionStepDefinition }>(
      `/admissions/config/steps/${id}`,
      payload,
      AUTH
    )
    return res.data
  },

  async remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/admissions/config/steps/${id}`,
      AUTH
    )
  },

  async reorder(
    group: AdmissionStepGroup,
    orderedIds: number[]
  ): Promise<AdmissionStepDefinition[]> {
    const res = await apiClient.post<{ data: AdmissionStepDefinition[] }>(
      "/admissions/config/steps/reorder",
      { group, orderedIds },
      AUTH
    )
    return res.data
  },
}

/* ------------------------------------------------------------------ */
/*  Query keys / options                                                */
/* ------------------------------------------------------------------ */

export const admissionStepsKeys = {
  all: ["admission-steps"] as const,
  list: (group?: AdmissionStepGroup) =>
    [...admissionStepsKeys.all, "list", group ?? "all"] as const,
  config: () => [...admissionStepsKeys.all, "config"] as const,
}

export const admissionStepsQueryOptions = {
  list: (group?: AdmissionStepGroup) =>
    createApiQueryOptions({
      queryKey: admissionStepsKeys.list(group),
      queryFn: () => admissionStepsApi.list(group),
    }),

  config: () =>
    createApiQueryOptions({
      queryKey: admissionStepsKeys.config(),
      queryFn: () => admissionStepsApi.config(),
      staleTime: 1000 * 60 * 5,
    }),
}

export const admissionStepsMutationOptions = {
  create: () =>
    createApiMutationOptions<
      AdmissionStepDefinition,
      CreateAdmissionStepPayload
    >({
      mutationKey: [...admissionStepsKeys.all, "create"],
      mutationFn: (payload) => admissionStepsApi.create(payload),
    }),

  update: () =>
    createApiMutationOptions<
      AdmissionStepDefinition,
      { id: number; payload: UpdateAdmissionStepPayload }
    >({
      mutationKey: [...admissionStepsKeys.all, "update"],
      mutationFn: ({ id, payload }) => admissionStepsApi.update(id, payload),
    }),

  remove: () =>
    createApiMutationOptions<{ message: string }, number>({
      mutationKey: [...admissionStepsKeys.all, "remove"],
      mutationFn: (id) => admissionStepsApi.remove(id),
    }),

  reorder: () =>
    createApiMutationOptions<
      AdmissionStepDefinition[],
      { group: AdmissionStepGroup; orderedIds: number[] }
    >({
      mutationKey: [...admissionStepsKeys.all, "reorder"],
      mutationFn: ({ group, orderedIds }) =>
        admissionStepsApi.reorder(group, orderedIds),
    }),
}
