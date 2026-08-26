import { z } from "zod"

/** A platform account and the roles it holds. */
export const platformRoleRefSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const platformUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  roles: z.array(platformRoleRefSchema),
})

export const platformRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  isSuperuser: z.boolean(),
  permissions: z.array(z.string()),
  // Ids so the matrix can check boxes without matching on name, and the member
  // count so the console knows whether a role is safe to delete.
  permissionIds: z.array(z.number()).default([]),
  memberCount: z.number().default(0),
})

export const platformPermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable(),
})

export const platformAuditEntrySchema = z.object({
  id: z.number(),
  action: z.string(),
  actor: z.string().nullable(),
  institution: z.string().nullable(),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string().nullable(),
})

export const createPlatformUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "Letters, digits, dot, underscore and dash only"
    ),
  password: z.string().min(8, "At least 8 characters"),
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  roleIds: z.array(z.number()).min(1, "Grant at least one role"),
})
