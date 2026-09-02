/** The institution portal's two roles and their nav sets, from the bundle 25 canvas. */

export type PortalRole = "admin" | "lect"

export type PortalView =
  | "overview"
  | "students"
  | "lect"
  | "courses"
  | "lessons"
  | "live"
  | "disc"
  | "assess"
  | "grades"
  | "media"
  | "msgs"
  | "announce"
  | "support"
  | "billing"
  | "settings"

export type NavEntry = { view: PortalView; label: string; d: string }

/**
 * The two nav sets. They are not a subset relationship: the same view carries
 * a different label per role ("Courses" against "My courses"), because an
 * admin looks at the institution's courses and a lecturer at their own.
 */
export const NAV_ADMIN: NavEntry[] = [
  { view: "overview", label: "Overview", d: "M4 11l8-7 8 7M6 9v11h12V9" },
  {
    view: "students",
    label: "Students",
    d: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8zM23 21v-2a4 4 0 00-3-3.87",
  },
  {
    view: "lect",
    label: "Lecturers",
    d: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5",
  },
  {
    view: "courses",
    label: "Courses",
    d: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
  },
  { view: "media", label: "Media", d: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z" },
  {
    view: "announce",
    label: "Announcements",
    d: "M3 11l18-8-4 16-6-4-3 4-1-6-4-2z",
  },
  {
    view: "support",
    label: "Support",
    d: "M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 118.5-8.5zM12 17v.5M12 13a2.5 2.5 0 10-2.5-2.5",
  },
  { view: "billing", label: "Billing", d: "M2 7h20v10H2zM2 11h20" },
  {
    view: "settings",
    label: "Settings",
    d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  },
]

export const NAV_LECTURER: NavEntry[] = [
  { view: "overview", label: "My teaching", d: "M4 11l8-7 8 7M6 9v11h12V9" },
  {
    view: "students",
    label: "My students",
    d: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z",
  },
  {
    view: "courses",
    label: "My courses",
    d: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
  },
  {
    view: "lessons",
    label: "Lessons",
    d: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  },
  {
    view: "live",
    label: "Live classes",
    d: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z",
  },
  {
    view: "disc",
    label: "Discussions",
    d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  },
  {
    view: "assess",
    label: "Assessments",
    d: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  },
  {
    view: "grades",
    label: "Grading",
    d: "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  },
  { view: "media", label: "Media", d: "M3 5h18v14H3zM10 9.5l5 2.5-5 2.5z" },
  {
    view: "msgs",
    label: "Messages",
    d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10zM8 9h8M8 13h5",
  },
  {
    view: "announce",
    label: "Announcements",
    d: "M3 11l18-8-4 16-6-4-3 4-1-6-4-2z",
  },
  {
    view: "support",
    label: "Support",
    d: "M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 118.5-8.5z",
  },
]

export type PortalNotice = { text: string; when: string }
