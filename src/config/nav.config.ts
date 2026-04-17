import { BarChart, Currency, CurrencyIcon, ListChecks, OctagonMinus, SchoolIcon, TestTubeDiagonalIcon, type LucideIcon } from "lucide-react";
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export enum UserRole {
   STUDENT = 'STUDENT',
   LECTURER = 'LECTURER',
   STAFF = 'STAFF',
   HOD = 'HOD',
   DEAN = 'DEAN',
   BURSARY = 'BURSARY',
   ADMIN = 'ADMIN',
   SUPER_ADMIN = 'SUPER_ADMIN'
}
export interface NavItem {
   title: string;
   href?: string;
   icon: LucideIcon;
   badge?: string | number;
   badgeVariant?: string;
   matchExactOnly?: boolean;
   children?: NavItem[];
}

export interface NavGroup {
   label?: string;
   items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Student navigation                                                 */
/* ------------------------------------------------------------------ */

const studentNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/student/dashboard", matchExactOnly: true, icon: LayoutDashboard },
         { title: "My Application", href: "/student/my-application", matchExactOnly: true, icon: FileText },
      ],
   },
   {
      items: [
         {
            title: "Reuseable Compoenets",
            icon: OctagonMinus,
            children: [
               { title: "Test Page", href: "/student/test", matchExactOnly: true, icon: TestTubeDiagonalIcon },
               { title: "Grades", href: "/student/test/grades", matchExactOnly: true, icon: CalendarDays },
            ],
         },
      ],
   },
   {
      label: "Academics",
      items: [
         { title: "My Courses", href: "/student/courses", matchExactOnly: true, icon: BookOpen },
         { title: "Timetable", href: "/student/timetable", matchExactOnly: true, icon: CalendarDays },
         {
            title: "Results",
            href: "/student/results",
            matchExactOnly: true,
            icon: ClipboardList,
         },
         { title: "Registration", href: "/student/registration", matchExactOnly: true, icon: FileText },
      ],
   },
   {
      label: "Campus",
      items: [
         { title: "Announcements", href: "/student/announcements", matchExactOnly: true, icon: Bell, badge: 3, badgeVariant: "warning" },
         { title: "Messages", href: "/student/messages", matchExactOnly: true, icon: MessageSquare },
         { title: "Payments", href: "/student/payments", matchExactOnly: true, icon: CreditCard },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/student/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  Lecturer navigation                                                */
/* ------------------------------------------------------------------ */

const lecturerNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/tutor", matchExactOnly: true, icon: LayoutDashboard },
      ],
   },
   {
      label: "Teaching",
      items: [
         { title: "My Courses", href: "/tutor/courses", matchExactOnly: true, icon: BookOpen },
         { title: "Timetable", href: "/tutor/timetable", matchExactOnly: true, icon: CalendarDays },
         {
            title: "Grading",
            icon: ClipboardList,
            children: [
               { title: "Submit Results", href: "/tutor/grading/submit", matchExactOnly: true, icon: FileText },
               { title: "Grade Book", href: "/tutor/grading/book", matchExactOnly: true, icon: FolderOpen },
            ],
         },
         { title: "Resources", href: "/tutor/resources", matchExactOnly: true, icon: Layers },
      ],
   },
   {
      label: "Campus",
      items: [
         { title: "Announcements", href: "/tutor/announcements", matchExactOnly: true, icon: Bell },
         { title: "Messages", href: "/tutor/messages", matchExactOnly: true, icon: MessageSquare },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/tutor/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  HOD navigation                                                     */
/* ------------------------------------------------------------------ */

const hodNav: NavGroup[] = lecturerNav;

/* ------------------------------------------------------------------ */
/*  Admin navigation                                                   */
/* ------------------------------------------------------------------ */

const adminNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/manager/dashbaord", matchExactOnly: true, icon: LayoutDashboard },
      ],
   },
   {
      label: "Admission",
      items: [
         { title: "Review Applications", href: "/manager/review-applications", matchExactOnly: true, icon: GraduationCap },
         { title: "Lecturers", href: "/manager/lecturers", matchExactOnly: true, icon: Users },
      ],
   },
   {
      label: "User Management",
      items: [
         { title: "Students", href: "/manager/students", matchExactOnly: true, icon: GraduationCap },
         { title: "Lecturers", href: "/manager/lecturers", matchExactOnly: true, icon: Users },
         { title: "Departments", href: "/manager/departments", matchExactOnly: true, icon: Building2 },
         {
            title: "Courses",
            icon: BookOpen,
            children: [
               { title: "Course List", href: "/manager/courses", matchExactOnly: true, icon: Layers },
               { title: "Allocation", href: "/manager/courses/allocation", matchExactOnly: true, icon: ClipboardList },
            ],
         },
      ],
   },
   {
      label: "Reports",
      items: [
         { title: "Analytics", href: "/manager/analytics", matchExactOnly: true, icon: BarChart3 },
         { title: "Announcements", href: "/manager/announcements", matchExactOnly: true, icon: Bell },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/manager/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  Dean navigation                                                    */
/* ------------------------------------------------------------------ */

const deanNav: NavGroup[] = adminNav;

/* ------------------------------------------------------------------ */
/*  Super-admin navigation                                             */
/* ------------------------------------------------------------------ */

const superAdminNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/admin/dashboard", matchExactOnly: true, icon: LayoutDashboard },
      ],
   },
   {
      label: "Academics",
      items: [
         { title: "Sessions", href: "/admin/academics/academic-year", matchExactOnly: true, icon: CalendarDays },
         { title: "Admissions", href: "/admin/academics/admissions", matchExactOnly: true, icon: SchoolIcon },
         { title: "Course Structure", href: "/admin/academics/course-structure", matchExactOnly: true, icon: GraduationCap },
         // {
         //    title: "Curriculum",
         //    icon: GraduationCap,
         //    children: [
         //       { title: "Faculties", href: "/admin/academics/curriculum/faculties", matchExactOnly: true, icon: School },
         //       { title: "Departments", href: "/admin/academics/curriculum/departments", matchExactOnly: true, icon: Building2 },
         //    ],
         // },
         { title: "Courses", href: "/admin/academics/courses-management", matchExactOnly: true, icon: BookOpen },
         { title: "Migrate Session", href: "/admin/academics/migrate-session", matchExactOnly: true, icon: BookOpen },
      ],
   },
   {
      label: "User Management",
      items: [
         { title: "Roles & Permissions", href: "/admin/users/roles", matchExactOnly: true, icon: ShieldCheck },
         {
            title: "User Management",
            icon: UserCog,
            children: [
               { title: "Summary", href: "/admin/users/summary", matchExactOnly: true, icon: Users },
               { title: "Students", href: "/admin/users/students", matchExactOnly: true, icon: GraduationCap },
               { title: "Lecturers", href: "/admin/users/lecturers", matchExactOnly: true, icon: BookOpen },
               { title: "Staff", href: "/admin/users/staff", matchExactOnly: true, icon: UserCog },
            ],
         },
      ],
   },
   {
      label: "Finance",
      items: [
         { title: "Fee Management", href: "/admin/finance/fee-management", matchExactOnly: true, icon: CurrencyIcon },
         { title: "Financial Summary", href: "/admin/finance/financial-summary", matchExactOnly: true, icon: Currency },
      ],
   },
   {
      label: "Grades Management",
      items: [
         { title: "Summary Charts", href: "/admin/grades/summary", matchExactOnly: true, icon: BarChart },
         { title: "Results", href: "/admin/grades/results", matchExactOnly: true, icon: ListChecks },
      ],
   },
   {
      label: "System",
      items: [
         { title: "Analytics", href: "/admin/system/analytics", matchExactOnly: true, icon: BarChart3 },
         { title: "System Config", href: "/admin/system/config", matchExactOnly: true, icon: Database },
         { title: "Portal Settings", href: "/admin/system/portal", matchExactOnly: true, icon: Globe },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/admin/account/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  Bursary navigation                                                 */
/* ------------------------------------------------------------------ */

const bursaryNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/admin/setup/fee-management", matchExactOnly: true, icon: LayoutDashboard },
      ],
   },
   {
      label: "Finance",
      items: [
         { title: "Fee Management", href: "/admin/setup/fee-management", matchExactOnly: true, icon: CreditCard },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/admin/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  Staff navigation                                                   */
/* ------------------------------------------------------------------ */

const staffNav: NavGroup[] = [
   {
      items: [
         { title: "Dashboard", href: "/manager/dashbaord", matchExactOnly: true, icon: LayoutDashboard },
      ],
   },
   {
      label: "Records",
      items: [
         { title: "Students", href: "/manager/students", matchExactOnly: true, icon: GraduationCap },
         { title: "Departments", href: "/manager/departments", matchExactOnly: true, icon: Building2 },
      ],
   },
   {
      label: "Campus",
      items: [
         { title: "Announcements", href: "/manager/announcements", matchExactOnly: true, icon: Bell },
         { title: "Messages", href: "/manager/messages", matchExactOnly: true, icon: MessageSquare },
      ],
   },
   {
      label: "Account",
      items: [
         { title: "Settings", href: "/manager/settings", matchExactOnly: true, icon: Settings },
      ],
   },
];

/* ------------------------------------------------------------------ */
/*  Combined config keyed by role                                      */
/* ------------------------------------------------------------------ */

export const navConfig: Record<UserRole, NavGroup[]> = {
   STUDENT: studentNav,
   LECTURER: lecturerNav,
   STAFF: staffNav,
   HOD: hodNav,
   DEAN: deanNav,
   BURSARY: bursaryNav,
   ADMIN: adminNav,
   SUPER_ADMIN: superAdminNav,
};

/** Maps each role to its dashboard base path */
export const roleDashboardPath: Record<UserRole, string> = {
   [UserRole.STUDENT]: "/student",
   [UserRole.LECTURER]: "/tutor",
   [UserRole.STAFF]: "/manager",
   [UserRole.HOD]: "/tutor",
   [UserRole.DEAN]: "/manager",
   [UserRole.BURSARY]: "/admin/setup/fee-management",
   [UserRole.ADMIN]: "/manager",
   [UserRole.SUPER_ADMIN]: "/admin",
};
