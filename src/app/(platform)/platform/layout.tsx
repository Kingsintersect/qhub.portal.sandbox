import type { ReactNode } from "react"

import { PlatformShell } from "@/modules/institutions/components/PlatformShell"

export const metadata = {
  title: "QHUB Platform",
  description: "Onboard and manage institutions",
}

/**
 * The platform console is a route group in the same app rather than a separate
 * deployment — it shares the API client, auth plumbing and design system, and
 * is separated by host (see src/proxy.ts) rather than by build.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>
}
