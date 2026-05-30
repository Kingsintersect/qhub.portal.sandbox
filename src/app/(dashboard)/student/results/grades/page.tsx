"use client";

import DataTable from "@/components/custom/DataTable";
import { MoreVertical, Edit, Trash } from "lucide-react";

interface Course extends Record<string, unknown> {
    id: string;
    code: string;
    title: string;
    instructor: string;
    students: number;
    status: "active" | "draft" | "archived";
    price: number;
    createdAt: string;
}

export default function CourseManagement() {
    const courses: Course[] = [
        {
            id: "1",
            code: "CS101",
            title: "Introduction to Programming",
            instructor: "Dr. Johnson",
            students: 45,
            status: "active",
            price: 49.99,
            createdAt: "2024-01-10",
        },
        {
            id: "2",
            code: "CS101",
            title: "Introduction to Programming",
            instructor: "Dr. Johnson",
            students: 45,
            status: "active",
            price: 49.99,
            createdAt: "2024-01-10",
        },
        {
            id: "3",
            code: "CS101",
            title: "Introduction to Programming",
            instructor: "Dr. Johnson",
            students: 45,
            status: "active",
            price: 49.99,
            createdAt: "2024-01-10",
        },
        // More data...
    ];

    const columns = [
        { key: "code", header: "Code", sortable: true, width: "100px" },
        { key: "title", header: "Course Title", sortable: true },
        { key: "instructor", header: "Instructor", sortable: true },
        {
            key: "students",
            header: "Students",
            sortable: true,
            align: "center" as const,
        },
        {
            key: "price",
            header: "Price",
            sortable: true,
            render: (row: Course) => `$${row.price}`,
        },
        {
            key: "status",
            header: "Status",
            render: (row: Course) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" :
                    row.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            align: "center" as const,
            render: () => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-accent rounded">
                        <Edit size={14} />
                    </button>
                    <button className="p-1 hover:bg-accent rounded">
                        <Trash size={14} />
                    </button>
                    <button className="p-1 hover:bg-accent rounded">
                        <MoreVertical size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={courses}
            columns={columns}
            searchable={true}
            pageSize={15}
            onRowClick={(row) => console.log("Edit course:", row)}
        />
    );
}