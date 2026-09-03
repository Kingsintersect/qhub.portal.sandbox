import type { Course as ApiCourse } from "@/types/school"
import type { Course } from "@/modules/portal/seed"

/**
 * The course catalogue, from the real API onto the lifted table.
 *
 * This is the widest gap of the wired surfaces, and it is worth stating
 * plainly rather than hiding behind an em-dash: the canvas draws seven
 * columns and `GET /courses` can fill three.
 *
 *   code, title      — present
 *   department       — now named, since the endpoint eager-loads it
 *   level            — now named, likewise
 *   lecturer         — still not in the response
 *   students, media  — still not in the response
 *
 * The first two closed when `GET /courses` began eager-loading `level` and
 * `owningDepartment`. The remaining three are session-dependent — a course has
 * a lecturer and an enrolment count *for an offering*, not in the abstract —
 * and are still open with the backend.
 *
 * Nothing here is invented to fill a column. A course the endpoint does not
 * name shows an em-dash, because "—" is true and a guessed department is not.
 */
export function toCatalogueRow(c: ApiCourse): Course {
  return {
    code: c.code,
    title: c.title,
    // Falls back rather than assumes: an older response, or a caller that did
    // not eager-load, sends null and the cell stays honest.
    dept: c.owning_department_name ?? "—",
    level: c.level_value !== null ? `${c.level_value}L` : (c.level_name ?? "—"),
    lect: "—",
    students: 0,
    media: 0,
  }
}
