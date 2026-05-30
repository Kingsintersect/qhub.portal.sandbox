"use client";

import { AnimatePresence } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUpcomingAssessments } from "../hooks/use-upcoming-assessments";
import { AssessmentCard } from "./assessment-card";

interface UpcomingAssessmentsProps {
    limit?: number;
    /** If provided, a "View all" link is shown */
    viewAllHref?: string;
}

function SkeletonRow() {
    return (
        <div className="flex gap-3 items-start animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted/60 rounded w-16" />
                <div className="h-4 bg-muted/60 rounded w-3/4" />
                <div className="h-3 bg-muted/60 rounded w-24" />
            </div>
        </div>
    );
}

export function UpcomingAssessments({ limit = 5, viewAllHref }: UpcomingAssessmentsProps) {
    const { data, isLoading } = useUpcomingAssessments(limit);
    const items = data?.data ?? [];

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Clock size={14} className="text-amber-500" />
                    </div>
                    <span className="font-semibold text-sm">Upcoming Deadlines</span>
                </div>
                {viewAllHref && (
                    <Link href={viewAllHref}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            View all <ArrowRight size={12} />
                        </Button>
                    </Link>
                )}
            </div>

            {/* Items */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No upcoming deadlines — you&apos;re all clear!</p>
            ) : (
                <AnimatePresence>
                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <AssessmentCard
                                key={item.id}
                                assessment={item}
                                index={idx}
                                href={`/student/assessments/${item.id}`}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
