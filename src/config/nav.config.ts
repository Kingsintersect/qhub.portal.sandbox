import { OctagonMinus, SchoolIcon, Settings2Icon, TestTubeDiagonalIcon, type LucideIcon } from "lucide-react";
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
        ],
    },
    {
        items: [
            {
                title: "Reuseable Compoenets",
                icon: OctagonMinus,
                children: [
                    { title: "Test Page", href: "/student/test", matchExactOnly:true, icon: TestTubeDiagonalIcon },
                    { title: "Grades", href: "/student/test/grades", matchExactOnly:true, icon: CalendarDays },
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
/*  Admin navigation                                                   */
/* ------------------------------------------------------------------ */

const adminNav: NavGroup[] = [
    {
        items: [
            { title: "Dashboard", href: "/manager", matchExactOnly: true, icon: LayoutDashboard },
        ],
    },
    {
        label: "Admission",
        items: [
            { title: "Review Application", href: "/manager/review-application", matchExactOnly: true, icon: GraduationCap },
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
/*  Super-admin navigation                                             */
/* ------------------------------------------------------------------ */

const superAdminNav: NavGroup[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard", matchExactOnly: true, icon: LayoutDashboard },
        ],
    },
    {
        items: [
            {
                title: "Setup",
                icon: Settings2Icon,
                children: [
                    {title: "Admissions", href: "/admin/setup/admissions", matchExactOnly: true, icon: SchoolIcon },
                    { title: "Academic sessions", href: "/admin/setup/academic-sessions", matchExactOnly: true, icon: TestTubeDiagonalIcon },
                    { title: "Fee Management", href: "/admin/setup/fee-management", matchExactOnly: true, icon: CalendarDays },
                ],
            },
        ],
    },
    {
        label: "Platform",
        items: [
            { title: "Users", href: "/admin/users", matchExactOnly: true, icon: Users },
            { title: "Roles & Permissions", href: "/admin/roles", matchExactOnly: true, icon: ShieldCheck },
            { title: "Faculties", href: "/admin/faculties", matchExactOnly: true, icon: Building2 },
            { title: "Departments", href: "/admin/departments", matchExactOnly: true, icon: Building2 },
            {
                title: "Academics",
                icon: GraduationCap,
                children: [
                    { title: "Sessions", href: "/admin/academics/sessions", matchExactOnly: true, icon: CalendarDays },
                    { title: "Courses", href: "/admin/academics/courses", matchExactOnly: true, icon: BookOpen },
                    { title: "Results", href: "/admin/academics/results", matchExactOnly: true, icon: ClipboardList },
                ],
            },
        ],
    },
    {
        label: "System",
        items: [
            { title: "Analytics", href: "/admin/analytics", matchExactOnly: true, icon: BarChart3 },
            { title: "System Config", href: "/admin/config", matchExactOnly: true, icon: Database },
            { title: "User Management", href: "/admin/user-management", matchExactOnly: true, icon: UserCog },
            { title: "Portal Settings", href: "/admin/portal", matchExactOnly: true, icon: Globe },
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
/*  Combined config keyed by role                                      */
/* ------------------------------------------------------------------ */

export const navConfig: Record<UserRole, NavGroup[]> = {
    STUDENT: studentNav,
    LECTURER: lecturerNav,
    ADMIN: adminNav,
    SUPER_ADMIN: superAdminNav,
};

/** Maps each role to its dashboard base path */
export const roleDashboardPath: Record<UserRole, string> = {
    [UserRole.STUDENT]: "/student",
    [UserRole.LECTURER]: "/tutor",
    [UserRole.ADMIN]: "/manager",
    [UserRole.SUPER_ADMIN]: "/admin",
};
