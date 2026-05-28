"use client";

import { useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import type { GradeFilters, GradeStatus } from "../types/grades.types";
import { ACADEMIC_YEARS, SEMESTERS, PROGRAMS, GRADE_SCALES } from "../services/grades.service";

interface FiltersBarProps {
    filters: GradeFilters;
    onChange: (partial: Partial<GradeFilters>) => void;
    onReset: () => void;
    activeFilterCount: number;
}

const STATUS_OPTIONS: { value: GradeStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "APPROVED", label: "Approved" },
    { value: "PUBLISHED", label: "Published" },
];

function SelectFilter({
    value,
    onChange,
    options,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 px-3 text-xs font-medium bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer ${className ?? ""}`}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

export function GradesFiltersBar({
    filters,
    onChange,
    onReset,
    activeFilterCount,
}: FiltersBarProps) {
    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange({ search: e.target.value }),
        [onChange]
    );

    const yearOptions = [
        { value: "all", label: "All Years" },
        ...ACADEMIC_YEARS.map((y) => ({ value: y.id, label: y.label })),
    ];

    const semesterOptions = [
        { value: "all", label: "All Semesters" },
        ...SEMESTERS.filter(
            (s) => filters.academicYearId === "all" || s.academicYearId === filters.academicYearId
        ).map((s) => ({ value: s.id, label: `${s.label} ${s.academicYear}` })),
    ];

    const programOptions = [
        { value: "all", label: "All Programs" },
        ...PROGRAMS.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
    ];

    const gradeOptions = [
        { value: "all", label: "All Grades" },
        ...GRADE_SCALES.map((g) => ({ value: g.grade, label: `${g.grade} (${g.gradePoint.toFixed(2)})` })),
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border rounded-2xl p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search student, matric, course…"
                        value={filters.search}
                        onChange={handleSearch}
                        className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                </div>

                {/* Status */}
                <SelectFilter
                    value={filters.status}
                    onChange={(v) => onChange({ status: v as GradeStatus | "all" })}
                    options={STATUS_OPTIONS}
                />

                {/* Academic Year */}
                <SelectFilter
                    value={filters.academicYearId}
                    onChange={(v) => onChange({ academicYearId: v, semesterId: "all" })}
                    options={yearOptions}
                />

                {/* Semester */}
                <SelectFilter
                    value={filters.semesterId}
                    onChange={(v) => onChange({ semesterId: v })}
                    options={semesterOptions}
                />

                {/* Program */}
                <SelectFilter
                    value={filters.programId}
                    onChange={(v) => onChange({ programId: v })}
                    options={programOptions}
                />

                {/* Grade Letter */}
                <SelectFilter
                    value={filters.gradeLetter}
                    onChange={(v) => onChange({ gradeLetter: v })}
                    options={gradeOptions}
                />

                {/* Reset */}
                {activeFilterCount > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onReset}
                        className="flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-destructive border border-border hover:border-destructive/50 rounded-xl transition"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
