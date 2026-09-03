import type { Tutor } from "@/types/users"
import type { Lecturer } from "@/modules/portal/seed"

/**
 * Teaching staff, from the real API onto the lifted table.
 *
 * Two columns the canvas draws have no source in the list response, and one
 * status the canvas draws has no equivalent. All three go to Design.
 *
 * TEACHING and STUDENTS. The canvas shows each lecturer's course codes and
 * their student count. `GET /users/tutors` returns neither. There is a
 * per-tutor `getTutorCourses`, but calling it once per row is N+1 — against
 * this institution's 3,414 teaching staff that is 3,414 requests to fill two
 * columns. Both show an em-dash until the list response carries them.
 *
 * INVITED. The canvas has a lecturer who has not yet set a password. The API
 * exposes `is_active` and nothing about invitation state, so a row is ACTIVE
 * or it is not; an inactive account is not necessarily an invited one, and
 * labelling it INVITED would be a guess presented as fact.
 */
export function toStaffRow(t: Tutor): Lecturer & { faculty: string } {
  const name = [t.user.first_name, t.user.last_name]
    .filter((p) => (p ?? "").trim() !== "")
    .join(" ")

  return {
    // No title field exists — the canvas's "Dr." came from a seed string, and
    // inventing one from `designation` (an academic rank, not an honorific)
    // would put the wrong word in front of somebody's name.
    name: name.trim() !== "" ? name : t.user.email,
    email: t.user.email,
    dept: t.department_name,
    codes: [],
    students: 0,
    status: t.user.is_active ? "ACTIVE" : "INVITED",
    last: "—",
    faculty: t.faculty_name,
  }
}
