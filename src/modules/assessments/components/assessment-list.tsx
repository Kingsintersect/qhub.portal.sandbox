"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/custom/EmptyState";
import { ClipboardList } from "lucide-react";
import { AssessmentCard } from "./assessment-card";
import { VisibilityToggle } from "./visibility-toggle";
import type { AssessmentItem } from "../types";

interface AssessmentListProps {
    items: AssessmentItem[];
    isLoading?: boolean;
    showVisibilityToggle?: boolean;
    /** If provided, each card links to the detail page */
    baseHref?: string;
}

function SkeletonCard() {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                    <div className="h-4 w-16 bg-muted/60 rounded-full" />
                    <div className="h-4 w-12 bg-muted/60 rounded-full" />
                </div>
                <div className="h-4 bg-muted/60 rounded w-3/4" />
                <div className="h-3 bg-muted/60 rounded w-full" />
                <div className="flex gap-3 mt-2">
                    <div className="h-3 w-20 bg-muted/60 rounded" />
                    <div className="h-3 w-16 bg-muted/60 rounded" />
                </div>
            </div>
        </div>
    );
}

export function AssessmentList({ items, isLoading = false, showVisibilityToggle = false, baseHref }: AssessmentListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={ClipboardList}
                title="No assessments found"
                description="Try adjusting your filters or check back after the next Moodle sync."
            />
        );
    }

    return (
        <AnimatePresence mode="popLayout">
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <motion.div key={item.id} layout>
                        <AssessmentCard
                            assessment={item}
                            index={idx}
                            showVisibility={showVisibilityToggle}
                            href={baseHref ? `${baseHref}/${item.id}` : undefined}
                            visibilityToggle={
                                showVisibilityToggle ? (
                                    <VisibilityToggle
                                        assessmentId={item.id}
                                        isVisible={item.isVisible}
                                    />
                                ) : undefined
                            }
                        />
                    </motion.div>
                ))}
            </div>
        </AnimatePresence>
    );
}
