import {
  AppWindowIcon,
  Banknote,
  BarChart,
  CalendarCheck2,
  ChartNetwork,
  ClapperboardIcon,
  ColumnsSettingsIcon,
  ListChecks,
  ListChevronsUpDown,
  NetworkIcon,
  SchoolIcon,
  Settings2,
  WifiSyncIcon,
  type LucideIcon,
} from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  MessageSquare,
  Bell,
  Settings,
  Users,
  BarChart3,
  Building2,
  ShieldCheck,
  Database,
  Layers,
  CreditCard,
  FolderOpen,
  UserCog,
  Globe,
  Link2,
  Award,
  UserCheck,
  CalendarCheck,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export enum UserRole {
  APPLICANT = "APPLICANT",
  GUEST = "GUEST",
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  STAFF = "STAFF",
  HOD = "HOD",
  DEAN = "DEAN",
  BURSARY = "BURSARY",
  DIRECTOR = "DIRECTOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}
export interface NavItem {
  title: string
  href?: string
  icon: LucideIcon
  badge?: string | number
  badgeVariant?: string
  matchExactOnly?: boolean
  children?: NavItem[]
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

/* ------------------------------------------------------------------ */
/*  Student navigation                                                 */
/* ------------------------------------------------------------------ */

const studentNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/student/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
      {
        title: "My Application",
        href: "/student/my-application",
        matchExactOnly: true,
        icon: FileText,
      },
      {
        title: "My Documents",
        href: "/student/documents",
        matchExactOnly: true,
        icon: FolderOpen,
      },
      {
        title: "My Hostel",
        href: "/student/hostel",
        matchExactOnly: true,
        icon: Building2,
      },
      {
        title: "My Clearance",
        href: "/student/clearance",
        matchExactOnly: true,
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        title: "My Courses",
        href: "/student/courses",
        matchExactOnly: true,
        icon: BookOpen,
      },
      {
        title: "Timetable",
        href: "/student/timetable",
        matchExactOnly: false,
        icon: CalendarDays,
      },
      {
        title: "Assessments",
        href: "/student/assessments/my-assessments",
        matchExactOnly: false,
        icon: ClipboardList,
      },
      {
        title: "Course Registration",
        href: "/student/enrollment",
        matchExactOnly: true,
        icon: UserCheck,
      },
      {
        title: "My Attendance",
        href: "/student/attendance",
        matchExactOnly: true,
        icon: CalendarCheck,
      },
      {
        title: "Results",
        href: "/student/results",
        matchExactOnly: true,
        icon: ClipboardList,
      },
      {
        title: "Grades",
        href: "/student/results/grades",
        matchExactOnly: true,
        icon: CalendarDays,
      },
      {
        title: "Profile",
        href: "/student/profile",
        matchExactOnly: true,
        icon: UserCog,
      },
    ],
  },
  {
    label: "Moodle LMS",
    items: [
      {
        title: "Moodle Grades",
        href: "/student/moodle/grades",
        matchExactOnly: true,
        icon: Award,
      },
      {
        title: "Moodle Calendar",
        href: "/student/moodle/calendar",
        matchExactOnly: true,
        icon: CalendarDays,
      },
      {
        title: "Upcoming (Moodle)",
        href: "/student/moodle/assessments/upcoming",
        matchExactOnly: true,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        title: "Notifications",
        href: "/student/notifications",
        matchExactOnly: true,
        icon: Bell,
        badge: 3,
        badgeVariant: "warning",
      },
      {
        title: "Calendar & Events",
        href: "/student/timetable/calendar",
        matchExactOnly: false,
        icon: CalendarDays,
      },
      {
        title: "Payments",
        href: "/student/payments",
        matchExactOnly: true,
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/student/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Tutor navigation                                                */
/* ------------------------------------------------------------------ */

const tutorNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/tutor",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Teaching",
    items: [
      {
        title: "Course Assignments",
        href: "/tutor/courses",
        matchExactOnly: true,
        icon: CalendarCheck2,
      },
      {
        title: "Assessments",
        href: "/tutor/assessments",
        matchExactOnly: true,
        icon: ClipboardList,
      },
      {
        title: "Attendance",
        href: "/tutor/attendance",
        matchExactOnly: true,
        icon: CalendarCheck,
      },
      {
        title: "Timetable",
        href: "/tutor/timetable",
        matchExactOnly: true,
        icon: CalendarDays,
      },
      {
        title: "Grading",
        icon: ClipboardList,
        children: [
          {
            title: "Submit Results",
            href: "/tutor/grading/submit",
            matchExactOnly: true,
            icon: FileText,
          },
          {
            title: "Grade Book",
            href: "/tutor/grading/book",
            matchExactOnly: true,
            icon: FolderOpen,
          },
        ],
      },
      {
        title: "Resources",
        href: "/tutor/resources",
        matchExactOnly: true,
        icon: Layers,
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        title: "Notifications",
        href: "/tutor/notifications",
        matchExactOnly: true,
        icon: Bell,
      },
      {
        title: "Calendar & Events",
        href: "/tutor/timetable/calendar",
        matchExactOnly: false,
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/tutor/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  HOD navigation                                                     */
/* ------------------------------------------------------------------ */

const hodNav: NavGroup[] = tutorNav

/* ------------------------------------------------------------------ */
/*  Director navigation                                                   */
/* ------------------------------------------------------------------ */

const directorNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/director/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Scholars",
    items: [
      {
        title: "Student & Lectures",
        href: "/director/scholars",
        matchExactOnly: true,
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Academic Reports",
    items: [
      {
        title: "Grade Reports",
        href: "/director/grades",
        matchExactOnly: true,
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Finances",
    items: [
      {
        title: "Financial Reports",
        href: "/director/financial-reports",
        matchExactOnly: true,
        icon: BarChart3,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Admin navigation                                                   */
/* ------------------------------------------------------------------ */

const adminNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/manager/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Admission",
    items: [
      {
        title: "Review Applications",
        href: "/manager/review-applications",
        matchExactOnly: true,
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Academic Sessions",
    items: [
      {
        title: "Sessions",
        href: "/manager/academics/academic-year",
        matchExactOnly: true,
        icon: CalendarDays,
      },
      {
        title: "Admissions",
        href: "/manager/academics/admissions",
        matchExactOnly: true,
        icon: SchoolIcon,
      },
      {
        title: "Course Structure",
        href: "/manager/academics/course-structure",
        matchExactOnly: true,
        icon: GraduationCap,
      },
      {
        title: "Academic Structure",
        href: "/manager/academics/academic-structure",
        matchExactOnly: true,
        icon: NetworkIcon,
      },
      {
        title: "Courses",
        href: "/manager/academics/courses-management",
        matchExactOnly: true,
        icon: BookOpen,
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "User Management",
        icon: UserCog,
        children: [
          {
            title: "Summary",
            href: "/manager/users/summary",
            matchExactOnly: true,
            icon: Users,
          },
          {
            title: "Students",
            href: "/manager/users/students",
            matchExactOnly: true,
            icon: GraduationCap,
          },
          {
            title: "Tutors",
            href: "/manager/users/tutors",
            matchExactOnly: true,
            icon: BookOpen,
          },
          {
            title: "Staff",
            href: "/manager/users/staff",
            matchExactOnly: true,
            icon: UserCog,
          },
          {
            title: "Documents",
            href: "/manager/documents",
            matchExactOnly: true,
            icon: FileText,
          },
          {
            title: "Hostels",
            href: "/manager/hostels",
            matchExactOnly: true,
            icon: Building2,
          },
          {
            title: "Clearance",
            href: "/manager/clearance",
            matchExactOnly: true,
            icon: ListChecks,
          },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Management",
        href: "/manager/finance/fees",
        matchExactOnly: true,
        icon: Banknote,
      },
    ],
  },
  {
    label: "Grades Management",
    items: [
      {
        title: "Summary Charts",
        href: "/manager/grades/summary",
        matchExactOnly: true,
        icon: BarChart,
      },
      {
        title: "Results",
        href: "/manager/grades/results",
        matchExactOnly: true,
        icon: ListChevronsUpDown,
      },
      {
        title: "Publish Results",
        href: "/manager/grades/publish-results",
        matchExactOnly: true,
        icon: ListChecks,
      },
      {
        title: "Grading Schemes",
        href: "/manager/grades/grading-schemes",
        matchExactOnly: true,
        icon: Settings2,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        title: "Analytics",
        href: "/manager/analytics",
        matchExactOnly: true,
        icon: BarChart3,
      },
      {
        title: "Announcements",
        href: "/manager/announcements",
        matchExactOnly: true,
        icon: Bell,
      },
      {
        title: "Notifications",
        href: "/manager/notification",
        matchExactOnly: true,
        icon: Bell,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/manager/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Super-admin navigation                                            */
/* ------------------------------------------------------------------ */

const superAdminNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
      {
        title: "Configurations",
        icon: AppWindowIcon,
        children: [
          {
            title: "Application Config",
            href: "/admin/configurations/app-config",
            matchExactOnly: true,
            icon: ColumnsSettingsIcon,
          },
          {
            title: "Roles & Permissions",
            href: "/admin/configurations/roles",
            matchExactOnly: true,
            icon: ShieldCheck,
          },
          {
            title: "Admission Config",
            href: "/admin/configurations/admission-config",
            matchExactOnly: true,
            icon: ClapperboardIcon,
          },
          {
            title: "Features Registry",
            href: "/admin/configurations/feature-registry",
            matchExactOnly: true,
            icon: Globe,
          },
          {
            title: "Features Access",
            href: "/admin/configurations/feature-access",
            matchExactOnly: true,
            icon: Settings,
          },
          {
            title: "Clearance Types",
            href: "/admin/configurations/clearance-types",
            matchExactOnly: true,
            icon: ListChecks,
          },
        ],
      },
    ],
  },
  {
    label: "Synchronize LMS",
    items: [
      {
        title: "Moodle Syncronizer",
        icon: WifiSyncIcon,
        children: [
          {
            title: "Overview",
            href: "/admin/moodle-sync",
            matchExactOnly: true,
            icon: WifiSyncIcon,
          },
          {
            title: "Categories",
            href: "/admin/moodle-sync/categories",
            matchExactOnly: true,
            icon: Building2,
          },
          {
            title: "Users",
            href: "/admin/moodle-sync/users",
            matchExactOnly: true,
            icon: Users,
          },
          {
            title: "Courses",
            href: "/admin/moodle-sync/courses",
            matchExactOnly: true,
            icon: BookOpen,
          },
          {
            title: "Enrollments",
            href: "/admin/moodle-sync/enrollments",
            matchExactOnly: true,
            icon: Link2,
          },
          {
            title: "Assessments",
            href: "/admin/moodle-sync/assessments",
            matchExactOnly: true,
            icon: ClipboardList,
          },
          {
            title: "Grades",
            href: "/admin/moodle-sync/grades",
            matchExactOnly: true,
            icon: Award,
          },
          {
            title: "Calendar & Zoom",
            href: "/admin/moodle-sync/calendar",
            matchExactOnly: true,
            icon: CalendarDays,
          },
        ],
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        title: "Sessions",
        href: "/admin/academics/academic-year",
        matchExactOnly: true,
        icon: CalendarDays,
      },
      {
        title: "Admissions",
        href: "/admin/academics/admissions",
        matchExactOnly: true,
        icon: SchoolIcon,
      },
      {
        title: "Course Structure",
        href: "/admin/academics/course-structure",
        matchExactOnly: true,
        icon: GraduationCap,
      },
      {
        title: "Academic Structure",
        href: "/admin/academics/academic-structure",
        matchExactOnly: true,
        icon: NetworkIcon,
      },
      {
        title: "Courses",
        href: "/admin/academics/courses-management",
        matchExactOnly: true,
        icon: BookOpen,
      },
      {
        title: "Assessments",
        icon: ClipboardList,
        children: [
          {
            title: "All Assessments",
            href: "/admin/assessments",
            matchExactOnly: true,
            icon: ClipboardList,
          },
          {
            title: "Sync Status",
            href: "/admin/assessments/sync-status",
            matchExactOnly: true,
            icon: Database,
          },
        ],
      },
      {
        title: "Timetable",
        icon: CalendarDays,
        children: [
          {
            title: "All Schedules",
            href: "/admin/timetable",
            matchExactOnly: true,
            icon: CalendarDays,
          },
          {
            title: "Venue Checker",
            href: "/admin/timetable/venue-check",
            matchExactOnly: true,
            icon: Building2,
          },
        ],
      },
      {
        title: "Enrollment",
        href: "/admin/enrollment",
        matchExactOnly: true,
        icon: UserCheck,
      },
    ],
  },
  {
    label: "Account Operations",
    items: [
      {
        title: "Summary",
        href: "/admin/users/summary",
        matchExactOnly: true,
        icon: Users,
      },
      {
        title: "Account Administration",
        icon: UserCog,
        children: [
          {
            title: "Students",
            href: "/admin/users/students",
            matchExactOnly: true,
            icon: GraduationCap,
          },
          {
            title: "Tutors",
            href: "/admin/users/tutors",
            matchExactOnly: true,
            icon: BookOpen,
          },
          {
            title: "Staff",
            href: "/admin/users/staff",
            matchExactOnly: true,
            icon: UserCog,
          },
        ],
      },
      {
        title: "Documents",
        href: "/admin/documents",
        matchExactOnly: true,
        icon: FileText,
      },
      {
        title: "Hostels",
        href: "/admin/hostels",
        matchExactOnly: true,
        icon: Building2,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Management",
        href: "/admin/finance/fees",
        matchExactOnly: true,
        icon: Banknote,
      },
    ],
  },
  {
    label: "Grades Management",
    items: [
      {
        title: "Summary Charts",
        href: "/admin/grades/summary",
        matchExactOnly: true,
        icon: BarChart,
      },
      {
        title: "Results",
        href: "/admin/grades/results",
        matchExactOnly: true,
        icon: ListChevronsUpDown,
      },
      {
        title: "Publish Results",
        href: "/admin/grades/publish-results",
        matchExactOnly: true,
        icon: ListChecks,
      },
      {
        title: "Grading Schemes",
        href: "/admin/grades/grading-schemes",
        matchExactOnly: true,
        icon: Settings2,
      },
    ],
  },
  {
    label: "Auditing",
    items: [
      {
        title: "Audit Overview",
        href: "/admin/audit",
        matchExactOnly: true,
        icon: ChartNetwork,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit/logs",
        matchExactOnly: true,
        icon: NetworkIcon,
      },
    ],
  },
  {
    label: "Communications",
    items: [
      {
        title: "Announcements",
        href: "/admin/announcements",
        matchExactOnly: true,
        icon: Bell,
      },
      {
        title: "Notifications",
        href: "/admin/notification",
        matchExactOnly: true,
        icon: Bell,
      },
      {
        title: "Calendar Events",
        href: "/admin/calendar",
        matchExactOnly: true,
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Analytics",
        href: "/admin/system/analytics",
        matchExactOnly: true,
        icon: BarChart3,
      },
      {
        title: "System Config",
        href: "/admin/system/config",
        matchExactOnly: true,
        icon: Database,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/admin/account/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Dean navigation                                                    */
/* ------------------------------------------------------------------ */

const deanNav: NavGroup[] = adminNav

/* ------------------------------------------------------------------ */
/*  Bursary navigation                                                 */
/* ------------------------------------------------------------------ */

const bursaryNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin/finance/fees",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Management",
        href: "/admin/finance/fees",
        matchExactOnly: true,
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

const applicantNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admission/application-form",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Staff navigation                                                   */
/* ------------------------------------------------------------------ */

const staffNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/manager/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Records",
    items: [
      {
        title: "Students",
        href: "/manager/students",
        matchExactOnly: true,
        icon: GraduationCap,
      },
      {
        title: "Departments",
        href: "/manager/departments",
        matchExactOnly: true,
        icon: Building2,
      },
      {
        title: "Clearance",
        href: "/manager/clearance",
        matchExactOnly: true,
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Campus",
    items: [
      {
        title: "Announcements",
        href: "/manager/announcements",
        matchExactOnly: true,
        icon: Bell,
      },
      {
        title: "Messages",
        href: "/manager/messages",
        matchExactOnly: true,
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/manager/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

const guestNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/guest/dashboard",
        matchExactOnly: true,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/guest/settings",
        matchExactOnly: true,
        icon: Settings,
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Combined config keyed by role                                      */
/* ------------------------------------------------------------------ */

export const navConfig: Record<UserRole, NavGroup[]> = {
  APPLICANT: applicantNav,
  GUEST: guestNav,
  STUDENT: studentNav,
  TUTOR: tutorNav,
  STAFF: staffNav,
  HOD: hodNav,
  DEAN: deanNav,
  BURSARY: bursaryNav,
  DIRECTOR: directorNav,
  ADMIN: adminNav,
  SUPER_ADMIN: superAdminNav,
}

/** Maps each role to its dashboard base path */
export const roleDashboardPath: Record<UserRole, string> = {
  [UserRole.APPLICANT]: "/admission/application-form",
  [UserRole.STUDENT]: "/student/dashboard",
  [UserRole.GUEST]: "/guest/dashboard",
  [UserRole.TUTOR]: "/tutor/dashboard",
  [UserRole.STAFF]: "/manager/dashboard",
  [UserRole.HOD]: "/tutor/dashboard",
  [UserRole.DEAN]: "/manager/dashboard",
  [UserRole.BURSARY]: "/admin/finance/fees",
  [UserRole.DIRECTOR]: "/director/dashboard",
  [UserRole.ADMIN]: "/manager/dashboard",
  [UserRole.SUPER_ADMIN]: "/admin/dashboard",
}
