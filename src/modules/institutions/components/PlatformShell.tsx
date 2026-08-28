"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  Activity,
  Bell,
  Building2,
  FileBarChart,
  ListChecks,
  Megaphone,
  Moon,
  ScrollText,
  Search,
  Settings,
  Sun,
  Ticket,
  Users,
  Wallet,
} from "lucide-react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { NotificationBell } from "@/modules/platform-notifications/components/NotificationBell"
import { ConsoleRail } from "@/modules/platform-rail/ConsoleRail"
import { ConfirmProvider } from "@/modules/platform-shared/ConfirmProvider"
import {
  useNavCounts,
  type NavCounts,
} from "@/modules/platform-nav/use-nav-counts"
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
 * Shown in the sidebar footer.
 *
 * Read from the build rather than typed in, so it cannot drift into claiming
 * a version that is not deployed.
 */
const CONSOLE_VERSION =
  process.env.NEXT_PUBLIC_CONSOLE_VERSION ?? "estate console"

type NavItem = {
  href: string
  label: string
  Icon: typeof Building2
  /** Null means every signed-in staff member sees it. */
  permission: string | null
  exact?: boolean
  /** Which nav count feeds this item's badge, if any. */
  badge?: keyof NavCounts
  /**
   * What the number means. Red for something wrong, amber for something
   * waiting, accent for something merely scheduled — the tone is the first
   * thing read and it should not have to be decoded.
   */
  tone?: "neg" | "warn" | "accent"
}

const NAV: NavItem[] = [
  {
    href: "/platform/overview",
    label: "Systems Overview",
    Icon: Activity,
    permission: "metrics.read",
    badge: "operations",
    tone: "neg",
  },
  {
    href: "/platform",
    label: "Institutions",
    Icon: Building2,
    permission: null,
    exact: true,
    badge: "institutions",
    tone: "neg",
  },
  {
    href: "/platform/tickets",
    label: "Tickets",
    Icon: Ticket,
    permission: "tickets.read",
    badge: "tickets",
    tone: "warn",
  },
  {
    href: "/platform/announcements",
    label: "Announcements",
    Icon: Megaphone,
    permission: "announcements.manage",
    badge: "announcements",
    tone: "warn",
  },
  {
    href: "/platform/billing",
    label: "Billing",
    Icon: Wallet,
    permission: "billing.read",
    badge: "billing",
    tone: "neg",
  },
  {
    href: "/platform/tasks",
    label: "My tasks",
    Icon: ListChecks,
    permission: "tasks.read",
    badge: "tasks",
    tone: "warn",
  },
  {
    href: "/platform/reports",
    label: "Reports",
    Icon: FileBarChart,
    permission: "reports.read",
    badge: "reports",
    tone: "accent",
  },
  {
    href: "/platform/team",
    label: "Roles & permissions",
    Icon: Users,
    permission: "team.read",
    badge: "team",
    tone: "neg",
  },
  {
    href: "/platform/audit",
    label: "Audit log",
    Icon: ScrollText,
    permission: "audit.read",
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
 * The estate console shell.
 *
 * Sticky 246px sidebar and a fluid main column, per the design. The nav is
 * filtered by permission rather than hidden behind disabled links — a control
 * you can see but not use teaches nothing except that the tool is lying.
 *
 * `isPlatform` is what admits somebody here, not a role: institution roles are
 * per-institution concepts and say nothing about platform access.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { can } = usePlatformPermissions()

  const isUnauthenticatedRoute = UNAUTHENTICATED_PATHS.includes(pathname)
  const isPlatformUser = session?.user?.isPlatform === true

  // Only once there is a session to count against — otherwise the request
  // fires on the sign-in screen and 401s on every render.
  const { data: counts } = useNavCounts(
    isPlatformUser && !isUnauthenticatedRoute
  )

  useEffect(() => {
    if (status === "loading" || isUnauthenticatedRoute) return

    if (!isPlatformUser) {
      router.replace(SIGNIN_PATH)
    }
  }, [status, isPlatformUser, isUnauthenticatedRoute, router])

  if (isUnauthenticatedRoute) {
    // Exactly the viewport, not a minimum: the login is a full-bleed image
    // with a centred card and must never scroll the page. dvh rather than vh
    // so a mobile browser's collapsing chrome cannot make it overflow.
    return (
      <main
        className="qhub-console"
        style={{ height: "100dvh", overflow: "hidden" }}
      >
        {children}
      </main>
    )
  }

  if (status === "loading" || !isPlatformUser) {
    return (
      <div
        className="qhub-console qhub-zoomed"
        style={{ minHeight: "calc(100dvh / var(--zoom))", padding: 22 }}
      >
        <div
          style={{
            height: 44,
            width: 240,
            background: "var(--img-ph)",
            borderRadius: 12,
          }}
        />
      </div>
    )
  }

  const items = NAV.filter(
    (item) => item.permission === null || can(item.permission)
  )

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <ConfirmProvider>
      <div
        className="qhub-console qhub-zoomed"
        style={{
          // Viewport units resolve before the 80% zoom, so a bare 100vh comes
          // out a quarter too tall and earns a scrollbar it should not have.
          minHeight: "calc(100vh / var(--zoom))",
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          padding: 22,
        }}
      >
        <aside
          style={{
            position: "sticky",
            zIndex: 1,
            top: 22,
            width: 246,
            flex: "0 0 246px",
            // The draft says calc(100vh - 44px). Viewport units resolve BEFORE
            // the 80% zoom, so a bare 100vh leaves the sidebar a fifth short of
            // the screen — and margin-top:auto then parks the theme toggle
            // above the fold instead of at the bottom, which is where the
            // handoff puts it.
            height: "calc(100vh / var(--zoom) - 44px)",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            padding: "6px 4px",
          }}
        >
          <Link
            href="/platform"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "6px 10px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "var(--logo-tile)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                style={{ stroke: "var(--logo-mark)" }}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18M3 12h18" />
              </svg>
            </span>
            <span>
              <span
                style={{
                  display: "block",
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: "var(--txt)",
                }}
              >
                QHub
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  color: "var(--txt3)",
                }}
              >
                Institutions manager
              </span>
            </span>
          </Link>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              whiteSpace: "nowrap",
              overflowY: "auto",
            }}
            aria-label="Console sections"
          >
            {items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item)}
                count={item.badge ? counts?.[item.badge] : undefined}
              />
            ))}
          </nav>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px",
            }}
          >
            <ThemeToggle />
            <span
              style={{
                fontSize: 11.5,
                color: "var(--icon2)",
                whiteSpace: "nowrap",
              }}
            >
              {CONSOLE_VERSION}
            </span>
          </div>
        </aside>

        <main
          style={{
            position: "relative",
            zIndex: 1,
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                flex: "1 1 auto",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--card)",
                borderRadius: 999,
                padding: "9px 10px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: "var(--panel)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <Search
                  size={16}
                  style={{ color: "var(--icon)" }}
                  aria-hidden="true"
                />
              </span>
              {/*
              Wired to the institutions list, which is the only searchable
              index the API exposes today. Deliberately not a dead control:
              it goes somewhere real rather than pretending to search
              incidents and admins that have no search endpoint.
            */}
              <input
                placeholder="Search institutions…"
                aria-label="Search institutions"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = (e.target as HTMLInputElement).value.trim()
                    router.push(
                      q ? `/platform?q=${encodeURIComponent(q)}` : "/platform"
                    )
                  }
                }}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: 14.5,
                  color: "var(--txt)",
                  width: "100%",
                }}
              />
              <kbd
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 7,
                  padding: "3px 7px",
                  marginRight: 6,
                  fontFamily: "inherit",
                  flex: "0 0 auto",
                }}
              >
                ⌘K
              </kbd>
            </div>

            <NotificationBell />

            <AccountMenu
              username={session?.user?.username ?? "Platform"}
              email={session?.user?.email ?? undefined}
            />
          </div>

          {children}
        </main>

        {/* Outside the view, as the draft places it: the rail is on every
          screen, not part of any one module. */}
        <ConsoleRail enabled={isPlatformUser} />
      </div>
    </ConfirmProvider>
  )
}

