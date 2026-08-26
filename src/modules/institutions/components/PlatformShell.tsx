"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { signOut, useSession } from "next-auth/react"
import {
  Activity,
  Bell,
  Building2,
  FileBarChart,
  ListChecks,
  LogOut,
  Megaphone,
  ScrollText,
  Settings,
  Ticket,
  Users,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { NotificationBell } from "@/modules/platform-notifications/components/NotificationBell"
import "@/modules/institutions/components/platform-tokens.css"

const SIGNIN_PATH = "/platform/signin"

/**
 * Routes that must render without a session.
 *
 * Somebody following an invitation or reset link has no account to sign in
 * with yet — that is the whole point of the link — so bouncing them to the
 * sign-in screen would make the link impossible to use.
 */
const UNAUTHENTICATED_PATHS = [SIGNIN_PATH, "/platform/set-password"]

/**
 * Navigation for the platform console.
 *
 * A sidebar rather than a top bar, matching the institution portal so the two
 * read as one product — and because the console is growing past what a row of
 * links comfortably holds.
 *
 * `permission: null` means always visible. Everything else is hidden when the
 * signed-in account lacks the grant; the API refuses independently, so this
 * only avoids offering a dead end.
 */
const NAV: Array<{
  href: string
  label: string
  Icon: typeof Building2
  permission: string | null
  exact?: boolean
  comingSoon?: boolean
}> = [
  {
    href: "/platform",
    label: "Institutions",
    Icon: Building2,
    permission: null,
    exact: true,
  },
  {
    href: "/platform/team",
    label: "Team",
    Icon: Users,
    permission: "team.read",
  },
  {
    href: "/platform/audit",
    label: "Audit trail",
    Icon: ScrollText,
    permission: "audit.read",
  },
  // Declared now so the shape of the console is visible; each becomes a real
  // link as its phase lands, rather than appearing from nowhere.
  {
    href: "/platform/tickets",
    label: "Support",
    Icon: Ticket,
    permission: "tickets.read",
  },
  {
    href: "/platform/announcements",
    label: "Announcements",
    Icon: Megaphone,
    permission: "announcements.manage",
  },
  {
    href: "/platform/billing",
    label: "Billing",
    Icon: Wallet,
    permission: "billing.read",
  },
  {
    href: "/platform/operations",
    label: "Operations",
    Icon: Activity,
    permission: "incidents.manage",
  },
  {
    href: "/platform/tasks",
    label: "My tasks",
    Icon: ListChecks,
    permission: "tasks.read",
  },
  {
    href: "/platform/reports",
    label: "Reports",
    Icon: FileBarChart,
    permission: "reports.read",
  },
  {
    href: "/platform/notifications",
    label: "Notifications",
    Icon: Bell,
    // Ungated: a notification belongs to one account and there is no view
    // here of anybody else's.
    permission: null,
  },
  {
    href: "/platform/settings",
    label: "Settings",
    Icon: Settings,
    // Your own password, MFA and sessions. Needing a grant to change your own
    // password would be the wrong shape.
    permission: null,
  },
]

/**
 * Chrome and access gate for the platform console.
 *
 * Gates on `isPlatform` rather than on a role: an institution's admin — even a
 * SUPER_ADMIN — has no standing here, and role values are per-institution
 * concepts that say nothing about platform access.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { can } = usePlatformPermissions()

  const isSigninPage = UNAUTHENTICATED_PATHS.includes(pathname)
  const isPlatformUser = session?.user?.isPlatform === true

  useEffect(() => {
    if (status === "loading" || isSigninPage) return

    if (!isPlatformUser) {
      router.replace(SIGNIN_PATH)
    }
  }, [status, isPlatformUser, isSigninPage, router])

  if (isSigninPage) {
    return <main className="qhub-console min-h-dvh">{children}</main>
  }

  if (status === "loading" || !isPlatformUser) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <Skeleton className="h-10 w-56" />
      </div>
    )
  }

  const items = NAV.filter(
    (item) => item.permission === null || can(item.permission)
  )

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="qhub-console min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          <Link
            href="/platform"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm leading-tight font-bold text-sidebar-foreground">
                QHUB Platform
              </span>
              <span className="block text-[10px] text-muted-foreground">
                Estate console
              </span>
            </span>
          </Link>
        </div>

        <nav
          className="flex-1 space-y-0.5 overflow-y-auto p-2"
          aria-label="Platform sections"
        >
          {items.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item)} />
          ))}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-2">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initialsOf(
                session?.user?.username ?? session?.user?.email ?? "?"
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-sidebar-foreground">
                {session?.user?.username ?? "Platform"}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {session?.user?.email}
              </span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
          >
            <LogOut className="mr-2 size-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Narrow screens get the nav as a scrolling strip rather than a hidden
          drawer — this is an operator tool, and a hamburger adds a tap between
          them and the thing they came for. */}
      <div className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 lg:hidden">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-3.5" aria-hidden="true" />
        </span>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.comingSoon ? "#" : item.href}
            aria-disabled={item.comingSoon}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap",
              isActive(item)
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
              item.comingSoon && "pointer-events-none opacity-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Top bar. The bell lives here rather than in the sidebar so it is in
          the same place on every screen — an alert you have to go looking for
          is one you find late. */}
      <div
        className="sticky top-0 z-30 hidden items-center justify-end gap-1 border-b px-6 py-2 lg:ml-60 lg:flex"
        style={{ borderColor: "var(--line)", background: "var(--card)" }}
      >
        <NotificationBell />
      </div>

      <main className="px-4 py-8 sm:px-6 lg:ml-60 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

function NavLink({
  href,
  label,
  Icon,
  active,
  comingSoon,
}: {
  href: string
  label: string
  Icon: typeof Building2
  active: boolean
  comingSoon?: boolean
}) {
  const className = cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
    active
      ? "bg-sidebar-primary/10 font-medium text-sidebar-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
  )

  // Not yet built. Rendered as inert text rather than a link so it cannot lead
  // to a 404, and labelled so it reads as forthcoming rather than broken.
  if (comingSoon) {
    return (
      <span
        className={cn(className, "cursor-default opacity-50")}
        aria-disabled="true"
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
        <span className="ml-auto text-[10px] tracking-wide uppercase">
          soon
        </span>
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  )
}

function initialsOf(value: string): string {
  return value.slice(0, 2).toUpperCase()
}
