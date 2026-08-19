/* ------------------------------------------------------------------ */
/*  Admission Step Registry — API Service (Mock-Ready)                 */
/*                                                                     */
/*  Full CRUD on the step definitions that drive:                      */
/*    - src/app/(admission)/(routes)/process-admission/page.tsx        */
/*    - src/app/(admission)/(routes)/admission-application-form/       */
/*  Runs on an in-memory dummy store today. Replace each method's body */
/*  with the commented apiClient call once the backend endpoints in    */
/*  sandbox/admission/admission_features_workflow.md exist — the       */
/*  interface (and every consumer of it) stays the same.               */
/* ------------------------------------------------------------------ */

import {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import { DEFAULT_ADMISSION_STEPS, sortByOrder } from "@/lib/admissionConfig"
import type {
  AdmissionConfig,
  AdmissionStepDefinition,
  AdmissionStepGroup,
  CreateAdmissionStepPayload,
  UpdateAdmissionStepPayload,
} from "@/types/admissionConfig"

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

/* ------------------------------------------------------------------ */
/*  MOCK STORE                                                          */
/* ------------------------------------------------------------------ */

let mockSteps: AdmissionStepDefinition[] = DEFAULT_ADMISSION_STEPS.map((s) => ({
  ...s,
}))
let nextId = mockSteps.length + 1

function nextOrder(group: AdmissionStepGroup): number {
  const inGroup = mockSteps.filter((s) => s.group === group)
  return inGroup.length === 0 ? 1 : Math.max(...inGroup.map((s) => s.order)) + 1
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export const admissionStepsApi = {
  async list(group?: AdmissionStepGroup): Promise<AdmissionStepDefinition[]> {
    // TODO: replace with → apiClient.get<AdmissionStepDefinition[]>("/admissions/config/steps", { access_token: true, params: { group } })
    await delay(300)
    const rows = group ? mockSteps.filter((s) => s.group === group) : mockSteps
    return sortByOrder(rows).map((s) => ({ ...s }))
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
    // TODO: replace with → apiClient.post<AdmissionStepDefinition>("/admissions/config/steps", payload, { access_token: true })
    await delay(500)
    if (
      mockSteps.some((s) => s.group === payload.group && s.key === payload.key)
    ) {
      throw new Error(
        `A step with key "${payload.key}" already exists in this group.`
      )
    }
    const created: AdmissionStepDefinition = {
      id: `custom-${nextId++}`,
      order: nextOrder(payload.group),
      ...payload,
    }
    mockSteps = [...mockSteps, created]
    return { ...created }
  },

  async update(
    id: string,
    payload: UpdateAdmissionStepPayload
  ): Promise<AdmissionStepDefinition> {
    // TODO: replace with → apiClient.patch<AdmissionStepDefinition>(`/admissions/config/steps/${id}`, payload, { access_token: true })
    await delay(400)
    const existing = mockSteps.find((s) => s.id === id)
    if (!existing) throw new Error("Step not found")
    const updated: AdmissionStepDefinition = {
      ...existing,
      ...payload,
      // A required step can never be turned off, regardless of what's asked.
      enabled: existing.required ? true : (payload.enabled ?? existing.enabled),
    }
    mockSteps = mockSteps.map((s) => (s.id === id ? updated : s))
    return { ...updated }
  },

  async remove(id: string): Promise<{ message: string }> {
    // TODO: replace with → apiClient.delete<{ message: string }>(`/admissions/config/steps/${id}`, { access_token: true })
    await delay(400)
    const existing = mockSteps.find((s) => s.id === id)
    if (!existing) throw new Error("Step not found")
    if (existing.required)
      throw new Error(
        `"${existing.label}" is a required step and can't be deleted.`
      )
    mockSteps = mockSteps.filter((s) => s.id !== id)
    return { message: "Step deleted" }
  },

  async reorder(
    group: AdmissionStepGroup,
    orderedIds: string[]
  ): Promise<AdmissionStepDefinition[]> {
    // TODO: replace with → apiClient.post<AdmissionStepDefinition[]>("/admissions/config/steps/reorder", { group, orderedIds }, { access_token: true })
    await delay(300)
    const orderById = new Map(orderedIds.map((id, idx) => [id, idx + 1]))
    mockSteps = mockSteps.map((s) =>
      s.group === group && orderById.has(s.id)
        ? { ...s, order: orderById.get(s.id)! }
        : s
    )
    return admissionStepsApi.list(group)
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
      { id: string; payload: UpdateAdmissionStepPayload }
    >({
      mutationKey: [...admissionStepsKeys.all, "update"],
      mutationFn: ({ id, payload }) => admissionStepsApi.update(id, payload),
    }),

  remove: () =>
    createApiMutationOptions<{ message: string }, string>({
      mutationKey: [...admissionStepsKeys.all, "remove"],
      mutationFn: (id) => admissionStepsApi.remove(id),
    }),

  reorder: () =>
    createApiMutationOptions<
      AdmissionStepDefinition[],
      { group: AdmissionStepGroup; orderedIds: string[] }
    >({
      mutationKey: [...admissionStepsKeys.all, "reorder"],
      mutationFn: ({ group, orderedIds }) =>
        admissionStepsApi.reorder(group, orderedIds),
    }),
}
