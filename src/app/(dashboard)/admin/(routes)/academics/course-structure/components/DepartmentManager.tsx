"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDepartments, useCreateDepartment, useUpdateDepartment } from "@/hooks/useCourseStructure";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { departmentSchema, type DepartmentFormValues } from "@/schemas/school.schema";
import type { Department } from "@/types/school";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./EmptyState";
import {
    GitBranch,
    Plus,
    ArrowRight,
    ArrowLeft,
    Pencil,
    Loader2,
} from "lucide-react";

export function DepartmentManager() {
    const {
        selectedFacultyId,
        selectedFacultyName,
        clearSelectedFaculty,
        setSelectedDepartment,
    } = useCourseStructureStore();

    const { data, isLoading } = useDepartments(selectedFacultyId);
    const createDepartment = useCreateDepartment();
    const updateDepartment = useUpdateDepartment();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const departments = data?.data ?? [];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: { name: "", code: "", description: "", email: "", phone_number: "" },
    });

    const onSubmit = async (values: DepartmentFormValues) => {
        if (editingId) {
            await updateDepartment.mutateAsync({ id: editingId, payload: values });
            setEditingId(null);
        } else {
            await createDepartment.mutateAsync({
                ...values,
                faculty_id: selectedFacultyId!,
            });
        }
        reset();
        setShowForm(false);
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        reset({
            name: dept.name,
            code: dept.code,
            description: dept.description,
            email: dept.email,
            phone_number: dept.phone_number,
        });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        reset({ name: "", code: "", description: "", email: "", phone_number: "" });
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
            >
                <Loader2 className="size-6 animate-spin text-primary" />
            </motion.div>
        );
    }

    const isPending = createDepartment.isPending || updateDepartment.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedFaculty}
                        title="Back to faculties"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Departments</h2>
                        <p className="text-sm text-muted-foreground">
                            Faculty:{" "}
                            <span className="font-medium text-foreground">
                                {selectedFacultyName}
                            </span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
                    <Plus className="size-4" data-icon="inline-start" />
                    New Department
                </Button>
            </div>

            {/* Create / Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? "Edit Department" : "Create Department"}</CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update department details below."
                                        : "Add a new department to this faculty."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept-name">Department Name</Label>
                                        <Input
                                            id="dept-name"
                                            placeholder="Computer Science"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept-code">Code</Label>
                                        <Input
                                            id="dept-code"
                                            placeholder="CSC"
                                            aria-invalid={!!errors.code}
                                            {...register("code")}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">{errors.code.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept-email">Email</Label>
                                        <Input
                                            id="dept-email"
                                            type="email"
                                            placeholder="csc@uni.edu.ng"
                                            aria-invalid={!!errors.email}
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept-phone">Phone</Label>
                                        <Input
                                            id="dept-phone"
                                            placeholder="01-4561001"
                                            {...register("phone_number")}
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="dept-desc">Description</Label>
                                        <Input
                                            id="dept-desc"
                                            placeholder="Brief description of the department"
                                            {...register("description")}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline" onClick={cancelForm}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
                                        {isPending && (
                                            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                                        )}
                                        {editingId ? "Save Changes" : "Create Department"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Department List */}
            {!departments.length && !showForm ? (
                <EmptyState
                    icon={GitBranch}
                    title="No departments yet"
                    description="Add departments to this faculty to organize academic programs."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Create First Department
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept, index) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitBranch className="size-4 text-primary" />
                                        {dept.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Code: {dept.code} — {dept.programs_count} program
                                        {dept.programs_count !== 1 ? "s" : ""}
                                    </CardDescription>
                                    <CardAction>
                                        {dept.is_active && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                <span className="size-1.5 rounded-full bg-primary" />
                                                Active
                                            </span>
                                        )}
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={() =>
                                                setSelectedDepartment(dept.id, dept.name)
                                            }
                                        >
                                            Programs
                                            <ArrowRight className="size-4" data-icon="inline-end" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => startEdit(dept)}
                                            title="Edit department"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
