"use client";
import Combobox, { ComboboxOption } from "@/components/custom/Combobox";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import type { FinancialSummaryFilters } from "../schemas/filters.schema";

interface FiltersProps {
    filters: FinancialSummaryFilters & {
        academicYears?: ComboboxOption[];
        semesters?: ComboboxOption[];
        programs?: ComboboxOption[];
    };
    setFilters: (f: FiltersProps["filters"]) => void;
}

const statusOptions: ComboboxOption[] = [
    { value: "PENDING", label: "Pending" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "CANCELLED", label: "Cancelled" },
];

export function Filters({ filters, setFilters }: FiltersProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-4 items-end">
            <Combobox
                options={statusOptions}
                value={filters.status ?? null}
                onChange={val => setFilters({ ...filters, status: val as string })}
                placeholder="Status"
                className="min-w-40"
            />
            <Combobox
                options={filters.academicYears ?? []}
                value={filters.academicYear ?? null}
                onChange={val => setFilters({ ...filters, academicYear: val as string })}
                placeholder="Academic Year"
                className="min-w-40"
            />
            <Combobox
                options={filters.semesters ?? []}
                value={filters.semester ?? null}
                onChange={val => setFilters({ ...filters, semester: val as string })}
                placeholder="Semester"
                className="min-w-40"
            />
            <Combobox
                options={filters.programs ?? []}
                value={filters.program ?? null}
                onChange={val => setFilters({ ...filters, program: val as string })}
                placeholder="Program"
                className="min-w-40"
            />
            <Button size="sm" onClick={() => setFilters({})}>Reset</Button>
        </motion.div>
    );
}
