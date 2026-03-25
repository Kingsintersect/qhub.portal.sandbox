"use client";

import { ArrowRight, GraduationCap, Award, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const navItems: NavItem[] = [
    {
        icon: <GraduationCap className="w-10 h-10 bg-white/80" strokeWidth={1.2} style={{ color: "white" }} />,
        title: "PROGRAMS",
        subtitle: "For individuals",
    },
    {
        icon: <Award className="w-10 h-10 text-white/80" strokeWidth={1.2} style={{ color: "white" }} />,
        title: "CERTIFICATE",
        subtitle: "For individuals",
    },
    {
        icon: <BookOpen className="w-10 h-10 text-white/80" strokeWidth={1.2} style={{ color: "white" }} />,
        title: "AFFORD",
        subtitle: "For individuals",
    },
];

export default function QhubBanner() {
    return (
        <div className="">
            <div className="flex justify-center rounded-sm overflow-hidden" style={{ height: "100px" }}>
                {/* Nav Items Section */}
                <div
                    className="flex flex-1 items-stretch"
                    style={{ backgroundColor: "#2d4a52" }}
                >
                    {navItems.map((item, index) => (
                        <NavCard key={index} item={item} />
                    ))}
                </div>

                {/* CTA Section */}
                <button
                    className={cn(
                        "flex items-center justify-between gap-6 px-8 py-6",
                        "transition-brightness duration-200 cursor-pointer group"
                    )}
                    style={{ backgroundColor: "#2ec4b6" }}
                    onClick={() => console.log("Discover Eduma clicked")}
                    aria-label="Discover Eduma"
                >
                    <div className="text-left">
                        <p className="text-white font-bold text-lg leading-tight tracking-wide">
                            DISCOVER Qhub
                        </p>
                        <p className="text-white/85 text-sm mt-0.5">{"Don't Hesitate to Ask"}</p>
                    </div>
                    <div className="shrink-0">
                        <ArrowRight
                            className="w-8 h-8 text-white transition-transform duration-200 group-hover:translate-x-1"
                            strokeWidth={2}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
}

function NavCard({ item }: { item: NavItem }) {
    return (
        <button
            className={cn(
                "flex items-center gap-4 px-8 py-6 flex-1",
                "border-r border-white/10 last:border-r-0",
                "hover:bg-white/5 transition-colors duration-200 cursor-pointer",
                "text-left group"
            )}
        >
            <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                {item.icon}
            </div>
            <div>
                <p className="text-white font-bold text-sm tracking-widest">
                    {item.title}
                </p>
                <p className="text-white/60 text-xs mt-0.5">{item.subtitle}</p>
            </div>
        </button>
    );
}