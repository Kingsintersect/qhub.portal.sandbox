import type { z } from "zod"

import type {
  createPlatformUserSchema,
  platformAuditEntrySchema,
  platformPermissionSchema,
  platformRoleSchema,
  platformUserSchema,
} from "@/modules/platform-team/schemas"

export type PlatformUser = z.infer<typeof platformUserSchema>
export type PlatformRole = z.infer<typeof platformRoleSchema>
export type PlatformPermission = z.infer<typeof platformPermissionSchema>
export type PlatformAuditEntry = z.infer<typeof platformAuditEntrySchema>
export type CreatePlatformUserPayload = z.infer<typeof createPlatformUserSchema>

/** Permissions grouped by module, as the API returns them for the matrix. */
export type PermissionCatalog = Record<string, PlatformPermission[]>
