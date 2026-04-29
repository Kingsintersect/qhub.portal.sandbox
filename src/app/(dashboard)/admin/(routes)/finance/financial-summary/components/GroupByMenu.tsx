"use client";

import Combobox, { ComboboxOption } from "@/components/custom/Combobox";

const groupByOptions: ComboboxOption[] = [
    { value: "Academic Year", label: "Academic Year" },
    { value: "Semester", label: "Semester" },
    { value: "Program", label: "Program" },
];

interface GroupByMenuProps {
    groupBy: string;
    setGroupBy: (g: string) => void;
}

export function GroupByMenu({ groupBy, setGroupBy }: GroupByMenuProps) {
    return (
        <Combobox
            options={groupByOptions}
            value={groupBy}
            onChange={val => setGroupBy(val as string)}
            placeholder="Group By"
            className="min-w-40"
        />
    );
}