function NavLink({
  item,
  active,
  count,
}: {
  item: NavItem
  active: boolean
  count?: number
}) {
  const { Icon } = item

  // Zero is not shown. A badge reading 0 is a control asking for attention it
  // does not need, and once people learn to ignore those they ignore the ones
  // that matter.
  const showBadge = typeof count === "number" && count > 0

  const badgeTone =
    item.tone === "neg"
      ? { c: "var(--neg)", bg: "var(--neg-bg)" }
      : item.tone === "warn"
        ? { c: "var(--warn)", bg: "var(--warn-bg)" }
        : { c: "var(--accent)", bg: "var(--accent-soft)" }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "12px 14px",
        borderRadius: 14,
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-nav)" : "none",
        fontSize: 14.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt2)",
        textDecoration: "none",
      }}
    >
      <Icon
        size={17}
        style={{
          color: active ? "var(--accent)" : "var(--icon2)",
          flex: "0 0 auto",
        }}
        aria-hidden="true"
      />
      {item.label}
      {showBadge && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            color: badgeTone.c,
            background: badgeTone.bg,
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

/**
 * Light and dark, persisted.
 *
 * Rendered only once mounted: next-themes cannot know the stored choice on the
 * server, so painting a guess first produces a flash of the wrong state.
 */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div
      style={{
        display: "flex",
        padding: 4,
        background: "var(--card)",
        borderRadius: 999,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <ThemeButton
        label="Light"
        active={resolvedTheme === "light"}
        onClick={() => setTheme("light")}
      >
        <Sun size={16} aria-hidden="true" />
      </ThemeButton>
      <ThemeButton
        label="Dark"
        active={resolvedTheme === "dark"}
        onClick={() => setTheme("dark")}
      >
        <Moon size={15} aria-hidden="true" />
      </ThemeButton>
    </div>
  )
}

function ThemeButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--icon2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

/**
 * The avatar, and the menu behind it.
 *
 * Two items, per the design: your own settings, and the way out. Closing on
 * an outside click matters more here than elsewhere — this sits over the
 * content on every screen.
 */
function AccountMenu({
  username,
  email,
}: {
  username: string
  email?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onEsc)

    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "0 0 auto" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Account menu for ${username}`}
        aria-expanded={open}
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: "var(--card)",
          boxShadow: "var(--shadow-sm)",
          color: "var(--txt)",
          display: "grid",
          placeItems: "center",
          fontSize: 12.5,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {initialsOf(username)}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 250,
            minWidth: 220,
            background: "var(--surface-solid)",
            border: "1px solid var(--line-strong)",
            borderRadius: 16,
            boxShadow: "var(--shadow-pop)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--line2)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>
              {username}
            </div>
            {email && (
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  marginTop: 2,
                  wordBreak: "break-all",
                }}
              >
                {email}
              </div>
            )}
          </div>

          <Link
            href="/platform/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "11px 16px",
              fontSize: 13,
              color: "var(--txt2)",
              textDecoration: "none",
            }}
          >
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "11px 16px",
              fontSize: 13,
              color: "var(--txt2)",
              background: "none",
              border: "none",
              borderTop: "1px solid var(--line2)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function initialsOf(value: string): string {
  const parts = value
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[1][0]).toUpperCase()
}
