import type { Student as ApiStudent, StudentStatus } from "@/types/users"
import type { Student } from "@/modules/portal/seed"

/**
 * The student roll, from the real API onto the shape the lifted table draws.
 *
 * Three things did not survive contact with the backend, and each is a
 * decision rather than a translation. All three are raised with Design.
 *
 * LEVELS. The canvas filters by "Year 1"…"Year 4"; the institution's own
 * vocabulary is 100, 200, 300 — the rest of this product renders "100L", and
 * so does the registry. Hardcoded year chips would match no real student at
 * all, so the label follows the backend and the chips are derived from the
 * rows actually present rather than assumed.
 *
 * STATUSES. The canvas designs three — ACTIVE, SUSPENDED, WITHDRAWN. The
 * backend has six: GRADUATED, RUSTICATED and DEFERRED have no treatment. They
 * are not invented one; they reuse the designed tone whose meaning they share,
 * so nothing renders untoned while the gap is open.
 *
 * LAST ACTIVE. This one turned out to be wrong in the original request to the
 * backend team: `users.last_login_at` has always been maintained on sign-in,
 * UserSummaryResource has always sent it, and usersApi has always mapped it.
 * Only the frontend `Student` type omitted it, so nothing could read a field
 * that was arriving. It is bucketed into the canvas's own vocabulary —
 * Today / Yesterday / Nd ago / This week — rather than a new date format.
 */

/** Statuses the canvas draws, and the tone each unmapped one borrows. */
const STATUS_TONE: Record<StudentStatus, Student["status"]> = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  // Disciplinary, and temporary — reads like a suspension, not an exit.
  RUSTICATED: "SUSPENDED",
  WITHDRAWN: "WITHDRAWN",
  // Both are "no longer on the active roll", which is what WITHDRAWN's muted
  // treatment says. Neither is a failure state and neither is coloured as one.
  GRADUATED: "WITHDRAWN",
  DEFERRED: "WITHDRAWN",
}

/**
 * The canvas's own buckets, so the column reads as it was drawn. A student who
 * has never signed in gets an em-dash, which is different from a long-ago one.
 */
export function lastActive(iso: string | null): string {
  if (iso === null || iso === "") return "—"

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"

  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 14) return "This week"

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  })
}

export function levelLabel(numeric: number): string {
  // The registry's own label. 0 means the record carries no level.
  return numeric > 0 ? `${numeric}L` : "—"
}

export function toRollStudent(s: ApiStudent): Student & { rawStatus: string } {
  const name = [s.user.first_name, s.user.last_name]
    .filter((p) => (p ?? "").trim() !== "")
    .join(" ")

  return {
    matric: s.matric_number,
    // Falls back to the matric number, which is never blank — a nameless row
    // is worse than an unfriendly one.
    name: name.trim() !== "" ? name : s.matric_number,
    prog: s.program_name,
    level: levelLabel(s.current_level),
    status: STATUS_TONE[s.status] ?? "WITHDRAWN",
    last: lastActive(s.user.last_login_at),
    rawStatus: s.status,
  }
}

/** The level chips, from the rows present rather than an assumed 1–4. */
export function levelsPresent(rows: { level: string }[]): string[] {
  const seen = [...new Set(rows.map((r) => r.level))].filter((l) => l !== "—")

  return seen.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
}
