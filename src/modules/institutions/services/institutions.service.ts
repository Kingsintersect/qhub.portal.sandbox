import apiClient from "@/lib/clients/apiClient"
import type {
  Institution,
  ProvisioningProgress,
  InstitutionListFilters,
  InstitutionListResponse,
  ProvisionInstitutionPayload,
  UpdateInstitutionStatusPayload,
} from "@/modules/institutions/types"

/**
 * Platform-console API calls. Every route here is 404 on an institution's own
 * host — the backend's `platform` middleware enforces that, so these only ever
 * succeed from the platform host.
 */
export const institutionsService = {
  list: (filters: InstitutionListFilters = {}) =>
    apiClient.get<InstitutionListResponse>("/platform/tenants", {
      access_token: true,
      params: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.perPage ? { perPage: filters.perPage } : {}),
      },
    }),

  get: (id: number) =>
    apiClient.get<Institution>(`/platform/tenants/${id}`, {
      access_token: true,
    }),

  /** How far the run has got. Polled while the wizard's panel is open. */
  provisioning: async (tenantId: number): Promise<ProvisioningProgress> =>
    (
      await apiClient.get<{ data: ProvisioningProgress }>(
        `/platform/tenants/${tenantId}/provisioning`,
        { access_token: true }
      )
    ).data,

  /**
   * Supply the password a paused run is waiting for.
   *
   * The only place this secret is ever accepted, by design — it is not
   * collected in the wizard and not echoed back in the response.
   */
  resumeProvisioning: async (
    tenantId: number,
    password: string
  ): Promise<ProvisioningProgress> =>
    (
      await apiClient.post<
        { data: ProvisioningProgress },
        { password: string }
      >(
        `/platform/tenants/${tenantId}/provisioning/resume`,
        { password },
        { access_token: true }
      )
    ).data,

  provision: (payload: ProvisionInstitutionPayload) =>
    apiClient.post<Institution, ProvisionInstitutionPayload>(
      "/platform/tenants",
      payload,
      {
        access_token: true,
        // Provisioning creates a database and runs 18 migrations — well past
        // the client's 10s default, and a timeout here would leave the operator
        // unsure whether the institution was created.
        timeout: 120_000,
      }
    ),

  updateStatus: (id: number, payload: UpdateInstitutionStatusPayload) =>
    apiClient.patch<Institution, UpdateInstitutionStatusPayload>(
      `/platform/tenants/${id}/status`,
      payload,
      { access_token: true }
    ),
}
