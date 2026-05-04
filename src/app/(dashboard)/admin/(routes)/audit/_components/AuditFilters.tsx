"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuditStore } from "../store/audit.store";
import { Badge } from "@/components/ui/badge";
import type { AuditAction, AuditEntityType } from "../types/audit.types";

// ─── Options ─────────────────────────────────────────────────────────────────

const ACTION_OPTIONS: AuditAction[] = [
    "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE",
    "APPROVE", "REJECT", "ENROLL", "PAYMENT", "SYNC",
];

const ENTITY_OPTIONS: AuditEntityType[] = [
    "Student", "Grade", "Invoice", "Course", "Lecturer",
    "Clearance", "Payment", "User", "Setting", "StudentEnrollment",
    "Document", "Announcement", "MoodleUser", "MoodleEnrollment",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AuditFilters() {
    const {
        filters,
        setFilters,
        resetFilters,
        isFilterPanelOpen,
        setFilterPanelOpen,
    } = useAuditStore();

    const activeCount = [
        filters.action,
        filters.entityType,
        filters.startDate,
        filters.endDate,
        filters.semester,
        filters.academicYear,
    ].filter(Boolean).length;

    return (
        <>
            {/* Trigger button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterPanelOpen(true)}
                className="relative gap-1.5"
            >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="absolute -right-1.5 -top-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground"
                    >
                        {activeCount}
                    </Badge>
                )}
            </Button>

            <AnimatePresence>
                {isFilterPanelOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFilterPanelOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        />

                        {/* Slide-in panel */}
                        <motion.div
                            key="panel"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 280 }}
                            className="fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col bg-card border-l border-border shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary" />
                                    <h3 className="font-semibold text-foreground">Filter Logs</h3>
                                    {activeCount > 0 && (
                                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                            {activeCount} active
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFilterPanelOpen(false)}
                                    className="h-7 w-7"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Filter fields */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                                {/* Action */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Action
                                    </Label>
                                    <Select
                                        value={filters.action ?? ""}
                                        onValueChange={(v) =>
                                            setFilters({ action: v as AuditAction | "", page: 1 })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All actions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All actions</SelectItem>
                                            {ACTION_OPTIONS.map((a) => (
                                                <SelectItem key={a} value={a}>
                                                    {a}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Entity Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Entity Type
                                    </Label>
                                    <Select
                                        value={filters.entityType ?? ""}
                                        onValueChange={(v) =>
                                            setFilters({ entityType: v as AuditEntityType | "", page: 1 })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All entities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All entities</SelectItem>
                                            {ENTITY_OPTIONS.map((e) => (
                                                <SelectItem key={e} value={e}>
                                                    {e}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Semester */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Semester
                                    </Label>
                                    <Select
                                        value={filters.semester ?? ""}
                                        onValueChange={(v) =>
                                            setFilters({ semester: v as "First" | "Second" | "", page: 1 })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All semesters" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All semesters</SelectItem>
                                            <SelectItem value="First">First Semester</SelectItem>
                                            <SelectItem value="Second">Second Semester</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date range */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Date Range
                                    </Label>
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">From</Label>
                                            <Input
                                                type="date"
                                                value={filters.startDate ?? ""}
                                                onChange={(e) =>
                                                    setFilters({ startDate: e.target.value, page: 1 })
                                                }
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">To</Label>
                                            <Input
                                                type="date"
                                                value={filters.endDate ?? ""}
                                                onChange={(e) =>
                                                    setFilters({ endDate: e.target.value, page: 1 })
                                                }
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Year */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Academic Year
                                    </Label>
                                    <Select
                                        value={filters.academicYear ?? ""}
                                        onValueChange={(v) => setFilters({ academicYear: v, page: 1 })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All years</SelectItem>
                                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border px-5 py-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="flex-1 gap-1.5"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Clear all
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setFilterPanelOpen(false)}
                                    className="flex-1"
                                >
                                    Apply
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
