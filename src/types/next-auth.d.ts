import { DefaultSession } from "next-auth"
import { UserRole } from "@/config/nav.config"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      username: string
      role: UserRole
      availableRoles: UserRole[]
      roles: UserRole[]
      accessToken: string
      refreshToken: string
      firstName: string | null
      lastName: string | null
      avatar?: string | null
      permissions: string[]
      /**
       * True for platform staff, who administer institutions and belong to
       * none of them. Their session carries no roles or permissions — those
       * are per-institution concepts.
       */
      isPlatform?: boolean
    }
    error?: string
  }

  interface User {
    id: string
    username: string
    role: UserRole
    availableRoles: UserRole[]
    roles: UserRole[]
    accessToken: string
    refreshToken: string
    firstName: string | null
    lastName: string | null
    permissions: string[]
    avatar?: string | null
    isPlatform?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    role?: UserRole
    availableRoles?: UserRole[]
    roles?: UserRole[]
    accessToken?: string
    refreshToken?: string
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    permissions?: string[]
    isPlatform?: boolean
  }
}
