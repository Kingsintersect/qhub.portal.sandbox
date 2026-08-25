"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { signOut, useSession } from "next-auth/react"
import { Building2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"

const SIGNIN_PATH = "/platform/signin"

/**
 * Chrome and access gate for the platform console.
 *
 * Gates on `isPlatform` rather than on a role: an institution's admin — even a
 * SUPER_ADMIN — has no standing here, and role values are per-institution
 * concepts that say nothing about platform access. The API enforces the same
 * boundary independently; this only decides what the browser renders.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { can } = usePlatformPermissions()

  const isSigninPage = pathname === SIGNIN_PATH
  const isPlatformUser = session?.user?.isPlatform === true

  useEffect(() => {
    if (status === "loading" || isSigninPage) return

    if (!isPlatformUser) {
      router.replace(SIGNIN_PATH)
    }
  }, [status, isPlatformUser, isSigninPage, router])

  if (isSigninPage) {
    return <main className="min-h-dvh bg-background">{children}</main>
  }

  if (status === "loading" || !isPlatformUser) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <Skeleton className="h-10 w-56" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              QHUB Platform
            </span>
          </Link>

          <nav
            className="flex items-center gap-1"
            aria-label="Platform sections"
          >
            <NavLink
              href="/platform"
              label="Institutions"
              active={pathname === "/platform"}
            />
            {/* Hidden when the account cannot read the team — the API refuses
                independently, this just avoids offering a dead end. */}
            {can("team.read") && (
              <NavLink
                href="/platform/team"
                label="Team"
                active={pathname.startsWith("/platform/team")}
              />
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {session?.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  )
}
