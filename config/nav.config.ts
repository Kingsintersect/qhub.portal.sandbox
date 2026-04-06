import { OctagonMinus, Settings2Icon, TestTubeDiagonalIcon, type LucideIcon } from "lucide-react";
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
            { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        items: [
            {
                title: "Reuseable Compoenets",
                icon: OctagonMinus,
                children: [
                    { title: "Test Page", href: "/student/test", icon: TestTubeDiagonalIcon },
                    { title: "Grades", href: "/student/test/grades", icon: CalendarDays },
                ],
            },
        ],
    },
    {
        label: "Academics",
        items: [
            { title: "My Courses", href: "/student/courses", icon: BookOpen },
            { title: "Timetable", href: "/student/timetable", icon: CalendarDays },
            {
                title: "Results",
                href: "/student/results",
                icon: ClipboardList,
            },
            { title: "Registration", href: "/student/registration", icon: FileText },
        ],
    },
    {
        label: "Campus",
        items: [
            { title: "Announcements", href: "/student/announcements", icon: Bell, badge: 3, badgeVariant: "warning" },
            { title: "Messages", href: "/student/messages", icon: MessageSquare },
            { title: "Payments", href: "/student/payments", icon: CreditCard },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Settings", href: "/student/settings", icon: Settings },
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Lecturer navigation                                                */
/* ------------------------------------------------------------------ */

const lecturerNav: NavGroup[] = [
    {
        items: [
            { title: "Dashboard", href: "/tutor", icon: LayoutDashboard },
        ],
    },
    {
        label: "Teaching",
        items: [
            { title: "My Courses", href: "/tutor/courses", icon: BookOpen },
            { title: "Timetable", href: "/tutor/timetable", icon: CalendarDays },
            {
                title: "Grading",
                icon: ClipboardList,
                children: [
                    { title: "Submit Results", href: "/tutor/grading/submit", icon: FileText },
                    { title: "Grade Book", href: "/tutor/grading/book", icon: FolderOpen },
                ],
            },
            { title: "Resources", href: "/tutor/resources", icon: Layers },
        ],
    },
    {
        label: "Campus",
        items: [
            { title: "Announcements", href: "/tutor/announcements", icon: Bell },
            { title: "Messages", href: "/tutor/messages", icon: MessageSquare },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Settings", href: "/tutor/settings", icon: Settings },
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Admin navigation                                                   */
/* ------------------------------------------------------------------ */

const adminNav: NavGroup[] = [
    {
        items: [
            { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
        ],
    },
    {
        label: "Management",
        items: [
            { title: "Students", href: "/manager/students", icon: GraduationCap },
            { title: "Lecturers", href: "/manager/lecturers", icon: Users },
            { title: "Departments", href: "/manager/departments", icon: Building2 },
            {
                title: "Courses",
                icon: BookOpen,
                children: [
                    { title: "Course List", href: "/manager/courses", icon: Layers },
                    { title: "Allocation", href: "/manager/courses/allocation", icon: ClipboardList },
                ],
            },
        ],
    },
    {
        label: "Reports",
        items: [
            { title: "Analytics", href: "/manager/analytics", icon: BarChart3 },
            { title: "Announcements", href: "/manager/announcements", icon: Bell },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Settings", href: "/manager/settings", icon: Settings },
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Super-admin navigation                                             */
/* ------------------------------------------------------------------ */

const superAdminNav: NavGroup[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
    },
    {
        items: [
            { title: "Setup", href: "/admin/setup", icon: Settings2Icon },
        ],
    },
    {
        label: "Platform",
        items: [
            { title: "Users", href: "/admin/users", icon: Users },
            { title: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
            { title: "Faculties", href: "/admin/faculties", icon: Building2 },
            { title: "Departments", href: "/admin/departments", icon: Building2 },
            {
                title: "Academics",
                icon: GraduationCap,
                children: [
                    { title: "Sessions", href: "/admin/academics/sessions", icon: CalendarDays },
                    { title: "Courses", href: "/admin/academics/courses", icon: BookOpen },
                    { title: "Results", href: "/admin/academics/results", icon: ClipboardList },
                ],
            },
        ],
    },
    {
        label: "System",
        items: [
            { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
            { title: "System Config", href: "/admin/config", icon: Database },
            { title: "User Management", href: "/admin/user-management", icon: UserCog },
            { title: "Portal Settings", href: "/admin/portal", icon: Globe },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Settings", href: "/admin/settings", icon: Settings },
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
