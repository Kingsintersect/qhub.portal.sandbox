import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "My Assessments",
};

export default function MyAssessmentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            {/* Section header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">My Assessments</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Assignments, quizzes, and forums from your enrolled courses.
                </p>
            </div>

            {/* Sub-nav tabs */}
            <nav className="flex gap-1 border-b border-border pb-0">
                <TabLink href="/assessments/my-assessments" exact icon={BookOpen} label="All" />
                <TabLink href="/assessments/my-assessments/upcoming" icon={Clock} label="Upcoming" />
            </nav>

            {children}
        </div>
    );
}

function TabLink({
    href,
    label,
    icon: Icon,
    exact = false,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
}) {
    // Active state is handled client-side via usePathname in a real app.
    // For static layout we render both links; the active class must be applied client-side.
    return (
        <Link
            href={href}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-primary/40 transition-all -mb-px"
        >
            <Icon size={14} />
            {label}
        </Link>
    );
}
