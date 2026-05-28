"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  Search, SlidersHorizontal, X, ChevronDown,
  CalendarDays, BookOpen, GraduationCap, Tag,
} from "lucide-react";
import type { FinancialFilters, TransactionStatus, TransactionType } from "../types/finance.types";
import {
  ACADEMIC_YEARS,
  SEMESTERS,
  PROGRAMS,
} from "../services/finance.service";

const STATUS_OPTIONS: { value: TransactionStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "" },
  { value: "paid", label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "refunded", label: "Refunded", color: "bg-violet-100 text-violet-700 border-violet-200" },
];

const TYPE_OPTIONS: { value: TransactionType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "tuition", label: "Tuition" },
  { value: "accommodation", label: "Accommodation" },
  { value: "library", label: "Library" },
  { value: "lab", label: "Laboratory" },
  { value: "exam", label: "Examination" },
  { value: "other", label: "Other" },
];

interface FiltersBarProps {
  filters: FinancialFilters;
  onChange: (updates: Partial<FinancialFilters>) => void;
  onReset: () => void;
  activeFilterCount: number;
}

function SelectField({
  icon: Icon,
  value,
  onChange,
  children,
  className = "",
}: {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-8 pr-8 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function FiltersBar({ filters, onChange, onReset, activeFilterCount }: FiltersBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    if (!pillsRef.current) return;
    gsap.from(pillsRef.current.children, {
      opacity: 0,
      x: -10,
      stagger: 0.05,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const filteredSemesters = filters.academicYearId === "all"
    ? SEMESTERS
    : SEMESTERS.filter((s) => s.academicYearId === filters.academicYearId);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* Top row: Search + reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by student, invoice, program..."
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground hidden sm:block">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-primary hover:text-accent font-medium transition flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter selects */}
      <div ref={pillsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Academic Year */}
        <SelectField
          icon={CalendarDays}
          value={filters.academicYearId}
          onChange={(v) => onChange({ academicYearId: v, semesterId: "all" })}
        >
          <option value="all">All Years</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y.id} value={y.id}>{y.label}</option>
          ))}
        </SelectField>

        {/* Semester */}
        <SelectField
          icon={BookOpen}
          value={filters.semesterId}
          onChange={(v) => onChange({ semesterId: v })}
        >
          <option value="all">All Semesters</option>
          {filteredSemesters.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </SelectField>

        {/* Program */}
        <SelectField
          icon={GraduationCap}
          value={filters.programId}
          onChange={(v) => onChange({ programId: v })}
          className="col-span-2 sm:col-span-1"
        >
          <option value="all">All Programs</option>
          {PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>{p.code}</option>
          ))}
        </SelectField>

        {/* Type */}
        <SelectField
          icon={Tag}
          value={filters.type}
          onChange={(v) => onChange({ type: v as TransactionType | "all" })}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </SelectField>

        {/* Date range — compact */}
        <div className="flex gap-1.5 col-span-2 lg:col-span-1">
          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
            className="flex-1 min-w-0 px-2 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
            className="flex-1 min-w-0 px-2 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="To"
          />
        </div>
      </div>

      {/* Status pill pills row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = filters.status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange({ status: opt.value })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                isActive
                  ? opt.value === "all"
                    ? "bg-primary text-white border-primary"
                    : `${opt.color} border`
                  : "bg-muted text-muted-foreground border-transparent hover:border-border"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
