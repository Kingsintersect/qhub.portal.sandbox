import { redirect } from "next/navigation"

/**
 * Operations folded into Systems Overview.
 *
 * Incidents, upgrades and anomalies are three of that page's five tabs, so a
 * separate route would be the same data behind a second door. Redirected
 * rather than deleted so any link already in a notification still lands.
 */
export default function PlatformOperationsRoute() {
  redirect("/platform/overview")
}
