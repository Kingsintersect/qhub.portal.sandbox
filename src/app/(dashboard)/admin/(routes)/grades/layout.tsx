"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, TableProperties, BarChart2, Send } from "lucide-react";

const TABS = [
    { label: "Results", href: "/admin/grades/results", Icon: TableProperties },
    { label: "Summary", href: "/admin/grades/summary", Icon: BarChart2 },
    { label: "Publish Results", href: "/admin/grades/publish-results", Icon: Send },
];

export default function GradesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-full">
            {/* Page header */}
            <div className="bg-card border border-border rounded-2xl px-5 py-4 mb-4 mx-4 mt-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-foreground leading-tight">Grade Management</h1>
                        <p className="text-xs text-muted-foreground">Results &amp; Analytics</p>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="px-4 mb-4">
                <nav className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit border border-border">
                    {TABS.map(({ label, href, Icon }) => {
                        const active = pathname === href || pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all
                  ${active
                                        ? "bg-card text-foreground shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"}
                `}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Page content */}
            <div className="flex-1 px-4 pb-6">{children}</div>
        </div>
    );
}
