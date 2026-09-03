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
 *   department       — only `owning_department_id`, no name
 *   level            — only `level_id`, no numeric value or label
 *   lecturer         — not in the response at all
 *   students, media  — not in the response at all
 *
 * Nothing here is invented to fill a column. A course whose department the
 * endpoint does not name shows an em-dash, because "—" is true and a guessed
 * department is not. The list response needs to carry the joined names and
 * counts before this table says what the canvas intends it to say.
 */
export function toCatalogueRow(c: ApiCourse): Course {
  return {
    code: c.code,
    title: c.title,
    dept: "—",
    level: "—",
    lect: "—",
    students: 0,
    media: 0,
  }
}
