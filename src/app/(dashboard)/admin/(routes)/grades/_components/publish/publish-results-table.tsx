"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp, ChevronDown, ChevronsUpDown,
    ChevronLeft, ChevronRight, Search, X,
} from "lucide-react";
import StatusBadge from "@/components/custom/StatusBadge";
import EmptyState from "@/components/custom/EmptyState";
import { GradesExportToolbar } from "../export-toolbar";
import { useGradesExport } from "../../hooks/use-grades-export";
import type { Grade, GradeStatus } from "../../types/grades.types";
import { usePublishStore } from "../../store/publishStore";

// ─── Shared helpers ───────────────────────────────────────────────────────────

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

const STATUS_BADGE_MAP: Record<GradeStatus, { label: string; variant: StatusVariant }> = {
    PUBLISHED: { label: "Published", variant: "success" },
    APPROVED: { label: "Approved", variant: "info" },
    SUBMITTED: { label: "Submitted", variant: "warning" },
    DRAFT: { label: "Draft", variant: "default" },
};

function GradePill({ letter, point }: { letter: string | null; point: number | null }) {
    if (!letter) return <span className="text-muted-foreground text-xs">—</span>;
    const colour =
        (point ?? 0) >= 4.5 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" :
            (point ?? 0) >= 3.5 ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" :
                (point ?? 0) >= 2.5 ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40" :
                    (point ?? 0) >= 1.0 ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" :
                        "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40";
    return (
        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono ${colour}`}>
            {letter}
        </span>
    );
}

// ─── Sort header ─────────────────────────────────────────────────────────────

type SortKey = keyof Grade | null;
type SortDir = "asc" | "desc" | null;

function SortHeader({
    label, field, sortKey, sortDir, onSort,
}: {
    label: string; field: keyof Grade;
    sortKey: SortKey; sortDir: SortDir;
    onSort: (k: keyof Grade) => void;
}) {
    const active = sortKey === field;
    return (
        <button onClick={() => onSort(field)} className="flex items-center gap-1 group/sort hover:text-foreground transition-colors">
            {label}
            {active
                ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                : <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover/sort:opacity-50" />}
        </button>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

interface PublishResultsTableProps {
    grades: Grade[];
}

export function PublishResultsTable({ grades }: PublishResultsTableProps) {
    const { selectedIds, toggleSelect, selectAll, deselectAll } = usePublishStore();
    const { exporting, exportCSV, exportExcel, exportPDF } = useGradesExport();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<GradeStatus | "all">("all");
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);

    const handleSort = (key: keyof Grade) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : null);
            if (sortDir === "desc") setSortKey(null);
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const filtered = useMemo(() => {
        let list = grades;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (g) => g.studentName.toLowerCase().includes(q) || g.studentMatric.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") list = list.filter((g) => g.status === statusFilter);
        if (sortKey) {
            list = [...list].sort((a, b) => {
                const av = a[sortKey] ?? "";
                const bv = b[sortKey] ?? "";
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }
        return list;
    }, [grades, search, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Publishable = not yet published (APPROVED is the primary target; admin can also publish SUBMITTED)
    const publishableIds = filtered.filter((g) => g.status !== "PUBLISHED").map((g) => g.id);
    const allPageSelected = pageSlice.length > 0 && pageSlice.every((g) => selectedIds.includes(g.id));
    const someSelected = selectedIds.length > 0;

    const handleSelectAllPage = () => {
        if (allPageSelected) {
            deselectAll();
        } else {
            selectAll(publishableIds.filter((id) => pageSlice.some((g) => g.id === id)));
        }
    };

    const handleSelectAllFiltered = () => {
        selectAll(publishableIds);
    };

    const SKELETON_ROWS = 8;

    return (
        <div className="space-y-3">
            {/* Search + filter row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search student name or matric…"
                        className="w-full pl-8 pr-8 py-2 text-xs border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as GradeStatus | "all"); setPage(1); }}
                    className="px-3 py-2 text-xs border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                    <option value="all">All Statuses</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                </select>

                {/* Export */}
                <GradesExportToolbar
                    grades={filtered}
                    exporting={exporting}
                    onExportCSV={exportCSV}
                    onExportExcel={exportExcel}
                    onExportPDF={exportPDF}
                    totalCount={filtered.length}
                />
            </div>

            {/* Select-all banner */}
            <AnimatePresence>
                {someSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5"
                    >
                        <span className="text-xs text-primary font-medium">
                            {selectedIds.length} grade{selectedIds.length !== 1 ? "s" : ""} selected
                            {filtered.length > PAGE_SIZE && (
                                <button
                                    onClick={handleSelectAllFiltered}
                                    className="ml-2 underline hover:no-underline"
                                >
                                    Select all {publishableIds.length} publishable
                                </button>
                            )}
                        </span>
                        <button onClick={deselectAll} className="text-xs text-muted-foreground hover:text-foreground transition">
                            Clear selection
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No results found"
                    description="Try adjusting the search or status filter."
                />
            ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="w-10 px-3 py-3">
                                        <input
                                            type="checkbox"
                                            checked={allPageSelected}
                                            onChange={handleSelectAllPage}
                                            className="rounded border-border accent-primary w-3.5 h-3.5"
                                        />
                                    </th>
                                    <th className="px-3 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                        <SortHeader label="Student" field="studentName" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Matric</th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                        <SortHeader label="CA" field="caScore" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                        <SortHeader label="Exam" field="examScore" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
                                        <SortHeader label="Total" field="totalScore" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Grade</th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">GP</th>
                                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageSlice.map((grade, i) => {
                                    const isSelected = selectedIds.includes(grade.id);
                                    const isPublished = grade.status === "PUBLISHED";
                                    return (
                                        <motion.tr
                                            key={grade.id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className={`border-b border-border/30 last:border-0 transition-colors
                                                ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}
                                                ${isPublished ? "opacity-60" : ""}`}
                                        >
                                            <td className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isPublished}
                                                    onChange={() => toggleSelect(grade.id)}
                                                    className="rounded border-border accent-primary w-3.5 h-3.5 disabled:cursor-not-allowed"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-foreground">{grade.studentName}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="font-mono text-muted-foreground">{grade.studentMatric}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-foreground">{grade.caScore ?? "—"}</td>
                                            <td className="px-3 py-3 text-center font-mono text-foreground">{grade.examScore ?? "—"}</td>
                                            <td className="px-3 py-3 text-center font-mono font-bold text-foreground">{grade.totalScore ?? "—"}</td>
                                            <td className="px-3 py-3 text-center">
                                                <GradePill letter={grade.gradeLetter} point={grade.gradePoint} />
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-muted-foreground">
                                                {grade.gradePoint?.toFixed(2) ?? "—"}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <StatusBadge {...STATUS_BADGE_MAP[grade.status]} dot />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 transition"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-7 h-7 text-xs rounded-lg border transition ${safePage === p
                                                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                    : "bg-card border-border text-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 transition"
                                >
                                    <ChevronRight className="w-3.5 h-3.5 text-foreground" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Skeleton placeholder for loading state */}
            {grades.length === 0 && (
                <div className="space-y-2">
                    {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                        <div key={i} className="h-10 bg-muted/40 rounded-xl animate-pulse" />
                    ))}
                </div>
            )}
        </div>
    );
}
