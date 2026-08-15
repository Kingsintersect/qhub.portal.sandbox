/* ------------------------------------------------------------------ */
/*  Admission Step Configuration — backed by the real Settings API    */
/*  (GET/POST/PATCH /configuration/settings) — group "admission",      */
/*  single key "admission_step_config" holding the whole AdmissionConfig */
/*  as a JSON string. See configuration_README.md.                     */
/* ------------------------------------------------------------------ */

import {
  createApiMutationOptions,
  createApiQueryOptions,
} from "@/lib/clients/apiClient"
import { ApiClientError } from "@/lib/clients/apiClient"
import { settingsApi } from "@/services/configurationApi"
import {
  DEFAULT_ADMISSION_CONFIG,
  mergeAdmissionConfig,
} from "@/lib/admissionConfig"
import type { AdmissionConfig } from "@/types/admissionConfig"
import type { Setting } from "@/types/school"

const SETTING_KEY = "admission_step_config"
const SETTING_GROUP = "admission"

// Settings - Create/Update/Get-By-Key currently return the flat Setting object
// (not wrapped in `data`) per configuration_README.md, while the shared
// `settingsApi` typings assume an `ApiSingleResponse<Setting>` envelope —
// a pre-existing mismatch in this codebase. Unwrap defensively so this
// feature works whichever shape actually comes back.
function unwrapSetting(res: unknown): Setting {
  if (
    res &&
    typeof res === "object" &&
    "data" in (res as Record<string, unknown>)
  ) {
    return (res as { data: Setting }).data
  }
  return res as Setting
}

export const admissionConfigApi = {
  async fetch(): Promise<AdmissionConfig> {
    try {
      const res = await settingsApi.getByKey(SETTING_KEY)
      const setting = unwrapSetting(res)
      const parsed = JSON.parse(setting.value) as Partial<AdmissionConfig>
      return mergeAdmissionConfig(parsed)
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return DEFAULT_ADMISSION_CONFIG
      }
      throw error
    }
  },

  async save(config: AdmissionConfig): Promise<AdmissionConfig> {
    const value = JSON.stringify(config)
    try {
      const res = await settingsApi.getByKey(SETTING_KEY)
      const existing = unwrapSetting(res)
      await settingsApi.update(existing.id, { value, group: SETTING_GROUP })
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        await settingsApi.create({
          key: SETTING_KEY,
          value,
          group: SETTING_GROUP,
        })
      } else {
        throw error
      }
    }
    return config
  },
}

export const admissionConfigKeys = {
  all: ["admission-config"] as const,
}

export const admissionConfigQueryOptions = {
  get: () =>
    createApiQueryOptions({
      queryKey: admissionConfigKeys.all,
      queryFn: () => admissionConfigApi.fetch(),
      staleTime: 1000 * 60 * 5,
    }),
}

export const admissionConfigMutationOptions = {
  save: () =>
    createApiMutationOptions<AdmissionConfig, AdmissionConfig>({
      mutationKey: [...admissionConfigKeys.all, "save"],
      mutationFn: (config) => admissionConfigApi.save(config),
    }),
}
