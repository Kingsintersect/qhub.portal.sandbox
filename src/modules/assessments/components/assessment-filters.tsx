"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAssessmentsUiStore } from "../store/assessments-ui.store";
import type { AssessmentType } from "../types";

const TYPES: { value: AssessmentType; label: string }[] = [
    { value: "assignment", label: "Assignments" },
    { value: "quiz", label: "Quizzes" },
    { value: "forum", label: "Forums" },
];

interface AssessmentFiltersProps {
    /** Show the visibility filter — for admin/tutor views */
    showVisibilityFilter?: boolean;
    /** Show the upcoming toggle — for student views */
    showUpcomingToggle?: boolean;
}

export function AssessmentFilters({ showVisibilityFilter = false, showUpcomingToggle = false }: AssessmentFiltersProps) {
    const {
        activeType,
        visibilityFilter,
        upcomingOnly,
        setActiveType,
        setVisibilityFilter,
        setUpcomingOnly,
        resetFilters,
    } = useAssessmentsUiStore();

    const isDirty = activeType !== null || visibilityFilter !== "all" || upcomingOnly;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Type filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <button
                    onClick={() => setActiveType(null)}
                    className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                        activeType === null
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
                    )}
                >
                    All
                </button>
                {TYPES.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setActiveType(activeType === t.value ? null : t.value)}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                            activeType === t.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Visibility filter */}
            {showVisibilityFilter && (
                <Select
                    value={visibilityFilter}
                    onValueChange={(v) => setVisibilityFilter(v as "all" | "visible" | "hidden")}
                >
                    <SelectTrigger className="h-8 text-xs w-32">
                        <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="visible">Visible</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                </Select>
            )}

            {/* Upcoming toggle */}
            {showUpcomingToggle && (
                <button
                    onClick={() => setUpcomingOnly(!upcomingOnly)}
                    className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                        upcomingOnly
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-transparent text-muted-foreground border-border hover:border-amber-400/60"
                    )}
                >
                    Upcoming only
                </button>
            )}

            {/* Clear filters */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={resetFilters}
                        >
                            <X size={12} className="mr-1" />
                            Clear
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
