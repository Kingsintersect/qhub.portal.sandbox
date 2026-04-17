"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrograms, useCreateProgram, useUpdateProgram } from "@/hooks/useCourseStructure";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { programSchema, type ProgramFormValues } from "@/schemas/school.schema";
import type { Program } from "@/types/school";

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
    GraduationCap,
    Plus,
    ArrowLeft,
    Pencil,
    Loader2,
} from "lucide-react";

export function ProgramManager() {
    const {
        selectedDepartmentId,
        selectedDepartmentName,
        selectedFacultyName,
        clearSelectedDepartment,
    } = useCourseStructureStore();

    const { data, isLoading } = usePrograms(selectedDepartmentId);
    const createProgram = useCreateProgram();
    const updateProgram = useUpdateProgram();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const programs = data?.data ?? [];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProgramFormValues>({
        resolver: zodResolver(programSchema),
        defaultValues: {
            name: "",
            code: "",
            degree_type: "",
            duration_years: 4,
            description: "",
            min_credit_units: 120,
        },
    });

    const onSubmit = async (values: ProgramFormValues) => {
        if (editingId) {
            await updateProgram.mutateAsync({ id: editingId, payload: values });
            setEditingId(null);
        } else {
            await createProgram.mutateAsync({
                ...values,
                department_id: selectedDepartmentId!,
            });
        }
        reset({ name: "", code: "", degree_type: "", duration_years: 4, description: "", min_credit_units: 120 });
        setShowForm(false);
    };

    const startEdit = (prog: Program) => {
        setEditingId(prog.id);
        reset({
            name: prog.name,
            code: prog.code,
            degree_type: prog.degree_type,
            duration_years: prog.duration_years,
            description: prog.description,
            min_credit_units: prog.min_credit_units,
        });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        reset({ name: "", code: "", degree_type: "", duration_years: 4, description: "", min_credit_units: 120 });
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

    const isPending = createProgram.isPending || updateProgram.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedDepartment}
                        title="Back to departments"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Programs</h2>
                        <p className="text-sm text-muted-foreground">
                            {selectedFacultyName} &rarr;{" "}
                            <span className="font-medium text-foreground">
                                {selectedDepartmentName}
                            </span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
                    <Plus className="size-4" data-icon="inline-start" />
                    New Program
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
                                <CardTitle>{editingId ? "Edit Program" : "Create Program"}</CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update the program details below."
                                        : "Add a degree program to this department (e.g., B.Sc. Computer Science)."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-name">Program Name</Label>
                                        <Input
                                            id="prog-name"
                                            placeholder="B.Sc. Computer Science"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-code">Code</Label>
                                        <Input
                                            id="prog-code"
                                            placeholder="CSC"
                                            aria-invalid={!!errors.code}
                                            {...register("code")}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">{errors.code.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-degree">Degree Type</Label>
                                        <Input
                                            id="prog-degree"
                                            placeholder="B.Sc."
                                            aria-invalid={!!errors.degree_type}
                                            {...register("degree_type")}
                                        />
                                        {errors.degree_type && (
                                            <p className="text-sm text-destructive">{errors.degree_type.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-duration">Duration (years)</Label>
                                        <Input
                                            id="prog-duration"
                                            type="number"
                                            min={1}
                                            max={7}
                                            aria-invalid={!!errors.duration_years}
                                            {...register("duration_years", { valueAsNumber: true })}
                                        />
                                        {errors.duration_years && (
                                            <p className="text-sm text-destructive">{errors.duration_years.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-credits">Min Credit Units</Label>
                                        <Input
                                            id="prog-credits"
                                            type="number"
                                            min={1}
                                            aria-invalid={!!errors.min_credit_units}
                                            {...register("min_credit_units", { valueAsNumber: true })}
                                        />
                                        {errors.min_credit_units && (
                                            <p className="text-sm text-destructive">{errors.min_credit_units.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="prog-desc">Description</Label>
                                        <Input
                                            id="prog-desc"
                                            placeholder="Brief description"
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
                                        {editingId ? "Save Changes" : "Create Program"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Program List */}
            {!programs.length && !showForm ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No programs yet"
                    description="Add degree programs to this department (e.g., B.Sc., B.Eng.)."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Add First Program
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {programs.map((prog, index) => (
                        <motion.div
                            key={prog.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="size-4 text-primary" />
                                        {prog.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {prog.degree_type} — {prog.duration_years} year
                                        {prog.duration_years !== 1 ? "s" : ""} — {prog.min_credit_units} credit units
                                    </CardDescription>
                                    <CardAction>
                                        {prog.is_active && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                <span className="size-1.5 rounded-full bg-primary" />
                                                Active
                                            </span>
                                        )}
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <span className="flex-1 text-sm text-muted-foreground">
                                            Code: {prog.code}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => startEdit(prog)}
                                            title="Edit program"
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
